const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();

const router = express.Router();
const crypto = require("crypto");

const UserSchema = require("../models/User.js")
const CourseSchema = require('../models/Course.js')
const progressschema = require("../models/Userprogress.js")
const mailer = require("../config/nodemailer.js")
const cartschema = require("../models/Cart.js")

const instance = async (req, res) => {
    try {

        const { prize } = req.body
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: prize * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_74394",

            // take this parameters from frontend
            // courseid:"courseid",
            // userid:"userid"
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);

        console.log("this is done", order);
    } catch (error) {
        res.status(500).send(error);
    }
};

const verify = async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            courseid,
            userid,
            flag
        } = req.body;

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        console.log("this is course and user id", userid, "this is coures", courseid[0]._id);

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });
        else {
            console.log("payment is authorized")
            // console.log("this is courseid", courseid[0]);

            if (flag) {
                try {
                    // find the course and add user in it

                    for (let i = 0; i < courseid.length; i++) {
                        const enrollstudent = await CourseSchema.findByIdAndUpdate({ _id: courseid[i]._id }, { $push: { "studentsenrolled": userid } }, { new: true })

                        console.log("student enrolled", enrollstudent)

                        if (!enrollstudent) {
                            return res.status(401).json({
                                success: false,
                                message: `student not enrolled`
                            })
                        }

                        const addcourse = await UserSchema.findByIdAndUpdate({ _id: userid }, { $push: { 'courses': courseid[i]._id } }, { new: true })

                        console.log("corse added into user bought courses", addcourse)

                        if (!addcourse) {
                            return res.status(401).json({
                                success: false,
                                message: `course not added`
                            })
                        }

                        // make userprogress 

                        const userprogress = await progressschema.create({
                            user: userid,
                            course: [{ courseId: courseid[i]._id, subsection: [] }]
                        })

                        if (!userprogress) {
                            return res.status(401).json({
                                success: false,
                                message: `User progress has not created`
                            })
                        }

                        console.log("corse added into user bought courses", userprogress)


                        const addprogress = await UserSchema.findByIdAndUpdate(userid, {
                            progress: userprogress._id
                        })

                        if (!addprogress) {
                            return res.status(401).json({
                                success: false,
                                message: `User progress not added in userschema`
                            })
                        }

                        // now check that the courseid is present in cart schema if yes than delete that

                        try {
                            const userdetail = await UserSchema.findById(userid);
                            if (!userdetail) {
                                console.error("User not found");
                                return;
                            }

                            const cartdetail = await cartschema.findById(userdetail.cart);
                            if (!cartdetail) {
                                console.error("Cart not found for user");
                                return;
                            }

                            // Check if course is already in the cart
                            if (cartdetail.course.includes(courseid[i]._id)) {
                                // Remove course from the cart
                                cartdetail.course.pull(courseid[i]._id);
                                await cartdetail.save();

                                console.log(`Course ${courseid[i]._id} removed from cart`);
                            } else {
                                console.log(`Course ${courseid[i]._id} not found in cart`);
                            }
                        } catch (error) {
                            console.error("Error while removing course from cart:", error);
                        }

                        // send the mail

                        try {
                            const existuser = await UserSchema.findOne({ _id: userid })
                            const mail = await mailer.sendMail({
                                from: 'From Kunal Kumawat',
                                to: existuser.email,
                                subject: "course purchased",
                                html: `<div>Congratulation you have successfully bought the course ${courseid[i]._id}</div>`
                            })
                            console.log("mail", mail)
                        }
                        catch (e) {
                            console.log(e.message)
                        }
                    }
                }
                catch (e) {
                    return res.status(401).json({
                        success: false,
                        message: `course not bought ${e.message}`
                    })
                }
            }
            else {
                try {
                    // find the course and add user in it

                    const enrollstudent = await CourseSchema.findByIdAndUpdate({ _id: courseid }, { $push: { "studentsenrolled": userid } }, { new: true })

                    console.log("student enrolled", enrollstudent)

                    if (!enrollstudent) {
                        return res.status(401).json({
                            success: false,
                            message: `student not enrolled`
                        })
                    }

                    const addcourse = await UserSchema.findByIdAndUpdate({ _id: userid }, { $push: { 'courses': courseid } }, { new: true })

                    console.log("corse added into user bought courses", addcourse)

                    if (!addcourse) {
                        return res.status(401).json({
                            success: false,
                            message: `course not added`
                        })
                    }

                    // make userprogress 

                    const userprogress = await progressschema.create({
                        user: userid,
                        course: [{ courseId: courseid, subsection: [] }]
                    })

                    if (!userprogress) {
                        return res.status(401).json({
                            success: false,
                            message: `User progress has not created`
                        })
                    }

                    console.log("corse added into user bought courses", userprogress)


                    const addprogress = await UserSchema.findByIdAndUpdate(userid, {
                        progress: userprogress._id
                    })

                    if (!addprogress) {
                        return res.status(401).json({
                            success: false,
                            message: `User progress not added in userschema`
                        })
                    }

                    // now check that the courseid is present in cart schema if yes than delete that

                    try {
                        const userdetail = await UserSchema.findById(userid);
                        if (!userdetail) {
                            console.error("User not found");
                            return;
                        }

                        const cartdetail = await cartschema.findById(userdetail.cart);
                        if (!cartdetail) {
                            console.error("Cart not found for user");
                            return;
                        }

                        // Check if course is already in the cart
                        if (cartdetail.course.includes(courseid)) {
                            // Remove course from the cart
                            cartdetail.course.pull(courseid);
                            await cartdetail.save();

                            console.log(`Course ${courseid} removed from cart`);
                        } else {
                            console.log(`Course ${courseid} not found in cart`);
                        }
                    } catch (error) {
                        console.error("Error while removing course from cart:", error);
                    }

                    // send the mail

                    try {
                        const existuser = await UserSchema.findOne({ _id: userid })
                        const mail = await mailer.sendMail({
                            from: 'From Kunal Kumawat',
                            to: existuser.email,
                            subject: "course purchased",
                            html: `<div>Congratulation you have successfully bought the course</div>`
                        })
                        console.log("mail", mail)
                    }
                    catch (e) {
                        console.log(e.message)
                    }
                }
                catch (e) {
                    return res.status(401).json({
                        success: false,
                        message: `course not bought ${e.message}`
                    })
                }
            }
        }

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            courseid: courseid,
            userid: userid
        });
        console.log("this is done verify");
    } catch (error) {
        res.status(500).send(error);
    }
};


module.exports = { instance, verify }