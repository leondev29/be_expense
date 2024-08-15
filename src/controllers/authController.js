const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables at the top

// List of default categories in Vietnamese
const defaultCategories = [
    { name: 'Ăn uống' },
    { name: 'Mua sắm' },
    { name: 'Giải trí' },
    { name: 'Đi lại' },
    { name: 'Học tập' },
    { name: 'Sức khỏe' },
    { name: 'Nhà cửa' },
    { name: 'Tiết kiệm' },
    { name: 'Từ thiện' },
    { name: 'Khác' }
];

exports.register = async (req, res) => {
    const { username, password, email, full_name, initial_balance } = req.body;
    try {
        const user = new User({ username, password, email, full_name });
        await user.save();

        // Create a new wallet for the user
        const wallet = new Wallet({
            user_id: user._id,
            balance: initial_balance || 0
        });
        await wallet.save();

        // Create default categories for the user
        const categories = defaultCategories.map(category => ({
            ...category,
            user_id: user._id
        }));
        await Category.insertMany(categories);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ error: errors.join(', ') });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Use process.env.JWT_SECRET
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    const { full_name, email, password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.full_name = full_name || user.full_name;
            user.email = email || user.email;
            if (password) {
                user.password = password;
            }
            await user.save();
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ error: errors.join(', ') });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};
