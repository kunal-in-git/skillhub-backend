const mongoose = require("mongoose");

const RatingAndReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "UserSchema",
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },

    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "CourseSchema"
    }

});

module.exports = mongoose.model("RatingAndReviewSchema", RatingAndReviewSchema)