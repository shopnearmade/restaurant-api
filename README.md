# Restaurant API

A RESTful API for managing a restaurant's menu, customers, and orders — built with **Express.js**, **MongoDB**, and **Mongoose**.

---

## Project Overview

This API provides a complete back-end for a restaurant management system. It supports creating and browsing menu items, registering customers, placing orders, and querying analytics like the most popular item ordered. All endpoints follow RESTful conventions, include input validation, and return meaningful HTTP status codes.

---

## Collections / Models

| Model | Description |
|---|---|
| **MenuItem** | A dish or drink on the restaurant's menu (name, description, price, category, ingredients, availability, calories, prep time) |
| **Customer** | A registered customer (name, email, phone, address) |
| **Order** | A customer's order linking one Customer to one or more MenuItems, with a status workflow and total amount |

### Relationships
- An **Order** references a **Customer** via `ObjectId`
- An **Order** references one or more **MenuItems** via an array of `ObjectId` references

---

## API Endpoints

### Menu Items — `/api/menuItems`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/menuItems` | Get all menu items. Supports `?name=`, `?category=`, `?available=`, `?sort=`, `?page=`, `?limit=` |
| GET | `/api/menuItems/available` | Get only currently available items |
| GET | `/api/menuItems/:id` | Get a single menu item by ID |
| POST | `/api/menuItems` | Create a new menu item |
| PUT | `/api/menuItems/:id` | Full update of a menu item |
| PATCH | `/api/menuItems/:id` | Partial update of a menu item |
| DELETE | `/api/menuItems/:id` | Delete a menu item |

### Customers — `/api/customers`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | Get all customers. Supports `?name=`, `?sort=`, `?page=`, `?limit=` |
| GET | `/api/customers/:id` | Get a single customer by ID |
| POST | `/api/customers` | Create a new customer |
| PUT | `/api/customers/:id` | Full update of a customer |
| PATCH | `/api/customers/:id` | Partial update of a customer |
| DELETE | `/api/customers/:id` | Delete a customer |

### Orders — `/api/orders`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/popular` | Get the most ordered menu item across all orders |
| GET | `/api/orders/:id` | Get a single order by ID |
| POST | `/api/orders` | Create a new order |
| PUT | `/api/orders/:id` | Full update of an order |
| DELETE | `/api/orders/:id` | Delete an order |

**Total: 19 endpoints**

---

## Sample Request Bodies

### Create a Menu Item
```json
{
  "name": "Margherita Pizza",
  "description": "Classic tomato sauce with fresh mozzarella and basil",
  "price": 12.99,
  "category": "Main Course",
  "available": true,
  "ingredients": ["tomato sauce", "mozzarella", "basil"],
  "calories": 800,
  "preparationTime": 15
}
```

Valid `category` values: `"Appetizer"`, `"Main Course"`, `"Dessert"`, `"Beverage"`, `"Side Dish"`

### Create a Customer
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-1234",
  "address": "123 Main St"
}
```

### Create an Order
```json
{
  "customer": "<customer_id>",
  "menuItem": [
    { "item": "<menuItem_id>", "quantity": 2 }
  ],
  "totalAmount": 25.98,
  "status": "Pending",
  "specialInstructions": "No onions please"
}
```

Valid `status` values: `"Pending"`, `"Preparing"`, `"Ready"`, `"Completed"`, `"Cancelled"`

---

## Setup & Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd restaurant-api

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root with your MongoDB connection string
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/restaurantDB

# 4. Start the server
node server.js
```

Server runs at `http://localhost:3000`.

---

## Technical Highlights

- **Mongoose validation**: `required` fields, `minlength`/`maxlength`, `min` value constraints, `enum` for categories and order status, and a **custom validator** on `MenuItem.price` enforcing ≤ 2 decimal places
- **Virtual properties**: `Customer.displayName` → `"name (email)"`; `MenuItem.formattedPrice` → `"$X.XX"`
- **ObjectId relationships**: Order → Customer and Order → MenuItem (with `.populate()` on the popular-item endpoint)
- **`timestamps: true`** on Customer and MenuItem for automatic `createdAt`/`updatedAt`
- **Pagination** via `?page=&limit=` on Customers and MenuItems
- **`$regex` text search** on `name` for both Customers and MenuItems
- **Filtering** by `category` and `available` on MenuItems
- **Dynamic sorting** via `?sort=<field>` on Customers and MenuItems
- **Status workflow** on Orders: `Pending → Preparing → Ready → Completed / Cancelled`
- **async/await** throughout with `try/catch` error handling and appropriate HTTP status codes

---

## Team Members & Contributions

| Name | Role | Contributions |
|---|---|---|
| Kareem Alkhaleefa | Back-end Developer | MenuItem model & routes, project setup, MongoDB config, server.js |
| Nabila Jeylani | Back-end Developer | Customer model & routes |
| Urjii Kalil | Back-end Developer | Order model & routes, popular item endpoint |

### Endpoint Contribution Table

| File | Implemented By |
|---|---|
| `models/menuItem.js` | Kareem Alkhaleefa |
| `routes/menuItems.js` (7 endpoints) | Kareem Alkhaleefa |
| `config/db.js`, `server.js` | Kareem Alkhaleefa |
| `models/customer.js` | Nabila Jeylani |
| `routes/customers.js` (6 endpoints) | Nabila Jeylani |
| `models/order.js` | Urjii Kalil |
| `routes/orders.js` (6 endpoints) | Urjii Kalil |
