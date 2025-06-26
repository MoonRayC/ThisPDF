const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  createUser: async (email, passwordHash, isEmailVerified = false) => {
    const userId = uuidv4();
    await query(
      `INSERT INTO users (id, email, password_hash, is_email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [userId, email, passwordHash, isEmailVerified]
    );
    return userId;
  },

    getUserByAccessToken: async (accessToken) => {
    const { verifyToken } = require('../utils/jwt');
    let userId;
    
    try {
      const decoded = verifyToken(accessToken);
      userId = decoded.sub; 
    } catch (error) {
      return null;
    }

    const result = await query(`
      SELECT id, email, is_email_verified, created_at, last_login_at
      FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `, [userId]);
    
    return result.rows[0] || null;
  },

  getUserByEmail: async (email) => {
    const result = await query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    return result.rows[0];
  },

  getUserById: async (id) => {
    const result = await query('SELECT id, email, is_email_verified, created_at FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
    return result.rows[0];
  },

  updateUserPassword: async (userId, passwordHash) => {
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
  },

  verifyUserEmail: async (userId) => {
    await query('UPDATE users SET is_email_verified = true, updated_at = NOW() WHERE id = $1', [userId]);
  },

  updateLastLogin: async (userId) => {
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);
  },

  createEmailVerificationToken: async (userId, verificationToken, expiresAt) => {
    await query(
      `INSERT INTO email_verification_tokens (id, user_id, verification_token, expires_at, used, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [uuidv4(), userId, verificationToken, expiresAt, false]
    );
  },

  getValidEmailVerificationToken: async (userId, verificationToken) => {
    const result = await query(
      `SELECT id FROM email_verification_tokens 
       WHERE user_id = $1 AND verification_token = $2 AND used = false AND expires_at > NOW()`,
      [userId, verificationToken]
    );
    return result.rows[0];
  },

  markEmailVerificationTokenAsUsed: async (userId, verificationToken) => {
    await query(
      'UPDATE email_verification_tokens SET used = true WHERE user_id = $1 AND verification_token = $2',
      [userId, verificationToken]
    );
  },

  createPasswordResetToken: async (userId, resetToken, expiresAt) => {
    await query(
      `INSERT INTO password_resets
       (id, user_id, reset_token, expires_at, used, created_at, resend_count, last_sent_at)
       VALUES ($1, $2, $3, $4, false, NOW(), 1, NOW())`,
      [uuidv4(), userId, resetToken, expiresAt]
    );
  },

  getValidPasswordResetToken: async (resetToken) => {
    const result = await query(
      `SELECT user_id FROM password_resets 
       WHERE reset_token = $1 AND used = false AND expires_at > NOW()`,
      [resetToken]
    );
    return result.rows[0];
  },

  markPasswordResetTokenAsUsed: async (resetToken) => {
    await query(
      'UPDATE password_resets SET used = true WHERE reset_token = $1',
      [resetToken]
    );
  },

  getLatestActiveEmailVerificationToken: async (userId) => {
    const result = await query(`
      SELECT id, verification_token, resend_count, last_sent_at
      FROM email_verification_tokens
      WHERE user_id = $1 AND used = false AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);
    return result.rows[0];
  },

  incrementEmailVerificationResendCount: async (tokenId) => {
    await query(`
      UPDATE email_verification_tokens
      SET resend_count = resend_count + 1, last_sent_at = NOW()
      WHERE id = $1
    `, [tokenId]);
  },

  getLatestActivePasswordResetToken: async (userId) => {
    const result = await query(`
      SELECT id, reset_token, resend_count, last_sent_at
      FROM password_resets
      WHERE user_id = $1 AND used = false AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);
    return result.rows[0];
  },

  incrementPasswordResetResendCount: async (tokenId) => {
    await query(`
      UPDATE password_resets
      SET resend_count = resend_count + 1, last_sent_at = NOW()
      WHERE id = $1
    `, [tokenId]);
  },

  createRefreshToken: async (userId, token, userAgent, ipAddress, expiresAt) => {
    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, user_agent, ip_address, expires_at, revoked, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [uuidv4(), userId, token, userAgent, ipAddress, expiresAt, false]
    );
  },

  getRefreshToken: async (token) => {
    const result = await query(
      `SELECT rt.*, u.id as user_id, u.email 
       FROM refresh_tokens rt 
       JOIN users u ON rt.user_id = u.id 
       WHERE rt.token = $1 AND rt.revoked = false AND rt.expires_at > NOW() AND u.deleted_at IS NULL`,
      [token]
    );
    return result.rows[0];
  },

  revokeRefreshToken: async (token) => {
    await query('UPDATE refresh_tokens SET revoked = true WHERE token = $1', [token]);
  },

  revokeAllRefreshTokensForUser: async (userId) => {
    await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [userId]);
  },

  createOrUpdateDevice: async (userId, deviceId, userAgent) => {
    await query(
      `INSERT INTO devices (id, user_id, device_id, user_agent, last_seen_at, created_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (device_id) DO UPDATE SET last_seen_at = NOW()`,
      [uuidv4(), userId, deviceId, userAgent]
    );
  },

  getUserDevices: async (userId) => {
    const result = await query(
      `SELECT d.device_id, d.user_agent, d.last_seen_at, d.created_at,
       COUNT(rt.id) as active_sessions
       FROM devices d
       LEFT JOIN refresh_tokens rt ON d.user_id = rt.user_id AND rt.revoked = false AND rt.expires_at > NOW()
       WHERE d.user_id = $1
       GROUP BY d.device_id, d.user_agent, d.last_seen_at, d.created_at
       ORDER BY d.last_seen_at DESC`,
      [userId]
    );
    return result.rows;
  },

  createSocialAccount: async (userId, provider, providerUid, email) => {
    await query(
      `INSERT INTO social_accounts (id, user_id, provider, provider_uid, email, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [uuidv4(), userId, provider, providerUid, email]
    );
  },

  getSocialAccount: async (userId, provider) => {
    const result = await query(
      'SELECT id FROM social_accounts WHERE user_id = $1 AND provider = $2',
      [userId, provider]
    );
    return result.rows[0];
  }
};