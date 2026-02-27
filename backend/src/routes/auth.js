const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

router.post(
  '/register',
  [body('username').isLength({ min: 3 }), body('email').isEmail(), body('password').isLength({ min: 6 })],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    authController.register(req, res, next);
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').exists()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    authController.login(req, res, next);
  }
);

const { authMiddleware } = require('../middlewares/authMiddleware');
router.get('/me', authMiddleware, authController.me);

module.exports = router;
