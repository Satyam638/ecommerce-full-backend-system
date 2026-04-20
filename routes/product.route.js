const express = require('express');
const route = express.Router();
const productController = require('../controllers/product.controllers');
const upload = require('../middlewares/upload')
const isValid = require('../middlewares/inputValidator');
const authenticate = require('../middlewares/identifiers');

// add product
/**
 * @swagger
 * /api/products/add-product:
 *   post:
 *     summary: Add a new product
 *     tags: [Product]
 *     security:
 *       - tokenAuth:[]
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
route.post('/add-product',
    authenticate.validUser,
    authenticate.isAdmin, //only admin can add product
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
route.put('/update-product/:id',
    authenticate.validUser,
    authenticate.isAdmin, //only admin can update details of product
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
route.get('/all-product',
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
    '/search',
    productController.getProductByName
);
/**
 * @swagger
 * /api/products/category:
 *   get:
 *     summary: Get products by category with pagination
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Category name to filter products
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         required: false
 *         description: Number of products per page
 *
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       422:
 *         description: Category name must be present
 *       500:
 *         description: Internal Server Error
 */
route.get('/category', productController.getProductByCategory);

// delete products
route.delete('/delete:id',
    authenticate.validUser,
    authenticate.isAdmin,
    productController.deleteProductById);
// lowStock products
route.get('/low-stock-products',
    authenticate.validUser,authenticate.isAdmin,
    productController.lowStockProduct);

module.exports = route;