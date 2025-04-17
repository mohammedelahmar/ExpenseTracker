import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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
      const { data } = await axios.get(`/api/categories/${id}`, {  // Note the template literal syntax
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
    <div>
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
        </div>
        <div className="mb-3">
          <label className="form-label">Icon</label>
          <input
            type="text"
            className="form-control"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;