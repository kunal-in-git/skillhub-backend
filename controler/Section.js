const SectionSchema = require("../models/Section.js")
const CourseSchema = require("../models/Course.js")

const createsection = async (req, res) => {
    try {
        const { sectionname, couresid } = req.body

        if (!sectionname || !couresid) {
            return res.status(401).json({
                success: false,
                message: "all the fields are required"
            })
        }

        const createsection = await SectionSchema.create({ sectionname })

        // now update the course

        const updatedcourse = await CourseSchema.findByIdAndUpdate(couresid, { $push: { coursecontent: createsection._id } }, { new: true }).populate("coursecontent")

        console.log("course updated", updatedcourse)

        return res.status(200).json({
            success: true,
            data: createsection,
            message: "section craeted successfully"
        })

    }
    catch (e) {
        return res.status(200).json({
            success: false,
            message: `section not created,${e.message}`
        })
    }
}

// udpate the section name


const updatesection = async (req, res) => {
    try {
        const { sectionname, sectionid } = req.body

        const updatesection = await SectionSchema.findByIdAndUpdate(sectionid, { sectionname: sectionname }, { new: true })

        return res.status(200).json({
            success: true,
            data: updatesection,
            message: "section updated successfully"
        })
    }
    catch (e) {
        return res.status(200).json({
            success: false,
            message: `section not updated,${e.message}`
        })
    }
}



const deletesection = async (req, res) => {
    try {
        const { sectionid, courseid } = req.body;

        // Delete the section from the SectionSchema
        const delsection = await SectionSchema.findByIdAndDelete(sectionid);
        if (!delsection) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        // Remove the section ID from the course's `coursecontent` array
        await CourseSchema.findByIdAndUpdate(courseid, {
            $pull: { coursecontent: sectionid }
        });

        return res.status(200).json({
            success: true,
            data: delsection,
            message: "Section deleted successfully",
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Section not deleted: ${e.message}`,
        });
    }
};

module.exports = { createsection, updatesection, deletesection }



const getsection = async (req, res) => {
    try {
        const { sectionid } = req.query
        console.log(sectionid);
        const data = await SectionSchema.findById(sectionid);

        return res.status(200).json({
            success: true,
            data: data,
            message: "section is here"
        })
    }
    catch (e) {
        return res.status(200).json({
            success: false,
            message: `section details not fetched,${e.message}`
        })
    }
}

module.exports = { createsection, updatesection, deletesection, getsection }