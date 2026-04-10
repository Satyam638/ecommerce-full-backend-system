const productModel = require('../models/product.model');


const isInputValid  = async (req,res,next) => {
    if(!req.body.name){
        return res.status(422).json({message:"Product Name Must be Present in Request"});
    }
    if(!req.body.description){
        return res.status(422).json({message:"Product Description Must be Present in Request"});
    }
    if(!req.body.category){
        return res.status(422).json({message:"Product Category Must be Present in Request"});
    }
    if(!req.body.price){
        return res.status(422).json({message:"Product Price Must be Present in Request"});
    }
    if(!req.file){
        return res.status(422).json({message:"Product Image Must be Present in Request"});
    }

    console.log("Your input is correct let store data")
    next();
}

const validateUserReq = async(req,res,next)=>{

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if(!req.body.name){
        return res.status(422).json("User name must be Present");
    }
    if(!req.body.email || !emailPattern.test(req.body.email)){
        return res.status(422).json("User Email must be Present in proper format");
    }
    if(!req.body.password || !passwordPattern.test(req.body.password)){
        return res.status(422).json("User Password must be Present and Password must contain uppercase, lowercase, number, special char and min 8 length");
    }
    console.log("All fields are valid");
    next();
}

const cartInputValid = async(req,res,next)=>{

    const {cartItems} = req.body;

    // check cart array
    if(!cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json("Cart Item must be Provided and in array format")
    }

    // let's traverse cart array items

    for(let items of cartItems){
        if(!items.productId) {
        return res.status(400).json("Product ID must be Provided and in array format")
    }
    if(!items.quantity) {
        return res.status(400).json("Quantity must be Provided and in array format")
    }

    }
    console.log('Request is Valid, now create create');
    next();
}

const checkProductQty = async(req,res,next)=>{

    const {cartItems} = req.body;

    const productIds = cartItems.map(item => item.productId);
    // const qunatity = cartItems.map(item => item.productId);

    // call to db to all products ids which comes from request

    const product = await productModel.find({
        _id:{$in:productIds}
    }).select('inStock');

    // lets create map for product id and their in_stock number to check either product is available or not
    // we use map because its fast for search

    const productMap ={};

    // traverse product which comes from db call to fetch in_stock number and map

    product.forEach(product=>{
        productMap[product._id.toString()] = product
    })

    // now traverse productMap to check the quanity and in_stock
    for(let item of cartItems){

        const product = productMap[item.productId.toString()]

        if(!product){
            return res.status(400).json("Product Not Found");
        }
        if(item.quantity>product.inStock){
            return res.status(400).json(`Only ${product.inStock} items available`);
        }
    }
    console.log("Let's Add to cart");
    next();
}

module.exports = {
    isInputValid,
    validateUserReq,
    cartInputValid,
    checkProductQty
};