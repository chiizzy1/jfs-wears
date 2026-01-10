# JFS Wears - E-Commerce Platform

A modern e-commerce platform for fashion retail built with Next.js 15, NestJS, and Tailwind v4.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS v4
- **Backend**: NestJS 10, Prisma ORM
- **Database**: PostgreSQL (Render)
- **Payments**: OPay, Monnify, Paystack
- **Images**: Cloudinary
- **Hosting**: Vercel (Frontend) + Render (Backend)

## Getting Started

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Start frontend only
npm run dev:web

# Start backend only
npm run dev:api
```

## Project Structure

```
jfs-wears/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared/       # Shared types and utilities
└── turbo.json        # Turborepo config
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.
