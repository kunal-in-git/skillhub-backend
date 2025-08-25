const express = require("express")
const paymentrouter = express.Router()

const {instance,verify} = require("../config/razorpay.js")
const{auth} = require("../middleware/Auths.js")

paymentrouter.post("/order", auth, instance);
paymentrouter.post("/verify", verify);

module.exports = {paymentrouter}