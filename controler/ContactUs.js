const ContactUsSchema = require("../models/ContactUs.js")

const makecontact = async(req,res)=>{
    try{
        const{firstname, lastname, email, countryCode, phonenumber, message} = req.body
    
        // make new entry
    
        const entry = await ContactUsSchema.create({
            firstname, lastname, email, countryCode, phonenumber, message
        })
    
        if( !firstname || !lastname || !email || !phonenumber || !countryCode ){
            return res.status(400).json({
                success: false,
                message: "all the fields are required",
            })
        }
        
        // console.log(entry )

        return res.status(200).json({
            success: true,
            data: entry,
            message: "response submitted successfully",
        })
    }
    catch(e){
        return res.status(400).json({
            success: false,
            message: e.message,
        })
    }
}

module.exports = {makecontact}