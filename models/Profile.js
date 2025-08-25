const mongoose = require("mongoose")

const ProfileSchema = mongoose.Schema({
    displayname:{
        type: String,
        required: true,
        trim: true
    },

    profession:{
        type: String,
        required: true,
    },
    
    DOB:{
        type: Date,
        required: true
    },

    gender:{
        type: String,
        required: true,
    },

    countryCode:{
        type: String,
        required: true,
    },

    phonenumber:{
        type: String,
        required: true,
    },

    about:{
        type: String,
        required: true,
    },

})

module.exports = mongoose.model("ProfileSchema", ProfileSchema )