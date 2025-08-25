const CategorySchema = require("../models/Category.js")
const CourseSchema = require("../models/Course.js")

const createcategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(401).json({
                success: false,
                message: "all the fields are required"
            })
        }

        const newcategory = await CategorySchema.create({
            name,
            description
        })

        return res.status(200).json({
            success: true,
            data: newcategory,
            message: "category created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const showallcategory = async (req, res) => {
    try {
        const allCategories = await CategorySchema.find({}, {
            name: true,
            description: true
        });
        return res.status(200).json({
            success: true,
            message: "All category received",
            data: allCategories
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const categorypagedetails = async (req, res) => {
    try {
        // get course with specified category

        const { categoryname } = req.query
        const catcourses = await CategorySchema.findOne({ name: categoryname }).populate({
            path: "course", populate: ([
                { path: "coursecontent", populate: ({ path: "subsection" }) },
                { path: "instructor" }
            ])
        })

        if (!catcourses) {
            return res.status(500).json({
                success: false,
                message: "error in getting course with specific category"
            })
        }

        if ((catcourses.course).length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // console.log("these are cat courses", catcourses);
        return res.status(200).json({
            success: true,
            data: catcourses,
            message: "get all courses",
        });
    }
    catch (e) {
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}


// get top courses 


const mostsellingcourse = async (req, res) => {
    function sortCoursesByStudentsEnrolled(courses) {
        if (!Array.isArray(courses)) {
            return "Input must be an array.";
        }

        return courses.slice().sort((a, b) => {
            // Check if studentsenrolled is an array and handle potential undefined/null cases.
            const aLength = Array.isArray(a.studentsenrolled) ? a.studentsenrolled?.length : 0;
            const bLength = Array.isArray(b.studentsenrolled) ? b.studentsenrolled?.length : 0;
            return bLength - aLength; // Sort in descending order (largest to smallest)
        });
    }

    try {
        const { categoryname } = req.query
        const catcourses = await CategorySchema.findOne({ name: categoryname }).populate({
            path: "course", populate: ([
                { path: "coursecontent", populate: ({ path: "subsection" }) },
                { path: "instructor" }
            ])
        })

        if (!catcourses) {
            return res.status(500).json({
                success: false,
                message: "error in getting course with specific category"
            })
        }

        if ((catcourses.course)?.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        const sortedCourses = sortCoursesByStudentsEnrolled(catcourses);
        // console.log("data of sorted ",catcourses)

        return res.status(200).json({
            success: true,
            data: catcourses,
            message: "get all courses",
        });
    }
    catch (e) {
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

// highly reted course

const topcourses = async (req, res) => {
    function sortCoursesByStudentsEnrolled(courses) {
        if (!Array.isArray(courses)) {
            return "Input must be an array.";
        }

        return courses.slice().sort((a, b) => {
            const aRating = typeof a.avgrating === "number" ? a.avgrating : 0;
            const bRating = typeof b.avgrating === "number" ? b.avgrating : 0;
            return bRating - aRating; // Sort in descending order (highest to lowest rating)
        });
    }

    try {
        const { categoryname } = req.query
        // const catcourses = await CategorySchema.findOne({ name: categoryname }).populate({ path: "course", populate:[{path:"instructor"}, {path:"coursecontent", populate:{path:"subsection"}}]})
        const catcourses = await CategorySchema.findOne({ name: categoryname }).populate({
            path: "course", populate: ([
                { path: "coursecontent", populate: ({ path: "subsection" }) },
                { path: "instructor" }
            ])
        })

        if (!catcourses) {
            return res.status(500).json({
                success: false,
                message: "error in getting course with specific category"
            })
        }

        if ((catcourses.course)?.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        const sortedCourses = sortCoursesByStudentsEnrolled(catcourses);
        // console.log("data of sorted ",catcourses)

        return res.status(200).json({
            success: true,
            data: catcourses,
            message: "get all courses",
        });
    }
    catch (e) {
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

module.exports = { createcategory, showallcategory, categorypagedetails, mostsellingcourse, topcourses }