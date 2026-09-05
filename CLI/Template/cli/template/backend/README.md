# Backend

A production-ready Node.js backend built with Express, MongoDB, and Mongoose.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB instance (local or Atlas)

## Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update `.env` with your configuration (MongoDB URI, JWT secret, Cloudinary credentials, etc.).

## Installing Dependencies

After generating the project, install dependencies by running:

```bash
npm install
```

## Running the Application

- Development mode (with auto-reload via nodemon):

```bash
npm run dev
```

- Production mode:

```bash
npm start
```

## Project Structure

```
src/
├── config/      # Configuration (DB, JWT, Cloudinary, Razorpay)
├── controllers/   # Route controllers
├── models/        # Mongoose models
├── routes/        # Express routes
├── middleware/    # Auth, admin, validation middleware
├── services/      # Business logic services
├── utils/         # Helpers and utilities
├── helpers/       # Order/cart helpers
app.js             # Express app setup
server.js          # Entry point
```
