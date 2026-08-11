# How to Run eVault System (Backend Only)

This guide explains how to start the eVault Backend API.

> **Important**: Ensure you open the terminal from inside the `evault-backend` folder!

---

## Start the Backend API

Run the following commands one by one:

```bash
# 1. Kill any stuck processes holding port 3000 to prevent EADDRINUSE errors
npx kill-port 3000

# 2. Install dependencies (if you haven't already)
npm install

# 3. Setup the database and run migrations
npm run db:migrate

# 4. Seed the database with test users and documents
npm run db:seed

# 5. Start the backend server
npm run dev
```

**Expected Output:**
You should see: `[INFO] eVault API server running {"port":3000,"env":"development"...}`
Leave this terminal open and running.

---

## 🚀 How to Test the App

Now that the backend is running without errors, you can test the API using Postman or cURL.

1. Because we ran the `db:seed` command earlier, the database has been populated with test accounts! 
2. You can log in via `POST http://localhost:3000/api/v1/auth/login` using:
   - **Email**: `admin@evault.in`
   - **Password**: `Password123`
3. Use the returned access token as a Bearer token to test other endpoints.
