# Posts API

SQLite-backed Express API for Social posts + admin login.

## Endpoints

- `GET /api/health`
- `POST /api/auth/login` `{ username, password }` → `{ token, user }`
- `POST /api/auth/logout` (Bearer token)
- `GET /api/auth/me` (Bearer token)
- `GET /api/posts` public published posts
- `GET /api/posts?all=1` all posts (auth)
- `POST /api/posts` create (auth)
- `PUT /api/posts/:id` update (auth)
- `DELETE /api/posts/:id` delete (auth)
- `POST /api/posts/:id/react` `{ key: like|fire|idea, delta: 1|-1 }`

## Run locally

```bash
cd api
npm install
cp .env.example .env   # or use existing .env
npm start
```

Admin UI: `/admin.html` on the site.

Default seeded admin (change after first login by resetting DB / env):

- username: `ritik`
- password: from `ADMIN_PASSWORD` in `api/.env`
