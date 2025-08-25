const instance = require('../config/razorpay.js')
const CourseSchema = require('../models/Course.js')
const UserSchema = require("../models/User.js")
const mailer = require("../config/nodemailer.js")
const crypto  = require('crypto')

const makepayment = async( req, res )=>{
    const{userid, courseid} = req.body

    const existuser = await UserSchema.findOne({_id:userid})

    if( !existuser ){
        return res.status(401).json({
            success: false,
            message: "Not a valid exist user"
        })
    }

    // console.log("existuser", existuser) 
    let existcourse
    // now check that the user has already bought the course of not
    
    try{
        existcourse  = await CourseSchema.findOne({_id:courseid})
        
        if( !existcourse ){
            return res.status(401).json({
                success: false,
                message: "Not a valid course"
            })
        }

        // to check in array include will be used   

        // love babbar done this and put it into userid
        // const uid = new mongoose.Types.ObjectId(userid)

        // he told in course user id act as object id to we converted userid( string h )

        // upper way is outdated
        // const uid = new mongoose.Types.createFromTime(userid)

        if( existcourse.studentsenrolled.includes(userid)){
            return res.status(401).json({
                success: false,
                message: "Student already bought the course"
            })
        }        
    }
    catch(e){
        return res.status(401).json({
            success: false,
            message: `error in find user in the course ${e.message}`
        })
    }
    
    // create order

    const amount = existcourse.price
    const currency = 'INR'

    const options = {
        amount: amount * 100,
        currency,
        
        // all below are optional data

        receipt: `receipt no. is ${Date.now()}`,
        notes:{
            courseid: existcourse._id,
            userId: userid
        }
    }

    try{
        // payment initiate

        const paymentresponse = await instance.orders.create(options)

        console.log("paymentresponse",paymentresponse)

        return res.status(200).json({
            success: true,
            message: "payment done successfully",
            coursename: existcourse.coursename,
            coursedescription: existcourse.coursedescription,
            thumbnail: existcourse.thumbnail,
            orderid: paymentresponse.id,
            amount: paymentresponse.amount,
            currency: paymentresponse.currency
        })        
    }
    catch(e){
        return res.status(401).json({
            success: false,
            message: `error in payment ${e.message}`
        })
    }
}


// verify signature of razorpay

const verifysignature = async (req,res)=>{
    try{

        const webhooksecret = "12345678"
        
        // signature of razorpay
        
        const signature = req.headers["x-razorpay-signature"]
        
        // the signature is being hashed so reversing is not allowed 
        // so will be apply hashing on webhooksecret and then compare signature and hashed webhooksecret
        
        // hasfunction sha256
        const shasum = crypto.createHmac( "sha256", webhooksecret )
        
        // req.body me data kya h vo nahi pata
        shasum.update(JSON.stringify(req.body))
        
        // the output of hashed function is sometime called digest 
        const digest = shasum.digest("hex")
        
        console.log("signature", signature )
        console.log("digest", digest )

        if( signature === digest ){
            console.log("payment is authorized")
            
            const {userid, courseid} = req.body.payload.payment.entity.notes
            
            try{
                // find the course and add user in it
                
                const enrollstudent = await CourseSchema.findByIdAndUpdate({_id: courseid}, {$push: {"studentsenrolled":userid}}, {new: true})
                
                console.log("student enrolled", enrollstudent)
                
                if(!enrollstudent){
                    return res.status(401).json({
                        success: false,
                        message: `student not enrolled`
                    })                
                }
                
                const addcourse = await UserSchema.findByIdAndUpdate({_id:userid}, {$push:{'courses':courseid}}, {new: true})
                
                console.log("corse added into user bought courses",addcourse)
                
                if( !addcourse ){
                    return res.status(401).json({
                        success: false,
                        message: `course not added`
                    })                
                }
                
                // send the mail
                
                try{
                    const existuser = await UserSchema.findOne({_id:userid})
                    const mail = await mailer.sendMail({
                        from: 'From Kunal Kumawat',
                        to: existuser.email,
                        subject: "course purchased",
                        html: `<div>Congratulation you have successfully bought the course</div>`
                    })
                    console.log("mail", mail)
                }
                catch(e){
                    console.log(e.message)
                }
            }   
            catch(e){
            return res.status(401).json({
                success: false,
                message: `course not bought ${e.message}`
            })                
        }
        }
        else{
            return res.status(401).json({
                success: false,
                message: "signature not matched"
            })  
        }

        return res.status(200).json({
            success: true,
            message: "signature verified and your are successfully enrolled into the course"
        })  
    }
    catch(e){
        return res.status(401).json({
            success: true,
            message: `error in payment ${e.message}`
        })  
    }
}


module.exports = {makepayment, verifysignature}