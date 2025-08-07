const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  verificationOtp: {
    type: Number
  },
  isVerified : {
    type : Boolean,
    default : false
  },
  profile : {
    type : String
  },
  subscription : []
});

const User = mongoose.model('User', userSchema);

module.exports = User;
