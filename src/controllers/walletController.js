const Wallet = require('../models/Wallet');

exports.getWallets = async (req, res) => {
    try {
        const wallets = await Wallet.find({ user_id: req.user._id });
        res.json(wallets);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getWalletById = async (req, res) => {
    try {
        const wallet = await Wallet.findById(req.params.id);
        res.json(wallet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateWalletBalance = async (req, res) => {
    const { balance } = req.body;
    try {
        const wallet = await Wallet.findOne({ user_id: req.user._id });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        wallet.balance = balance; // Update the wallet balance
        await wallet.save();

        res.json(wallet);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ error: errors.join(', ') });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};
