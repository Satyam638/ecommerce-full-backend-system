const product = require('../models/product.model');
const imagekit = require('../config/imagekit');
const { json } = require('express');
const productModel = require('../models/product.model');
const redisClient = require('../config/redis');



const createorAddProduct = async (req, res) => {

    // const isValidate = isvalidAllFields(req.body);
    try {
        const { name, description, category, price } = req.body;

        // now image upload into cloud provider;

        let urlOfImage = "";
        // fetch image from request file and upload into imagekit cloud
        if (req.file) {
            const response = await imagekit.upload({
                file: req.file.buffer,
                fileName: req.file.originalname,
                folder: '/products'
            })
            urlOfImage = response.url;
        }


        // lets make a entry into database
        const newProduct = await product.create({
            name,
            description,
            price,
            category,
            productImage: urlOfImage
        })
        console.log("Product Details:", newProduct)
        // delete cache
        await redisClient.del("allProducts");
                console.log('Delete Cache Data Successfully')
        res.status(201).json({
            success: true,
            message: "Product is Added",
            data: newProduct
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })

    }
}
// update Product 
const updateProduct = async (req, res) => {

    try {
        const productId = req.params.id;

        const isExistProduct = await product.findById(productId);

        if (!isExistProduct) return res.status(404).json({
            success: false,
            message: "Product Not Found"
        })
        // lets update product 
        const updatedProduct = await product.findByIdAndUpdate(
            productId,
            req.body,
            { returnDocument: 'after' }
        );

        await redisClient.del('allProducts');
        console.log('Delete Cache Data Successfully')
        console.log('Update Product', updatedProduct);

        res.status(200).json({
            success: true,
            message: "Product is Updated SuccessFully",
            data: updatedProduct
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })

    }
}

const deleteProductById = async (req, res) => {

    try {
        const productId = req.params.id;

        const deletedProduct = await product.findByIdAndDelete(productId);

        await redisClient.del("allProducts");
        console.log('Delete cache data');
        res.status(200).json({
            success: true,
            message: "Deleted Product SuccessFully",
            data: deletedProduct
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })

    }
}
const getAllProduct = async (req, res) => {
    try {
        // get query from req to implement pagination
        // came as string so we need convert its data type into number
        let { limit = 5, page = 1 } = req.query

        // convert into number Dtype
        limit = Number(limit);
        page = Number(page);

        // find all product
        let skip = (page - 1) * limit;

        // lets check is data cached or not 
        const cacheKey = "allProducts";
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log('Cache Hit: Redis');
            console.log(`Cache Data for ${cacheKey}`,JSON.stringify(cachedData))
            res.status(200).json({ success: true, source: "cache", data: JSON.parse(cachedData) });
        }
        // if data not cached then we will fetch from database and store into cache so that next time we will get the data
        else {
            const allProduct = await product.find().skip(skip).limit(limit);

            // save into redis for 60 sec 
            console.log('Cache Miss');
            await redisClient.setEx(
                "allProducts",
                120,
                JSON.stringify(allProduct)
            );

            console.log('All product are:', allProduct);
            res.status(200).json({
                success: true,
                message: "All Products are:",
                data: allProduct
            })
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error:"
        })
    }
}
const getProductByCategory = async (req, res) => {

    try {
        let { limit = 5, page = 1, category } = req.query

        // convert into number Dtype
        limit = Number(limit);
        page = Number(page);

        // find all product
        let skip = (page - 1) * limit
        if (!category) {
            return res.status(422).json(
                {
                    success: false,
                    message: "Category name must be present"
                }
            )
        }
        console.log('category:', category);
        const categoryFilter = { $regex: category, $options: 'i' }

        const totalProduct = await product.countDocuments({ category: categoryFilter });
        console.log(`Total Product in ${category}  is:`, totalProduct);

        // find product for same category
        const productByCategory = await product.find({ category: categoryFilter }).skip(skip).limit(limit);
        console.log(`Product in ${category} is:`, productByCategory);
        res.status(200).json({
            success: true, message: `Products of ${category} is`,
            count: totalProduct,
            data: productByCategory
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error:"
        })
    }
}

const getProductByName = async (req, res) => {
    try {
        const name = req.query.name;

        // find product based on name

        const productByName = await product.find({ name: { $regex: name, $options: 'i' } });

        console.log(productByName);
        res.status(200).json({
            success: true,
            message: `The ${name} product is:`,
            data: productByName
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error:"
        })
    }
}
const lowStockProduct = async (req, res) => {

    try {

        // lets find product from producy model who last  low stock quanity

        const lowStProduct = await productModel.find().select('name inStock').sort({ inStock: 1 });

        res.status(200).json({ success: true, message: "Your Low Stock Products are", data: lowStProduct });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error:"
        })
    }
}

module.exports = {
    createorAddProduct,
    updateProduct,
    getAllProduct,
    getProductByCategory,
    deleteProductById,
    getProductByName,
    lowStockProduct
}