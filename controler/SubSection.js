const SubSectionSchema = require("../models/SubSection.js")
const SectionSchema = require("../models/Section.js")
const cloudinary = require('cloudinary').v2

const createsubsection = async (req, res) => {
    try {
        const { sectionid, title, timeduration, description } = req.body
        const video = req.files.file

        console.log("this is videofile", video)

        if (!sectionid || !title || !timeduration || !description) {
            res.status(401).json({
                success: false,
                message: "all fields are required"
            })
        }

        const option = { folder: process.env.FOLDER_NAME, resource_type: "auto" }
        console.log("this is temp file path", video.tempFilePath);

        let videolink;
        try {
            videolink = await cloudinary.uploader.upload(video.tempFilePath, option)
        }
        catch (e) {
            return res.status(401).json({
                success: false,
                message: `unable to upload video, ${e.message}`,
            })
        }


        videolink = videolink.secure_url;
        console.log("this is video from cloudinary", videolink);

        const newsubsection = await SubSectionSchema.create({
            title, timeduration, description, "videourl": videolink
        })

        const updatesection = await SectionSchema.findByIdAndUpdate(sectionid, { $push: { subsection: newsubsection._id } }, { new: true }).populate("subsection")

        console.log("updated section", updatesection)
        console.log("new subsection", newsubsection)

        return res.status(200).json({
            success: true,
            message: "section updated successfully",
            data: newsubsection
        })
    }
    catch (e) {
        return res.status(400).json({
            success: false,
            message: `section not updated ${e.message}`,
        })
    }
}



const updatesubsection = async (req, res) => {
    try {
        const { title, subsectionid, timeduration, description } = req.body
        const video = req.files.file

        console.log("this is videofile", video)
        if (!subsectionid || !title || !timeduration || !description || !video) {
            res.status(401).json({
                success: false,
                message: "all fields are required"
            })
        }

        const option = { folder: process.env.FOLDER_NAME, resource_type: "auto" }
        console.log("this is temp file path", video.tempFilePath);

        let videolink;
        try {
            videolink = await cloudinary.uploader.upload(video.tempFilePath, option)
        }
        catch (e) {
            return res.status(401).json({
                success: false,
                message: `unable to upload video, ${e.message}`,
            })
        }


        videolink = videolink.secure_url;
        console.log("this is video from cloudinary", videolink);

        console.log(title, " title ", subsectionid, " subsectionid", timeduration, " timeduration", description, " description", videolink, "videolink");

        const updatesubsection = await SubSectionSchema.findByIdAndUpdate(subsectionid,
            {
                title: title,
                timeduration: timeduration,
                description: description,
                videourl: videolink
            }, { new: true })

        console.log("this is data by updation of subsection", updatesubsection);
        return res.status(200).json({
            success: true,
            data: updatesubsection,
            message: "subsection updated successfully"
        })

    }
    catch (e) {
        return res.status(200).json({
            success: false,
            message: `subsection not updated,${e.message}`
        })
    }
}

const markasdone = async (req, res) => {
    try {
        const { subsectionid } = req.body;
        console.log("this is subsection id", subsectionid);

        // Find and update the subsection, marking it as completed
        const deletesubsection = await SubSectionSchema.findByIdAndUpdate(
            subsectionid,
            { completed: true },
            { new: true }
        );

        // Check if the subsection was found and updated
        if (!deletesubsection) {
            return res.status(404).json({ message: "Subsection not found" });
        }

        // Send a success response
        return res.status(200).json({
            message: "Subsection marked as completed successfully",
            data: deletesubsection
        });
    } catch (error) {
        console.error("Error marking subsection as done:", error);
        return res.status(500).json({ message: "An error occurred while updating the subsection" });
    }
};


const deletesubsection = async (req, res) => {
    try {
        const { subsectionid } = req.body
        console.log("this is subsection id", subsectionid);
        const deletesubsection = await SubSectionSchema.findByIdAndDelete(subsectionid, { new: true })

        // we should delete the subsetion from section to 

        return res.status(200).json({
            success: true,
            data: deletesubsection,
            message: "subsection deleted successfully"
        })
    }
    catch (e) {
        return res.status(200).json({
            success: false,
            message: `subsection not deleted,${e.message}`
        })
    }
}


module.exports = { createsubsection, updatesubsection, deletesubsection, markasdone } 