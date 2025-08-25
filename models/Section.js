const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
    
    sectionname: {
        type:String,
    },
    subsection: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSectionSchema",  
            default: null  
        }
    ],
});

module.exports = mongoose.model("SectionSchema", SectionSchema);