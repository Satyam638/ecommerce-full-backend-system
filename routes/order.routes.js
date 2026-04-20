const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authticate = require('../middlewares/identifiers');
const isCartExist = require('../middlewares/inputValidator');

/**
 * @swagger
 * /api/order/create-order:
 *   post:
 *     summary: Create order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order created successfully
 */
router.post('/create-order',
    authticate.validUser,
    isCartExist.isCartExist,
    orderController.createOrder
);
/**
 * @swagger
 * /api/order/my-orders:
 *   get:
 *     summary: Get all orders of logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/my-orders',
    authticate.validUser,
    orderController.myOrders
);
/**
 * @swagger
 * /api/order/request-cancel:
 *   put:
 *     summary: User requests order cancellation
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cancel request submitted
 */
router.put('/request-cancel',
    authticate.validUser,
    authticate.isUser,
    orderController.requestCancelOrder
);
/**
 * @swagger
 * /api/order/cancel-orders/{orderId}:
 *   patch:
 *     summary: Admin cancels order after user request
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderid
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 */
router.patch('/cancel-orders/:orderid',
    authticate.validUser,
    authticate.isAdmin,
    orderController.cancelOrder
);
/**
 * @swagger
 * /api/order/create-payment-order:
 *   post:
 *     summary: Create Razorpay payment order
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment order created
 */
router.post('/create-payment-order',
    orderController.createPaymentOrder
);
/**
 * @swagger
 * /api/order/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment and update order
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified and order updated
 */
router.post('/verify-payment',
    orderController.verifyPayment
);



module.exports = router;