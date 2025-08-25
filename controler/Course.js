const CourseSchema = require('../models/Course.js')
const CategorySchema = require('../models/Category.js')
const UserSchema = require('../models/User.js')
const SectionSchema = require('../models/Section.js')
const SubSectionSchema = require('../models/SubSection.js')


const cloudinary = require('cloudinary').v2
require('dotenv').config()

const createcourse = async (req, res) => {
    try {
        const { coursename, description, price, category, tags, benefits, requirements, thumbnail } = req.body

        // console.log(coursename, description, price, category, tags, benefits, requirements, thumbnail);
        if (!coursename || !description || !tags || !price || !category || !benefits || !requirements || !thumbnail) {
            return res.status(401).json({
                success: false,
                message: "all the fields are required"
            })
        }


        // check for instructor for putting the instructor id

        // this is userid ?

        const instructorid = req.user.decoded.id
        console.log(instructorid)

        // by this we will get object id ?

        // difference between user and object id

        const existinstructor = await UserSchema.findOne({ _id: instructorid })

        console.log("this is info of instructor", existinstructor)

        if (!existinstructor) {
            return res.status(401).json({
                success: false,
                message: "Instructor doesn't exists"
            })
        }


        const categorydetails = await CategorySchema.findOne({ name: category })
        console.log("this is categorydetail", categorydetails)

        if (!categorydetails) {
            return res.status(401).json({
                success: false,
                message: "category deosn't exists"
            })
        }

        // const option = {folder:process.env.FOLDER_NAME, resource_type: "auto"}

        // try{          
        //     thumbnailimage = await cloudinary.uploader.upload( thumbnail.thumbnailimage.tempFilePath, option )
        // }
        // catch(e){
        //     return res.json({
        //         success: false,
        //         message: `unable to upload image, ${e.message}`,
        //     })
        // }

        let newcourse = await CourseSchema.create({
            coursename: coursename, description: description, instructor: existinstructor._id, benefits: benefits, price: price, category: category, thumbnail: thumbnail, tags: tags, requirements: requirements
        })

        // populate is not used over create
        newcourse = await newcourse.populate([{ path: 'instructor' }, { path: 'category' }])
        // add the course in category data base

        // const getcategdata = await CategorySchema.findOne({name: category})

        await existinstructor.updateOne({ $push: { courses: newcourse._id } })
        await categorydetails.updateOne({ $push: { course: newcourse._id } })

        console.log(newcourse)

        // add the new course into instructor

        const updatelist = UserSchema.findByIdAndUpdate(instructorid, { $push: { course: newcourse._id } })

        console.log(updatelist)

        return res.json({
            success: true,
            message: `newcourse created successfully`,
            data: newcourse
        })
    }
    catch (e) {
        return res.json({
            success: false,
            message: `New course not created, ${e.message}`,
        })
    }
}

const editcourse = async (req, res) => {
    try {
        const { coursename, description, price, category, tags, benefits, requirements, thumbnail, courseid } = req.body;

        // Update the course in the database
        const updatecourse = await CourseSchema.findByIdAndUpdate(
            courseid,
            {
                coursename: coursename,
                description: description,
                benefits: benefits,
                price : price,
                category: category,
                thumbnail: thumbnail,
                tags: tags,
                requirements: requirements
            },
            { new: true } // Return the updated document
        );

        // If course is not found, return 404 response
        if (!updatecourse) {
            console.log(`Course with ID ${courseid} not found`);
            return res.status(404).json({ message: "Course not found" });
        }

        // Log and send the updated course data
        console.log("Course updated successfully:", updatecourse);
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            updatedCourse: updatecourse
        });

    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



const getallcourse = async (req, res) => {
    try {
        const allcourse = await CourseSchema.find({}, {
            coursename: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingandreviews: true,
            studentsenrolled: true
        }).populate("instructor").populate("studentsenrolled")

        return res.json({
            success: true,
            data: allcourse,
            message: `All the courses are here`,
        })
    }
    catch (e) {
        return res.json({
            success: false,
            message: `problem in fetching all the courses, ${e.message}`,
        })
    }
}

const getcoursedetail = async (req, res) => {
    try {
        const { courseid } = req.query
        const existcourse = await CourseSchema.findOne({ _id: courseid })

            // .populate({
            //     path: "instructor",
            //     populate: { path: "additionaldetails" } // ✅ Nested population inside instructor
            // })
            // .populate({
            //     path: "coursecontent",
            //     populate: { path: "subsection" } // ✅ Populate subsection inside coursecontent
            // })
            // .populate({ path: "ratingandreviews" })
            // .populate({
            //     path: "studentsenrolled",
            //     populate: { path: "additionaldetails" } // ✅ Nested population inside studentsenrolled
            // });

            // this is good for you

            .populate([{ path: 'instructor', populate: ([{ path: "additionaldetails" }]) }, { path: 'coursecontent', populate: ([{ path: "subsection" },]) }, { path: "ratingandreviews" }, { path: "studentsenrolled", populate: ([{ path: "additionaldetails" }]) }])

        console.log(existcourse)

        if (!existcourse) {
            return res.status(401).json({
                successs: false,
                message: "nothing is available in course"
            })
        }

        return res.status(200).json({
            successs: true,
            data: existcourse,
            message: "info of course is successfully fetched"
        })
    }

    catch (e) {
        return res.status(401).json({
            successs: false,
            message: `nothing is available in course, ${e.message}`
        })
    }
}

const publishCourse = async (req, res) => {
    try {
        const { courseid } = req.body

        const existcourse = await CourseSchema.findOne({ _id: courseid })

            // .populate({
            //     path: "instructor",
            //     populate: { path: "additionaldetails" } // ✅ Nested population inside instructor
            // })
            // .populate({
            //     path: "coursecontent",
            //     populate: { path: "subsection" } // ✅ Populate subsection inside coursecontent
            // })
            // .populate({ path: "ratingandreviews" })
            // .populate({
            //     path: "studentsenrolled",
            //     populate: { path: "additionaldetails" } // ✅ Nested population inside studentsenrolled
            // });

            // this is good for you

            .populate([{ path: 'instructor', populate: ([{ path: "additionaldetails" }]) }, { path: 'coursecontent', populate: ([{ path: "subsection" }]) }, { path: "ratingandreviews" }, { path: "studentsenrolled", populate: ([{ path: "additionaldetails" }]) }])

        console.log("existcourse", existcourse);
        existcourse.status = "Publish"
        await existcourse.save();
        console.log(existcourse)

        if (!existcourse) {
            return res.status(401).json({
                successs: false,
                message: "nothing is available in course"
            })
        }

        return res.status(200).json({
            successs: true,
            data: existcourse,
            message: "Course is successfully published"
        })
    }

    catch (e) {
        return res.status(401).json({
            successs: false,
            message: `course not published, ${e.message}`
        })
    }
}


const getallcoursebyuserid = async (req, res) => {
    try {
        // Extract user ID from request params
        const { userId } = req.query;
        // Validate userId
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Check if user exists
        const userExists = await UserSchema.findById(userId).populate([{ path: 'courses', populate: { path: "coursecontent", populate: { path: "subsection" } } }]);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: userExists
        });

    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deletecourse = async (req, res) => {
    try {
        const { courseid } = req.body;

        // Delete the course
        const existCourse = await CourseSchema.findByIdAndDelete(courseid);
        if (!existCourse) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Remove course ID from instructor's account
        await UserSchema.findByIdAndUpdate(existCourse.instructor, {
            $pull: { courses: existCourse._id }
        });

        // Remove sections and subsections associated with the course
        for (let i = 0; i < existCourse.coursecontent.length; i++) {
            const sectionData = await SectionSchema.findByIdAndDelete(existCourse.coursecontent[i]);

            // Delete associated subsections
            for (let j = 0; j < sectionData.subsection.length; j++) {
                await SubSectionSchema.findByIdAndDelete(sectionData.subsection[j]);
            }
        }

        console.log("Course and related data deleted successfully");
        res.status(200).json({ message: "Course deleted successfully", data: existCourse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports = { createcourse, getallcourse, getcoursedetail, publishCourse, getallcoursebyuserid, deletecourse, editcourse }