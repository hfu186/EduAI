// scripts/seedOrders.js — chạy 1 lần để test
const mongoose = require("mongoose");
const Order = require("./models/order");

const seed = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/edu_db");
  
  const courseIds = [
    new mongoose.Types.ObjectId(),
  ];

  const orders = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i); 
    return {
      orderCode: Date.now() + i,
      userId: new mongoose.Types.ObjectId(),
      coursesId: courseIds,
      status: "PAID",
      amount: Math.floor(Math.random() * 500000) + 100000, 
      createdAt: d,
    };
  });

  await Order.insertMany(orders);
  console.log("Seeded 30 orders!");
  process.exit(0);
};

seed();