const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Visitor = require('./models/Visitor');
const Appointment = require('./models/Appointment');
const Pass = require('./models/Pass');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Visitor.deleteMany();
    await Appointment.deleteMany();
    await Pass.deleteMany();

    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin',
      },
      {
        name: 'Security Staff',
        email: 'security@example.com',
        password: '123456',
        role: 'security',
      },
      {
        name: 'Employee Host',
        email: 'employee@example.com',
        password: '123456',
        role: 'employee',
      },
      {
        name: 'Visitor User',
        email: 'visitor@example.com',
        password: '123456',
        role: 'visitor',
      },
    ]);

    const visitors = await Visitor.create([
      {
        fullName: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        company: 'TCS',
        purpose: 'Business Meeting',
        idProofType: 'Aadhar',
        idProofNumber: 'AD123456',
      },
      {
        fullName: 'Priya Verma',
        email: 'priya@example.com',
        phone: '9123456780',
        company: 'Infosys',
        purpose: 'Interview',
        idProofType: 'PAN',
        idProofNumber: 'PAN98765',
      },
      {
        fullName: 'Aman Gupta',
        email: 'aman@example.com',
        phone: '9988776655',
        company: 'Wipro',
        purpose: 'Project Discussion',
        idProofType: 'Driving License',
        idProofNumber: 'DL456789',
      },
    ]);

    const appointments = await Appointment.create([
      {
        visitor: visitors[0]._id,
        host: users[2]._id,
        visitDate: new Date(),
        status: 'approved',
        notes: 'Client meeting at front office',
      },
      {
        visitor: visitors[1]._id,
        host: users[2]._id,
        visitDate: new Date(Date.now() + 86400000),
        status: 'pending',
        notes: 'Interview round scheduled',
      },
      {
        visitor: visitors[2]._id,
        host: users[2]._id,
        visitDate: new Date(Date.now() + 2 * 86400000),
        status: 'approved',
        notes: 'Project discussion with employee host',
      },
    ]);

    await Pass.create([
      {
        visitor: visitors[0]._id,
        appointment: appointments[0]._id,
        issuedBy: users[0]._id,
        passNumber: 'PASS001',
        qrCodeDataUrl: 'sample-qr-code-1',
        validFrom: new Date(),
        validTill: new Date(Date.now() + 86400000),
        status: 'issued',
        pdfPath: 'uploads/passes/pass001.pdf',
      },
      {
        visitor: visitors[2]._id,
        appointment: appointments[2]._id,
        issuedBy: users[0]._id,
        passNumber: 'PASS002',
        qrCodeDataUrl: 'sample-qr-code-2',
        validFrom: new Date(),
        validTill: new Date(Date.now() + 86400000),
        status: 'issued',
        pdfPath: 'uploads/passes/pass002.pdf',
      },
    ]);

    console.log('Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();