import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 20000,
  maxPoolSize: 1, // Recommended for serverless
};

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  // In development, reuse client across HMR reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  // In production, create a new client per module instance (serverless-safe)
  client = new MongoClient(uri, options);
}

// Lazy connection: the driver auto-connects on first operation.
// No module-level connect() call = no background timeout crash on cold start.
export async function getDb(): Promise<Db> {
  return client.db(process.env.MONGODB_DB || "nifty-pulse");
}
