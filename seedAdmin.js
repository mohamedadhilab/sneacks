const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/adminModel');

mongoose.connect('mongodb://127.0.0.1:27017/sneacks');

async function createAdmin() {
  try {
    const existing = await Admin.findOne({ email: 'admin@sneacks.com' });

    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

        await Admin.create({
        full_name: 'Super Admin',   
        email: 'admin@sneacks.com',
        password: hashedPassword
        });

    console.log('Admin created successfully');
    process.exit();

  } catch (error) {
    console.log(error);
    process.exit();
  }
}

createAdmin();