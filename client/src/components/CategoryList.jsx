import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import '../styles/CategoryList.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
          const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
          const token = localStorage.getItem('token');
        await axios.delete(`/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(categories.filter(category => category._id !== id));
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  if (loading) {
    return (
      <div className="categories-container">
        <div className="category-loading-container">
          <div className="category-loading-animation">
            <Lottie 
              animationData={require('../assets/dashboard-loading.json')} 
              loop={true} 
              autoplay={true}
            />
          </div>
          <h3 className="category-loading-text">Loading Categories</h3>
          <p className="category-loading-subtext">Organizing your financial categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <Link to="/categories/add" className="btn btn-primary">
          Add New Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p>No categories found. Create your first category!</p>
      ) : (
        <div className="row">
          {categories.map((category) => (
            <div key={category._id} className="col-md-4 mb-3">
              <div className="card" style={{ borderLeft: `5px solid ${category.color}` }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">
                      <i className={category.icon} style={{ marginRight: '8px', color: category.color }}></i>
                      {category.name}
                    </h5>
                    <div className="btn-group">
                      <Link to={`/categories/edit/${category._id}`} className="btn btn-sm btn-outline-primary">
                        Edit
                      </Link>
                      {!category.isDefault && (
                        <button 
                          onClick={() => handleDelete(category._id)} 
                          className="btn btn-sm btn-outline-danger"
                          disabled={category.isDefault}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;