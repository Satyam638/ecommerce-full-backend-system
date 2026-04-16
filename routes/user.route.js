const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.controllers');
const inpReqVal = require('../middlewares/inputValidator');
const isAuthenticated = require('../middlewares/identifiers');

/**
 * @swagger
 * /api/register/register-user:
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
router.post('/api/register/register-user',
    inpReqVal.validateUserReq,
    authController.registerUser);
/**
 * @swagger
 * /api/user/login-user:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/api/user/login-user',
    authController.loginUser);
/**
 * @swagger
 * /api/user/reset-password:
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
router.put('/api/user/reset-password',
    isAuthenticated.validUser,
    authController.resetPassword);
/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/api/user/logout',
    isAuthenticated.validUser,
    authController.logoutUser);
/**
 * @swagger
 * /api/user/all-user:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/api/user/all-user',
    isAuthenticated.validUser,
    isAuthenticated.isAdmin,
    authController.getAlluser);

module.exports = router