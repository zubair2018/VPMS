const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const seed = async () => {
  await connectDB();
  await User.deleteMany();
  await User.create([
    { name: 'Admin User', email: 'admin@example.com', password: '123456', role: 'admin' },
    { name: 'Security Staff', email: 'security@example.com', password: '123456', role: 'security' },
    { name: 'Employee Host', email: 'employee@example.com', password: '123456', role: 'employee' },
    { name: 'Visitor User', email: 'visitor@example.com', password: '123456', role: 'visitor' }
  ]);
  console.log('Seed complete');
  process.exit();
};

seed();
