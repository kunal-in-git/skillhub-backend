const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },

    lastname: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    accounttype: {
        type: String,
        required: true,
        enum: ['admin', 'student', 'instructor']
    },

    // this is not needed we can store all the things 
    // at single place here during signup

    additionaldetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProfileSchema"
    },

    // i thing course should be an array of objectid because a student can buy multiple courses

    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseSchema"
    }],

    image: {
        type: String,
    },

    // this token will help in password reset at time of forgot
    forgotpasstoken: {
        type: String,
        // we cant write expire here because token is string type and expires apply with type Date
    },

    forgotpasstokenexpires: {
        type: Date,
        // this is delete the whole user with that registered email after 5 miutes
        // expires: 300 // 5 minutes
    },

    resetpasswordexpirein: {
        type: Date,
        // kya yaha likhe se kaam nahi chalega
        // expires: 5*60*1000
    },

    progress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "progressschema"
    },

    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartschema"
    }
})

module.exports = mongoose.model("UserSchema", UserSchema)