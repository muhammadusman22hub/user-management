const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, gender, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, gender, password: hashedPassword });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // ← add role
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      to: email,
      subject: 'Password Reset - UserHub',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#1a1a2e;color:#fff;border-radius:16px">
        <h2 style="color:#667eea">Reset Your Password</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="http://localhost:5173/reset-password/${token}" style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Reset Password</a>
        <p style="color:rgba(255,255,255,0.4);font-size:12px">If you didn't request this, you can ignore this email.</p>
      </div>`,
    });

    res.json({ message: 'Reset email sent! Check your inbox.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Token invalid or expired' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
