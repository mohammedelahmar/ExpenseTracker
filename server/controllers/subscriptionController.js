import asyncHandler from "express-async-handler";
import Subscription from "../models/Subscription.js";
import Expense from "../models/Expense.js";

// @desc   Create new subscription
// @route  POST /api/subscriptions
// @access Private
const createSubscription = asyncHandler(async(req, res) => {
    const user = req.user._id;
    const { name, amount, frequency, category, description, startDate, autoPay, reminderDays } = req.body;
    
    // Calculate first billing date
    const firstBillingDate = new Date(startDate);
    
    const subscription = await Subscription.create({
        user,
        name,
        amount,
        frequency,
        category,
        description,
        startDate,
        nextBillingDate: firstBillingDate,
        autoPay,
        reminderDays: reminderDays || 3
    });
    
    if(subscription) {
        res.status(201).json(subscription);
    } else {
        res.status(400);
        throw new Error("Invalid subscription data");
    }
});

// @desc   Get all subscriptions for logged in user
// @route  GET /api/subscriptions
// @access Private
const getAllSubscriptions = asyncHandler(async(req, res) => {
    const subscriptions = await Subscription.find({ user: req.user._id });
    res.json(subscriptions);
});

// @desc   Get subscription by ID
// @route  GET /api/subscriptions/:id
// @access Private
const getSubscriptionById = asyncHandler(async(req, res) => {
    const subscription = await Subscription.findById(req.params.id);
    
    if(!subscription) {
        res.status(404);
        throw new Error("Subscription not found");
    }
    
    // Check if subscription belongs to logged in user
    if(subscription.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to access this subscription");
    }
    
    res.json(subscription);
});

// @desc   Update subscription
// @route  PUT /api/subscriptions/:id
// @access Private
const updateSubscription = asyncHandler(async(req, res) => {
    const subscription = await Subscription.findById(req.params.id);
    
    if(!subscription) {
        res.status(404);
        throw new Error("Subscription not found");
    }
    
    // Check if subscription belongs to logged in user
    if(subscription.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to update this subscription");
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
        subscription[key] = req.body[key];
    });
    
    const updatedSubscription = await subscription.save();
    res.json(updatedSubscription);
});

// @desc   Delete subscription
// @route  DELETE /api/subscriptions/:id
// @access Private
const deleteSubscription = asyncHandler(async(req, res) => {
    const subscription = await Subscription.findById(req.params.id);
    
    if(!subscription) {
        res.status(404);
        throw new Error("Subscription not found");
    }
    
    // Check if subscription belongs to logged in user
    if(subscription.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to delete this subscription");
    }
    
    await Subscription.deleteOne({ _id: req.params.id });
    res.json({ message: "Subscription removed" });
});

// @desc   Record payment for a subscription
// @route  POST /api/subscriptions/:id/payment
// @access Private
const recordPayment = asyncHandler(async(req, res) => {
    const subscription = await Subscription.findById(req.params.id);
    
    if(!subscription) {
        res.status(404);
        throw new Error("Subscription not found");
    }
    
    // Check if subscription belongs to logged in user
    if(subscription.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized for this subscription");
    }
    
    // Create corresponding expense record
    const expense = await Expense.create({
        user: req.user._id,
        date: new Date(),
        amount: subscription.amount,
        category: subscription.category,
        description: `${subscription.name} - ${subscription.description} (Subscription payment)`,
    });
    
    // Update next billing date
    subscription.updateNextBillingDate();
    await subscription.save();
    
    res.json({ 
        message: "Payment recorded successfully",
        expense,
        nextBillingDate: subscription.nextBillingDate
    });
});

// @desc   Get upcoming subscription payments
// @route  GET /api/subscriptions/upcoming
// @access Private
const getUpcomingPayments = asyncHandler(async(req, res) => {
    const { days = 30 } = req.query;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));
    
    const subscriptions = await Subscription.find({ 
        user: req.user._id,
        status: 'active',
        nextBillingDate: { $lte: endDate }
    }).sort('nextBillingDate');
    
    res.json(subscriptions);
});

export { 
    createSubscription, 
    getAllSubscriptions, 
    getSubscriptionById, 
    updateSubscription, 
    deleteSubscription,
    recordPayment,
    getUpcomingPayments
};