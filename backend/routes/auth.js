const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const { body } = require('express-validator');

router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
], authController.register);

router.post('/login', [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists()
], authController.login);
router.get('/me', requireAuth, authController.getUser);

module.exports = router;
