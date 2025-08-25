const mongoose =  require('mongoose');

const ContactUsSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },

    lastname:{
        type: String,
        required: true
    },

    email: {
        type: String, 
        required: true
    },

    phonenumber: {
        type: String,
        required: true
    },

    message: {
        type: String,
    }
})

module.exports = mongoose.model("ContactUsSchema", ContactUsSchema)