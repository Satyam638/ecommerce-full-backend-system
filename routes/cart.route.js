const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controllers');
const isAutheticate = require('../middlewares/identifiers');
const validInput = require('../middlewares/inputValidator');
// add to cart route
/**
 * @swagger
 * /api/add-items-to-cart:
 *   post:
 *     summary: Add items to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Items added to cart successfully
 */
router.post('/api/add-items-to-cart',
    isAutheticate.validUser,
    validInput.cartInputValid,
    cartController.addToCart
);
/**
 * @swagger
 * /api/update-cart:
 *   put:
 *     summary: Update product quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart updated successfully
 */
router.put('/api/update-cart',
    isAutheticate.validUser,
    cartController.updateQty
);
/**
 * @swagger
 * /api/get-cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 */
router.get('/api/get-cart',
    isAutheticate.validUser,
    cartController.getCart
);
/**
 * @swagger
 * /api/delete-product/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove
 *     responses:
 *       200:
 *         description: Product removed from cart
 */
router.delete('/api/delete-product',
    isAutheticate.validUser,
    cartController.deleteProduct
)

module.exports = router;