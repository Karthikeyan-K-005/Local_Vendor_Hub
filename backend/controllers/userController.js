import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Store from '../models/storeModel.js';
import { generateToken } from '../middleware/authMiddleware.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body; 

    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please add all required fields (Name, Email, Password, Role)');
    }

    if (role === 'vendor') {
        // Robust validation for Indian phone numbers (10 digits, starting 6-9)
        const phoneRegex = /^[6-9]\d{9}$/; 
        if (!phone || !phoneRegex.test(phone)) {
            res.status(400);
            throw new Error('Phone number is required and must be a valid 10-digit Indian number for vendors.');
        }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        phone: role === 'vendor' ? phone : undefined, // Only set phone if role is vendor
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            favorites: user.favorites,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data provided');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // --- Admin Login Logic ---
    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

        if (!adminUser) {
            adminUser = await User.create({
                name: 'Admin',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD, // Hashed by 'pre' hook
                role: 'admin',
            });
        } else {
            const isMatch = await adminUser.matchPassword(password);
            if (!isMatch) {
                res.status(401);
                throw new Error('Invalid credentials for admin');
            }
        }

        res.json({
            _id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            favorites: adminUser.favorites,
            token: generateToken(adminUser._id, adminUser.role),
        });
        return; // Stop execution here
    }
    // --- End Admin Login Logic ---

    // Check for regular user
    const user = await User.findOne({ email }).select('+phone'); 

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone, 
            favorites: user.favorites,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is set by the 'protect' middleware
    const user = await User.findById(req.user.id)
        .select('-password')
        .populate('favorites');
    res.status(200).json(user);
});

// @desc    Toggle a store as favorite
// @route   PUT /api/users/profile/favorite/:id
// @access  Private (Customer)
const toggleFavoriteStore = asyncHandler(async (req, res) => {
    const storeId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const storeExists = await Store.findById(storeId);
    if (!storeExists) {
        res.status(404);
        throw new Error('Store not found');
    }

    // Check if store is already a favorite
    const isFavorite = user.favorites.includes(storeId);

    if (isFavorite) {
        // Remove from favorites
        await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: storeId } });
        res.status(200).json({ message: 'Store removed from favorites' });
    } else {
        // Add to favorites
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { favorites: storeId },
        });
        res.status(200).json({ message: 'Store added to favorites' });
    }
});

export { registerUser, loginUser, getUserProfile, toggleFavoriteStore };