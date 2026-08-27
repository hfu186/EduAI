import bcrypt from "bcryptjs";
const password = await bcrypt.hash("Instructor@123", 10);
console.log(password);