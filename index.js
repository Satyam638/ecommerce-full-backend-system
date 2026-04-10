const express = require('express');
const app = express();
require('dotenv').config()
const mongoose = require('mongoose');
const connectDB = require('./db/db');
const PORT = process.env.PORT || 3000;
const productRoutes = require('../backend/routes/product.route');
const authRoutes = require('../backend/routes/user.route');
const cartRoutes = require('../backend/routes/cart.route');

// middleware
app.use(express.json());
// routes
app.use('/product',productRoutes);
app.use('/auth',authRoutes);
app.use('/cart',cartRoutes);

// connected to DB
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
app.listen(PORT, () => {
    
    console.log(`Your server is running on http://localhost:${PORT}`);
    try {
        connectDB();
    } catch (err) {
        console.log(err);
    }
})