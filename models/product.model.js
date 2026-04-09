const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    productImage:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true,
    },
    inStock:{
        type:Number,
        default:100
    },
},{
    timestamps:true
})

const productModel = mongoose.model('Product',productSchema);

module.exports = productModel;