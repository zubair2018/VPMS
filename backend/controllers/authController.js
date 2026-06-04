const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This function creates a JWT token
const makeToken = (userId, userRole) => {
  return jwt.sign(
    {
      id: userId,     // store user id in token
      role: userRole, // store user role in token
    },
    process.env.JWT_SECRET, // secret key from .env file
    {
      expiresIn: '7d', // token will expire in 7 days
    }
  );
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    // Get data from request body
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    // Check if any field is missing
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Please fill all fields',
      });
    }

    // Check if user already exists in database
    const userExists = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // Create new user in database
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role.toLowerCase().trim(),
    });

    // Create token for the new user
    const token = makeToken(newUser._id, newUser.role);

    // Send success response
    return res.status(201).json({
      message: 'User registered',
      token: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log('Register error:', error.message);

    return res.status(500).json({
      message: 'Server error during registration',
    });
  }
};

// Login existing user
const loginUser = async (req, res) => {
  try {
    // Get email and password from request body
    const email = req.body.email;
    const password = req.body.password;

    // Check if email and password were sent
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter email and password',
      });
    }

    // Find user in database by email
    const foundUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // If user does not exist
    if (!foundUser) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Compare entered password with stored password
    const passwordMatched = await foundUser.matchPassword(password);

    // If password is wrong
    if (!passwordMatched) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Create token for logged-in user
    const token = makeToken(foundUser._id, foundUser.role);

    // Send success response
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      },
    });
  } catch (error) {
    console.log('Login error:', error.message);

    return res.status(500).json({
      message: 'Server error during login',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};