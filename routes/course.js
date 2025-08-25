const express = require('express')
const courserouter = express.Router()

const { createcourse, getallcourse, getcoursedetail, publishCourse, getallcoursebyuserid, deletecourse, editcourse } = require("../controler/Course.js")

const { createcategory, showallcategory, categorypagedetails, mostsellingcourse, topcourses } = require("../controler/Category.js")

const { createsection, deletesection, updatesection, getsection } = require("../controler/Section.js")

const { createsubsection, updatesubsection, deletesubsection, markasdone } = require("../controler/SubSection.js")

const { createrating, getallrating, deletereview } = require("../controler/RatingAndReview.js")


// now import middleware

const { auth, isstudent, isadmin, isinstructor } = require("../middleware/Auths.js")

courserouter.post("/createcourse", auth, isinstructor, createcourse)
courserouter.get("/getallcourse", auth, isinstructor, getallcourse)
courserouter.get("/getallcoursebyuserid", auth, isinstructor, getallcoursebyuserid)
courserouter.get("/getcoursedetail", auth, getcoursedetail)
courserouter.put("/publishCourse", auth, isinstructor, publishCourse)
courserouter.post("/createsection", auth, isinstructor, createsection)
courserouter.delete("/deletesection", auth, isinstructor, deletesection)
courserouter.get("/getsection", auth, isinstructor, getsection)
courserouter.put("/updatesection", auth, isinstructor, updatesection)
courserouter.post("/createsubsection", auth, isinstructor, createsubsection)
courserouter.put("/updatesubsection", auth, isinstructor, updatesubsection)
courserouter.delete("/deletesubsection", auth, isinstructor, deletesubsection)
courserouter.delete("/deletecourse", auth, isinstructor, deletecourse)
courserouter.put("/editcourse", auth, isinstructor, editcourse)
courserouter.put("/markasdone", auth, markasdone)


// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************


courserouter.post("/createcategory", auth, isadmin, createcategory)
courserouter.get("/showallcategory", auth, showallcategory)
courserouter.get("/categorypagedetails", auth, categorypagedetails)
courserouter.get("/mostsellingcourse", auth, mostsellingcourse)
courserouter.get("/topcourses", auth, topcourses)


// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************


courserouter.post("/createrating", auth, createrating)
courserouter.get("/getallrating", getallrating)
courserouter.delete("/deletereview", auth, deletereview)

module.exports = { courserouter }