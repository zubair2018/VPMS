// Import mongoose to create schema and model
const mongoose = require('mongoose');

// Import bcryptjs to hash and compare passwords
const bcrypt = require('bcryptjs');

// Create schema for User collection
const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: true,   // name is compulsory
      trim: true,       // removes extra spaces
    },

    // Email of the user
    email: {
      type: String,
      required: true,   // email is compulsory
      unique: true,     // no two users can have same email
      lowercase: true,  // convert email to lowercase automatically
      trim: true,       // remove extra spaces
    },

    // Password of the user
    password: {
      type: String,
      required: true,   // password is compulsory
      minlength: 6,     // minimum 6 characters
    },

    // Role of the user
    role: {
      type: String,
      enum: ['admin', 'employee', 'security', 'visitor'], // allowed roles only
      default: 'visitor',  // if no role is given, visitor will be used
      lowercase: true,
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

// This runs before saving user data in MongoDB
userSchema.pre('save', async function (next) {
  // If password was not changed, do not hash again
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password before saving
  this.password = await bcrypt.hash(this.password, 10);

  next();
});

// Custom method to check entered password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', userSchema);