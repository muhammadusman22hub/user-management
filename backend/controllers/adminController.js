const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE USER
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE ANY USER
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, gender, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ name, email, phone, gender, role });
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE ANY USER
exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET STATS
exports.getStats = async (req, res) => {
  try {
    const total = await User.count();
    const admins = await User.count({ where: { role: 'admin' } });
    const users = await User.count({ where: { role: 'user' } });

    // New users in last 7 days
    const { Op } = require('sequelize');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newThisWeek = await User.count({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } }
    });

    res.json({ total, admins, regularUsers: users, newThisWeek });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PROMOTE USER TO ADMIN
exports.promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ role: 'admin' });
    res.json({ message: `${user.name} is now an admin` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DEMOTE ADMIN TO USER
exports.demoteToUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot demote yourself.' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ role: 'user' });
    res.json({ message: `${user.name} has been demoted to user` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};