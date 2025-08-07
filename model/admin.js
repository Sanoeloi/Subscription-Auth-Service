
const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
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
    isVerified: {
        type: Boolean,
        default: false
    }
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
