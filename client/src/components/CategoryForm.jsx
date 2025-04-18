import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/CategoryForm.css';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    icon: 'fa fa-tag'
  });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Predefined color options
  const colorOptions = [
    '#1a237e', '#0d47a1', '#01579b', '#006064', 
    '#004d40', '#1b5e20', '#33691e', '#bf360c',
    '#e65100', '#ff6f00', '#ff8f00', '#f57f17',
    '#880e4f', '#4a148c', '#311b92', '#0d47a1'
  ];

  // Common FontAwesome icons
  const iconOptions = [
    'fa fa-home', 'fa fa-car', 'fa fa-utensils', 'fa fa-shopping-cart',
    'fa fa-medkit', 'fa fa-plane', 'fa fa-graduation-cap', 'fa fa-gamepad',
    'fa fa-tshirt', 'fa fa-credit-card', 'fa fa-gift', 'fa fa-bus',
    'fa fa-coffee', 'fa fa-taxi', 'fa fa-dumbbell', 'fa fa-book'
  ];

  useEffect(() => {
    // If ID exists, we're in edit mode
    if (id) {
      setIsEdit(true);
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        name: data.name,
        color: data.color,
        icon: data.icon
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch category');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorSelect = (color) => {
    setFormData({ ...formData, color });
  };

  const handleIconSelect = (icon) => {
    setFormData({ ...formData, icon });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isEdit) {
        // Update existing category
        await axios.put(`/api/categories/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await axios.post('/api/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }
      navigate('/categories');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <h2>{isEdit ? 'Edit Category' : 'Add New Category'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter category name"
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Color</label>
          <input
            type="color"
            className="form-control form-control-color"
            name="color"
            value={formData.color}
            onChange={handleChange}
          />
          <div className="gap-2">
            {colorOptions.map((color) => (
              <div
                key={color}
                className={`color-circle ${formData.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color, border: '2px solid transparent' }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Icon</label>
          <input
            type="text"
            className="form-control"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="FontAwesome class (e.g., fa fa-tag)"
          />
          <div className="gap-3">
            {iconOptions.map((icon) => (
              <div
                key={icon}
                className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                onClick={() => handleIconSelect(icon)}
              >
                <i className={icon}></i>
              </div>
            ))}
          </div>
        </div>

        {/* Category Preview */}
        <div 
          className="category-preview" 
          style={{ borderLeftColor: formData.color }}
        >
          <div className="preview-title">Preview</div>
          <div className="preview-content">
            <i className={formData.icon} style={{ color: formData.color }}></i>
            <span>{formData.name || 'Category Name'}</span>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/categories')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;