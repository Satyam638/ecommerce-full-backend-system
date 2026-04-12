const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userId: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    },
    address: {
        type:String,
        required: true,
    },
    orderStatus: {
        type:String,
        enum: ['SHIPPED', 'DELIVERED', 'REJECTED','INITIATED'],
        default: 'INITIATED'
    },
    paymentType: {
        type:String,
        enum: ['UPI', 'CREDIT CARD', 'COD'],
        default: 'COD'
    },
    paymentStatus:{
        type:String,
        enum:['CONFIRMED','INCOMPLETE'],
        default:'INCOMPLETE'
    },
    cartItems: [
        {
            productId: {
                ref: 'Product',
                type: mongoose.Schema.Types.ObjectId
            },
            quantity:Number,
            price:Number,
            productName:String
        }
    ],
    totalAmt:Number
},{
    timestamps:true
});

const orderModel = mongoose.model('Order',orderSchema);

module.exports = orderModel;