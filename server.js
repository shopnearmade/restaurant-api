import express from 'express';
import connectDB from './config/db.js';
import Orders from './routes/orders.js'

const app = express();
const port = 3000;

await connectDB();

app.use('/api/orders',Orders);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

