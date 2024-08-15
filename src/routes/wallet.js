const express = require('express');
const { getWallets, getWalletById, updateWalletBalance } = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', protect, getWallets);
router.get('/:id', protect, getWalletById);
router.put('/', protect, updateWalletBalance);

module.exports = router;
