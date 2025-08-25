const ProfileSchema = require('../models/Profile.js')
const UserSchema = require("../models/User.js")
const CourseSchema = require("../models/Course.js")
const cloudinary = require('cloudinary').v2
const progressschema = require("../models/Userprogress.js")
const cartschema = require("../models/Cart.js")

const uploadimageOnCloudinary = async (req, res) => {
    let imageuploaded;
    try {
        const image = req.files.file
        imageuploaded = await cloudinary.uploader.upload(image.tempFilePath, { folder: "MegaProject" })
        return res.status(200).json({
            success: true,
            data: imageuploaded,
            message: "Image uploaded successfully"
        })
    }
    catch (e) {
        return res.status(400).json({
            success: false,
            message: `error in image uploading on cloudinary ${e.message}`
        })
    }
}

const createprofile = async (req, res) => {
    try {
        const { displayname, profession, DOB, gender, countryCode, phonenumber, about } = req.body
        // [user detail was already in req while token created]

        const userid = req.user.decoded.id

        if (!displayname || !profession || !DOB || !countryCode || !phonenumber || !about || !gender) {
            return res.status(400).json({
                success: false,
                message: "All the fields are manditory"
            })
        }

        // now put in db and push

        // create or update => if profile is created with null than udpate 

        const newprofile = await ProfileSchema.create({ displayname, profession, DOB, gender, countryCode, phonenumber, about })
        // console.log("new profile",newprofile)

        // update in user
        const existuser = await UserSchema.findByIdAndUpdate({ _id: userid }, { additionaldetails: newprofile._id }, { new: true }).populate({ path: 'additionaldetails' }).exec()

        // console.log(existuser)

        return res.status(200).json({
            success: true,
            data: existuser,
            message: "additional details added successfully"
        })
    }
    catch (e) {
        return res.status(400).json({
            success: false,
            message: `additional details not added successfully, ${e.message}`
        })
    }
}

const getprofiledata = async (req, res) => {
    try {
        const { id } = req.query;

        const existuser = await UserSchema.findOne({ _id: id }).populate({path:"additionaldetails"});
        
        if (!existuser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        const additionalDetails = existuser.additionaldetails;
        if (!additionalDetails ) {
            return res.status(404).json({
                success: false,
                message: "No additional details found"
            });
        }
        
        console.log("this is id from getprofiledata controller", additionalDetails);

        return res.status(200).json({
            success: true,
            data: additionalDetails,
            message: "Profile details successfully fetched"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `Error fetching profile data: ${error.message}`
        });
    }
};

const deleteaccount = async (req, res) => {
    try {
        const id = req.user.decoded.id;

        // Check if user exists
        const existuser = await UserSchema.findById(id);
        if (!existuser) {
            return res.status(400).json({
                success: false,
                message: `User not found`
            });
        }

        // Delete user profile
        await ProfileSchema.findByIdAndDelete(existuser.additionaldetails);

        // Delete user account
        await UserSchema.findByIdAndDelete(id);

        // Remove user from enrolled courses
        await CourseSchema.updateMany(
            { _id: { $in: existuser.courses } },
            { $pull: { studentsenrolled: id } }
        );

        // Delete user progress
        await progressschema.findByIdAndDelete(existuser.progress);

        // Delete user cart
        await cartschema.findByIdAndDelete(existuser.cart);

        return res.status(200).json({
            success: true,
            message: "Your account has been successfully deleted"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `User account deletion failed: ${error.message}`
        });
    }
};


module.exports = { createprofile, deleteaccount, uploadimageOnCloudinary, getprofiledata }