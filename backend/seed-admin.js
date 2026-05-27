const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('./models/Admin');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@kvs.com';
    const password = 'adminpassword'; // User should change this later

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    await Admin.create({
      email,
      password,
    });

    console.log('Admin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
