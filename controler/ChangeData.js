const UserSchema = require('../models/User.js')

const ChangeImage = async (req, res) => {
    try {
        const { imagelink, email } = req.body;

        // ✅ Find the user by email
        const existuser = await UserSchema.findOne({email} );

        // ✅ Handle case where user does not exist
        if (!existuser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ✅ Update the image URL
        existuser.image = imagelink;
        await existuser.save(); // ✅ Save changes to the database

        return res.status(200).json({
            success: true,
            data: existuser,
            message: "Additional details added successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Additional details not added successfully: ${e.message}`,
        });
    }
};


const RemoveImage = async (req, res) => {
    try {
        const { email } = req.body;

        // ✅ Find the user by email
        const existuser = await UserSchema.findOne({email} );

        // ✅ Handle case where user does not exist
        if (!existuser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // making profile photo using first and last name

        const imagelink  = `https://api.dicebear.com/5.x/initials/svg?seed=${existuser.firstname}+${existuser.lastname}`

        // ✅ Update the image URL
        existuser.image = imagelink;
        await existuser.save(); // ✅ Save changes to the database

        return res.status(200).json({
            success: true,
            data: existuser,
            message: "Image removed successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Additional details not added successfully: ${e.message}`,
        });
    }
};

module.exports = { ChangeImage, RemoveImage };
