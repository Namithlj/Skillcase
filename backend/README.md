# Skillcase Backend

Minimal backend skeleton for the Skillcase intern assessment.

Setup:

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Run `npm install` in `backend/`.
3. Run migrations: execute `backend/model/schema.sql` against your Postgres database.
4. Start server: `npm run dev` (requires `nodemon`) or `npm start`.

Uploaded videos should be placed in `backend/uploads/` and will be served at `/uploads/<filename>`.

Using a hosted Postgres (Render, Supabase, Neon)

- Do NOT commit database credentials. Set your connection string in an environment variable named `DATABASE_URL`.
- Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET` before starting the server.
- Example `DATABASE_URL` format (redacted):

	postgres://<username>:<password>@<host>:5432/<database>

- To apply the SQL schema manually (if you prefer), you can use `psql` or any Postgres client. Example using `psql`:

```bash
# on macOS / Linux
psql "$DATABASE_URL" -f backend/model/schema.sql

# or using psql with explicit host/port/user/db
psql -h <host> -U <user> -d <database> -f backend/model/schema.sql
```

- The server will also attempt to apply `backend/model/schema.sql` automatically on startup when `DATABASE_URL` is present.
