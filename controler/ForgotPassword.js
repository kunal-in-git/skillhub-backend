const UserSchema = require("../models/User.js");
const mailer = require("../config/nodemailer.js");
const bcrypt = require('bcryptjs');

const resetpasstoken = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("this is email from resetpasstoken controller", email);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existuser = await UserSchema.findOne({ email });

    if (!existuser) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist with the registered email",
      });
    }

    // Generate a secure token
    const forgotpasstoken = crypto.randomUUID();

    // Store token and expiration time (5 minutes)
    const updatedentry = await UserSchema.findOneAndUpdate(
      { email },
      { forgotpasstoken, forgotpasstokenexpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );

    if (!updatedentry) {
      return res.status(500).json({
        success: false,
        message: "Error updating user with reset token",
      });
    }

    // Generate reset password link
    const url = `http://localhost:3000/Newpassword/${forgotpasstoken}`;

    try {
      await mailer.sendMail({
        from: "From Kunal Kumawat",
        to: existuser.email,
        subject: "🔑 Password Reset Request for Your Account",
        html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #4a6bff;
            color: white;
            padding: 25px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            background-color: #4a6bff;
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .link-box {
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #eee;
          }
          .highlight {
            color: #ff4757;
            font-weight: 600;
          }
          @media screen and (max-width: 480px) {
            .content {
              padding: 20px;
            }
            .header h1 {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello,</p>
              
              <p>We received a request to reset your password. Click the button below to proceed:</p>
              
              <div style="text-align: center;">
                <a href="${url}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              
              <div class="link-box">
                ${url}
              </div>
              
              <p>For security reasons, this link will expire in <span class="highlight">5 minutes</span>.</p>
              
              <p>If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
              
              <p>Best regards,<br>Your Application Team</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
              <p>This is an automated message - please do not reply directly to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>`
      });

      return res.status(200).json({
        success: true,
        message: "Password reset link sent successfully",
        forgotpasstoken: forgotpasstoken,
        data: url,
      });
    } catch (mailError) {
      console.error("Error sending email:", mailError.message);
      return res.status(500).json({
        success: false,
        message: "Error sending reset password email",
      });
    }
  } catch (error) {
    console.error("Error in resetpasstoken:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const resetpass = async (req, res) => {
  try {
    const { forgotpasstoken, newpassword, confirmpassword } = req.body;

    if (!forgotpasstoken || !newpassword || !confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "all the fields are necessary",
      });
    }

    console.log("this is forgotpass token", forgotpasstoken);


    if (newpassword != confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "newpassword and confirmpassword is not same",
      });
    }

    const existuser = await UserSchema.findOne({ forgotpasstoken });
    // console.log(existuser)

    if (!existuser) {
      return res.status(400).json({
        success: false,
        message: "user doesn't exists with the registered token",
      });
    }

    // check if token expires or not

    if (existuser.forgotpasstokenexpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Time expired",
      });
    }

    // will this work

    const hashpass = await bcrypt.hash(newpassword, 10);

    existuser.password = hashpass;

    // Remove token fields before saving
    existuser.forgotpasstoken = undefined;
    existuser.forgotpasstokenexpires = undefined;

    await existuser.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

module.exports = { resetpasstoken, resetpass };
