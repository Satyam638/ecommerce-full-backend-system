const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique:true
    },
    cartItems:[
        {
            productId:{
                type:[mongoose.Schema.Types.ObjectId],
                ref:'Product',
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
            },
            name:{
                type:String,
            },
            price:{
                type:Number,
            }
        }
    ],
    totalAmt:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

const cartModel = mongoose.model('Cart',cartSchema);

module.exports = cartModel;