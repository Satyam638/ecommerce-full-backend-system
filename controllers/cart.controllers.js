const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');

const addToCart = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const userId = req.userId;

        // 🔴 check if cart already exists
        let cart = await cartModel.findOne({ userId });

        // extract product ids from cart 
        const productIds = cartItems.map(item => item.productId);

        // now find products from product DB to find prices, and more
        const products = await productModel.find({
            _id: { $in: productIds }
        }).select('price name');

        // lets map productIds from cart along with the information about product comes from product database
        const productMap = {};

        products.forEach(p => {
            productMap[p._id.toString()] = p;
        });

        const updatedItems = cartItems.map(item => {
            const product = productMap[item.productId.toString()];

            // validate product exists
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            return {
                // comes prom cart item -> cart
                productId: item.productId,
                quantity: item.quantity,
                // comes from product model -> product
                price: product.price,
                name:product.name
            };
        });

        // CASE 1: cart already exists → UPDATE
        if (cart) {

            updatedItems.forEach(newItem => {

                // find allready existing items from cart
                const existingItem = cart.cartItems.find(
                    i => i.productId.toString() === newItem.productId.toString()
                );

                // if item exist then increase their quantity
                if (existingItem) {
                    existingItem.quantity += newItem.quantity;
                } else {
                    // else add new product to the cart
                    cart.cartItems.push(newItem);
                }
            });

            // recalc total
            cart.totalAmt = cart.cartItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );

            await cart.save();

            return res.status(200).json({
                success: true,
                message: "Cart updated",
                data: cart
            });
        }

        // CASE 2: cart not exists → CREATE CART
        let totalAmt = updatedItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );


        // create cart
        cart = await cartModel.create({
            userId,
            cartItems: updatedItems,
            totalAmt
        });

        res.status(201).json({
            success: true,
            message: "Cart created",
            data: cart
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const updateQty = async (req, res) => {
    try {
        const { action, productId } = req.body
        const userId = req.userId;

        const cart = await cartModel.findOne({ userId })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        const item = cart.cartItems.find(
            item => item.productId.toString() === productId
        )

        if (!item) return res.status(404).json({
            success: false,
            message: "Product not found in Cart"
        });

        // for(let item of cart.cartItems){
        //     if(item.productId.toString() === productId) item = productId
        // }
        if (action !== 'INC' && action !== 'DEC') {
            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });
        }

        // update quantity based on action keyword
        if (action === 'INC') {

            const productItem = await productModel.findById(productId).select('inStock');

            // 🔴 check product exists
            if (!productItem) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }
            if (productItem.inStock < item.quantity + 1) return res.status(400).json({
                success: false,
                message: "Product is Out of Stock"
            });
            item.quantity += 1;
        }
        else if (action === 'DEC') item.quantity -= 1

        // let's check if the quantity 0 if then remove product
        // we will use filter to remove matching product as whose quantity is 0
        if (item.quantity <= 0) {
            cart.cartItems = cart.cartItems.filter(
                i => i.productId.toString() !== productId
            )
        }

        // lets check if the quanity is increased by the we need to check is product in stock


        // let's calcluate the final amount
        let total = 0;

        cart.cartItems.forEach(item => {
            total += item.price * item.quantity;
        });

        cart.totalAmt = total;

        // save cart
        await cart.save();

        console.log(cart);
        res.status(201).json({
            success: true,
            message: "Update Cart SuccessFully",
            data: cart
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
const getCart = async (req, res) => {
    const cart = await cartModel.findOne({ userId: req.userId }).populate('cartItems.productId', 'name');

    if (!cart) {
        return res.status(200).json({
            success: true,
            message: "Cart is empty",
            data: {
                cartData: [],
                totalAmt: 0
            }
        });
    }

    // data which want to show when user click getCart
    const cartData = cart.cartItems.map(item => ({
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
    }));

    console.log(cart);
    res.status(200).json({
        success: true,
        message: "Your Selected Products is",
        data: {
            cartData,
            totalAmt: cart.totalAmt
        }
    });
}
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.userId;
        // find cart using user id
        const cartProduct = await cartModel.findOne({ userId });
        // remove product from cart using filter

        cartProduct.cartItems = cartProduct.cartItems.filter(item => item.productId.toString() !== productId);
        // now update calculation
        let total = 0;

        cartProduct.cartItems.forEach(item => {
            total += item.price * item.quantity;
        });

        cartProduct.totalAmt = total;

        // save cart
        await cartProduct.save();

        console.log(cartProduct);
        res.status(201).json({
            success: true,
            message: "Product Removed From Cart SuccessFully",
            data: cartProduct
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

}
module.exports = {
    addToCart,
    updateQty,
    getCart,
    deleteProduct
}