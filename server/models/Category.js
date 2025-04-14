import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#000000' // Hex color code
    },
    icon: {
        type: String,
        default: 'default-icon'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for unique category names per user
CategorySchema.index({ user: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', CategorySchema);
export default Category;