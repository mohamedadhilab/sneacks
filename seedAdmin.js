const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/adminModel');

mongoose.connect('mongodb://127.0.0.1:27017/sneacks');

async function createAdmin() {
  try {
    // ✅ Check if admin already exists
    const existing = await Admin.findOne({ email: 'admin@sneacks.com' });

    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // ✅ Create admin
        await Admin.create({
        full_name: 'Super Admin',   // ✅ REQUIRED FIELD
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