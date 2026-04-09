const isInputValid  = async (req,res,next) => {
    if(!req.body.name){
        return res.status(422).json({message:"Product Name Must be Present in Request"});
    }
    if(!req.body.description){
        return res.status(422).json({message:"Product Description Must be Present in Request"});
    }
    if(!req.body.category){
        return res.status(422).json({message:"Product Category Must be Present in Request"});
    }
    if(!req.body.price){
        return res.status(422).json({message:"Product Price Must be Present in Request"});
    }
    if(!req.file){
        return res.status(422).json({message:"Product Image Must be Present in Request"});
    }

    console.log("Your input is correct let store data")
    next();
}

const validateUserReq = async(req,res,next)=>{

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if(!req.body.name){
        return res.status(422).json("User name must be Present");
    }
    if(!req.body.email || !emailPattern.test(req.body.email)){
        return res.status(422).json("User Email must be Present in proper format");
    }
    if(!req.body.password || !passwordPattern.test(req.body.password)){
        return res.status(422).json("User Password must be Present and Password must contain uppercase, lowercase, number, special char and min 8 length");
    }
    console.log("All fields are valid");
    next();
}

module.exports = {isInputValid,validateUserReq};