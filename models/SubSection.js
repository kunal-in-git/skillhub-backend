const mongoose =  require('mongoose');

const SubSectionSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    timeduration: {
        type: String,
    },
    description: {
        type:String,
    },
    videourl:{
        type:String,
    },
    completed:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model("SubSectionSchema", SubSectionSchema);