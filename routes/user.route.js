const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.controllers');
const inpReqVal = require('../middlewares/inputValidator');
const isAuthenticated = require('../middlewares/identifiers');
const rateLimiter = require('../config/rateLimiter');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post('/register/',
    inpReqVal.validateUserReq,
    authController.registerUser);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "test@gmail.com"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
    rateLimiter.loginRateLimiter,
    authController.loginUser);
/**
 * @swagger
 * /api/auth/user/reset-password:
 *   put:
 *     summary: Reset user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.put('/user/reset-password',
    isAuthenticated.validUser,
    authController.resetPassword);
/**
 * @swagger
 * /api/auth/user/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/user/logout',
    isAuthenticated.validUser,
    authController.logoutUser);
/**
 * @swagger
 * /api/auth/user/all-user:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/user/all-user',
    isAuthenticated.validUser,
    isAuthenticated.isAdmin,
    authController.getAlluser);

router.get('/admin/dashboards',
    isAuthenticated.validUser,
    isAuthenticated.isAdmin,
    authController.dashboards)

module.exports = router