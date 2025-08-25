const express = require("express");
const app = express();

const fileupload = require("express-fileupload");
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "files",
  })
);

// this is for cors( cross origin resource sharing )
const cors = require("cors");

const allowedOrigins = ["http://localhost:3000", "https://localhost:3000", "https://skillhub-kunal.vercel.app/"]; // List of allowed origins

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("Not allowed by CORS")); // Block request
    }
  },
  credentials: true, // Allow cookies & JWT tokens
};
app.use(cors(corsOptions));

// this is for cookieparser
const cookieparser = require("cookie-parser");
app.use(cookieparser());

// this is for data parsing
app.use(express.json());

// app is an instance of express

// use dotenv file
require("dotenv").config();

// import all the routes
const { courserouter } = require("./routes/course.js");
const { paymentrouter } = require("./routes/payment.js");
const { profilerouter } = require("./routes/profile.js");
const { userrouter } = require("./routes/user.js");
const {editrouter} = require("./routes/editdata.js")

// now mount
app.use("/api/v1/course", courserouter);
app.use("/api/v1/payment", paymentrouter);
app.use("/api/v1/profile", profilerouter);
app.use("/api/v1/user", userrouter);
app.use("/api/v1/Editdata", editrouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Your server has started and you are at port number ${port}`);
});

// now connnect mongodb
const dbconnect = require("./config/database.js");
dbconnect();

// now connect cloudinary
const cloudinaryconnect = require("./config/cloudinary.js");
cloudinaryconnect();

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "You are in get request",
  });
});
