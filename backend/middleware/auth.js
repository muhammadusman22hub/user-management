const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // Check header exists
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Check it follows "Bearer <token>" format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format. Use: Bearer <token>' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ message: 'Access denied. Token is empty.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};

module.exports = authMiddleware;