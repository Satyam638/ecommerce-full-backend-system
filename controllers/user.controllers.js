const { userModel } = require('../models/user.model');
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const redisClient = require('../config/redis');

// admin dashboards
const dashboards = async (req, res) => {
    try {

        // lets find is data stored in cache or not
        let cacheDashboard = 'dashboard-data';
        const data = await redisClient.get(cacheDashboard);

        // if data is cached thenr return cached data 
        if (data) {
            console.log('Cache Hit');
            console.log(JSON.parse(data));
            return res.status(200).json({ success: true, message: "Admin Dashboard", dshboard: JSON.parse(data) });
        }
        // else make fresh entry and store into cache
        else {
            let [totalRevenue, revenueByPayType, orderDelivered, orderPending, orderShipped, totalUsers, lowestProducts] = await Promise.all([
                // find total revenue
                orderModel.aggregate([
                    {
                        $match: { orderStatus: "DELIVERED" }
                    },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: "$totalAmt" }
                        }
                    }
                ]),
                // total revenue by payment type whose payment is confirmed
                orderModel.aggregate([
                    {
                        $match: { paymentStatus: 'CONFIRMED' }
                    },
                    {
                        $group: {
                            _id: "$paymentType",
                            revenueByPayType: { $sum: "$totalAmt" }
                        }
                    }
                ]),

                // total orderdelivered
                orderModel.countDocuments({ orderStatus: 'DELIVERED' }),
                // total orderPending
                orderModel.countDocuments({ orderStatus: 'INITIATED' }),
                // total order shipped 
                orderModel.countDocuments({ orderStatus: 'SHIPPED' }),

                // total users
                userModel.countDocuments({ userRole: 'USER' }),
                // lowest stock product
                productModel.find().select('name inStock').sort({ inStock: 1 }).limit(10),
            ]);

            const output = {
                totalRevenue,
                revenueByPayType,
                orderDelivered,
                orderPending,
                orderShipped,
                totalUsers,
                lowestProducts
            }

            // store into cache
            console.log('Cache Miss');
            await redisClient.setEx('dashboard-data',120,JSON.stringify(output));
            console.log("Admin Dashboard: ", output);

            res.status(200).json({
                success: true,
                message: "Admin Dashboard",
                data: output
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(
            "Internal Server Error")
    };
}

// create user
console.log(userModel);
const registerUser = async (req, res) => {
    // check request is validate or not if then move to next
    const { name, email, password, userRole } = req.body
    // check is user exist or not
    const isuserExist = await userModel.findOne({ email });

    if (isuserExist) return res.status(400).json({
        status: false,
        message: "User is Already Exits"
    });

    // lets create hash password for hashing
    const hashpassword = await bcryptjs.hash(password, 10);

    // lets create user
    const newUser = await userModel.create({
        name,
        email,
        password: hashpassword,
        userRole
    })
    // create token
    // const token = jwt.sign({
    //     userid: newUser._id,
    //     email: newUser.email
    // }, process.env.SECRET_KEY,
    //     { expiresIn: '1d' }
    // )

    // res.cookie("token", token)

    console.log('Register User', newUser);
    res.status(201).json({
        success: true,
        message: "User Register Successfully",
        data: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        }
    })
}
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check user is exist or not

        const isUserExist = await userModel.findOne({ email });


        if (!isUserExist) return res.status(404).json({ success: false, message: "User Not Found, Please Register First" })

        // let compare password

        const isMatch = await bcryptjs.compare(password, isUserExist.password);

        if (!isMatch) return res.status(404).json({ success: false, message: "Wrong Password, Enter Correct Password" })

        const token = jwt.sign({
            userId: isUserExist._id,
            email: isUserExist.email
        },
            process.env.SECRET_KEY,
            {
                expiresIn: '1d'
            })
        res.cookie("token", token);

        console.log('token', token);

        console.log('Login User', isUserExist);
        res.status(201).json({
            success: true,
            message: "User Login Successfully",
            data: {
                id: isUserExist._id,
                name: isUserExist.name,
                email: isUserExist.email
            }
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
// reset password
const resetPassword = async (req, res) => {
    try {
        const { email, oldPass, newPass } = req.body;


        const isUserExist = await userModel.findOne({ email });


        if (!isUserExist) return res.status(404).json({ success: false, message: "User Not Found, Please Register First" })

        // let compare password

        const isMatch = await bcryptjs.compare(oldPass, isUserExist.password);
        if (!isMatch) return res.status(404).json({ success: false, message: "Wrong Password, Enter Correct Password" })

        // it means credential is correct so let convert newpass into hash password

        const newHashPassword = await bcryptjs.hash(newPass, 10);
        // update into database 
        isUserExist.password = newHashPassword
        await isUserExist.save();
        console.log("Updated Password successfully");

        res.status(200).json({
            success: true, message: "Update Password Successfully",
            data: isUserExist
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
// logout user
const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "You Logout Successfully" })
}
// get all user
const getAlluser = async (req, res) => {
    try {
        const allUser = await userModel.find().select('name email userRole');
        console.log(allUser);
        res.status(200).json({ success: true, message: "All User are", data: allUser })
    } catch (eerror) {
        console.log(error);
        res.status(505).json("Internal Server Error");
    }
}

// get speicific user

module.exports = {
    dashboards,
    registerUser,
    loginUser,
    resetPassword,
    getAlluser,
    logoutUser
}