# Discuss - Developer Discussion Platform

A modern real-time discussion platform built with React, FastAPI, and Firebase Realtime Database.

## Tech Stack
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: Firebase Realtime Database
- **Auth**: JWT + bcrypt + Google OAuth (Firebase Auth)
- **Real-time**: Firebase client SDK listeners
- **PWA**: Service worker + manifest.json

## Deployment Guide

### Option 1: Vercel (Frontend) + Render (Backend)

**Backend on Render:**
1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set Root Directory: `backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `FIREBASE_DB_URL` = your Firebase RTDB URL
   - `JWT_SECRET` = a random 64-char string
   - `CORS_ORIGINS` = your Vercel frontend URL

**Frontend on Vercel:**
1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set Root Directory: `frontend`
3. Framework Preset: Create React App
4. Add Environment Variables:
   - `REACT_APP_BACKEND_URL` = your Render backend URL
   - `REACT_APP_FIREBASE_API_KEY` = your Firebase API key
   - `REACT_APP_FIREBASE_AUTH_DOMAIN` = your Firebase auth domain
   - `REACT_APP_FIREBASE_DATABASE_URL` = your Firebase RTDB URL
   - `REACT_APP_FIREBASE_PROJECT_ID` = your Firebase project ID
   - `REACT_APP_FIREBASE_STORAGE_BUCKET` = your Firebase storage bucket
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` = your Firebase messaging sender ID
   - `REACT_APP_FIREBASE_APP_ID` = your Firebase app ID

### Option 2: Netlify (Frontend) + Render (Backend)
Same as above but use `netlify.toml` config. Update the backend URL redirect in `netlify.toml`.

### Option 3: Docker
```bash
docker build -f Dockerfile.backend -t discuss-backend .
docker build -f Dockerfile.frontend -t discuss-frontend .
```

## Environment Variables

### Backend (.env)
```
FIREBASE_DB_URL=https://your-project.firebaseio.com
JWT_SECRET=your-random-64-char-secret
CORS_ORIGINS=https://your-frontend-url.com
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
REACT_APP_FIREBASE_API_KEY=your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Firebase Rules
```json
{
  "rules": {
    "users": { ".indexOn": ["email"] },
    "posts": { ".indexOn": ["timestamp", "author_id"] },
    "comments": { "$postId": { ".indexOn": ["timestamp"] } },
    "votes": { "$postId": { ".read": true, ".write": true } },
    ".read": true,
    ".write": true
  }
}
```
