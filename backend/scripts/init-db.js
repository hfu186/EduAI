require("dotenv").config();

const fs = require("fs");
const path = require("path");
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

async function exportSchemas() {
  let output = "";

  for (const model of models) {
    output += "=====================================================\n";
    output += `Collection: ${model.collection.name}\n`;
    output += `Model: ${model.modelName}\n`;
    output += "=====================================================\n";

    const paths = model.schema.paths;

    for (const key in paths) {
      const field = paths[key];

      output += `${key}\n`;
      output += `  Type      : ${field.instance}\n`;
      output += `  Required  : ${field.isRequired || false}\n`;

      if (field.options.ref) {
        output += `  Ref       : ${field.options.ref}\n`;
      }

      if (field.options.default !== undefined) {
        output += `  Default   : ${field.options.default}\n`;
      }

      output += "\n";
    }

    output += "\n\n";
  }

  fs.writeFileSync(
    path.join(__dirname, "mongodb-schema.txt"),
    output,
    "utf8"
  );

  console.log("Schema exported to mongodb-schema.txt");
}

async function main() {
  try {
    await connectDB();
    await exportSchemas();
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();