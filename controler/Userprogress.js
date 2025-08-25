const UserSchema = require('../models/User.js');
const CourseSchema = require('../models/Course.js');
const SubSectionSchema = require('../models/SubSection.js');
const progressschema = require('../models/Userprogress.js');

// Create Progress
const createProgress = async (req, res) => {
    try {
        const { userid, courseid } = req.body;

        // Check if user and course exist
        const userExists = await UserSchema.findById(userid);
        const courseExists = await CourseSchema.findById(courseid);

        if (!userExists || !courseExists) {
            return res.status(404).json({ error: "User or Course not found" });
        }

        // Create progress
        const result = await progressschema.create({
            user: userid,
            course: courseid,
        });

        userExists.progress = result._id;
        await userExists.save();


        console.log("Course progress created", result);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Edit Progress
const editProgress = async (req, res) => {
    try {
        const { progressid, subsectionid } = req.body;

        // Check if progress and subsection exist
        const progressExists = await progressschema.findById(progressid);
        const subsectionExists = await SubSectionSchema.findById(subsectionid);

        if (!progressExists || !subsectionExists) {
            return res.status(404).json({ error: "Progress or Subsection not found" });
        }

        // Update progress
        const updatedProgress = await progressschema.findByIdAndUpdate(
            progressid,
            { $addToSet: { subsection: subsectionid } },
            { new: true }
        );

        console.log("Progress updated", updatedProgress);
        res.status(200).json(updatedProgress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { createProgress, editProgress };
