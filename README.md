# Discuss - Developer Discussion Platform

A modern real-time discussion platform built with React, FastAPI, and Firebase.

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+ and Yarn
- Python 3.11+
- Firebase project with Realtime Database enabled

### 1. Clone the repo
```bash
git clone https://github.com/your-username/discuss.git
cd discuss
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
FIREBASE_DB_URL=https://your-project-default-rtdb.firebaseio.com
JWT_SECRET=your-random-64-char-hex-string-here
CORS_ORIGINS=http://localhost:3000
EOF

# Start backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Setup
```bash
cd frontend
yarn install

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
EOF

# Start frontend
yarn start
```

App runs at `http://localhost:3000`

---

## Deployment

### Vercel (Frontend Only)
1. Import repo on [vercel.com](https://vercel.com)
2. **Root Directory**: `frontend`
3. **Framework Preset**: Create React App
4. Add all `REACT_APP_*` environment variables
5. Set `REACT_APP_BACKEND_URL` to your deployed backend URL

### Render (Backend)
1. Create Web Service on [render.com](https://render.com)
2. **Root Directory**: `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add env vars: `FIREBASE_DB_URL`, `JWT_SECRET`, `CORS_ORIGINS`

### Netlify (Frontend Only)
1. Import repo, config is in `netlify.toml`
2. Add all `REACT_APP_*` environment variables
3. Requires Node 20+ (configured in netlify.toml)

### Docker
```bash
# Backend
docker build -f Dockerfile.backend -t discuss-backend .
docker run -p 8001:8001 --env-file backend/.env discuss-backend

# Frontend
docker build -f Dockerfile.frontend -t discuss-frontend .
docker run -p 3000:3000 discuss-frontend
```

---

## Firebase Setup
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database** (not Firestore)
3. Enable **Authentication** > Google provider
4. Add your deployed domains to **Authentication > Settings > Authorized domains**
5. Set database rules:
```json
{
  "rules": {
    "users": { ".indexOn": ["email"] },
    "posts": { ".indexOn": ["timestamp", "author_id"] },
    "comments": { "$postId": { ".indexOn": ["timestamp"] } },
    ".read": true,
    ".write": true
  }
}
```

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Firebase Client SDK
- **Backend**: FastAPI, PyJWT, bcrypt
- **Database**: Firebase Realtime Database
- **Auth**: JWT + bcrypt + Google OAuth
- **PWA**: Service Worker + Web App Manifest

## License
MIT
