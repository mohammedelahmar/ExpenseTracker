import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
        default: 'monthly'
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    nextBillingDate: {
        type: Date,
        required: true,
    },
    autoPay: {
        type: Boolean,
        default: false
    },
    reminderDays: {
        type: Number,
        default: 3 // Remind 3 days before
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'cancelled'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Method to calculate next billing date after payment
SubscriptionSchema.methods.updateNextBillingDate = function() {
    const currentDate = this.nextBillingDate;
    const newDate = new Date(currentDate);
    
    switch(this.frequency) {
        case 'weekly':
            newDate.setDate(newDate.getDate() + 7);
            break;
        case 'monthly':
            newDate.setMonth(newDate.getMonth() + 1);
            break;
        case 'quarterly':
            newDate.setMonth(newDate.getMonth() + 3);
            break;
        case 'yearly':
            newDate.setFullYear(newDate.getFullYear() + 1);
            break;
    }
    
    this.nextBillingDate = newDate;
    return this;
};

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;