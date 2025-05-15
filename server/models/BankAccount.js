import mongoose from "mongoose";

const BankAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Salt Edge specific fields
  saltEdgeConnectionId: {
    type: String,
    required: true
  },
  saltEdgeAccountId: {
    type: String,
    required: true
  },
  // Institution/provider information
  bankName: {
    type: String,
    required: true
  },
  // Account information
  accountName: {
    type: String, 
    required: true
  },
  accountType: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    default: 'xxxx'
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  // Status fields
  lastSync: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional Salt Edge metadata (optional)
  extra: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Ensure each user can only have one connection to each Salt Edge account
BankAccountSchema.index({ user: 1, saltEdgeAccountId: 1 }, { unique: true });

const BankAccount = mongoose.model("BankAccount", BankAccountSchema);
export default BankAccount;