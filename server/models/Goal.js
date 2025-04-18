import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    required: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: "piggy-bank" // Default icon
  }
}, {
  timestamps: true
});

// Add a virtual field for progress percentage
GoalSchema.virtual('progressPercentage').get(function() {
  return this.targetAmount > 0 
    ? Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100) 
    : 0;
});

// Ensure virtuals are included in JSON output
GoalSchema.set('toJSON', {
  virtuals: true
});

const Goal = mongoose.model("Goal", GoalSchema);
export default Goal;