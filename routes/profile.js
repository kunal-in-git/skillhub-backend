const express = require("express")
const profilerouter = express.Router()

const{createprofile, deleteaccount, uploadimageOnCloudinary, getprofiledata} = require("../controler/Profile.js")
const{auth, isstudent, isadmin, isinstructor} = require("../middleware/Auths.js")

profilerouter.post("/createprofile", auth, createprofile)
profilerouter.delete("/deleteaccount", auth, deleteaccount)
profilerouter.post("/uploadoncloudinary", uploadimageOnCloudinary)
profilerouter.get("/getprofiledata", auth, getprofiledata)

module.exports = {profilerouter}