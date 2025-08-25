const mongoose = require('mongoose')

const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description:{
        type: String,
    },

    course:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseSchema"
    }]
})

module.exports = mongoose.model("CategorySchema", CategorySchema)