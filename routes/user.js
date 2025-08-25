const express = require("express")
const userrouter = express.Router()

const{otpsend,signup,login, changepassword} = require("../controler/Auth.js")
const{makecontact} = require("../controler/ContactUs.js")
const{resetpasstoken, resetpass} = require("../controler/ForgotPassword.js")
const{ createProgress, editProgress } = require("../controler/Userprogress.js")
const{auth, isstudent, isadmin, isinstructor} = require("../middleware/Auths.js")
const{addcourseincart, deletecoursebycart, getdataofcart, isAlreadyEnrolled} = require("../controler/Cart.js")


userrouter.post("/otpsend", otpsend)
userrouter.post("/signup", signup)
userrouter.post("/login", login)
userrouter.put("/changepassword", auth, changepassword)

userrouter.post("/makecontact",makecontact)

userrouter.post("/resetpasstoken", resetpasstoken)
userrouter.post("/resetpass", resetpass)

userrouter.post("/createprogress", auth, createProgress)
userrouter.put("/editprogress", auth, editProgress)


// these are related to cart

userrouter.post("/addcourseincart", auth, addcourseincart)
userrouter.delete("/deletecoursebycart", auth, deletecoursebycart)
userrouter.get("/getdataofcart", auth, getdataofcart)
userrouter.post("/isAlreadyEnrolled", auth, isAlreadyEnrolled)


// this curly breases is important
module.exports = {userrouter}
