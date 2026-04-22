const rateLimiter = require('express-rate-limit');

// create login rate limitter to protect API from abuse and make available resouces available to all users

const loginRateLimiter = rateLimiter({
    windowMs:5*60*1000,  // 5 min
    max:5,
    message:{
        succes:false,
        message:"Too many Login Request, Please Login After 5 minutes"
    }
});

const RegRateLimiter = rateLimiter({
    windowMs:5*60*1000,  // 5 min
    max:3,
    message:{
        succes:false,
        message:"Too many Request, Please Register Again After 5 minutes"
    }
});

const createRateLimiter = rateLimiter({
    windowMs:5*60*1000,  // 5 min
    max:2,
    message:{
        succes:false,
        message:"Too many Login Request, Please Login After 5 minutes"
    }
});

module.exports = {
    loginRateLimiter,RegRateLimiter,createRateLimiter
}