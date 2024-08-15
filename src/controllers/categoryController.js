const Category = require('../models/Category');

exports.addCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const category = new Category({
            name,
            user_id: req.user.id
        });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user_id: req.user.id });
        res.json(categories);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
