import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve .env from the project root regardless of where the process is started
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import Auth from './routes/auth.js';
import Users from './routes/users.js';
import Orders from './routes/orders.js';
import Customers from './routes/customers.js';
import MenuItems from './routes/menuItems.js';

const app = express();

// Allow requests from the Next.js dev server
// Allow requests from the Next.js dev server (tries 3000, falls back to 3001 if taken)
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] }));
app.use(express.json());

const port = process.env.PORT || 4000;

await connectDB();

app.use('/api/auth', Auth);
app.use('/api/users', Users);
app.use('/api/orders', Orders);
app.use('/api/customers', Customers);
app.use('/api/menuItems', MenuItems);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
