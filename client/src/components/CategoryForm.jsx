import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/CategoryForm.css'; // Add your CSS styles here
const ICON_OPTIONS = [
  'fa-solid fa-utensils',
  'fa-solid fa-house',
  'fa-solid fa-car',
  'fa-solid fa-bus',
  'fa-solid fa-briefcase',
  'fa-solid fa-graduation-cap',
  'fa-solid fa-heart',
  'fa-solid fa-stethoscope',
  'fa-solid fa-laptop',
  'fa-solid fa-gamepad',
  'fa-solid fa-shopping-basket',
  'fa-solid fa-gift'
];

const COLOR_OPTIONS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
  '#FF9F40', '#8AC249', '#EA526F', '#00A6ED', '#6F2DBD'
];

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    color: COLOR_OPTIONS[0],
    icon: ICON_OPTIONS[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
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
      toast.error('Failed to fetch category details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isEditing) {
        await axios.put(`/api/categories/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
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

  if (loading && isEditing) return <div>Loading category...</div>;

  return (
    <div className="category-form-container">
      <h2>{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Category Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Color</label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {COLOR_OPTIONS.map((color) => (
              <div 
                key={color}
                onClick={() => setFormData({...formData, color})}
                className={`color-circle ${formData.color === color ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: color,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: formData.color === color ? '2px solid black' : '1px solid #ddd'
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Icon</label>
          <div className="d-flex flex-wrap gap-3 mb-3">
            {ICON_OPTIONS.map((icon) => (
              <div 
                key={icon}
                onClick={() => setFormData({...formData, icon})}
                className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                style={{ 
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: formData.icon === icon ? '#f0f0f0' : 'transparent',
                  borderRadius: '4px'
                }}
              >
                <i className={icon} style={{ color: formData.color, fontSize: '20px' }}></i>
              </div>
            ))}
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
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