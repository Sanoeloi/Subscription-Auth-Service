const AWS = require('aws-sdk');
const fs = require('fs');

require('dotenv').config(); 
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,  
});

const s3 = new AWS.S3();
const uploadImageToS3 = (image) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: image.originalname,
        Body: image.buffer,
        ContentType: 'image/jpeg', 
    };
    console.log('IMAGE :::: ', image)
    return s3.upload(params).promise();
}

module.exports = uploadImageToS3;