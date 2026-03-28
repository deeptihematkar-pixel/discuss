# Discuss - Developer Discussion Platform PRD

## Original Problem Statement
Build a fully functional public discussion platform web app called "Discuss" — production-grade, Discord-inspired modern app with authentication, real-time data, and community features. Light theme only. Firebase Realtime Database. JWT + bcrypt auth. Google OAuth. PWA. Two post types (Discussion, Project). Comments, likes, profile.

## Architecture
- **Backend**: FastAPI (Python) with Firebase Realtime Database REST API
- **Frontend**: React with Firebase Client SDK for real-time listeners
- **Database**: Firebase Realtime Database (https://discuss-13fbc-default-rtdb.firebaseio.com)
- **Auth**: JWT + bcrypt (email/password) + Firebase Google OAuth
- **Caching**: IndexedDB for offline post caching
- **PWA**: manifest.json, service-worker.js, offline fallback

## User Personas
- Developers sharing projects & discussions
- Community members engaging via likes/comments

## Core Requirements
- Landing page with hero, features, how-it-works
- Auth: Register, Login (email/password + Google OAuth)
- Feed: Real-time posts (Discussion + Project types)
- Posts: Create, edit, delete, like, comment
- Profile: User info, stats, logout
- PWA: Installable, offline fallback

## What's Been Implemented (March 28, 2026)
- Full landing page with logo, hero, feature cards, steps, CTA
- Register/Login with email/password + Google OAuth button
- "Managed by <discuss>" branding on auth pages
- Post feed with real-time Firebase listeners
- Discussion & Project post types with badges
- Like/unlike toggle with real-time count
- Comments with left-border accent, delete confirmation
- Profile page with username, email, member since, post count
- PWA manifest, service worker, offline.html
- IndexedDB caching for offline post reading
- Hidden scrollbar, responsive design (13px mobile, 15px desktop)

## Prioritized Backlog
- P0: None (MVP complete)
- P1: Push notifications for new comments on user's posts
- P1: Full offline sync (queue posts/comments when offline)
- P2: User avatar/photo display
- P2: Search/filter posts
- P2: Post categories/tags
- P3: Password change feature
- P3: User-to-user mentions
