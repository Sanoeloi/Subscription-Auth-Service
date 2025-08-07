const User = require("../model/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require("path");
const multer = require('multer');
const { isValidEmail, isValidMobileNumber } = require("../utility/isValidEmail");
const randomPasswordGenerator = require("../utility/randomPasswordGenerator");
const mailSenderService = require("../utility/mailSenderService");
const pushNotificationOnMobile = require("../utility/pushNotificationOnMobile");
const uploadImageToS3 = require("../utility/uploadImageToS3");
const verificationEmail = require("../utility/verificationEmail");

const userRegistration = async(req, res) => {
    try{
        const {email , username , mobileNumber } = req.body;

        const isUserAlreadyExists = await User.findOne({email}).lean();

        if(isUserAlreadyExists)
            return res.status(403).json({
                success : false,
                message : 'Account already exists'
            })

        const file = req.file;
        const password = await randomPasswordGenerator();
         
        if(!isValidEmail(email))
            return res.status(403).json({
                    success : false,
                    message : 'Invalid Email Address'
            })

        if(!isValidMobileNumber(mobileNumber))
            return res.status(403).json({
                    success : false,   
                    message : 'Invalid Mobile Number'
            })
        console.log('FILE :::: ', file);
        const image = await uploadImageToS3(file);
        console.log('IMAGE ::: ', image.Location)
        const userRegistrationObject = {
            email,
            username,
            mobileNumber,
            password,
            profile : image.Location
        }

        const userObject = new User(userRegistrationObject);
        userObject.save();

        verificationEmail(email).then(() => {
            console.log('OTP sent successfully.');
        }).catch((err) => {
            console.error('Error sending OTP:', err.message);
        })

        return res.status(200).json({
            success : true,
            message : 'Please verify your email'
        });
    }catch(err){
        console.log('ERROR ::: ', err);
        return res.status(200).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const userLogin = async (req, res) => {
    try{
        const {email, password} = req.body;
        const isUserExistOrNot = await User.findOne({email : email.trim()}).lean();
        
        if(!isUserExistOrNot.isVerified)
            return res.status(404).json({
                success : false,
                message : 'Please verify your account'    
            })
        
        if(!isUserExistOrNot)
            return res.status(404).json({
                success : false,
                message : 'Email not found'    
            })
        
        const isPasswordMatched = await bcrypt.compare(password, isUserExistOrNot.password);
        console.log(isPasswordMatched)
        if(!isPasswordMatched)
            return res.status(403).json({
                success : false,
                message : 'Incorrect Password'
            })
        
        const token =  await jwt.sign({email : email}, process.env.SECRET_JWT_KEY);
        return res.status(200).json({
            success : true,
            token : token,
            email
        })
    }catch(err){
        console.log('ERROR ::: ',err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const getUserDetails = async(req, res) => {
    try{
        const email = req.user.email;
        const userData = await User.findOne({email}).lean();

        if(!userData)
            return res.status(404).json({
                success : false,
                message : 'No user exists with this email address'
            })
        
        return res.status(200).json({
            success : true,
            message : {
                email : email,
                username : userData.username,
                profile : userData.profile,
                mobileNumber : userData.mobileNumber
            }
        })
    }catch(err){
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const otpVerification = async (req, res) => {
    try{
        const {otp, email} = req.body;
        const userDetails = await User.findOne({email}).lean();

        if(userDetails.verificationOtp == otp){
            const encryptedPassword = await bcrypt.hash(userDetails.password, 8);
            await User.updateOne({email}, {
                $set : {"isVerified" : true, "password" : encryptedPassword}
            })

            mailSenderService(userDetails);
            return res.status(200).json({
                success : true,
                message : 'Verification Successfull'
            })
        }

        return res.status(403).json({
            success : false,
            message : 'Invalid OTP'
        })

    }catch(err){
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const webHookFunction = async(req, res) => {
    try{
        const {subscriptionID, email, subscriptionName, subscriptionAmount, expiryDate} = req.body;
        const isUserExistsWithThisEmailAddress = await User.findOne({email}).lean();

        if(!isUserExistsWithThisEmailAddress)
            return res.status(403).json({
                success : false,
                message : 'No Account exist with this Email Address'
            })
        const subscriptionObject = {
            subscriptionID, 
            email, 
            subscriptionName, 
            subscriptionAmount, 
            expiryDate
        }

        await User.updateOne({email}, {$push : {"subscription" : subscriptionObject}});
        return res.status(200).json({
            success : true,
            message : 'Triggered Successfully'
        })
    }catch(err){
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const notificationService = (req, res) => {
    try{
        const {message} = req.body;

        pushNotificationOnMobile(message);
        return res.status(200).json({
            success : true,
            message : 'Triggered Successfully'
        })
    }catch(err){
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
module.exports = {
    userRegistration,
    userLogin,
    otpVerification,
    webHookFunction,
    notificationService,
    getUserDetails,
    upload
}