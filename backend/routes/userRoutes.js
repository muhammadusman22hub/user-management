const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  deleteAccount,
  getAllUsers
} = require('../controllers/userController');

// ✅ authMiddleware explicitly added to EACH route
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteAccount);
router.get('/all', authMiddleware, getAllUsers);

module.exports = router;