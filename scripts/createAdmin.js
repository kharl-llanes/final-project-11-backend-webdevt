import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

dotenv.config();

const rl = readline.createInterface({ input, output });

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const firstName = (await rl.question("Admin first name: ")).trim();
    const lastName = (await rl.question("Admin last name: ")).trim();
    const email = (
      await rl.question("Admin email: ")
    ).trim().toLowerCase();
    const password = await rl.question(
      "Admin password (minimum 8 characters): "
    );

    if (!firstName || !lastName || !email || password.length < 8) {
      throw new Error(
        "Please provide all fields and a password of at least 8 characters."
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "An account with this email already exists. Choose another email."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin account created successfully: ${admin.email}`);
  } catch (error) {
    console.error("Could not create admin:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

createAdmin();