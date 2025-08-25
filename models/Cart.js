const mongoose = require('mongoose')

const cartschema = mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserSchema"
    },

    course:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseSchema",
        default:[]
    }]
})

module.exports = mongoose.model("cartschema", cartschema)