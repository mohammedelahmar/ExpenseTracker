import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Use string reference to model
        required: true,
    },
    bankAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankAccount',
        required: false,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    amount: {
        type: Number, // Use Number instead of float
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    receipt: {
        type: String, // Optional field for receipt image URLs
        required: false
    },
    // Bank import metadata
    transactionId: {
        type: String,
        required: false,
    },
    importMethod: {
        type: String,
        enum: ['plaid', 'saltedge', null],
        required: false,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Helpful index to avoid duplicate imported transactions per user
ExpenseSchema.index({ user: 1, transactionId: 1 }, { unique: true, sparse: true });

const Expense = mongoose.model("Expense", ExpenseSchema);
export default Expense;