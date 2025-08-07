const express = require('express');
const { otpVerification, userRegistration, userLogin, webHookFunction, notificationService, upload, getUserDetails } = require('../controller/userController');
const userMiddleware = require('../middleware.js/userMiddleware');
const router = express.Router();

router.post('/user/signup', upload.single('image'), userRegistration); 
router.post('/user/verification/otp', otpVerification)
router.post('/user/login', userLogin);
router.post('/webhook', webHookFunction);
router.post('/notification', notificationService);
router.get('/user/info', userMiddleware, getUserDetails);

module.exports = router;