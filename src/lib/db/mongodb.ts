import { MongoClient, Db } from "mongodb";

const uri: string | undefined = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  interface Global {
    _mongoClientPromise?: Promise<MongoClient>;
  }
}

const globalWithMongo = global as unknown as Global;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

if (process.env.NODE_ENV === "development") {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function connectDB(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB);
}

export { client };
