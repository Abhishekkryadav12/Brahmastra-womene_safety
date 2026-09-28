import mongoose from "mongoose";

let connectionPromise;

export default async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then(({ connection }) => {
      console.info(`MongoDB connected (${connection.name})`);
      return connection;
    })
    .catch((error) => {
      connectionPromise = undefined;
      console.error("MongoDB connection failed:", error.message);
      throw error;
    });

  return connectionPromise;
}

mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
mongoose.connection.on("error", (error) => console.error("MongoDB error:", error.message));
