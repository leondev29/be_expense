const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, required: [true, 'Balance is required'] }
}, {
    timestamps: true
});

module.exports = mongoose.model('Wallet', walletSchema);
