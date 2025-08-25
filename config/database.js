const mongoose = require('mongoose')
require("dotenv").config()


const dbconnect = ()=>{
    mongoose.connect(process.env.DB_URL)
    .then(()=>{
        console.log("successfully connected to database")
    })
    .catch((e)=>{
        console.log(e.message)
    })
}

module.exports = dbconnect