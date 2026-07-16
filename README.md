# HireFlow : Full Stack Job Portal

A production-ready MERN stack job portal with AI-powered resume screening, 
real-time notifications, and Redis caching.

## Live Demo
-  https://hireflow-three-alpha.vercel.app/


## Features

**For Job Seekers**
- Browse and search jobs with full-text search and filters
- Apply with resume upload and cover letter
- Keyword based match score against job description
- Track application status with email notifications
- Forgot password with OTP verification

**For Recruiters**
- Post, edit, and delete job listings
- View applicants ranked by Keyword based match score
- Schedule interviews with date/time — candidate gets email
- Close job listings and auto-delete after 3 days
- Analytics dashboard with Recharts bar chart

## System Design Concepts
1. Stateless API design (JWT no server sessions)
2. JWT + Refresh token rotation (httpOnly cookie)
3. Role-Based Access Control (Job Seeker / Recruiter)
4. Rate limiting (express-rate-limit)
5. Database indexing (compound + text indexes)
6. MongoDB aggregation pipeline (dashboard analytics)
7. Cache-aside pattern (Redis + Upstash)
8. Async job queue producer/consumer (Bull + Redis)
9. Cursor-based pagination (job listings)
10. CDN + Cloud storage (Multer + Cloudinary)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TailwindCSS, Recharts, React Router |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT + Refresh token rotation |
| Cache | Redis (Upstash) |
| Queue | Bull + Redis |
| Email | Resend API |
| Files | Multer + Cloudinary |
| Deploy | Railway + Vercel |

## Local Setup

```bash
# Clone
git clone https://github.com/Param2725/hireflow.git
cd hireflow

# Backend
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev

# Frontend
cd ../client
npm install
npm start
```

## Environment Variables

```
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
REDIS_URL=
EMAIL_USER=
```

## Architecture

```
React (Vercel)
  └── Axios → Express API (Railway)
        ├── JWT middleware
        ├── Role middleware
        ├── Rate limiter
        ├── Redis cache check (Upstash)
        │     └── Miss → MongoDB
        ├── Cloudinary (file storage)
        └── Bull queue → Resend (email)
```