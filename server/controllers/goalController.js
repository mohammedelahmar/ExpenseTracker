import asyncHandler from "express-async-handler";
import Goal from "../models/Goal.js";

// @desc   Create new financial goal
// @route  POST /api/goals
// @access Private
export const createGoal = asyncHandler(async(req, res) => {
  const { name, targetAmount, targetDate, category, description, icon } = req.body;
  const user = req.user._id;
  
  const goal = await Goal.create({
    user,
    name,
    targetAmount,
    targetDate,
    category,
    description,
    icon,
    currentAmount: req.body.currentAmount || 0
  });
  
  if(goal) {
    res.status(201).json(goal);
  } else {
    res.status(400);
    throw new Error("Invalid goal data");
  }
});

// @desc   Get all goals for logged in user
// @route  GET /api/goals
// @access Private
export const getGoals = asyncHandler(async(req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ targetDate: 1 });
  res.json(goals);
});

// @desc   Get a specific goal
// @route  GET /api/goals/:id
// @access Private
export const getGoalById = asyncHandler(async(req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if(!goal) {
    res.status(404);
    throw new Error("Goal not found");
  }
  
  // Check if goal belongs to logged in user
  if(goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to access this goal");
  }
  
  res.json(goal);
});

// @desc   Update goal
// @route  PUT /api/goals/:id
// @access Private
export const updateGoal = asyncHandler(async(req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if(!goal) {
    res.status(404);
    throw new Error("Goal not found");
  }
  
  // Check if goal belongs to logged in user
  if(goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this goal");
  }
  
  // Update fields
  const { name, targetAmount, currentAmount, targetDate, category, description, icon, isCompleted } = req.body;
  
  goal.name = name ?? goal.name;
  goal.targetAmount = targetAmount ?? goal.targetAmount;
  goal.targetDate = targetDate ?? goal.targetDate;
  goal.category = category ?? goal.category;
  goal.description = description ?? goal.description;
  goal.icon = icon ?? goal.icon;
  
  // Only update these if they are explicitly provided
  if (currentAmount !== undefined) goal.currentAmount = currentAmount;
  if (isCompleted !== undefined) goal.isCompleted = isCompleted;
  
  // Check if goal is completed based on amount
  if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
    goal.isCompleted = true;
  }
  
  const updatedGoal = await goal.save();
  res.json(updatedGoal);
});

// @desc   Delete goal
// @route  DELETE /api/goals/:id
// @access Private
export const deleteGoal = asyncHandler(async(req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if(!goal) {
    res.status(404);
    throw new Error("Goal not found");
  }
  
  // Check if goal belongs to logged in user
  if(goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this goal");
  }
  
  await goal.deleteOne();
  res.json({ message: "Goal removed" });
});

// @desc   Add contribution to goal
// @route  POST /api/goals/:id/contribute
// @access Private
export const contributeToGoal = asyncHandler(async(req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if(!goal) {
    res.status(404);
    throw new Error("Goal not found");
  }
  
  // Check if goal belongs to logged in user
  if(goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to contribute to this goal");
  }
  
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Please provide a valid contribution amount");
  }
  
  goal.currentAmount += parseFloat(amount);
  
  // Check if goal is now complete
  if (goal.currentAmount >= goal.targetAmount) {
    goal.isCompleted = true;
  }
  
  const updatedGoal = await goal.save();
  res.json(updatedGoal);
});