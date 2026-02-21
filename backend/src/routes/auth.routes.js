const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  forgotPassword, 
  verifyResetCode, 
  resetPassword 
} = require('../controllers/auth.controller');

router.post('/signup',            signup);
router.post('/login',             login);
router.post('/forgot-password',   forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password',    resetPassword);

module.exports = router;
