const mongoose = require('mongoose');
require('dotenv').config();
async function connectDB() {

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Database Connected Successfully');
    console.log('Database Name: ',mongoose.connection.name);
}

module.exports = connectDB;