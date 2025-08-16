/*
 Seed/reset database for CI/E2E runs.
 - Creates a test user if not present
 - Ensures at least a couple of categories for that user
 Usage (env):
   NODE_ENV=production CONNECTION_URL=mongodb://localhost:27017/expense_e2e node scripts/seed.js
*/
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    // Create or get test user
    const email = process.env.SEED_USER_EMAIL || 'e2e_user@test.com';
    const username = process.env.SEED_USER_NAME || 'e2e_user';
    const password = process.env.SEED_USER_PASS || 'Password123!';

    let user = await User.findOne({ email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      user = await User.create({ username, email, password: hashed });
      // eslint-disable-next-line no-console
      console.log('Created seed user', email);
    } else {
      // eslint-disable-next-line no-console
      console.log('Seed user exists', email);
    }

    // Ensure categories
    const defaults = [
      { name: 'Food', color: '#FF7043', icon: 'utensils' },
      { name: 'Transport', color: '#42A5F5', icon: 'car' },
      { name: 'Other', color: '#9E9E9E', icon: 'tag' },
    ];

    for (const c of defaults) {
      const exists = await Category.findOne({ user: user._id, name: c.name });
      if (!exists) {
        await Category.create({ ...c, user: user._id, isDefault: true });
      }
    }

    // Done
    await mongoose.connection.close();
    // eslint-disable-next-line no-console
    console.log('Seed completed');
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seed failed', err);
    process.exit(1);
  }
};

run();
