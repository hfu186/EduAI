import bcrypt from "bcryptjs";
const password = await bcrypt.hash("Admin@123", 10);
console.log(password);