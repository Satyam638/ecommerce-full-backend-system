const express = require('express');
const route = express.Router();
const productController = require('../controllers/product.controllers');
const upload = require('../middlewares/upload')
const isValid = require('../middlewares/inputValidator');
// add product


route.post('/api/products/add-product',
   upload.single('productImage'), //multer will read image data  
   isValid.isInputValid, // check input is valid or not
    productController.createorAddProduct //business logic to store product into database
);

route.put('/api/products/update-product/:id',
    productController.updateProduct
);

route.get('/api/products/all-product',
    productController.getAllProduct
);
route.get('/api/products/',
    productController.getProductByName
);

module.exports = route;