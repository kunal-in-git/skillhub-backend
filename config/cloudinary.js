const cloudinary = require("cloudinary").v2;

const cloudinaryconnect = ()=>{
    try{
        cloudinary.config({
            
            // case sensitive
            cloud_name: process.env.CLOUD_NAME, // Correct key
            api_key: process.env.API_KEY,      // Correct key
            api_secret: process.env.API_SECRET // Correct key
        })
        console.log("successfully connected with cloudinary")
    }
    catch(e){
        console.log(e)
    }
}

module.exports = cloudinaryconnect