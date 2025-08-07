const sgMail = require('@sendgrid/mail');
const User = require('../model/user');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_KEY);


const mailSenderService = async (user) => {
    try{
        const message = {
            to : user.email,
            from : process.env.EMAIL,
            subject : 'Account Credentials',
            text : `Email : ${user.email} , Password : ${user.password}`
        }

        return sgMail.send(message);
    }catch(err){    
        console.log('ERROR ::: ', err);
    }
}

module.exports = mailSenderService;