# Project Collaboration System

A RESTful API for managing projects and tracking issues, built with **NestJS**, **MongoDB**, and **JWT authentication**.

---

## Tech Stack

- **Framework**: NestJS 11 + TypeScript
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (access + refresh tokens) + Bcrypt
- **Validation**: class-validator / class-transformer
- **Docs**: Swagger UI at `/v1/docs`

---

## Modules

| Module | Description |
|---|---|
| **Auth** | Register, login, logout, token refresh |
| **Users** | Profile + admin user management |
| **Projects** | CRUD with owner/member access control |
| **Issues** | Per-project issue tracking (filter, sort, paginate) |
| **Reports** | Admin analytics (issues by status, per project, top assignees) |

---

## Key API Routes (prefix: `/v1`)

```
POST   /auth/register          Public
POST   /auth/login             Public  →  { accessToken, refreshToken }
POST   /auth/refresh           Refresh token header
POST   /auth/logout            JWT

GET    /users                  Admin only
GET    /users/me               JWT
DELETE /users/:id              Admin only

POST   /projects               JWT
GET    /projects               JWT (admins see all; users see own/member)
PATCH  /projects/:id           Owner or Admin
DELETE /projects/:id           Owner or Admin

POST   /projects/:pid/issues   JWT
GET    /projects/:pid/issues   JWT  ?status ?priority ?page ?limit ?sortBy
PATCH  /projects/:pid/issues/:id
DELETE /projects/:pid/issues/:id

GET    /reports/issues-by-status        Admin only
GET    /reports/project-issue-count     Admin only
GET    /reports/top-assigned-users      Admin only
```

---

## Roles

- **USER** — access own projects and member projects only
- **ADMIN** — full access to all resources and reports

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env   # fill in MONGODB_URI and JWT secrets

# 3. Start dev server
npm run start:dev
```

Server runs on `http://localhost:3000`. Swagger docs at `http://localhost:3000/v1/docs`.

---

## Environment Variables

| Variable | Example |
|---|---|
| `PORT` | `3000` |
| `MONGODB_URI` | `mongodb://localhost:27017/project-collaboration` |
| `JWT_ACCESS_SECRET` | `your-secret` |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_SECRET` | `your-secret` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |

---

A Postman collection is included at the repo root for quick API testing.
