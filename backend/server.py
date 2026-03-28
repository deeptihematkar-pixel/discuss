from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
import bcrypt
import jwt
import requests
import json
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import Optional

# Firebase Realtime Database URL
FIREBASE_DB_URL = os.environ.get('FIREBASE_DB_URL', 'https://discuss-13fbc-default-rtdb.firebaseio.com')
JWT_SECRET = os.environ.get('JWT_SECRET', 'd9f2c8a7e4b1f6d3a0e5c9b2f8d4a7e1c6b3f0d5a8e2c7b4f1d6a3e0c5b9f2')
JWT_ALGORITHM = "HS256"

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Firebase RTDB helpers ---
def fb_get(path):
    """GET data from Firebase RTDB"""
    url = f"{FIREBASE_DB_URL}/{path}.json"
    resp = requests.get(url, timeout=10)
    if resp.status_code == 200:
        return resp.json()
    logger.error(f"Firebase GET {path} failed: {resp.status_code} {resp.text}")
    return None

def fb_put(path, data):
    """PUT (set) data at Firebase RTDB path"""
    url = f"{FIREBASE_DB_URL}/{path}.json"
    resp = requests.put(url, json=data, timeout=10)
    if resp.status_code == 200:
        return resp.json()
    logger.error(f"Firebase PUT {path} failed: {resp.status_code} {resp.text}")
    return None

def fb_post(path, data):
    """POST (push) data to Firebase RTDB path, returns generated key"""
    url = f"{FIREBASE_DB_URL}/{path}.json"
    resp = requests.post(url, json=data, timeout=10)
    if resp.status_code == 200:
        return resp.json()
    logger.error(f"Firebase POST {path} failed: {resp.status_code} {resp.text}")
    return None

def fb_patch(path, data):
    """PATCH (update) data at Firebase RTDB path"""
    url = f"{FIREBASE_DB_URL}/{path}.json"
    resp = requests.patch(url, json=data, timeout=10)
    if resp.status_code == 200:
        return resp.json()
    logger.error(f"Firebase PATCH {path} failed: {resp.status_code} {resp.text}")
    return None

def fb_delete(path):
    """DELETE data at Firebase RTDB path"""
    url = f"{FIREBASE_DB_URL}/{path}.json"
    resp = requests.delete(url, timeout=10)
    return resp.status_code == 200

# --- Password helpers ---
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# --- JWT helpers ---
def create_access_token(user_id: str, username: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_data = fb_get(f"users/{payload['sub']}")
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        user_data.pop("password_hash", None)
        user_data["id"] = payload["sub"]
        return user_data
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Pydantic models ---
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CreatePostRequest(BaseModel):
    type: str  # "discussion" or "project"
    title: str
    content: str
    github_link: Optional[str] = ""
    preview_link: Optional[str] = ""

class UpdatePostRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    github_link: Optional[str] = None
    preview_link: Optional[str] = None

class CreateCommentRequest(BaseModel):
    text: str

class GoogleAuthRequest(BaseModel):
    uid: str
    email: str
    display_name: str
    photo_url: Optional[str] = ""

# --- Auth endpoints ---
@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower().strip()
    username = req.username.strip()
    if not username or not email or not req.password:
        raise HTTPException(status_code=400, detail="All fields are required")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if len(username) < 2:
        raise HTTPException(status_code=400, detail="Username must be at least 2 characters")

    # Check if email already exists
    users = fb_get("users") or {}
    for uid, udata in users.items():
        if udata.get("email", "").lower() == email:
            raise HTTPException(status_code=400, detail="Email already registered")
        if udata.get("username", "").lower() == username.lower():
            raise HTTPException(status_code=400, detail="Username already taken")

    user_id = str(uuid.uuid4())
    user_data = {
        "username": username,
        "email": email,
        "password_hash": hash_password(req.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    fb_put(f"users/{user_id}", user_data)

    token = create_access_token(user_id, username, email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

    return {
        "id": user_id,
        "username": username,
        "email": email,
        "created_at": user_data["created_at"],
        "token": token
    }

@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower().strip()
    users = fb_get("users") or {}
    
    for uid, udata in users.items():
        if udata.get("email", "").lower() == email:
            if verify_password(req.password, udata["password_hash"]):
                token = create_access_token(uid, udata["username"], udata["email"])
                response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
                return {
                    "id": uid,
                    "username": udata["username"],
                    "email": udata["email"],
                    "created_at": udata.get("created_at", ""),
                    "token": token
                }
            else:
                raise HTTPException(status_code=401, detail="Invalid password")
    
    raise HTTPException(status_code=401, detail="No account found with this email")

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = get_current_user(request)
    return user

@api_router.post("/auth/google")
async def google_auth(req: GoogleAuthRequest, response: Response):
    email = req.email.lower().strip()
    display_name = req.display_name.strip() or email.split("@")[0]
    
    # Check if user already exists by email
    users = fb_get("users") or {}
    for uid, udata in users.items():
        if udata.get("email", "").lower() == email:
            token = create_access_token(uid, udata["username"], udata["email"])
            response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
            return {
                "id": uid,
                "username": udata["username"],
                "email": udata["email"],
                "created_at": udata.get("created_at", ""),
                "photo_url": udata.get("photo_url", ""),
                "token": token
            }
    
    # Create new user from Google auth
    user_id = req.uid or str(uuid.uuid4())
    # Generate unique username from display name
    base_username = display_name.replace(" ", "").lower()[:15]
    username = base_username
    counter = 1
    for uid, udata in users.items():
        if udata.get("username", "").lower() == username.lower():
            username = f"{base_username}{counter}"
            counter += 1
    
    user_data = {
        "username": username,
        "email": email,
        "password_hash": "",
        "photo_url": req.photo_url or "",
        "auth_provider": "google",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    fb_put(f"users/{user_id}", user_data)
    
    token = create_access_token(user_id, username, email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "username": username,
        "email": email,
        "created_at": user_data["created_at"],
        "photo_url": req.photo_url or "",
        "token": token
    }

# --- Posts endpoints ---
@api_router.get("/posts")
async def get_posts(request: Request):
    get_current_user(request)  # Auth check
    posts_data = fb_get("posts") or {}
    likes_data = fb_get("likes") or {}
    comments_data = fb_get("comments") or {}
    
    posts_list = []
    for pid, pdata in posts_data.items():
        post_likes = likes_data.get(pid, {}) or {}
        post_comments = comments_data.get(pid, {}) or {}
        posts_list.append({
            "id": pid,
            **pdata,
            "like_count": len(post_likes),
            "comment_count": len(post_comments),
            "liked_by": list(post_likes.keys())
        })
    
    posts_list.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return posts_list

@api_router.post("/posts")
async def create_post(req: CreatePostRequest, request: Request):
    user = get_current_user(request)
    if req.type not in ["discussion", "project"]:
        raise HTTPException(status_code=400, detail="Invalid post type")
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    
    post_data = {
        "type": req.type,
        "title": req.title.strip(),
        "content": req.content.strip(),
        "github_link": req.github_link.strip() if req.github_link else "",
        "preview_link": req.preview_link.strip() if req.preview_link else "",
        "author_username": user["username"],
        "author_id": user["id"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "like_count": 0,
        "comment_count": 0
    }
    
    result = fb_post("posts", post_data)
    if result and "name" in result:
        post_data["id"] = result["name"]
        post_data["liked_by"] = []
        return post_data
    raise HTTPException(status_code=500, detail="Failed to create post")

@api_router.put("/posts/{post_id}")
async def update_post(post_id: str, req: UpdatePostRequest, request: Request):
    user = get_current_user(request)
    post = fb_get(f"posts/{post_id}")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["author_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own posts")
    
    updates = {}
    if req.title is not None:
        updates["title"] = req.title.strip()
    if req.content is not None:
        updates["content"] = req.content.strip()
    if req.github_link is not None:
        updates["github_link"] = req.github_link.strip()
    if req.preview_link is not None:
        updates["preview_link"] = req.preview_link.strip()
    
    if updates:
        fb_patch(f"posts/{post_id}", updates)
    
    updated = fb_get(f"posts/{post_id}")
    updated["id"] = post_id
    likes = fb_get(f"likes/{post_id}") or {}
    comments = fb_get(f"comments/{post_id}") or {}
    updated["like_count"] = len(likes)
    updated["comment_count"] = len(comments)
    updated["liked_by"] = list(likes.keys())
    return updated

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, request: Request):
    user = get_current_user(request)
    post = fb_get(f"posts/{post_id}")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["author_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own posts")
    
    fb_delete(f"posts/{post_id}")
    fb_delete(f"comments/{post_id}")
    fb_delete(f"likes/{post_id}")
    return {"message": "Post deleted"}

# --- Like endpoint ---
@api_router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, request: Request):
    user = get_current_user(request)
    post = fb_get(f"posts/{post_id}")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    existing_like = fb_get(f"likes/{post_id}/{user['id']}")
    if existing_like:
        fb_delete(f"likes/{post_id}/{user['id']}")
        liked = False
    else:
        fb_put(f"likes/{post_id}/{user['id']}", True)
        liked = True
    
    all_likes = fb_get(f"likes/{post_id}") or {}
    like_count = len(all_likes)
    
    return {"liked": liked, "like_count": like_count, "liked_by": list(all_likes.keys())}

# --- Comments endpoints ---
@api_router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str, request: Request):
    get_current_user(request)
    comments_data = fb_get(f"comments/{post_id}") or {}
    comments_list = []
    for cid, cdata in comments_data.items():
        comments_list.append({"id": cid, **cdata})
    comments_list.sort(key=lambda x: x.get("timestamp", ""))
    return comments_list

@api_router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, req: CreateCommentRequest, request: Request):
    user = get_current_user(request)
    post = fb_get(f"posts/{post_id}")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Comment text is required")
    
    comment_data = {
        "author_username": user["username"],
        "author_id": user["id"],
        "text": req.text.strip(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    result = fb_post(f"comments/{post_id}", comment_data)
    if result and "name" in result:
        comment_data["id"] = result["name"]
        return comment_data
    raise HTTPException(status_code=500, detail="Failed to create comment")

@api_router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(post_id: str, comment_id: str, request: Request):
    user = get_current_user(request)
    comment = fb_get(f"comments/{post_id}/{comment_id}")
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment["author_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own comments")
    
    fb_delete(f"comments/{post_id}/{comment_id}")
    return {"message": "Comment deleted"}

# --- User stats ---
@api_router.get("/users/{user_id}/stats")
async def get_user_stats(user_id: str, request: Request):
    get_current_user(request)
    posts_data = fb_get("posts") or {}
    post_count = sum(1 for p in posts_data.values() if p.get("author_id") == user_id)
    return {"post_count": post_count}

# Health check
@api_router.get("/")
async def root():
    return {"message": "Discuss API is running"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
