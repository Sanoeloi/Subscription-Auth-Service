const sgMail = require('@sendgrid/mail');
const User = require('../model/user');
const Admin = require('../model/admin');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_KEY);


const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

const verificationEmail = async (email, key) => {
    try{
        const otp = generateOTP();
        const message = {
            to : email,
            from : process.env.EMAIL,
            subject : 'Account Verification Mail',
            text : `Your OTP ::: ${otp}`
        }

        if(key !== 1)
            await User.updateOne({email}, {
                $set : {"verificationOtp" : otp}
            })
        else
            await Admin.updateOne({email}, {
                $set : {"verificationOtp" : otp}
            })
            
        return sgMail.send(message);
    }catch(err){    
        console.log('ERROR ::: ', err);
    }
}

module.exports = verificationEmail;