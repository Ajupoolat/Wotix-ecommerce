const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    categoryName:{type:String,required:true},
    image:{type:String,required:true},
    description:{type:String,required:true},
    isHiddenCat:{type:Boolean,default:false}

},{timestamps:true});

categorySchema.index({ categoryName: 1 }, { unique: true }); 


module.exports = mongoose.model("Categories",categorySchema)