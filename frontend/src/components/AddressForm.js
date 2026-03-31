import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "./config";
import './AddressForm.css';

const AddressForm = ({ userId, editingAddressId, addresses, onAddressAdded, onAddressUpdated, onCancel }) => {
  const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });
  const [errors, setErrors] = useState({});

  // Load existing address if editing
  useEffect(() => {
    if (editingAddressId) {
      const addressToEdit = addresses.find(a => a.id === editingAddressId);
      if (addressToEdit) {
        setFormData({
          firstName: addressToEdit.first_name,
          lastName: addressToEdit.last_name,
          email: addressToEdit.email || '',
          phone: addressToEdit.phone,
          streetAddress: addressToEdit.street_address,
          city: addressToEdit.city,
          state: addressToEdit.state,
          zipCode: addressToEdit.zip_code,
          country: addressToEdit.country,
          isDefault: addressToEdit.is_default === 1
        });
      }
    }
  }, [editingAddressId, addresses]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!/^[0-9\-\+\(\)\s]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        is_default: formData.isDefault
      };

      let response;
      if (editingAddressId) {
        response = await fetch(`${API_BASE}/api/shipping-addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE}/api/shipping-addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (data.success) {
        if (editingAddressId) {
          onAddressUpdated(data.address);
        } else {
          onAddressAdded(data.address);
        }
      } else {
        setErrors({ submit: data.message || 'Failed to save address' });
      }
    } catch (err) {
      console.error('[AddressForm] Submit error:', err);
      setErrors({ submit: 'Failed to save address. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      {errors.submit && <div className="form-error">{errors.submit}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            className={errors.firstName ? 'input-error' : ''}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            className={errors.lastName ? 'input-error' : ''}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className={errors.phone ? 'input-error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="streetAddress">Street Address *</label>
        <input
          type="text"
          id="streetAddress"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          placeholder="Enter street address"
          className={errors.streetAddress ? 'input-error' : ''}
        />
        {errors.streetAddress && <span className="error-text">{errors.streetAddress}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
            className={errors.city ? 'input-error' : ''}
          />
          {errors.city && <span className="error-text">{errors.city}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="state">State/Province *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter state"
            className={errors.state ? 'input-error' : ''}
          />
          {errors.state && <span className="error-text">{errors.state}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="zipCode">Zip Code *</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Enter zip code"
            className={errors.zipCode ? 'input-error' : ''}
          />
          {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="country">Country *</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={errors.country ? 'input-error' : ''}
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
          {errors.country && <span className="error-text">{errors.country}</span>}
        </div>
      </div>

      <div className="form-group checkbox-group">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
        />
        <label htmlFor="isDefault" className="checkbox-label">Set as default address</label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save Address')}
        </button>
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
