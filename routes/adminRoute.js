const express = require('express');
const { adminRegistration, adminLogin, getAdminDetails, otpVerification, getAllUsers, upload } = require('../controller/adminController');
const adminMiddleware = require('../middleware.js/adminMiddleware');
const router = express.Router();

router.post('/admin/signup', upload.single('image'), adminRegistration); 
router.post('/admin/verification/otp', otpVerification)
router.post('/admin/login', adminLogin); 
router.get('/admin/info', adminMiddleware, getAdminDetails);
router.get('/admin/users', adminMiddleware, getAllUsers);
module.exports = router;