import mongoose from "mongoose";

/**
 * Connects to MongoDB using the connection string in the MONGODB_URI
 * environment variable. If the connection fails, we log the error and
 * stop the server -- there's no point running an API that can't reach
 * its database.
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
