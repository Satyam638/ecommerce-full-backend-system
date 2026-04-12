const jwt = require('jsonwebtoken');
const { userModel } = require('../models/user.model');

const validUser = async(req,res,next) =>{


    const token = req.headers['token'];
    if(!token) return res.status(404).json("Token is Missing");

    const decoded = jwt.verify(token,process.env.SECRET_KEY)

    if(!decoded) {
        return res.status(404).json({
            success:false,
            message:"Token is Invalid"
        })
    }
    req.userId = decoded.userId;
    console.log(`Your are Authenticated User with ${req.userId}`);
    next();
}

const isAdmin = async (req,res,next) =>{

    try{
        const id = req.userId;

        const user = await userModel.findById(id);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }
        // let's check is user admin or not
        console.log(user.userRole);
        if(user.userRole !== 'ADMIN'){
            return res.status(403).json({success:false,message:"Only Admin are Allowed to see all Users"});
        }
        console.log("You are Admin so lets proceed further");;
        next();
    }
    catch(error){
        console.log(error)
        return res.status(505).json({success:false,message:"Internal Server Error"});

    }
}

module.exports = {validUser,isAdmin};

