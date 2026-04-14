const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authticate = require('../middlewares/identifiers');
const isCartExist = require('../middlewares/inputValidator');

router.post('/api/create-order',
    authticate.validUser,
    isCartExist.isCartExist,
    orderController.createOrder
);
router.get('/api/my-orders',
    authticate.validUser,
    orderController.myOrders
);
router.put('/api/request-cancel',
    authticate.validUser,
    authticate.isUser,
    orderController.requestCancelOrder
);
router.patch('/api/cancel-orders/:orderid',
    authticate.validUser,
    authticate.isAdmin,
    orderController.cancelOrder
);
router.post('/api/create-payment-order',
    orderController.createPaymentOrder
);
router.post('/api/verify-payment',
    orderController.verifyPayment
);

// router.post('/api/payment')


module.exports = router;