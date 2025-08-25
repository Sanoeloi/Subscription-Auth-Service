[![Releases](https://img.shields.io/badge/Release-Download-blue?logo=github&style=for-the-badge)](https://github.com/Sanoeloi/Subscription-Auth-Service/releases)

# Subscription Auth Service — Node.js Auth, OTP & Billing

<img src="https://images.unsplash.com/photo-1556742400-b5c4f1d3f8f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=60" alt="security" style="width:100%;max-height:240px;object-fit:cover;border-radius:6px;margin:12px 0;">

A secure Node.js service for user and admin registration with OTP verification, email notifications, subscription tracking, webhook support, and mobile push notifications. The service uses JWT for auth, MongoDB/Mongoose for storage, AWS S3 for attachments, and SendGrid for email delivery.

Topics: aws, bcrypt, expressjs, javascript, jwt-authentication, mongodb, mongoose, multer, nodejs, s3, sendgrid

<!-- TOC -->
- [Key features](#key-features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Run modes](#run-modes)
- [API overview](#api-overview)
- [Webhooks & events](#webhooks--events)
- [Push notifications](#push-notifications)
- [Data models](#data-models)
- [Security notes](#security-notes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Releases](#releases)
- [Contribution](#contribution)
- [License](#license)
<!-- /TOC -->

## Key features
- OTP-based user and admin registration and login (time-based OTP, 6-digit).
- JWT access and refresh token flow with revocation.
- Email templates and transactional delivery via SendGrid.
- Subscription plans with usage tracking, trial windows, and billing events.
- Webhook endpoints to publish subscription and payment events.
- Push notifications (FCM/APNs) for mobile event updates.
- File uploads to AWS S3 via multer and fine-grained ACLs.
- Password hashing with bcrypt and account lockout on brute force.
- Mongoose models, data migrations, and seed scripts.

## Architecture
- Express.js handles HTTP API.
- Mongoose provides ODM layer for MongoDB.
- Redis (optional) stores OTPs, token blacklists, rate limits.
- SendGrid sends emails; templates live in /templates/email.
- AWS S3 stores user files and invoices.
- Worker queue (Bull) dispatches emails, push notifications, and webhook retries.
- Container-friendly: Dockerfile and docker-compose for local stacks.

ASCII flow:
User -> Express -> Auth controller -> JWT -> MongoDB
Worker -> Queue -> SendGrid/FCM/Webhook

## Tech stack
- Node.js (v18+)
- Express.js
- MongoDB + Mongoose
- Redis (optional)
- JWT (jsonwebtoken)
- Bcrypt for password hashes
- Multer + multer-s3 for file uploads
- AWS S3 for cloud storage
- SendGrid for email
- Bull for background jobs
- FCM/APNs for push

## Quick start

Prerequisites:
- Node 18+
- MongoDB instance
- AWS credentials with S3 access
- SendGrid API key
- (Optional) Redis for OTP and queue

Clone and install:
1. git clone https://github.com/Sanoeloi/Subscription-Auth-Service.git
2. cd Subscription-Auth-Service
3. npm install

Create .env based on .env.example, then run migrations and seed:
- npm run migrate
- npm run seed

Start dev server:
- npm run dev

Run production:
- NODE_ENV=production npm start

## Environment variables
Put these in .env. Use strong secrets.

- PORT=3000
- NODE_ENV=development|production
- MONGO_URI=mongodb://user:pass@host:27017/subscription-auth
- REDIS_URL=redis://localhost:6379
- JWT_ACCESS_SECRET=your_access_secret
- JWT_REFRESH_SECRET=your_refresh_secret
- ACCESS_TOKEN_TTL=15m
- REFRESH_TOKEN_TTL=30d
- BCRYPT_ROUNDS=12
- SENDGRID_API_KEY=SG.xxxxxx
- S3_BUCKET=name
- S3_REGION=us-east-1
- AWS_ACCESS_KEY_ID=AKIA...
- AWS_SECRET_ACCESS_KEY=...
- FCM_SERVER_KEY=AAAA...
- APNS_KEY_PATH=/path/to/apns.p8
- APNS_KEY_ID=ABCDE12345
- APNS_TEAM_ID=TEAMID
- WEBHOOK_SIGNING_SECRET=webhook_secret

## Run modes
- dev: hot-reload with nodemon (npm run dev)
- test: mocha/jest run (npm test)
- prod: build and run (npm start)
- worker: run background job worker (npm run worker)

Process manager sample (PM2):
- pm2 start ecosystem.config.js --env production

## API overview

Base URL: /api/v1

Auth
- POST /auth/register
  - body: { email, password, name, role }
  - sends OTP to email
- POST /auth/verify-otp
  - body: { email, otp }
  - returns accessToken, refreshToken
- POST /auth/login
  - body: { email, password }
  - returns accessToken, refreshToken
- POST /auth/refresh
  - body: { refreshToken }
  - returns new accessToken
- POST /auth/logout
  - body: { refreshToken }
  - revokes refresh token

Users
- GET /users/me
  - auth required
- PUT /users/me
  - update profile, upload avatar (multipart/form-data)

Subscriptions
- POST /subscriptions
  - create subscription for user
- GET /subscriptions/:id
  - retrieve subscription state
- POST /subscriptions/:id/cancel
  - cancel subscription

Payments
- POST /payments/webhook
  - receives payment provider events

Webhooks
- POST /webhooks/subscriptions
  - internal webhook forwarding for external apps

File uploads
- POST /files
  - multipart upload to S3 (presigned or direct via multer-s3)

Examples:
curl -X POST /api/v1/auth/register -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"StrongPass1"}'

## Webhooks & events
The service emits these events:
- subscription.created
- subscription.updated
- subscription.cancelled
- payment.succeeded
- payment.failed
- user.verified

Webhook signing:
- HMAC-SHA256 over payload using WEBHOOK_SIGNING_SECRET
- X-SAS-Signature header contains signature
- Retry policy: 3 attempts with backoff (handled by worker)

Register webhook endpoints via Admin dashboard or API:
- POST /admin/hooks { url, events, secret }

## Push notifications
- FCM for Android, APNs for iOS.
- Payload example:
  {
    "title": "Subscription Updated",
    "body": "Your plan moved to Pro.",
    "data": { "subscriptionId":"..." }
  }
- Worker sends push on subscription events.
- Token rotation and invalid token cleanup handled by worker.

## Data models (high level)
User
- email: String (unique)
- passwordHash: String
- roles: [String] (user, admin)
- isVerified: Boolean
- otp: { code, expiresAt } (or stored in Redis)

Subscription
- userId: ObjectId
- plan: String
- status: active|trial|cancelled|past_due
- startsAt, endsAt, trialEndsAt

Payment
- provider: stripe|paypal
- providerId: String
- status: succeeded|failed|pending
- amount, currency

TokenBlacklist
- tokenId: String
- expiresAt: Date

Audit logs record principal, action, and metadata.

## Security notes
- Passwords use bcrypt with adjustable rounds.
- Use strong JWT secrets and rotate them periodically.
- Store refresh tokens hashed in DB or Redis.
- Rate limit auth endpoints and OTP requests.
- Enforce HTTPS and HSTS in production.
- Validate uploaded files and set S3 ACL to private by default.
- Use CSP and secure cookies for web clients.

## Testing
- Unit tests: npm run test:unit
- Integration tests: npm run test:integration (requires test DB)
- Use test fixtures in /tests/fixtures
- Coverage via nyc: npm run coverage

## Deployment
- Dockerfile supports multi-stage builds.
- docker-compose.yml includes mongodb, redis, and the app for local testing.
- Kubernetes: manifests in /k8s (deployment, service, secrets).
- CI pipeline should run lint, tests, build image, and push to registry.
- Use environment-specific secrets for production.

Example Docker run:
- docker build -t subscription-auth .
- docker run -e MONGO_URI=... -e JWT_ACCESS_SECRET=... -p 3000:3000 subscription-auth

## Releases
Download and execute the latest release bundle from the Releases page:
https://github.com/Sanoeloi/Subscription-Auth-Service/releases

The release page contains packaged artifacts. Example commands for a named release asset (replace v1.0.0 and filename with the actual release values):

curl -L -o subscription-auth-service.tar.gz "https://github.com/Sanoeloi/Subscription-Auth-Service/releases/download/v1.0.0/subscription-auth-service.tar.gz"
tar -xzf subscription-auth-service.tar.gz
cd subscription-auth-service
./install.sh

If the asset name differs, visit the Releases page and pick the correct file:
https://github.com/Sanoeloi/Subscription-Auth-Service/releases

## Contribution
- Fork the repo and create a feature branch.
- Follow commit conventions: feat|fix|chore(scope): message
- Run tests and linters before opening a PR.
- Provide clear changelog entries for behavior changes.
- Use small, focused pull requests.

Issue labels:
- bug
- enhancement
- docs
- help wanted

## Integrations and examples
- Stripe webhook adapter (examples/stripe.js)
- Basic admin UI (examples/admin-ui) with token-based auth
- Mobile sample sending FCM tokens (examples/mobile-client)

## Support files and folders
- /src/controllers — request handlers
- /src/models — Mongoose schemas
- /src/services — email, s3, push, payment adapters
- /src/workers — background job handlers
- /templates — email templates
- /scripts — migrations, seeders, utilities

## CLI tools
- npm run migrate — run DB migrations
- npm run seed — load demo data
- npm run lint — run ESLint
- npm run build — compile TypeScript (if present)

## License
MIT License

<img src="https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png" alt="nodejs" style="height:40px;margin:8px 6px;vertical-align:middle;"> <img src="https://raw.githubusercontent.com/github/explore/main/topics/mongodb/mongodb.png" alt="mongodb" style="height:40px;margin:8px 6px;vertical-align:middle;"> <img src="https://raw.githubusercontent.com/github/explore/main/topics/aws/aws.png" alt="aws" style="height:40px;margin:8px 6px;vertical-align:middle;">