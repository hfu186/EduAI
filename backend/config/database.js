const mongoose = require("mongoose");

exports.connectDB = async () => {
  try {
    const uri = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/eduspace";

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed");
    console.error(error.message);
    process.exit(1);
  }
};
