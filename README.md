# Skillcase — Short-video learning platform

This repo contains a backend (Node.js + Express + PostgreSQL) and a frontend (React + Vite + Redux Toolkit).

Quick start (backend):

```bash
cd backend
npm install
cp .env.example .env
# set DATABASE_URL and JWT_SECRET in .env
npm run dev
```

Place the provided MP4 files into `backend/uploads/` (they are gitignored). On server start it will auto-apply the DB schema and import files into the `videos` table.

Quick start (frontend):

```bash
cd frontend
npm install
npm run dev
```

Open the frontend (default Vite port 5173). Use the login page to obtain a token and then you can like/comment/bookmark videos.
