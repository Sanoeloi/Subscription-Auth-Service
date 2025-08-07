const AWS = require('aws-sdk');
require('dotenv').config(); 
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,  
});
 
const sns = new AWS.SNS(); 
const sendSMS = (message) => {
  const params = {
    Message: message,
    PhoneNumber: '+918329224821',
  };

  return sns.publish(params).promise();
}

const pushNotificationOnMobile = (message) => {
    try{
        sendSMS(message)
        .then(data => {
                console.log('SMS sent successfully:', data);
        })
        .catch(error => {
                console.error('Error sending SMS:', error);
        });
    }catch(err){
        console.log('ERROR ::: ', err);
    }
}


module.exports = pushNotificationOnMobile;


