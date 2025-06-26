// src/controller/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { withTransaction } = require('../config/database');

const UserModel = require('../models/user.model');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const { verifyGoogleToken } = require('../services/socialAuth.service');

const THROTTLE_SECONDS = 30;
const MAX_ATTEMPTS = 5;

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) return res.status(422).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const userId = await withTransaction(async () => {
      const userId = await UserModel.createUser(email, passwordHash, false);
      await UserModel.createEmailVerificationToken(
        userId,
        verificationToken,
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      return userId;
    });

    await sendVerificationEmail(email, verificationToken);
    const user = await UserModel.getUserById(userId);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { user_id, verification_token } = req.body;

    const token = await UserModel.getValidEmailVerificationToken(user_id, verification_token);
    if (!token) return res.status(400).json({ error: 'Invalid or expired verification token' });

    await withTransaction(async () => {
      await UserModel.verifyUserEmail(user_id);
      await UserModel.markEmailVerificationTokenAsUsed(user_id, verification_token);
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, user_agent, ip_address } = req.body;

    const user = await UserModel.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const deviceId = uuidv4();

    await withTransaction(async () => {
      await UserModel.createRefreshToken(
        user.id,
        refreshToken,
        user_agent || null,
        ip_address || null,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      await UserModel.createOrUpdateDevice(user.id, deviceId, user_agent || null);
      await UserModel.updateLastLogin(user.id);
    });

    res.status(200).json({
      message: 'Login successful',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        is_email_verified: user.is_email_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    const tokenData = await UserModel.getRefreshToken(refresh_token);
    if (!tokenData) return res.status(403).json({ error: 'Invalid or expired refresh token' });

    const accessToken = jwt.sign(
      { userId: tokenData.user_id, email: tokenData.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({ access_token: accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Email not registered' });

    const now = new Date();
    const existingToken = await UserModel.getLatestActivePasswordResetToken(user.id);

    let resetToken;

    if (existingToken) {
      const lastSent = new Date(existingToken.last_sent_at);
      const secondsSinceLast = (now - lastSent) / 1000;

      if (secondsSinceLast < THROTTLE_SECONDS) {
        return res.status(429).json({
          error: `Please wait ${Math.ceil(THROTTLE_SECONDS - secondsSinceLast)} seconds before resending`
        });
      }

      if (existingToken.resend_count >= MAX_ATTEMPTS) {
        return res.status(429).json({
          error: 'Maximum resend attempts reached. Please try again later.'
        });
      }

      await UserModel.incrementPasswordResetResendCount(existingToken.id);
      resetToken = existingToken.reset_token;
    } else {
      resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      await UserModel.createPasswordResetToken(
        user.id,
        resetToken,
        new Date(Date.now() + 60 * 60 * 1000)
      );
    }

    await sendPasswordResetEmail(email, resetToken);
    res.status(200).json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;

    const token = await UserModel.getValidPasswordResetToken(reset_token);
    if (!token) return res.status(400).json({ error: 'Invalid or expired reset code' });

    const passwordHash = await bcrypt.hash(new_password, 12);

    await withTransaction(async () => {
      await UserModel.updateUserPassword(token.user_id, passwordHash);
      await UserModel.markPasswordResetTokenAsUsed(reset_token);
      await UserModel.revokeAllRefreshTokensForUser(token.user_id);
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'Refresh token is required' });

    await UserModel.revokeRefreshToken(refresh_token);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: 'Access token is required' });

    const googleUser = await verifyGoogleToken(access_token);
    if (!googleUser) return res.status(400).json({ error: 'Invalid Google token' });

    let user = await UserModel.getUserByEmail(googleUser.email);
    
    if (!user) {
      const userId = await withTransaction(async () => {
        const userId = await UserModel.createUser(googleUser.email, null, true);
        await UserModel.createSocialAccount(
          userId,
          'google',
          googleUser.id,
          googleUser.email
        );
        return userId;
      });
      user = await UserModel.getUserById(userId);
    } else {
      const socialAccount = await UserModel.getSocialAccount(user.id, 'google');
      if (!socialAccount) {
        await UserModel.createSocialAccount(
          user.id,
          'google',
          googleUser.id,
          googleUser.email
        );
      }
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    const refreshToken = crypto.randomBytes(32).toString('hex');

    await UserModel.createRefreshToken(
      user.id,
      refreshToken,
      null,
      null,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    res.status(200).json({
      message: 'Social login successful',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        is_email_verified: user.is_email_verified
      }
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.listDevices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const devices = await UserModel.getUserDevices(userId);
    res.status(200).json({ devices });
  } catch (error) {
    console.error('List devices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.is_email_verified) return res.status(400).json({ error: 'Email already verified' });

    const now = new Date();
    const existingToken = await UserModel.getLatestActiveEmailVerificationToken(user.id);

    let token;

    if (existingToken) {
      const lastSent = new Date(existingToken.last_sent_at);
      const secondsSinceLast = (now - lastSent) / 1000;

      if (secondsSinceLast < THROTTLE_SECONDS) {
        return res.status(429).json({
          error: `Please wait ${Math.ceil(THROTTLE_SECONDS - secondsSinceLast)} seconds before resending`
        });
      }

      if (existingToken.resend_count >= MAX_ATTEMPTS) {
        return res.status(429).json({
          error: 'Maximum resend attempts reached. Please try again later.'
        });
      }

      await UserModel.incrementEmailVerificationResendCount(existingToken.id);
      token = existingToken.verification_token;
    } else {
      token = Math.floor(100000 + Math.random() * 900000).toString();
      await UserModel.createEmailVerificationToken(
        user.id,
        token,
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
    }

    await sendVerificationEmail(email, token);
    res.status(200).json({ message: 'Verification code resent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCurrentUser = (req, res) => {
  try {
    const { id } = req.user;
    
    res.status(200).json({
      id,
      email: req.user.email,
      is_email_verified: req.user.is_email_verified,
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};