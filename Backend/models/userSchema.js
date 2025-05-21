const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true},
  googleId:{type:String,unique:true,sparse:true},
  lastName: { type: String, required: true },
  email: { type: String, required: function(){return !this.googleId}, unique: true },
  password: { type: String, required: function () { return !this.googleId; } },
  isBlocked:{type:Boolean,default:false},
  profileImage: { type: String, default: "" },
  refferalId:{type:String,unique:true} 
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
