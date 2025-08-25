const UserSchema = require("../models/User.js");
const OTPSchema = require("../models/OTP.js");
const otpgenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../config/nodemailer.js");
const cartschema = require("../models/Cart.js")

require("dotenv").config();

const otpsend = async (req, res) => {
  try {
    const { email } = req.body;

    // check that the user exist or not

    const check = await UserSchema.findOne({ email });

    if (check) {
      return res.status(401).json({
        success: false,
        message: "user already exists",
      });
    }

    const otpgen = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // check that otp is unique or not

    let result = await OTPSchema.findOne({ otp: otpgen });

    // this is bed method we have to use that library which assure of unique otp all time

    while (result) {
      const otpgen = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTPSchema.findOne({ otp: otpgen });
    }

    const payload = await OTPSchema.create({ email: email, otp: otpgen });
    console.log("this is data of otp", payload);

    res.status(200).json({
      success: true,
      data: otpgen,
      message: "otp send successfully",
    });
  } catch (e) {
    console.log("error in otp");
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const signup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      password,
      confirmpassword,
      email,
      accounttype,
      otp,
    } = req.body;

    // if any of the field is missing

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmpassword ||
      !accounttype ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All the fields are manditory",
      });
    }

    if (password != confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "password and conformpassword is not same",
      });
    }

    // check that use already exists or not

    const check = await UserSchema.findOne({ email });

    if (check) {
      return res.status(401).json({
        success: false,
        message: "user already exists",
      });
    }

    // now find the most recent otp

    const recentotp = await OTPSchema.findOne({ email })
      .sort({ createdat: -1 })
      .limit(1);

    console.log("This is recent otp ", recentotp);

    // -1 means descending order and limit = 1 means
    // return only one output

    // now verify the otp

    if (recentotp.otp != otp) {
      return res.status(401).json({
        success: false,
        message: "otp doesn't match",
      });
    }

    // now hash the password

    const hashpass = await bcrypt.hash(password, 10);

    // now create the entry of user

    const newuser = await UserSchema.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashpass,
      accounttype: accounttype,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname}+${lastname}`,
    });

    console.log("this is new user", newuser);



    // now make cart of the user 

    try {
      const dataofcart = await cartschema.create({
        user: newuser._id
      });

      newuser.cart = dataofcart._id
      await newuser.save();
      console.log("Cart created successfully:", dataofcart);
    } catch (error) {
      console.error("Error creating cart:", error);
    }

    // and put the id of cart in UserSchema


    return res.status(200).json({
      success: true,
      data: newuser,
      message: "New entry created successfully",
    });
  } catch (e) {
    return res.status(400).json({
      success: true,
      message: e.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all the fields are required",
      });
    }

    // check if user otp.exists of not

    const existuser = await UserSchema.findOne({ email });

    if (!existuser) {
      return res.status(400).json({
        success: false,
        message: "user doesn't exists with the registered email",
      });
    }

    if (!(await bcrypt.compare(password, existuser.password))) {
      return res.status(400).json({
        success: false,
        message: "Password doesn't match",
      });
    }

    // now make jwt token and always remember jwt token will be created after login

    const payload = {
      email: existuser.email,
      id: existuser._id,
      role: existuser.accounttype,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // not work we have to get token from header during auth middleware
    // req.user = {token}

    const option = {
      httpOnly: true,
      massage: 2 * 60 * 60 * 1000,
    };

    res.cookie("cookie", token, option);

    // remove password from existuser
    existuser.password = undefined;

    // this is used to change mongoose document to mongoose object so to insert an object in it which is not present in schema

    const userObject = existuser.toObject();

    userObject.token = token;
    return res.status(200).json({
      success: true,
      token,
      data: userObject,
      message: "Logged in successfully",
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

const changepassword = async (req, res) => {
  try {
    const { oldpass, newpass } = req.body;
    const id = req.user.decoded.id;
    // console.log(req.body)

    // console.log(req.user)
    // console.log("id", id)

    if (!oldpass || !newpass) {
      return res.status(400).json({
        success: false,
        message: "all the fields are required",
      });
    }

    // console.log(oldpass, "\n", newpass, "\n", confirmpass, "\n", id )

    const existuser = await UserSchema.findOne({ _id: id });

    // now check that the password given by user is correct or not

    // console.log(existuser)

    if (!(await bcrypt.compare(oldpass, existuser.password))) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    console.log("this is existuser", existuser);

    // don't know needed or not
    // const userObject = existuser.toObject();

    try {
      existuser.password = await bcrypt.hash(newpass, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error hashing password",
      });
    }

    // this is important to save the change

    await existuser.save();

    // send email of password changed
    try {
      const mail = await mailer.sendMail({
        from: "From Kunal Kumawat",
        to: existuser.email,
        subject: "password changed",
        html: `<div>password changed successfully</div>`,
      });
      console.log("mail", mail);
    } catch (e) {
      console.log(e.message);
    }

    return res.status(200).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

module.exports = { otpsend, signup, login, changepassword };
