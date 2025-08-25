const cartschema = require("../models/Cart.js");
const userschema = require("../models/User.js");

const addcourseincart = async (req, res) => {
    try {
        const { userid, courseid } = req.body;

        if (!userid || !courseid) {
            return res.status(400).json({ success: false, message: "User ID and Course ID are required" });
        }

        // Find user and get cart ID
        const existuser = await userschema.findById(userid);
        if (!existuser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const courseadded = await cartschema.findByIdAndUpdate(
            existuser.cart,
            { $addToSet: { course: courseid } },  // `addToSet` prevents duplicate entries
            { new: true }
        );

        console.log("Course added to cart:", courseadded);

        return res.status(200).json({ success: true, message: "Course added to cart", data: courseadded });

    } catch (error) {
        console.error("Error adding course to cart:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Delete Course from Cart
const deletecoursebycart = async (req, res) => {
    try {
        const { userid, courseid } = req.body;

        if (!userid || !courseid) {
            return res.status(400).json({ success: false, message: "User ID and Course ID are required" });
        }

        // Find user and get cart ID
        const existuser = await userschema.findById(userid);
        if (!existuser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const deletecourse = await cartschema.findByIdAndUpdate(
            existuser.cart,
            { $pull: { course: courseid } },
            { new: true }
        );

        console.log("Course removed from cart:", deletecourse);

        return res.status(200).json({ success: true, message: "Course removed from cart", data: deletecourse });

    } catch (error) {
        console.error("Error removing course from cart:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Get Cart Data
const getdataofcart = async (req, res) => {
    try {
        const { userid } = req.query;

        if (!userid) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Find user and get cart ID
        const existuser = await userschema.findById(userid);
        if (!existuser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch cart data
        const result = await cartschema.findById(existuser.cart).populate("course"); // Populate course details

        console.log("User Cart Data:", result);

        return res.status(200).json({ success: true, message: "Cart data fetched", data: result });

    } catch (error) {
        console.error("Error fetching cart data:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const isAlreadyEnrolled = async (req, res) => {
    try {
        const { userid, courseid } = req.body;

        if (!userid || !courseid) {
            return res.status(400).json({
                success: false,
                message: "User ID and Course ID are required"
            });
        }

        const user = await userschema.findById(userid);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isEnrolled = user.courses.includes(courseid);

        return res.status(200).json({
            success: true,
            data: isEnrolled,
            message: "already enrolled"
        });
    } catch (error) {
        console.error("Error checking enrollment:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = { addcourseincart, deletecoursebycart, getdataofcart, isAlreadyEnrolled };
