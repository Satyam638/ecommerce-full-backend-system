const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.controllers');
const inpReqVal = require('../middlewares/inputValidator');
const isAuthenticated = require('../middlewares/identifiers');
router.post('/api/register/register-user',
    inpReqVal.validateUserReq,
    authController.registerUser);
router.post('/api/user/login-user',
    authController.loginUser);
router.put('/api/user/reset-password',
    isAuthenticated.validUser,
    authController.resetPassword);

router.get('/api/user/all-user',
    isAuthenticated.validUser,
    isAuthenticated.isAdmin,
    authController.getAlluser);

module.exports = router