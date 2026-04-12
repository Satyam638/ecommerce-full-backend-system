const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const cartModel = require('../models/cart.model');
// const deleteCart = require('../middlewares/inputValidator');


const createOrder = async (req, res) => {

try {
    const { address } = req.body;
    const userId = req.userId;

    // fetch cart
    const cart = await cartModel
        .findOne({ userId })
        .populate('cartItems.productId', 'name');

    if (!cart) {
        return res.status(400).json({
            success: false,
            message: "Cart is Empty"
        });
    }

    // create order items with product name
    const orderItems = cart.cartItems.map(item => ({
        productId: item.productId._id || item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.productId.name
    }));

    // create order
    const newOrder = await orderModel.create({
        userId,
        address,
        cartItems: orderItems,
        totalAmt: cart.totalAmt,
    });

    console.log("Order Created");

    // extract product ids
    const productIds = cart.cartItems.map(
        item => item.productId._id || item.productId
    );

    const products = await productModel
        .find({ _id: { $in: productIds } })
        .select('_id inStock');

    const productMap = {};
    products.forEach(p => {
        productMap[p._id.toString()] = p;
    });

    // reduce stock
    for (let item of cart.cartItems) {


        const productId = item.productId._id || item.productId;
        const product = productMap[
            productId.toString()
        ];

        product.inStock -= item.quantity;

        await product.save();
    }

    console.log('Product Database with Stock data is updated');

    // delete cart
    await cartModel.deleteOne({ userId });
    console.log('Cart is deleted')
    console.log('Order Created: ',newOrder);
    res.status(201).json({
        success: true,
        message: "Order Is completed Let's Move to Payment",
        data: newOrder
    });

} catch (error) {
    console.log(error);
    res.status(500).json({
        success:false,
        message:'Internal Server Error'
    });
}
};
// cancelorder

// orderhistory

// myorders
// const myOrders = async(req,res)=>{
//     try{
//         const {userId} = req.userId;

//         // find order with confired or shipped status

//         const orders = await orderModel.find(
//             {userId:userId},
//         orderStatus:{$in:['SHIPPED','CONFIRE']});

//         if(orders.orderStatus)

//     }
// }
// invoices

// payment

module.exports = {
    createOrder
}