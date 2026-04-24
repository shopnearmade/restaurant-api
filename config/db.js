import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const mongoDB = process.env.mongoDB;
 
async function connectDB() {
  try {
    await mongoose.connect(mongoDB);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

export default connectDB;