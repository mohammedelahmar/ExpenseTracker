import express from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .post(protect, createCategory)
    .get(protect, getCategories);

router.route('/:id')
    .get(protect, getCategoryById)
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

export default router;