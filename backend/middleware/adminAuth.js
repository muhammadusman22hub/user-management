const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'undefined') {
      return res.status(401).json({ message: 'Access denied. Token is empty.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to check role
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    req.user = decoded;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};

module.exports = adminMiddleware;