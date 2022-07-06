import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = MongoClient.db(process.env.MONGO_DATABASE);
});

export { db }