const router = require('express').Router();
const adminMiddleware = require('../middleware/adminAuth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStats,
  promoteToAdmin,
  demoteToUser,
} = require('../controllers/adminController');

// All admin routes are protected by adminMiddleware
router.get('/stats', adminMiddleware, getStats);
router.get('/users', adminMiddleware, getAllUsers);
router.get('/users/:id', adminMiddleware, getUserById);
router.put('/users/:id', adminMiddleware, updateUser);
router.delete('/users/:id', adminMiddleware, deleteUser);
router.patch('/users/:id/promote', adminMiddleware, promoteToAdmin);
router.patch('/users/:id/demote', adminMiddleware, demoteToUser);

module.exports = router;