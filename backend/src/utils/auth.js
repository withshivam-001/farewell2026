const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ─── JWT ─────────────────────────────────────────────────────────
const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// ─── Random tokens ───────────────────────────────────────────────
const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  return { token, hashed, expires };
};

// ─── Email transporter ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Farewell 2024–26" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: '✉️ Verify Your Email — Farewell 2024–26',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0a0a0a;color:#fff;border-radius:12px;padding:32px;">
        <h2 style="color:#a78bfa;">Farewell 2024–26 🎬</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Verify Email</a>
        <p style="color:#888;font-size:13px;">Link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: '🔑 Reset Your Password — Farewell 2024–26',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0a0a0a;color:#fff;border-radius:12px;padding:32px;">
        <h2 style="color:#a78bfa;">Password Reset</h2>
        <p>You requested a password reset. Click below to set a new password.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
        <p style="color:#888;font-size:13px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmail,
};
