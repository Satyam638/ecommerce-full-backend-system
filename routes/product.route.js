const express = require('express');
const route = express.Router();
const productController = require('../controllers/product.controllers');
const upload = require('../middlewares/upload')
const isValid = require('../middlewares/inputValidator');
// add product

/**
 * @swagger
 * /api/products/add-product:
 *   post:
 *     summary: Add a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               productImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product added successfully
 */
route.post('/api/products/add-product',
   upload.single('productImage'), //multer will read image data  
   isValid.isInputValid, // check input is valid or not
    productController.createorAddProduct //business logic to store product into database
);
/**
 * @swagger
 * /api/products/update-product/{id}:
 *   put:
 *     summary: Update product details
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
route.put('/api/products/update-product/:id',
    productController.updateProduct
);
/**
 * @swagger
 * /api/products/all-product:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of all products
 */
route.get('/api/products/all-product',
    productController.getAllProduct
);
/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Get product by name
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Product name to search
 *     responses:
 *       200:
 *         description: Product found
 */
route.get(
  '/api/products/search',
  productController.getProductByName
);

module.exports = route;