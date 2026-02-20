require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Clear existing users (optional)
    await User.deleteMany();

    const users = await User.create([
      {
        name: 'Recruiter User',
        email: 'recruiter@example.com',
        password: 'password123',
        role: 'recruiter',
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'HR Manager',
        email: 'hr@example.com',
        password: 'password123',
        role: 'hr_manager',
      },
    ]);

    console.log('Users created successfully');
    console.log(users);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedUsers();
