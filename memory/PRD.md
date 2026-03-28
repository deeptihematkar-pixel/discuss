# Discuss - Developer Discussion Platform PRD

## Architecture
- Frontend: React 19 + Tailwind + Shadcn/UI (deploy on Vercel/Netlify)
- Backend: FastAPI Python (deploy on Render/Railway)
- Database: Firebase Realtime Database
- Auth: JWT+bcrypt + Google OAuth (Firebase Auth)
- Real-time: Firebase client SDK listeners
- PWA: manifest.json + service worker

## Implemented (March 28, 2026)
- Landing page, Register/Login (email + Google OAuth)
- Vote system (upvote/downvote replacing likes)
- Share modal (WhatsApp, Twitter/X, Telegram, Email, Copy Link)
- Discussion posts (content-only, no title) + Project posts (with title)
- Hashtags, search, trending tags
- Comments, profile page
- PWA, IndexedDB offline caching
- SEO (OG, Twitter cards, structured data, sitemap, robots.txt, AI discovery)
- Deployment configs: vercel.json, render.yaml, netlify.toml, Dockerfiles
- Emergent badge removed

## Deployment
- Vercel: Set root directory to `frontend`, add REACT_APP_* env vars
- Render: Backend as web service, root `backend`, add FIREBASE_DB_URL + JWT_SECRET
- See README.md for full instructions
