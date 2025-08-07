const Admin = require("../model/admin");
const User = require("../model/user");
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isValidEmail, isValidMobileNumber } = require("../utility/isValidEmail");
const randomPasswordGenerator = require("../utility/randomPasswordGenerator");
const uploadImageToS3 = require("../utility/uploadImageToS3");
const verificationEmail = require("../utility/verificationEmail");
const mailSenderService = require("../utility/mailSenderService");

const adminRegistration = async(req, res) => {
    try{
        const {email , username , mobileNumber } = req.body;
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
         
        const image = await uploadImageToS3(file);

        const userRegistrationObject = {
            email,
            username,
            mobileNumber,
            password,
            profile : image.Location
        }

        const userObject = new Admin(userRegistrationObject);
        userObject.save();

        verificationEmail(email, key=1).then(() => {
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

const adminLogin = async (req, res) => {
    try{
        const {email, password} = req.body;
        const isUserExistOrNot = await Admin.findOne({email}).lean();

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
        console.log('ERROR ::: ', err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const otpVerification = async (req, res) => {
    try{
        const {otp, email} = req.body;
        const userDetails = await Admin.findOne({email}).lean();
        
        if(userDetails.verificationOtp == otp){
            const encryptedPassword = await bcrypt.hash(userDetails.password, 8);
            await Admin.updateOne({email}, {
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
        console.log('ERROR ::: ', err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const getAdminDetails = async(req, res) => {
    try{
        const email = req.user.email;
        const userData = await Admin.findOne({email}).lean();

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
        console.log('ERROR ::: ', err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

const getAllUsers = async(req, res) => {
    try{
        const getAllUsersDetails = await User.find().lean();

        const userObject = getAllUsersDetails.map((element) => {
            return {
                username : element.username,
                email : element.email,
                mobileNumber : element.mobileNumber,
                profile : element.profile
            }
        })

        return res.status(200).json({
            success : true,
            message : userObject
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
    adminRegistration,
    adminLogin,
    otpVerification,
    getAdminDetails,
    upload,
    getAllUsers
}