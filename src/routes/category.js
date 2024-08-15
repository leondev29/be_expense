const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { addCategory, getCategories } = require('../controllers/categoryController');
const router = express.Router();

router.post('/', protect, addCategory);
router.get('/', protect, getCategories);

module.exports = router;
