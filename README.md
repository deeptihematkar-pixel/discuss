# Discuss - Developer Discussion Platform

A modern real-time discussion platform for developers. Built with React, FastAPI, and Firebase.

---

## Local Development

### Prerequisites
- Node.js 20+ & Yarn
- Python 3.11+
- Firebase project with Realtime Database

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create backend/.env
FIREBASE_DB_URL=https://your-project-default-rtdb.firebaseio.com
JWT_SECRET=generate-a-random-64-char-string
CORS_ORIGINS=http://localhost:3000

uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install

# Create frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_FIREBASE_API_KEY=your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-id
REACT_APP_FIREBASE_APP_ID=your-app-id

yarn start
```

---

## Deploy to Vercel (Frontend)

1. Go to [vercel.com/new](https://vercel.com/new) → Import your GitHub repo
2. **Root Directory**: Click "Edit" → type `frontend`
3. **Framework Preset**: `Create React App` (auto-detected)
4. **Environment Variables** — add all of these:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | Your Render backend URL (deploy backend first) |
   | `REACT_APP_FIREBASE_API_KEY` | Your Firebase API key |
   | `REACT_APP_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com |
   | `REACT_APP_FIREBASE_DATABASE_URL` | https://your-project-default-rtdb.firebaseio.com |
   | `REACT_APP_FIREBASE_PROJECT_ID` | your-project-id |
   | `REACT_APP_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com |
   | `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | your-sender-id |
   | `REACT_APP_FIREBASE_APP_ID` | your-app-id |
5. Click **Deploy**

> After deploying, add your Vercel domain to **Firebase Console → Authentication → Settings → Authorized domains**

---

## Deploy to Render (Backend)

1. Go to [render.com/new](https://dashboard.render.com/new) → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `discuss-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `FIREBASE_DB_URL` | https://your-project-default-rtdb.firebaseio.com |
   | `JWT_SECRET` | a-random-64-character-string |
   | `CORS_ORIGINS` | https://your-vercel-app.vercel.app |
5. Click **Create Web Service**

> **Important**: On Render, select **Python** runtime, NOT Node.js. The error "Couldn't find package.json" means you selected Node.

---

## Deploy to Netlify (Frontend)

1. Import repo on [netlify.com](https://app.netlify.com)
2. Config is auto-read from `netlify.toml` (base = `frontend`)
3. Add all `REACT_APP_*` environment variables (same as Vercel table above)
4. Deploy — `CI=false` is set to prevent lint warnings from failing the build

---

## Firebase Setup

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database**
3. Enable **Authentication** → Google sign-in provider
4. Add deployed domains to **Authentication → Settings → Authorized domains**
5. Set database rules:
```json
{
  "rules": {
    "users": { ".indexOn": ["email"] },
    "posts": { ".indexOn": ["timestamp", "author_id"] },
    "comments": { "$postId": { ".indexOn": ["timestamp"] } },
    ".read": true, ".write": true
  }
}
```

---

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Firebase SDK
- **Backend**: FastAPI, PyJWT, bcrypt
- **Database**: Firebase Realtime Database
- **Auth**: JWT + bcrypt + Google OAuth
- **PWA**: Service Worker + Manifest

## License
MIT
