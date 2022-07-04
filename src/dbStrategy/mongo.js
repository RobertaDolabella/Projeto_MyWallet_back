import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoClient = new MongoClient(process.env.URL_CONNECT_MONGO);
let db;
mongoClient.connect(() => {
  db = mongoClient.db(process.env.MONGO_DATABASE);
});

export { db }