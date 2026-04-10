const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const { userModel } = require('../models/user.model');

const addToCart = async (req,res)=>{
    try{
        const { cartItems } = req.body;

        // extract product ids
        const productIds = cartItems.map(item => item.productId);

        // fetch products
        const productDetails = await productModel.find({
            _id:{$in:productIds}
        }).select('name price');

        // create map
        const productMap = {};

        productDetails.forEach(p => {
            productMap[p._id.toString()] = p;
        });

        // calculate total
        let totalAmt = 0;

        const updatedCartItems = cartItems.map(item=>{

            const product = productMap[item.productId.toString()];

            const itemPrice = product.price * item.quantity;

            totalAmt += itemPrice;

            return{
                productId:item.productId,
                quantity:item.quantity,
                price:product.price
            }
        });

        // create cart
        const cart = await cartModel.create({
            userId:req.userId,
            cartItems:updatedCartItems,
            totalAmt
        });
        console.log("Cart is Created SuccessFully",cart);
        res.status(201).json({
            success:true,
            message:"Cart created successfully",
            data:cart
        });

    }catch(error){
        console.log(error);

        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });
    }
}

const updateQty = async(req,res)=>{
    try{
        const {action,productId} = req.body
        const userId = req.userId;

        const cart = await cartModel.findOne({userId})
        const item = cart.cartItems.find(item=>item.productId.toString() === productId)

        // for(let item of cart.cartItems){
        //     if(item.productId.toString() === productId) item = productId
        // }

        // update quantity based on action keyword

        if(action === 'INC'){

            const productItem = await productModel.findById(productId).select('inStock');
            
            if(productItem.inStock<item.quantity+1) return res.status(400).json({
                success:false,
                message:"Product is Out of Stock"
            });
            item.quantity+=1;
        }
        else if(action === 'DEC') item.quantity-=1

        // let's check if the quantity 0 if then remove product
        // we will use filter to remove matching product as whose quantity is 0
        if(item.quantity <= 0){
            cart.cartItems = cart.cartItems.filter(
                i=>i.productId.toString() !== productId
            )
        } 

        // lets check if the quanity is increased by the we need to check is product in stock


        // let's calcluate the final amount
        let total =0;

        cart.cartItems.forEach(item=>{
            total+= item.price*item.quantity;
        });

        cart.totalAmt = total;

        // save cart
        await cart.save();

        console.log(cart);
        res.status(201).json({
            success:true,
            message:"Update Cart SuccessFully",
            data:cart
        });
    }catch(error){
        console.log(error);

        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });
    }
}
const getCart = async(req,res)=>{
    const cart = await cartModel.findOne({userId:req.userId}).populate('cartItems.productId','name');

    console.log(cart);
    res.status(200).json({
        success:true,
        message:"Your Selected Products is",
        data:cart
    });
}

module.exports = {
    addToCart,
    updateQty,
    getCart
}