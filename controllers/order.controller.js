const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const cartModel = require('../models/cart.model');
const Razorpay = require('razorpay');
const razorpayInstance = require('../config/razorpay');
const { verify } = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('../services/emailService');
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
        console.log('Order Created: ', newOrder);
        res.status(201).json({
            success: true,
            message: "Order Is completed Let's Move to Payment",
            data: newOrder
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
// cancelorder action only by admin
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderid;
        // find order from db
        const isOrderExist = await orderModel.findById(orderId)
        // check order is exist or not 
        if (isOrderExist.orderStatus !== "REQUEST_CANCEL") return res.status(400).json({ message: "Cancelled Request Not Found" });
        isOrderExist.orderStatus = 'CANCELLED';
        // save database
        await isOrderExist.save();
        console.log(isOrderExist);

        setTimeout(() => {
            res.status(200).json({ success: false, message: "Order is Cancelled successully", data: isOrderExist })
        }, 2000);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
// request comes from user
const requestCancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.userId

        const findOrder = await orderModel.findById(orderId);
        // check order exist or not
        if (!findOrder) return res.status(400).json({ success: false, message: "Order Not Found" });
        // check is the order belong to the same logged in user or nor
        if (userId.toString() !== findOrder.userId.toString()) return res.status(403).json({ success: false, message: "This Order is not belongs to you" });
        // if stastu is already delivered then not perform operation
        if (findOrder.orderStatus === 'DELIVERED') return res.status(400).json({ success: false, message: "Order can't be Cancelled" });

        // now mark request cancel and return user
        findOrder.orderStatus = 'REQUEST_CANCEL';
        // save database 
        await findOrder.save();
        // return response
        console.log('Request is Raised for Cancel Order');
        res.status(200).json({ success: true, message: "Request is Raise for Cancel Order", data: findOrder });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// myorders
const myOrders = async (req, res) => {
    try {
        const userId = req.userId;

        // find order with confired or shipped status

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
        const orderDetails = orders.map(order => {
            return {
                orderId: order._id,
                orderStatus: `Product will be ${order.orderStatus}`,
                paymentStatus: `Payment Status is ${order.paymentStatus}`,
                totalAmt: order.totalAmt,
                items: order.cartItems.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
        });
        console.log("Your Orders are:", orders);
        res.status(200).json({ success: true, message: "Your Order are", data: orderDetails });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
// payment
const createPaymentOrder = async (req, res) => {
    try {

        const { orderId } = req.body;

        // find order

        const order = await orderModel.findById(orderId);

        if (!order) return res.status(404).json({ success: false, messge: "Order Not Found" })

        // lets fetch totalamount
        const options = {
            amount: order.totalAmt * 100, //convert into paise
            currency: "INR",
            receipt: `receipt${order._id.toString()}`
        }

        // call razorpay to create payment order
        const paymetOrder = await razorpayInstance.orders.create(options);

        console.log(paymetOrder);

        // store createorderid comes from razorpay API to order
        order.paymentOrderId = paymetOrder.id;

        // save database
        await order.save();

        // return response to perform payment
        console.log("orderId:", order.paymentOrderId);
        res.json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            amount: paymetOrder.amount,
            currency: paymetOrder.currency,
            razorpayOrderId: paymetOrder.id
        })


    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error creating payment order" });
    }
}
// let's confirm payment is completed or not
const verifyPayment = async (req, res) => {

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // generate signature to verify payment is done ot not
        const generateSignature = crypto.createHmac("sha256",
            process.env.RAZORPAY_KEY_SECRET).
            update(razorpay_order_id + "|" + razorpay_payment_id).
            digest('hex');

        if (generateSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment Verification Failed" });
        }
        // payment is verified
        console.log("Payment is Verified");
        const order = await orderModel.findOne({ paymentOrderId: razorpay_order_id }).populate('userId');

        order.paymentStatus = 'CONFIRMED';
        order.orderStatus = 'SHIPPED';

        // let's mail to the user
        console.log("Username: ", order.userId.email);
        sendMail(
            order.userId.email,
            "Payment is Successful 🎉",
            `Hello ${order.userId.name}, your payment ${order.totalAmt} is successful,
            Thank You for Shopping With Us`
        );

        await order.save();

        res.status(200).json({
            success: true,
            message: "Payment successful"
        });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Verification failed" });
    }
}

module.exports = {
    createOrder,
    myOrders,
    cancelOrder,
    requestCancelOrder,
    createPaymentOrder,
    verifyPayment
}