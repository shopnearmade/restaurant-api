import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import Orders from './routes/orders.js';
import Customers from './routes/customers.js';

const app = express();
app.use(express.json());

const port = 3000;

await connectDB();

app.use('/api/orders', Orders);
app.use('/api/customers', Customers);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});