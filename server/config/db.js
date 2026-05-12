console.log("DB FILE MONGO_URI:", process.env.MONGO_URI);
import mongoose from "mongoose";

async function connectDB() {
  const mongoDB = process.env.MONGO_URI

  console.log("MONGO URI:", mongoDB); 

  try {
    await mongoose.connect(mongoDB);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

export default connectDB;