const Expense = require("../models/Expense");
const Wallet = require("../models/Wallet");

exports.addExpense = async (req, res) => {
  const { amount, category_id, date, note } = req.body;
  try {
    // Find the user's wallet
    const wallet = await Wallet.findOne({ user_id: req.user._id });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // Ensure the wallet has sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance in wallet" });
    }

    // Create a new expense
    const expense = new Expense({
      user_id: req.user._id,
      wallet_id: wallet._id,
      category_id,
      amount,
      date,
      note,
    });
    await expense.save();

    // Deduct the amount from the wallet balance
    wallet.balance -= amount;
    await wallet.save();

    res.status(201).json(expense);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ error: errors.join(", ") });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user_id: req.user._id })
      .populate({
        path: 'category_id',
        select: 'name'  // Populate only the name field of the category
      })
      .populate('wallet_id');
    res.json(expenses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate({
        path: 'category_id',
        select: 'name'  // Populate only the name field of the category
      })
      .populate('wallet_id');
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    // Ensure the expense belongs to the authenticated user
    if (expense.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateExpense = async (req, res) => {
  const { amount, category_id, date, note } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Ensure the expense belongs to the authenticated user
    if (expense.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Find the user's wallet
    const wallet = await Wallet.findOne({ user_id: req.user._id });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // Refund the old amount to the wallet
    wallet.balance += expense.amount;

    // Ensure the wallet has sufficient balance for the new amount
    if (wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance in wallet" });
    }

    // Update the expense
    expense.amount = amount;
    expense.category_id = category_id;
    expense.date = date;
    expense.note = note;

    await expense.save();

    // Deduct the new amount from the wallet
    wallet.balance -= amount;
    await wallet.save();

    res.json(expense);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ error: errors.join(", ") });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Ensure the expense belongs to the authenticated user
    if (expense.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Find the user's wallet
    const wallet = await Wallet.findOne({ user_id: req.user._id });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // Refund the amount to the wallet
    wallet.balance += expense.amount;
    await wallet.save();

    // Delete the expense
    await Expense.deleteOne({ _id: req.params.id });

    res.json({ message: "Expense removed" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
