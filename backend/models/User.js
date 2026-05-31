// Import mongoose for schema/model
const mongoose = require('mongoose');

// Import bcryptjs to hash passwords
const bcrypt = require('bcryptjs');

// Create user schema
const userSchema = new mongoose.Schema(
  {
    // User full name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // User email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // User password
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // User role
    role: {
      type: String,
      enum: ['admin', 'employee', 'security', 'visitor'],
      default: 'visitor',
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Before saving the user, hash the password
userSchema.pre('save', async function (next) {
  // If password is not modified, continue
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export model
module.exports = mongoose.model('User', userSchema);