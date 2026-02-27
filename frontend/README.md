# Skillcase Frontend

Start dev server:

```bash
cd frontend
npm install
npm run dev
```

By default the frontend expects backend API at `http://localhost:4000/api`.
Set `VITE_API_URL` to change the API base.

Authentication token is persisted to `localStorage` under `skillcase_auth`.
