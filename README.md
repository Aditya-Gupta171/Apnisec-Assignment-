# ApniSec – Cloud & VAPT Security Portal

ApniSec is a full‑stack security issue tracking portal for Cloud Security, Red Team and VAPT work.  
It’s built with **Next.js App Router**, **TypeScript**, **Prisma (PostgreSQL/Supabase)** and **Resend email**, following a clean, class‑based backend architecture.

---

## Tech Stack

- **Frontend**
  - Next.js App Router (16) + React + TypeScript
  - Tailwind‑style utility classes via `globals.css`
- **Backend**
  - Next.js API routes (App Router) with OOP layering:
    - Handlers → Services → Repositories → Validators → Core
  - Prisma ORM (PostgreSQL/Supabase, `@prisma/adapter-pg`)
- **Auth & Security**
  - JWT auth with **access + refresh tokens** (httpOnly cookies)
  - Rate limiting per IP on all sensitive endpoints
  - Password reset flow with signed tokens
- **Email**
  - Resend for transactional emails:
    - Welcome email
    - Issue created notification
    - Password reset link

---

## Features

### Authentication

- Register, login, logout
- `remember me` via long‑lived refresh token
- `/api/auth/refresh` to rotate access tokens
- Password reset:
  - `/forgot-password` – request reset link
  - `/reset-password` – set new password

### User Profile

- `/profile` page backed by `/api/users/profile` (GET/PUT)
- Stores full name, company, role and phone
- Used to contextualise security issues

### Issues Management

- `/dashboard` page with:
  - Create new issue (type, title, description, priority)
  - Filter by type, status, priority, search text
  - Inline update of status/priority
  - Delete issue
- APIs:
  - `GET /api/issues`
  - `POST /api/issues`
  - `GET /api/issues/[id]`
  - `PUT /api/issues/[id]`
  - `DELETE /api/issues/[id]`

### Emails

- Welcome email on successful registration
- Notification when a new issue is created
- Password reset link with secure token

### SEO & DX

- Custom metadata via `app/layout.tsx`
- `robots.ts` and `sitemap.ts` routes
- Clean folder structure for backend and frontend
- Centralised error handling and rate limiting

---

## Project Structure

```text
src/
  app/
    api/
      auth/           # /api/auth/* endpoints
      issues/         # /api/issues & /api/issues/[id]
      users/          # /api/users/profile
    dashboard/        # /dashboard page (issues UI)
    login/            # /login page
    register/         # /register page
    profile/          # /profile page
    forgot-password/  # /forgot-password page
    reset-password/   # /reset-password page
    layout.tsx        # root layout + metadata
    page.tsx          # landing page
    robots.ts         # SEO robots
    sitemap.ts        # SEO sitemap
  hooks/
    useRequireAuth.ts # client-side auth guard
  lib/
    core/             # ApiError, BaseHandler, JwtService, RateLimiter, etc.
    db/
      prisma.ts       # Prisma client (adapter-pg)
    modules/
      auth/           # AuthRepository, AuthService, AuthHandlers, AuthValidator
      users/          # UserRepository, UserService, UserHandlers, UserValidator
      issues/         # IssueRepository, IssueService, IssueHandlers, IssueValidator
      email/          # EmailService (Resend)
```

---

## Environment Variables

Create a `.env` file at the project root (see `.env.example`):

```env
DATABASE_URL="postgresql://...your-supabase-connection..."
JWT_SECRET="long-random-secret-for-jwt"
RESEND_API_KEY="re_..."
```

| Variable         | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `DATABASE_URL`   | Supabase PostgreSQL connection string (session pooler). |
| `JWT_SECRET`     | Secret used to sign/verify JWT access tokens.           |
| `RESEND_API_KEY` | Resend API key for sending transactional emails.        |

---

## Running Locally

1. **Install dependencies**

```bash
npm install
```

2. **Generate Prisma client**

```bash
npx prisma generate
```

3. **Run database migrations**

```bash
npx prisma migrate dev
```

4. **Start dev server**

```bash
npm run dev
```

Open http://localhost:3000.

---

## Available Scripts

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint
npx prisma studio   # Prisma DB browser (optional)
```

---

## Deployment (Vercel)

1. Push the repo to GitHub/GitLab/Bitbucket.
2. On https://vercel.com → **New Project** → import this repo.
3. Set environment variables in Vercel (Project → Settings → Environment Variables):
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `RESEND_API_KEY`
4. Ensure `package.json` has:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate"
}
```

5. Deploy. Vercel will build and host the app.  
   Use the Vercel URL to demo the full flow (auth, dashboard, profile, reset password).

---

## API Shape

All APIs respond with a consistent JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "validation_error | auth_error | rate_limit | ...",
    "message": "Human readable message"
  }
}
```

Rate limited responses have HTTP `429` and include:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
