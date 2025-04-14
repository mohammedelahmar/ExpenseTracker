import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

// @desc   Create a new category
// @route  POST /api/categories
// @access Private
const createCategory = asyncHandler(async (req, res) => {
    const { name, color, icon } = req.body;
    
    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
        user: req.user._id,
        name: name
    });
    
    if (existingCategory) {
        res.status(400);
        throw new Error('Category already exists');
    }
    
    const category = await Category.create({
        user: req.user._id,
        name,
        color,
        icon
    });
    
    res.status(201).json(category);
});

// @desc   Get all categories for logged in user
// @route  GET /api/categories
// @access Private
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ user: req.user._id });
    res.json(categories);
});

// @desc   Update a category
// @route  PUT /api/categories/:id
// @access Private
const updateCategory = asyncHandler(async (req, res) => {
    const { name, color, icon } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    
    // Check if category belongs to logged in user
    if (category.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this category');
    }
    
    // Don't allow updating default categories
    if (category.isDefault) {
        res.status(400);
        throw new Error('Cannot modify default categories');
    }
    
    category.name = name || category.name;
    category.color = color || category.color;
    category.icon = icon || category.icon;
    
    const updatedCategory = await category.save();
    res.json(updatedCategory);
});

// @desc   Delete a category
// @route  DELETE /api/categories/:id
// @access Private
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    
    // Check if category belongs to logged in user
    if (category.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this category');
    }
    
    // Don't allow deleting default categories
    if (category.isDefault) {
        res.status(400);
        throw new Error('Cannot delete default categories');
    }
    
    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: 'Category removed' });
});

export { createCategory, getCategories, updateCategory, deleteCategory };