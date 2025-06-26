const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const registerValidation = [
    body('username', 'Username is required').not().isEmpty().trim().escape(),
    body('email', 'A valid email is required').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
];

// --- Public Routes ---
router.get('/login', authController.showLoginForm);
router.get('/register', authController.showRegisterForm);
router.post('/login', authController.loginUser);
router.post('/register', registerValidation, authController.registerUser);

// --- Protected Routes ---
router.get('/logout', authController.logoutUser);
router.get('/my-articles', protect, authController.getMyArticles);

module.exports = router;