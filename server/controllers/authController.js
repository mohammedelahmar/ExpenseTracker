//Auth logic (signup, login)
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs'; // Add this import

// @desc   Register new user
// @route  POST /api/users/register
const registerUser = asyncHandler(async(req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if(existingUser) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    if(user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc   Auth user & get token
// @route  POST /api/users/login
const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if(user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc   Get user profile
// @route  GET /api/users/profile
const getUserProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);
    
    if(user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { registerUser, loginUser, getUserProfile };