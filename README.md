# Job Scout Pro

Job Scout Pro is a Kenyan job platform for discovering jobs, posting paid job listings, managing applications, and handling admin review workflows.

## Live App
https://job-scout-pro-production.up.railway.app

## GitHub Repository
https://github.com/peterlemreng/Job-Scout-Pro

## Main Features
- User signup and login
- Email verification flow
- Forgot password with OTP reset
- Public jobs listing
- Job detail page with views, likes, and clicks
- Post job draft then continue to payment
- Payment submission and admin review
- Employer dashboard
- Admin dashboard
- Application records
- Payment records
- Audit logging for key admin actions
- API rate limiting
- JWT-based admin protection

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL
- Hosting: Railway

## Environment Variables
Create `backend/.env` with:

- `DATABASE_URL` or database host settings
- `RESEND_API_KEY`
- `JWT_SECRET`

## Run Locally
### Backend
- `cd backend`
- `npm install`
- `npm run dev`

### Frontend
Frontend files are served by the backend static server.

## Important Routes
- `/login.html`
- `/signup.html`
- `/verify-email.html`
- `/jobs.html`
- `/job-detail.html?id=JOB_ID`
- `/post-job.html`
- `/payment.html?jobId=JOB_ID`
- `/employer-dashboard.html`
- `/admin.html`

## Current Status
Working:
- authentication flow
- email verification foundation
- password reset flow
- paid job posting flow
- admin review flow
- employer dashboard
- job engagement counters
- audit logging
- JWT admin protection

Planned next:
- broader JWT protection across more routes
- stronger trust and moderation systems
- better production polish
- domain connection for `jobscoutapp.com`

