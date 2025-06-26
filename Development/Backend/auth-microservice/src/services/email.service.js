const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4e79a7;">${process.env.FROM_NAME}</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up! To complete your registration, please enter the following verification code in the app:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="
                display: inline-block;
                font-size: 32px;
                letter-spacing: 10px;
                background-color: #ffffff;
                padding: 15px 25px;
                border-radius: 6px;
                border: 2px dashed #4e79a7;
                color: #4e79a7;
                font-weight: bold;
              ">
                ${verificationCode}
              </div>
            </div>

            <p style="color: #666; font-size: 14px;">
              This code will expire in 24 hours. If you did not request this, please ignore this email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} ${process.env.FROM_NAME}. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification code sent to:', email);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification code');
  }
};

const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #e15759;">Reset Your Password</h2>
          <p>Use the code below to reset your password. It will expire in 1 hour.</p>
          <div style="font-size: 32px; font-weight: bold; color: #e15759; text-align: center; margin: 20px 0;">
            ${resetCode}
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};