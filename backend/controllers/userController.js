const User = require('../models/User');

// GET MY PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE MY PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.update({ name, email }, { where: { id: req.user.id } });
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE MY ACCOUNT
exports.deleteAccount = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.user.id } });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL USERS (admin use)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};