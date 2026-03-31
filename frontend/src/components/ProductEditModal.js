import React, { useState, useEffect } from 'react';
import Select from "react-select";
import './ProductEditModal.css';
import { API_BASE_URL } from "./config";

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    age_range: product.age_range || '',
    brand_name: product.brand_name || product.brand || '',
    gender: product.gender || '',
    tag_ids: product.tag_ids || [],
    customized: product.customized || 0,
    category_id: product.category_id || product.category_id || null,
    subcategory_id: product.subcategory_id || null,
    mrp: product.mrp != null ? Number(product.mrp) : '',
    price: product.price != null ? Number(product.price) : '',
    discount: product.discount != null ? Number(product.discount) : 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Categories for editing category
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch available tags & categories
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tags`);
        const data = await res.json();
        if (data.success) {
          setTags(data.tags || []);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      } finally {
        setTagsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data || []);
        } else if (data.success && data.length !== undefined) {
          setCategories(data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    const fetchSubcategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/subcategories`);
    const data = await res.json();

    if (data.success) {
      setSubcategories(data.subcategories || []);
    } else if (Array.isArray(data)) {
      setSubcategories(data);
    }
  } catch (err) {
    console.error("Error fetching subcategories:", err);
  }
};


    fetchTags();
    fetchCategories();
    fetchSubcategories(); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev };

      // Handle numeric fields
      if (name === 'mrp' || name === 'price' || name === 'discount') {
        const num = value === '' ? '' : Number(value);
        next[name] = value === '' ? '' : (isNaN(num) ? prev[name] : num);
      } else if (name === 'customized') {
        next[name] = parseInt(value, 10);
      } else {
        next[name] = value;
      }

      // Recalculate relationships
      const mrpVal = next.mrp !== '' && next.mrp != null ? Number(next.mrp) : null;
      const priceVal = next.price !== '' && next.price != null ? Number(next.price) : null;
      const discVal = next.discount !== '' && next.discount != null ? Number(next.discount) : null;

      // If user changed mrp or price, compute discount
      if (name === 'mrp' || name === 'price') {
        if (mrpVal && priceVal != null && !isNaN(mrpVal) && mrpVal > 0) {
          next.discount = parseFloat((((mrpVal - priceVal) / mrpVal) * 100).toFixed(2));
        }
      }

      // If user changed discount, compute price from mrp (if mrp available)
      if (name === 'discount') {
        if (mrpVal && discVal != null && !isNaN(discVal)) {
          const p = parseFloat((mrpVal * (1 - discVal / 100)).toFixed(2));
          next.price = p;
        }
      }

      return next;
    });
    setError('');
  };

  const handleTagChange = (tagId) => {
    setFormData((prev) => {
      const currentTags = prev.tag_ids || [];
      const isSelected = currentTags.includes(tagId);
      const updatedTags = isSelected
        ? currentTags.filter(id => id !== tagId)
        : [...currentTags, tagId];
      return {
        ...prev,
        tag_ids: updatedTags,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get admin token - check multiple possible storage locations
      let authToken = localStorage.getItem('adminToken');
      console.log('🔍 Checking adminToken:', authToken); // Debug
      
      // If no adminToken, try getting token from regular user login
      if (!authToken) {
        authToken = localStorage.getItem('token');
        console.log('🔍 Checking token:', authToken); // Debug
      }
      
      // Also check for token in session storage as backup
      if (!authToken) {
        authToken = sessionStorage.getItem('token');
        console.log('🔍 Checking sessionStorage token:', authToken); // Debug
      }
      
      if (!authToken) {
        console.error('❌ No token found in any storage'); // Debug
        throw new Error('Admin authentication required. Please login as admin first.');
      }

      console.log('✅ Using token for request'); // Debug
      // Ensure customized, category_id, and subcategory_id are sent as numbers
      const dataToSend = {
        ...formData,
        customized: parseInt(formData.customized, 10),
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id, 10) : null,
      };
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product.id}/details`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Admin login required. Please login as admin to edit products.');
        }
        throw new Error(data.message || 'Failed to update product');
      }

      // Call onSave with updated product data
      onSave({ ...product, ...formData });
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while updating the product');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand_name">Brand Name</label>
            <input
              type="text"
              id="brand_name"
              name="brand_name"
              value={formData.brand_name}
              onChange={handleChange}
              placeholder="Enter brand name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age_range">Age Range</label>
              <input
                type="text"
                id="age_range"
                name="age_range"
                value={formData.age_range}
                onChange={handleChange}
                placeholder="e.g., 3-8 years"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="customized">Customized Product</label>
              <select
                id="customized"
                name="customized"
                value={formData.customized}
                onChange={handleChange}
              >
                <option value="0">No - Regular Product (0)</option>
                <option value="1">Yes - Add to Customized Products (1)</option>
              </select>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                💡 Select "Yes" to add this product to the Customized Products section
              </p>
            </div>
          </div>

          {/* <div className="form-group">
            <label htmlFor="tag_ids">Tags / Characters & Themes</label>
            {tagsLoading ? (
              <p style={{ color: '#999' }}>Loading tags...</p>
            ) : tags.length > 0 ? (
              <>
                <select
                  id="tag_ids"
                  multiple
                  value={formData.tag_ids || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    setFormData((prev) => ({
                      ...prev,
                      tag_ids: selectedOptions,
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    minHeight: '120px'
                  }}
                  title="Hold Ctrl (or Cmd on Mac) to select multiple tags"
                >
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>💡 Hold Ctrl/Cmd to select multiple tags</p>
              </>
            ) : (
              <p style={{ color: '#999' }}>No tags available</p>
            )}
          </div> */}

          <div className="form-group">
  <label>Tags / Characters & Themes</label>

  {tagsLoading ? (
    <p style={{ color: "#999" }}>Loading tags...</p>
  ) : (
    <Select
      isMulti
      options={tags.map(tag => ({
        value: tag.id,
        label: tag.name
      }))}
      value={tags
        .filter(tag => formData.tag_ids.includes(tag.id))
        .map(tag => ({
          value: tag.id,
          label: tag.name
        }))
      }
      onChange={(selectedOptions) =>
        setFormData(prev => ({
          ...prev,
          tag_ids: selectedOptions
            ? selectedOptions.map(opt => opt.value)
            : []
        }))
      }
      placeholder="Select tags..."
      classNamePrefix="react-select"
    />
  )}
</div>

<div className="form-row">
  {/* CATEGORY */}
  <div className="form-group">
    <label htmlFor="category_id">Category</label>
    {categoriesLoading ? (
      <p style={{ color: "#999" }}>Loading categories...</p>
    ) : (
      <select
        id="category_id"
        name="category_id"
        value={formData.category_id || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            category_id: e.target.value ? parseInt(e.target.value, 10) : null,
            subcategory_id: null, // ✅ reset subcategory when category changes
          }))
        }
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id || c.sno} value={c.id || c.sno}>
            {c.name || c.category_name}
          </option>
        ))}
      </select>
    )}
  </div>

  {/* SUBCATEGORY */}
  <div className="form-group">
    <label htmlFor="subcategory_id">Sub Category</label>

    <select
      id="subcategory_id"
      name="subcategory_id"
      value={formData.subcategory_id || ""}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          subcategory_id: e.target.value ? parseInt(e.target.value, 10) : null,
        }))
      }
      disabled={!formData.category_id}
    >
      <option value="">
        {formData.category_id ? "Select sub category" : "Select category first"}
      </option>

      {subcategories
        .filter(
          (sub) => String(sub.category_id) === String(formData.category_id)
        )
        .map((sub) => (
        <option key={sub.id || sub.sno} value={sub.id || sub.sno}>
  {sub.subcategory_name || sub.name}
</option>

        ))}
    </select>
  </div>
  {/* MRP */}
  <div className="form-group">
    <label htmlFor="mrp">MRP (₹)</label>
    <input
      type="number"
      id="mrp"
      name="mrp"
      min="0"
      step="0.01"
      value={formData.mrp}
      onChange={handleChange}
      placeholder="Enter MRP"
    />
  </div>

  {/* PRICE */}
  <div className="form-group">
    <label htmlFor="price">Price (₹)</label>
    <input
      type="number"
      id="price"
      name="price"
      min="0"
      step="0.01"
      value={formData.price}
      onChange={handleChange}
      placeholder="Enter selling price"
    />
  </div>

  {/* DISCOUNT */}
  <div className="form-group">
    <label htmlFor="discount">Discount (%)</label>
    <input
      type="number"
      id="discount"
      name="discount"
      min="0"
      max="100"
      step="0.01"
      value={formData.discount}
      onChange={handleChange}
      placeholder="Enter discount percentage"
    />
  </div>
</div>



          {/* <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category_id">Category</label>
              {categoriesLoading ? (
                <p style={{ color: '#999' }}>Loading categories...</p>
              ) : (
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id || c.sno} value={c.id || c.sno}>{c.name || c.category_name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="discount">Discount (%)</label>
              <input
                type="number"
                id="discount"
                name="discount"
                min="0"
                max="100"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                placeholder="Enter discount percentage"
              />
            </div>
          </div> */}

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
