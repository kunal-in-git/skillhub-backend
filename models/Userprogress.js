const mongoose = require("mongoose");

const progressschema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },

    course: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "CourseSchema",
        },
        subsection: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSectionSchema",
            default: []
        }]
    }]
});

module.exports = mongoose.model("progressschema", progressschema);
