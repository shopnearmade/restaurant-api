# Restaurant Management System

A full-stack restaurant management application built with **Express.js**, **MongoDB**, and **Next.js**.

---

## Project Overview

This system provides a complete front-end and back-end for managing a restaurant's menu, customers, and orders. Staff can log in, browse and search menu items, manage customer records, and place and track orders — all through a responsive web interface that communicates with a REST API using the Fetch API and JWT authentication.

---

## Team Members & Primary Responsibilities

| Name | Role | Primary Contributions |
|---|---|---|
| Kareem Alkhaleefa | Full-Stack Developer | MenuItem model & routes, server setup, MongoDB config, client-side app, API service module, auth module |
| Nabila Jeylani | Back-End Developer | Customer model & routes |
| Urjii Kalil | Back-End Developer | Order model & routes, popular item endpoint |

---

## Implemented Functionalities

### API (Server)
- **User Authentication** — registration and login with bcrypt password hashing, JWT token issuance
- **Protected Routes** — all order endpoints require a valid JWT via `Authorization: Bearer <token>` header
- **Menu Items** — full CRUD + filtering by category, availability, and name search + pagination
- **Customers** — full CRUD + name and email search + pagination
- **Orders** — full CRUD + filtering by status + popular item analytics endpoint
- **Error handling** — input validation via Mongoose schemas, meaningful HTTP status codes, try/catch throughout

### Client (Browser)
- **Authentication flow** — register, login, logout; JWT stored in `localStorage` via auth module
- **Dashboard** — welcome view showing user info and live stats (order count, menu items, popular item)
- **Menu Items page** — search by name, filter by category and availability, create/edit/delete with modal forms
- **Customers page** — search by name and email (multi-criteria), create/edit/delete with modal forms
- **Orders page** — filter by status, create orders (select customer + items with auto-calculated total), update status, delete
- **API service module** — all Fetch API calls centralized in `client/lib/api.ts`
- **Auth module** — `localStorage` session management in `client/lib/auth.ts`

---

## Project Structure

```
restaurant-api/
├── server/                  # Express.js + MongoDB API
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protect middleware
│   ├── models/
│   │   ├── user.js          # User schema (bcrypt, role)
│   │   ├── menuItem.js      # MenuItem schema
│   │   ├── customer.js      # Customer schema
│   │   └── order.js         # Order schema (refs Customer + MenuItem)
│   ├── routes/
│   │   ├── auth.js          # POST /register, POST /login
│   │   ├── users.js         # User CRUD
│   │   ├── menuItems.js     # Menu CRUD + filter/search
│   │   ├── customers.js     # Customer CRUD + search
│   │   └── orders.js        # Order CRUD + filter + popular
│   ├── server.js            # Express app entry point
│   └── package.json
├── client/                  # Next.js 15 front-end
│   ├── lib/
│   │   ├── api.ts           # Centralized API service module
│   │   └── auth.ts          # Authentication module (localStorage)
│   ├── components/
│   │   └── Navbar.tsx       # Shared navigation bar
│   └── app/
│       ├── page.tsx         # Redirect to /dashboard or /login
│       ├── login/           # Login page
│       ├── register/        # Registration page
│       ├── dashboard/       # User dashboard + stats
│       ├── menu/            # Menu items management
│       ├── customers/       # Customer management
│       └── orders/          # Order management
├── .env.example             # Environment variable template
└── README.md
```

---

## Server Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd restaurant-api

# 2. Create your .env file from the template
cp .env.example .env
# Then fill in MONGO_URI and JWT_SECRET

# 3. Install server dependencies
cd server && npm install

# 4. Start the API server (from the project root)
node server/server.js
# Server runs at http://localhost:4000

# 5. In a separate terminal, install and start the client
cd client && npm install && npm run dev
# Client runs at http://localhost:3001 (Next.js auto-increments if 3000 is taken)
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/menuItems` | — | List items (`?name=&category=&available=&sort=&page=&limit=`) |
| POST | `/api/menuItems` | — | Create item |
| PUT | `/api/menuItems/:id` | — | Update item |
| DELETE | `/api/menuItems/:id` | — | Delete item |
| GET | `/api/customers` | — | List customers (`?name=&email=&sort=&page=&limit=`) |
| POST | `/api/customers` | — | Create customer |
| PUT | `/api/customers/:id` | — | Update customer |
| DELETE | `/api/customers/:id` | — | Delete customer |
| GET | `/api/orders` | JWT | List orders (`?status=&customer=&sort=&page=&limit=`) |
| GET | `/api/orders/popular` | JWT | Most ordered menu item |
| POST | `/api/orders` | JWT | Create order |
| PATCH | `/api/orders/:id` | JWT | Update order status/instructions |
| DELETE | `/api/orders/:id` | JWT | Delete order |
