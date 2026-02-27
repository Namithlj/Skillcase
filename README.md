# Skillcase — Short-video Learning Platform

==================================================
Project Summary
==================================================

Skillcase is a full-stack short-video learning platform where users can 
register, log in, and interact with educational video content.

The application demonstrates:

- JWT-based authentication
- Protected API routes using middleware
- Video streaming support
- Like, comment, and bookmark features
- Full-stack REST API integration
- Deployment of frontend and backend on Render


==================================================
Technology Stack
==================================================

Backend:
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication

Frontend:
- React (Vite)
- Redux Toolkit
- React Router
- Axios

Deployment:
- Render


==================================================
Deployed Links (Required)
==================================================

Frontend:
https://skillcase.onrender.com

Backend:
https://skillcase-backend.onrender.com


==================================================
Steps to Execute the Project (Local Setup)
==================================================

1️⃣ Clone the Repository

git clone <your-repository-link>
cd skillcase


2️⃣ Setup and Run Backend

cd backend
npm install
cp .env.example .env

Edit the .env file and add:

PORT=4000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key

Place the required MP4 files inside:

backend/uploads/

Expected files:
- Introduction_German.mp4
- Learning_German.mp4
- Story_German.mp4

Start the backend:

npm run dev

Backend will run at:
http://localhost:4000


3️⃣ Setup and Run Frontend

Open a new terminal:

cd frontend
npm install

Create a .env file inside frontend:

VITE_API_URL=http://localhost:4000/api

Start frontend:

npm run dev

Frontend will run at:
http://localhost:5173


4️⃣ Test the Application

- Open http://localhost:5173
- Register a new account
- Login
- View videos
- Like / Comment / Bookmark videos


==================================================
Architecture Overview
==================================================

Frontend (React + Redux)
        ↓
Axios API Calls
        ↓
Express Backend (Node.js)
        ↓
PostgreSQL Database

Authentication Flow:

1. User logs in or registers.
2. Backend generates a JWT token.
3. Token is stored in localStorage.
4. Token is sent in Authorization header:
   Authorization: Bearer <token>
5. Protected routes validate token using authMiddleware.


==================================================
API Endpoints
==================================================

Auth:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Videos:
GET    /api/videos
POST   /api/videos/:id/like
POST   /api/videos/:id/comment
POST   /api/videos/:id/bookmark


==================================================
Video Files (Important Requirement)
==================================================

Video files are NOT pushed to GitHub as required.

They must be manually placed inside:

backend/uploads/

The uploads folder is gitignored.


==================================================
Submission Requirements Confirmation
==================================================

✔ Deployed Link (Frontend + Backend provided above)  
✔ GitHub repository (frontend + backend)  
✔ SQL schema file included (backend/models/schema.sql)  
✔ README with setup steps and architecture explanation  
✔ Clear instructions to run backend and frontend  
✔ Video files NOT pushed to GitHub  

==================================================
End of README
==================================================
