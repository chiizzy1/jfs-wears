# JFS Wears - Deployment Guide

A step-by-step guide to deploy your e-commerce platform for **FREE** (or very low cost).

---

## Architecture Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │   Database      │
│   (Next.js)     │ ───▶ │   (NestJS)      │ ───▶ │  (PostgreSQL)   │
│   Vercel        │      │ Railway/Render  │      │   Neon          │
│   FREE          │      │  $5 or FREE     │      │   FREE          │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                │
                                ▼
                         ┌─────────────────┐
                         │     Redis       │
                         │    Upstash      │
                         │    FREE         │
                         └─────────────────┘
```

**Estimated Monthly Cost: $0** (using Render) or **$5** (using Railway)

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account (push your code there first)
- [ ] Vercel account (vercel.com)
- [ ] Railway account (railway.app) OR Render account (render.com)
- [ ] Neon account (neon.tech)
- [ ] Upstash account (upstash.com)

---

## Step 1: Push Code to GitHub

If not already done:

```bash
# Initialize git (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/jfs-wears.git

# Push
git push -u origin main
```

---

## Step 2: Set Up Database (Neon - FREE)

### 2.1 Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Click **"Create Project"**

### 2.2 Create Database

1. Project name: `jfs-wears`
2. Database name: `jfswears`
3. Region: Choose closest to your users
4. Click **"Create Project"**

### 2.3 Get Connection String

1. After creation, you'll see a connection string like:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/jfswears?sslmode=require
   ```
2. **Copy and save this** - you'll need it for the backend

### 2.4 Verify Database

Your `DATABASE_URL` should look like:

```
postgresql://neondb_owner:AbCdEf123456@ep-xyz-123456.us-east-2.aws.neon.tech/jfswears?sslmode=require
```

---

## Step 3: Set Up Redis Cache (Upstash - FREE)

### 3.1 Create Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub

### 3.2 Create Redis Database

1. Click **"Create Database"**
2. Name: `jfs-wears-cache`
3. Region: Same as your Neon database
4. Type: **Regional** (free tier)
5. Click **"Create"**

### 3.3 Get Redis Credentials

1. Go to your database dashboard
2. Find:
   - **UPSTASH_REDIS_REST_URL**: `https://xyz.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `AXyz123...`
3. Also note the **Redis URL**:
   ```
   redis://default:password123@xyz.upstash.io:6379
   ```

---

## Step 4: Deploy Backend

Choose **Option A** (Railway) for better performance/reliability, or **Option B** (Render) for $0 cost.

### Option A: Railway ($5/mo - Recommended)

### 4.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### 4.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub and select your `jfs-wears` repo
4. **Important**: Railway will detect the monorepo

### 4.3 Configure the Backend Service

1. In Railway dashboard, click on the service
2. Go to **Settings** tab
3. Set **Root Directory**: `apps/api`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm run start:prod`

### 4.4 Add Environment Variables

Go to **Variables** tab and add:

```env
# Database
DATABASE_URL=postgresql://username:password@ep-xyz.neon.tech/jfswears?sslmode=require

# JWT (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters

# Redis (from Upstash)
REDIS_HOST=xyz.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# Frontend URL (update after Vercel deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Payment Providers (get from providers)
OPAY_MERCHANT_ID=your-opay-merchant-id
OPAY_PUBLIC_KEY=your-opay-public-key
OPAY_SECRET_KEY=your-opay-secret-key
MONNIFY_API_KEY=your-monnify-api-key
MONNIFY_SECRET_KEY=your-monnify-secret-key
MONNIFY_CONTRACT_CODE=your-contract-code
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Port (Railway sets this automatically)
PORT=3001
```

### 4.5 Generate Secure JWT Secrets

Run this in your terminal to generate secure secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET (run again)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.6 Deploy

1. Railway auto-deploys when you push to GitHub
2. Click **"Deploy"** if manual
3. Wait for build to complete (2-5 minutes)

### 4.7 Get Your API URL

1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"**
3. You'll get something like: `jfs-wears-api.up.railway.app`
4. **Save this URL** for the frontend

### 4.8 Run Database Migrations

In Railway, go to the service and open the **Shell**:

```bash
npx prisma db push
```

---

### Option B: Render (Truly FREE - $0/mo)

**Note:** Render's free tier spins down after inactivity. The first request after a while will take ~30-60 seconds.

#### 4B.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

#### 4B.2 Create Web Service

1. Click **"New"** -> **"Web Service"**
2. Select **"Build and deploy from a Git repository"**
3. Connect your `jfs-wears` repo
4. Name: `jfs-wears-api`
5. **Region**: Choose closest to you (e.g., Frankfurt, Oregon)
6. **Branch**: `main`
7. **Root Directory**: `apps/api`
8. **Runtime**: `Node`
9. **Build Command**: `npm install && npm run build`
10. **Start Command**: `npm run start:prod`
11. **Instance Type**: Free

#### 4B.3 Environment Variables

Scroll down to **Environment Variables** and add all the same variables as Railway:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (from Upstash)
- `NEXT_PUBLIC_APP_URL` (Set this to your future Vercel URL)
- `CLOUDINARY_*` keys
- `OPAY_*`, `MONNIFY_*`, `PAYSTACK_*` keys
- **Important**: Add `PORT` = `3000` (Render explicitly needs this sometimes for NestJS)

#### 4B.4 Deploy

1. Click **"Create Web Service"**
2. Wait for the build to finish.
3. Your URL will look like: `https://jfs-wears-api.onrender.com`

---

## Step 5: Deploy Frontend (Vercel - FREE)

### 5.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 5.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Select your `jfs-wears` GitHub repo
3. Vercel will detect it's a monorepo

### 5.3 Configure Build Settings

1. **Framework Preset**: Next.js
2. **Root Directory**: `apps/web`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`

### 5.4 Add Environment Variables

Add these in Vercel's dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-railway-api.up.railway.app/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 5.5 Deploy

1. Click **"Deploy"**
2. Wait for build (1-3 minutes)
3. You'll get a URL like: `jfs-wears.vercel.app`

### 5.6 Update Backend CORS

Go back to Railway and update:

```env
NEXT_PUBLIC_APP_URL=https://jfs-wears.vercel.app
```

---

## Step 6: Post-Deployment Checklist

### 6.1 Verify Database

```bash
# In Railway shell
npx prisma db push
npx prisma studio  # Opens database GUI
```

### 6.2 Create Admin User

In Railway shell or locally:

```bash
# Run seed script (if you have one)
npm run db:seed

# Or create via API (use Swagger)
# Go to: https://your-api.railway.app/api/docs
```

### 6.3 Test the Flow

1. **Frontend**: Visit your Vercel URL
2. **API Docs**: Visit `https://your-api.railway.app/api/docs`
3. **Test Registration**: Create a user account
4. **Test Cart**: Add items to cart
5. **Test Checkout**: Complete a test order

---

## Step 7: Custom Domain (Optional)

### For Frontend (Vercel)

1. Go to Vercel → Settings → Domains
2. Add your domain: `jfswears.com`
3. Update DNS records as shown

### For Backend (Railway)

1. Go to Railway → Settings → Domains
2. Add: `api.jfswears.com`
3. Update DNS records

---

## Environment Variables Summary

### Backend (Railway)

| Variable              | Example Value                 | Description            |
| --------------------- | ----------------------------- | ---------------------- |
| `DATABASE_URL`        | `postgresql://...`            | Neon connection string |
| `JWT_SECRET`          | `64-char-hex-string`          | Access token signing   |
| `JWT_REFRESH_SECRET`  | `64-char-hex-string`          | Refresh token signing  |
| `REDIS_HOST`          | `xyz.upstash.io`              | Upstash host           |
| `REDIS_PORT`          | `6379`                        | Redis port             |
| `REDIS_PASSWORD`      | `your-password`               | Upstash password       |
| `NEXT_PUBLIC_APP_URL` | `https://jfswears.vercel.app` | Frontend URL (CORS)    |
| `CLOUDINARY_*`        | Various                       | Image upload           |
| `OPAY_*`              | Various                       | OPay payments          |
| `MONNIFY_*`           | Various                       | Monnify payments       |
| `PAYSTACK_*`          | Various                       | Paystack payments      |

### Frontend (Vercel)

| Variable              | Example Value                 | Description          |
| --------------------- | ----------------------------- | -------------------- |
| `NEXT_PUBLIC_API_URL` | `https://api.railway.app/api` | Backend API endpoint |
| `NEXT_PUBLIC_APP_URL` | `https://jfswears.vercel.app` | Self URL             |

---

## Troubleshooting

### Backend won't start

1. Check logs in Railway dashboard
2. Verify DATABASE_URL is correct
3. Run `npx prisma db push` in Railway shell

### CORS errors

1. Verify `NEXT_PUBLIC_APP_URL` in backend matches Vercel URL
2. Include protocol: `https://` not just domain

### Database connection fails

1. Check Neon connection string includes `?sslmode=require`
2. Verify IP isn't blocked (Neon has allowlist)

### Build fails

1. Check build logs in Vercel/Railway
2. Run `npm run build` locally to test
3. Check for TypeScript errors

---

## Cost Summary

| Service     | Free Tier        | If Exceeded   |
| ----------- | ---------------- | ------------- |
| **Vercel**  | 100GB bandwidth  | $20/mo        |
| **Railway** | $5 free credit   | Pay as you go |
| **Render**  | Free Web Service | $7/mo (Pro)   |
| **Neon**    | 0.5GB storage    | $19/mo        |
| **Upstash** | 10k commands/day | $0.2/100k     |

**Realistic monthly cost for small store: $0-10**

---

## Next Steps After Deployment

1. **Set up payment providers** - Get live API keys from OPay/Monnify/Paystack
2. **Configure email** - Set up Resend or other email provider
3. **Add products** - Use admin dashboard or Swagger API
4. **Test payments** - Make test transactions
5. **Set up monitoring** - Use Vercel Analytics (free)

---

## Quick Reference

| Component        | URL                                     |
| ---------------- | --------------------------------------- |
| **Live Site**    | `https://your-app.vercel.app`           |
| **API Swagger**  | `https://your-api.railway.app/api/docs` |
| **Database GUI** | Neon dashboard or `npx prisma studio`   |
| **Logs**         | Railway/Vercel dashboards               |

---

Good luck with your deployment! 🚀
