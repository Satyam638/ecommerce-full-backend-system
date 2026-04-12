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

// router.get('/api/my-order');

// router.post('/api/payment')


module.exports = router;