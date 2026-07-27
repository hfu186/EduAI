require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../config/database");

const models = [
  require("../models/category"),
  require("../models/certificate"),
  require("../models/chat"),
  require("../models/course"),
  require("../models/courseProgress"),
  require("../models/order"),
  require("../models/OTP"),
  require("../models/profile"),
  require("../models/quizResult"),
  require("../models/ratingAndReview"),
  require("../models/section"),
  require("../models/submission"),
  require("../models/subSection"),
  require("../models/user"),
];

async function ensureCollections() {
  const db = mongoose.connection.db;

  for (const model of models) {
    const collectionName = model.collection.name;

    try {
      const exists = await db.listCollections({ name: collectionName }).hasNext();

      if (!exists) {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } else {
        console.log(`Collection already exists: ${collectionName}`);
      }

      await model.syncIndexes();
      console.log(`Synced indexes for: ${collectionName}`);
    } catch (error) {
      console.error(`Failed for ${collectionName}:`, error.message);
    }
  }
}

async function main() {
  try {
    await connectDB();
    await ensureCollections();
    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
