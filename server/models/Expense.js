import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Use string reference to model
        required: true,
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
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const Expense = mongoose.model("Expense", ExpenseSchema);
export default Expense;