import { check, validationResult } from 'express-validator';

// Validate request results
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for expense creation/update
export const expenseValidator = [
  check('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  check('category')
    .isIn(['Food', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Health', 'Education', 'Other'])
    .withMessage('Invalid category'),
  check('description')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Description must be between 3 and 200 characters'),
  check('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  validateRequest
];

// Validation for user registration
export const registerValidator = [
  check('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  check('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];

// Validation for user login
export const loginValidator = [
  check('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];