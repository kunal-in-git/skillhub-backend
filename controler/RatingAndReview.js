const RatingAndReviewSchema = require("../models/RatingAndReview.js")
const CourseSchema = require("../models/Course.js")

const createrating = async (req, res) => {
    try {
        const { userid, rating, review, courseid } = req.body;

        // 1. ✅ Check if user already reviewed this course
        const alreadyReviewed = await RatingAndReviewSchema.findOne({
            user: userid,
            course: courseid,
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "User has already reviewed this course",
            });
        }

        // 2. ✅ Create new review (with user + course directly)
        const newReview = await RatingAndReviewSchema.create({
            user: userid,
            course: courseid,
            rating,
            review,
        });

        // 3. ✅ Push new review into Course document
        const updatedCourse = await CourseSchema.findByIdAndUpdate(
            courseid,
            { $push: { ratingandreviews: newReview._id } },
            { new: true }
        );

        // 4. ✅ Recalculate course average rating
        const allCourseReviews = await RatingAndReviewSchema.find({ course: courseid });
        const totalRating = allCourseReviews.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = totalRating / allCourseReviews.length;

        // 5. ✅ Save new average rating
        updatedCourse.avgrating = avgRating;
        await updatedCourse.save();

        // 6. ✅ Populate review with user & course for response
        const populatedReview = await RatingAndReviewSchema.findById(newReview._id)
            .populate("user")
            .populate("course");

        return res.status(200).json({
            success: true,
            message: "Successfully added a new review",
            data: populatedReview,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};


const getallrating = async (req, res) => {
    try {
        const allreviews = await RatingAndReviewSchema.find({})
            .sort({ rating: -1 }) // use -1 instead of "descending"
            .populate({
                path: "user",
                select: "firstname lastname email image" // no commas
            })
            .populate({
                path: "course",
                select: "coursename"
            });

        return res.status(200).json({
            success: true,
            data: allreviews,
            message: "All reviews fetched successfully"
        });
    } catch (e) {
        return res.status(500).json({ // should be 500 for server error
            success: false,
            message: `Error in fetching reviews: ${e.message}`
        });
    }
};

const deletereview = async (req, res) => {
    try {
        const { courseid, userid } = req.body;

        // Find the review to delete
        const review = await RatingAndReviewSchema.findOne({ user: userid, course: courseid });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found for the given user and course"
            });
        }

        // Remove the review reference from CourseSchema
        await CourseSchema.findByIdAndUpdate(courseid, {
            $pull: { ratingandreviews: review._id }
        });

        // Delete the review
        await RatingAndReviewSchema.findByIdAndDelete(review._id);

        // Optional: Update average rating
        const course = await CourseSchema.findById(courseid).populate("ratingandreviews");
        if (course.ratingandreviews.length > 0) {
            const total = course.ratingandreviews.reduce((acc, curr) => acc + curr.rating, 0);
            course.avgrating = total / course.ratingandreviews.length;
        } else {
            course.avgrating = 0;
        }
        await course.save();

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Error in deleting review:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while deleting review",
            error: error.message
        });
    }
};


module.exports = { createrating, getallrating, deletereview }