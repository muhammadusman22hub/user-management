const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { getProfile, updateProfile, deleteAccount, getAllUsers } = require('../controllers/userController');

// All routes below require a valid JWT
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteAccount);
router.get('/all', getAllUsers);

module.exports = router;