# Subscription Auth Service

A secure and scalable Node.js service for managing user and admin registrations with OTP email verification, password encryption, subscription tracking, and notification delivery.

---

## 🚀 Features

- ✅ User & Admin Registration with profile image upload to S3
- ✅ OTP-based Email Verification
- ✅ JWT Authentication for secured access
- ✅ Encrypted Password Handling with bcrypt
- ✅ Subscription management via webhook
- ✅ Push notifications to mobile devices
- ✅ Admin dashboard to fetch all users
- ✅ Email service integration with SendGrid

---

## 🧰 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **AWS S3 (Image Upload)**
- **SendGrid (Email Service)**
- **JWT (Auth)**
- **Multer (File Uploads)**
- **bcrypt (Password Hashing)**

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/priyanka-suradkar/subscription-auth-service.git
cd subscription-auth-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure `.env`

Create a `.env` file with the following content:

```env
PORT=3002
MONGO_URI=<your_mongo_uri>
SECRET_JWT_KEY=<your_jwt_secret>
SENDGRID_API_KEY=<your_sendgrid_api_key>
AWS_ACCESS_KEY_ID=<your_aws_access_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret>
AWS_REGION=<your_aws_region>
AWS_BUCKET_NAME=<your_s3_bucket_name>
```

### 4. Start the Server

```bash
npm start
```

---

## 📁 Project Structure

```
├── controller/
│   ├── adminController.js
│   └── userController.js
├── db/
│   └── mongoConfig.js
├── middleware.js/
│   ├── adminMiddleware.js
│   └── userMiddleware.js
├── model/
│   ├── admin.js
│   └── user.js
├── routes/
│   ├── adminRoute.js
│   └── userRoute.js
├── utility/
│   ├── isValidEmail.js
│   ├── mailSenderService.js
│   ├── pushNotificationOnMobile.js
│   ├── randomPasswordGenerator.js
│   ├── uploadImageToS3.js
│   └── verificationEmail.js
├── index.js
└── .env (excluded)
```

---

## 🌐 Key Endpoints

### 🔐 Auth & Registration

| Method | Endpoint                | Description                  |
|--------|-------------------------|------------------------------|
| POST   | `/register`             | User registration            |
| POST   | `/admin/register`       | Admin registration           |
| POST   | `/login`                | User login                   |
| POST   | `/admin/login`          | Admin login                  |
| POST   | `/verify-otp`           | User OTP verification        |
| POST   | `/admin/verify-otp`     | Admin OTP verification       |

### 📩 Notifications

| Method | Endpoint                | Description                      |
|--------|-------------------------|----------------------------------|
| POST   | `/webhook/subscribe`    | Add subscription to user        |
| POST   | `/notify`               | Trigger push notification       |

---

## 🧪 Testing

You can use Postman or Swagger to test the endpoints.

---

## 📬 Contact

Made with ❤️ by [Your Name]  
Contributions welcome!
