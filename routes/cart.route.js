const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controllers');
const isAutheticate = require('../middlewares/identifiers');
const validInput = require('../middlewares/inputValidator');
// add to cart route
router.post('/api/add-items-to-cart',
    isAutheticate.validUser,
    validInput.cartInputValid,
    cartController.addToCart
);
router.put('/api/update-cart',
    isAutheticate.validUser,
    cartController.updateQty
);
router.get('/api/get-cart',
    isAutheticate.validUser,
    cartController.getCart
);

module.exports = router;