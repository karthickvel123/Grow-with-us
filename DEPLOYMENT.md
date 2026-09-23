# CodePath AI — Public Launch & Production Deployment Guide

This guide provides instructions to launch **CodePath AI** publicly for real students and users worldwide.

---

## 🚀 Recommended Deployment Options

### Option 1: Free Modern Cloud (Vercel + Render) — Fastest (10 Minutes)

This architecture uses serverless frontend hosting with global CDN (Vercel) and containerized Python backend hosting (Render).

#### Step 1: Deploy Backend to [Render.com](https://render.com)
1. Push your code to a GitHub or GitLab repository.
2. Go to [Render Dashboard](https://dashboard.render.com/) → Click **New** → **Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Name**: `codepath-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `SECRET_KEY`: *(Generate a secure random string, e.g. `openssl rand -hex 32`)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key from Google AI Studio)*
   - `DATABASE_URL`: `sqlite+aiosqlite:///./codepath.db` *(or connect a free Render PostgreSQL instance)*
6. Click **Deploy Web Service**.
7. Note down your public backend URL (e.g., `https://codepath-api.onrender.com`).

#### Step 2: Deploy Frontend to [Vercel](https://vercel.com)
1. Go to [Vercel Dashboard](https://vercel.com/new) → Click **Add New Project**.
2. Select your repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add an **Environment Variable**:
   - `VITE_API_BASE`: `https://codepath-api.onrender.com/api` *(Your Render backend URL with `/api`)*
5. Click **Deploy**.
6. Your app is live at `https://your-project.vercel.app` with free SSL, global CDN, and automatic Git updates!

---

### Option 2: Single-Server VPS with Docker (Full Control & Best Performance)

Deploy both frontend and backend on any Linux VPS ($4-$6/mo on DigitalOcean, Hetzner, Linode, or AWS EC2).

#### Step 1: Setup Server & Clone Repo
```bash
# Update server and install Docker
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git

# Clone your project repository
git clone https://github.com/your-username/codepath-ai.git
cd codepath-ai
```

#### Step 2: Configure Environment
Create `.env` file in the root folder:
```bash
SECRET_KEY=your-super-secret-random-jwt-key
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Step 3: Launch with Docker Compose
```bash
sudo docker compose up --build -d
```
* The React frontend is served on port `80` with Nginx.
* The FastAPI backend runs on port `8000` with automated proxying.
* The SQLite database is safely mounted to a persistent Docker volume (`backend-data`).

#### Step 4: Add Free SSL with Let's Encrypt (Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔒 Pre-Launch Security & Verification Checklist

Before announcing publicly, verify these checklist items:

1. **Secret Key**:
   - [ ] Generate a production JWT secret key. Do not use the development fallback key.
2. **AI Teacher & Interview Engine**:
   - [ ] Provide a valid `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/) for live Gemini 3.8 Flash inference.
   - [ ] *(Note: If no key is set, the app still operates safely with its built-in AST Socratic heuristic engine).*
3. **Database**:
   - [ ] For heavy concurrent traffic (1,000+ simultaneous students), connect a PostgreSQL database by providing `DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname`.
4. **Code Execution Sandbox**:
   - [ ] The sandbox includes AST parsing to forbid dangerous calls (`os`, `sys`, `subprocess`, `socket`, `open`).
   - [ ] The 5-second process timeout prevents CPU exhaustion from infinite loops.
5. **CORS Restrictions**:
   - [ ] In `backend/app/core/config.py`, replace `"*"` with your exact production domain (e.g., `https://yourdomain.com`).
6. **Mobile App Store Packaging (Optional)**:
   - [ ] The app includes `capacitor.config.json` and a full PWA manifest.
   - [ ] Run `npx cap add android` or `npx cap add ios` inside `frontend/` to generate native APK / iOS project files for Google Play and the Apple App Store.

---

## 🌐 Public Launch Readiness Status

| Layer | Status | Notes |
| :--- | :--- | :--- |
| **Frontend Web App** | ✅ Ready | Builds cleanly (`npm run build`), responsive, PWA configured. |
| **Backend REST API** | ✅ Ready | FastAPI, CORS enabled, async handlers, JWT auth. |
| **Curriculum & Bank** | ✅ Ready | Stages 0 to 7 seeded, 25+ problems, diagnostic quiz. |
| **Socratic AI Engine**| ✅ Ready | Google GenAI SDK integrated + AST heuristic fallback. |
| **Code Sandbox** | ✅ Ready | Subprocess isolation, AST safety filter, 5s timeout. |
| **Interview Simulator**| ✅ Ready | 4-dimension rubric scoring, daily topic exit interview. |
| **Docker Configuration**| ✅ Ready | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`. |
