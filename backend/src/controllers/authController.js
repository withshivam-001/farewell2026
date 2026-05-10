const crypto = require('crypto');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../utils/auth');

// ─── Signup ──────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const { token, hashed, expires } = generateVerificationToken();

    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: hashed,
      emailVerificationExpires: expires,
    });

    await sendVerificationEmail(email, token);

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.',
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// ─── Verify Email ────────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) return res.status(400).json({ error: 'Token invalid or expired' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Login ───────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastSeen = new Date();
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        avatar: user.avatar,
        isPremium: user.isPremium,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ─── Refresh Token ───────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// ─── Logout ──────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const user = await User.findById(req.user._id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
        await user.save();
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Forgot Password ─────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If this email exists, a reset link was sent.' });

    const { token, hashed, expires } = generateVerificationToken();
    user.passwordResetToken = hashed;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    await sendPasswordResetEmail(email, token);
    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Reset Password ──────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and new password required' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) return res.status(400).json({ error: 'Token invalid or expired' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Get Me ──────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
