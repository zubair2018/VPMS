# Visitor Pass Management System

This is a MERN starter project for your assignment. It includes role-based authentication, visitor creation, appointments, pass generation with QR/PDF, scan logs, and a simple dashboard.

## Folder structure

- `backend/` Express + MongoDB API
- `frontend/` React app
- `package.json` root helper scripts

## Step 1: install

```bash
cd visitor-pass-management
npm install
npm run install:all
```

## Step 2: backend env

Copy `backend/.env.example` to `backend/.env` and update values.

## Step 3: frontend env

Copy `frontend/.env.example` to `frontend/.env`.

## Step 4: run seed

```bash
cd backend
npm run seed
```

Demo users after seeding:
- admin@example.com / 123456
- security@example.com / 123456
- employee@example.com / 123456
- visitor@example.com / 123456

## Step 5: start app

From the project root:

```bash
npm run dev
```

Frontend runs on port 3000 and backend on port 5000.

## What you should improve next

1. Replace manual pass-number scan input with a real QR scanner component.
2. Add file upload for visitor photo and ID proof.
3. Auto-select employee hosts instead of typing host ID manually.
4. Add search, filter, export CSV/PDF, pagination, and charts.
5. Add SMS integration and proper email templates.
6. Add validation using Joi/Zod and better error handling.
7. Deploy backend on Render/Railway and frontend on Vercel/Netlify.

## Important note

This starter uses `localStorage` in the frontend auth context. If you want strict assignment quality, replace that with a more production-safe auth flow such as HTTP-only cookies or at least refresh-token handling before final submission.
