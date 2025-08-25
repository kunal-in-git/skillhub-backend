const jwt = require('jsonwebtoken')
require('dotenv').config()

const auth = (req,res,next)=>{
    try{
        // their are three ways to get value of a token by body, by bearer, by cookie
        console.log("this is from header",req.header("Authorization"));
        const token = 
        
        // this is best way and by body is worst way
        req.header("Authorization").replace("Bearer ", "")
        // req.header.Authorization.split(" ")[1]

        if( !token ){
            console.log("header is not present");
        }

        console.log("this is token in auth", token)

        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // by this we can send anything to req for furthur use
        
        // req.body = decoded will overright the req body 
        req.user = {decoded};
        console.log(req.body)
        console.log("Authorization done")
        next()
    }
    catch(e){
        res.status(200).json({
            success: false,
            message: `token not verified ${e.message}`       
        })
    }
}

const isstudent = (req,res,next)=>{
    try{
        if( req.user.decoded.role === 'student' ){
            console.log("you are a student")
            next()
        }
        else{
            res.status(200).json({
                success: false,
                message: `Only student entry is allowed`       
            })
        }
    }
    catch(e){
    }
}

const isadmin = (req,res,next)=>{
    try{
        if( req.user.decoded.role === "admin" ){
            console.log("you are an admin")
            next()
        }
        else{
            res.status(200).json({
                success: false,
                message: `Only Admin entry is allowed`       
            })
        }
    }
    catch(e){
    }
}


const isinstructor = (req,res,next)=>{
    try{
        if( req.user.decoded.role === 'instructor' ){
            console.log("you are an instructor")
            next()
        }
        else{
            res.status(200).json({
                success: false,
                message: `Only instructor entry is allowed`       
            })
        }
    }
    catch(e){
    }
}


module.exports = { auth, isstudent, isadmin, isinstructor }