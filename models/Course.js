const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    coursename: {
        type: String,
    },
    description: {
        type: String,
    },

    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserSchema",
    },

    coursecontent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SectionSchema",
    }],
    ratingandreviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReviewSchema",
    }],
    price: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    category: {
        type: String
    },
    // category:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"category"
    // },
    studentsenrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "UserSchema",
    }],

    tags: {
        type: String,
    },

    benefits: {
        type: String
    },

    requirements: {
        type: String
    },

    // instructions: {
    // 	type: String,
    // },
    // status: {
    // 	type: String,
    // 	enum: ["draft", "published"],
    // },
    // createdat: {
    // 	type:Date,
    // 	default:Date.now
    // },

    status: {
        type: String,
        default: "draft"
    },

    date: {
        type: Date,
        default: Date.now // ✅ Correct way to set the default timestamp
    },

    avgrating:{
        type: Number,
        default:0
    }
})

module.exports = mongoose.model("CourseSchema", CourseSchema);