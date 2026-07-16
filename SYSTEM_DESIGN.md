# HireFlow : System Design

## Architecture Overview

```
Client (React/Vercel)
  └── REST API → Node.js/Express (Railway)
        ├── Auth: JWT access (15min) + refresh (7days httpOnly cookie)
        ├── Cache: Redis cache-aside (Upstash, TTL 2min)
        ├── DB: MongoDB Atlas (compound + text indexes)
        ├── Files: Multer → Cloudinary CDN
        └── Email: Bull queue → Resend API
```

## Database Design

### Indexes
```
Jobs collection:
  text index    → { title, description, skills }  (full-text search)
  compound      → { postedBy, createdAt }          (recruiter's jobs)

Applications collection:
  unique        → { jobId, seekerId }              (no duplicate applications)
  compound      → { status, createdAt }            (dashboard queries)
```

## Key Design Decisions

### Why cursor-based pagination over offset?
SKIP in MongoDB is O(n) page 1000 scans 10,000 documents.
Cursor pagination uses _id index directly O(log n) at any page.

### Why Bull queue for emails?
Email delivery via SMTP takes 1-3 seconds. Inline sending blocks
the API response. Bull queue responds in <50ms, processes email
in background with automatic retry on failure.

### Why Redis cache-aside?
Job listings are read-heavy same search query hits DB hundreds
of times. Cache-aside stores results with 2min TTL. Cache
invalidated on job create/delete. Reduces DB load by ~50%.

### Why stateless API?
No server-side sessions means any Node instance handles any
request. Ready for horizontal scaling behind load balancer
with zero code changes.

### Why TF-IDF cosine similarity for match score?
Fast, explainable, runs in-process with no API cost. Extracts
top 30 keywords from cover letter and job description, measures
overlap. Production upgrade: OpenAI embeddings for semantic matching.

## Scaling to 1M Users

```
Current                     Production (1M users)
─────────────────────       ──────────────────────
Single Node instance    →   Horizontal scale + Nginx LB
MongoDB Atlas M0        →   Atlas M10 + read replicas
Redis free tier         →   Redis Cluster
Cloudinary free         →   Cloudinary paid + CDN
Bull single worker      →   Bull cluster (multiple workers)
MongoDB text search     →   Elasticsearch
```

## API Endpoints

```
Auth
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout
  POST /api/auth/refresh
  POST /api/auth/send-otp
  POST /api/auth/reset-password

Jobs
  GET    /api/jobs              (public, cached)
  GET    /api/jobs/:id          (public)
  POST   /api/jobs              (recruiter)
  PATCH  /api/jobs/:id          (recruiter, owner)
  DELETE /api/jobs/:id          (recruiter, owner)
  PATCH  /api/jobs/:id/close    (recruiter, owner)

Applications
  POST   /api/applications/:jobId        (seeker)
  GET    /api/applications/mine          (seeker)
  GET    /api/applications/job/:jobId    (recruiter)
  PATCH  /api/applications/:id/status   (recruiter)

Dashboard
  GET /api/dashboard/seeker     (seeker)
  GET /api/dashboard/recruiter  (recruiter)
```