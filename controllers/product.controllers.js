const product = require('../models/product.model');
const imagekit = require('../config/imagekit');
const { json } = require('express');
// const { response } = require('express');

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
        let skip = (page - 1) * limit
        const allProduct = await product.find().skip(skip).limit(limit);
        // .skip(skip).limit(limit);
        console.log('All product are:', allProduct);
        res.status(200).json({
            success: true,
            message: "All Products are:",
            data: allProduct
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
        console.log('category:',category);
        const categoryFilter = { $regex: category, $options: 'i' }

         const totalProduct = await product.countDocuments({ category: categoryFilter });
        console.log(`Total Product in ${category}  is:`,totalProduct);

        // find product for same category
        const productByCategory = await product.find({ category: categoryFilter }).skip(skip).limit(limit);
        console.log(`Product in ${category} is:`,productByCategory);
        res.status(200).json({
            success: true, message: `Products of ${category} is`,
            count:totalProduct,
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

        const productByName = await product.find({name:{$regex:name,$options:'i'} });

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

module.exports = {
    createorAddProduct,
    updateProduct,
    getAllProduct,
    getProductByCategory,
    deleteProductById,
    getProductByName
}