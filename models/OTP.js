const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdat: {
        type: Date,
        // Date.now is a reference when mongoose create new document that it will call the fucnction Date.now()
        default: Date.now,
        expires: 300 // 5 minutes,
    }
});

const mailer = require('../config/nodemailer.js')

// for pre function async function (next) is important using next we can use this

OTPSchema.pre("save", async function (next) {
    console.log("you are at sending mail");
    try {
        const mail = await mailer.sendMail({
            from: "From Kunal Kumawat",
            to: this.email,
            subject: "🔐 Verification Mail - Action Required",
            html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Verification Mail</title>
                        <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            color: #333;
                        }
                
                        .email-container {
                            width: 100%;
                            max-width: 600px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
                            padding: 20px;
                        }
                
                        .email-header {
                            background-color: #4caf50;
                            padding: 15px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                            color: #ffffff;
                        }
                
                        .email-header h1 {
                            margin: 0;
                            font-size: 24px;
                        }
                
                        .email-content {
                            padding: 20px;
                        }
                
                        .otp-box {
                            font-size: 22px;
                            font-weight: bold;
                            color: #4caf50;
                            background-color: #f0f0f0;
                            padding: 10px;
                            border-radius: 5px;
                            text-align: center;
                            margin: 20px 0;
                        }
                
                        .email-footer {
                            text-align: center;
                            font-size: 12px;
                            color: #777;
                            padding: 10px;
                            border-top: 1px solid #e0e0e0;
                        }
                
                        .email-footer a {
                            color: #4caf50;
                            text-decoration: none;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                        <div class="email-header">
                            <h1>Verify Your Email</h1>
                        </div>
                        <div class="email-content">
                            <p>Hello,</p>
                            <p>Thank you for registering with us. To complete your verification, please use the OTP below:</p>
                            <div class="otp-box">${this.otp}</div>
                            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                            <p>If you did not request this verification, please ignore this email or <a href="mailto:support@yourapp.com">contact support</a>.</p>
                        </div>
                        <div class="email-footer">
                            © ${new Date().getFullYear()} YourAppName. All rights reserved.
                        </div>
                        </div>
                    </body>
                    </html>
                    `
        });
        console.log("mail", mail);
    } catch (e) {
        console.log(e.message);
    }
});


module.exports = mongoose.model("OTPSchema", OTPSchema);