import express from 'express';
import connectDB from './config/db.js';

const app = express();
const port = 3000;

await connectDB();
app.get('/',(req,res)=>
{
   console.log("Restaurant API");
   res.send("Welcome to the Restaurant API!"); 
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

