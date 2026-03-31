import React, { useState, useEffect } from 'react';
import './ShippingAddressForm.css';
import { API_BASE_URL } from "./config";
const ShippingAddressForm = ({ userId, initialData = null, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    is_default: false
  });

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
      const payload = { ...form, user_id: userId };
      console.log('[shipping UI] submit payload=', payload);
      if (initialData && initialData.id) {
        // update
        const url = `${API_BASE}/api/shipping-addresses/${initialData.id}`;
        console.log('[shipping UI] update ->', url);
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        console.log('[shipping UI] update status=', res.status);
        const data = await res.json();
        console.log('[shipping UI] update response=', data);
        if (data.success) onSaved(data.address);
        else alert('Failed to update: ' + (data.message || JSON.stringify(data)));
      } else {
        // create
        const url = `${API_BASE}/api/shipping-addresses`;
        console.log('[shipping UI] create ->', url);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        console.log('[shipping UI] create status=', res.status);
        const data = await res.json();
        console.log('[shipping UI] create response=', data);
        if (data.success) onSaved(data.address);
        else alert('Failed to create: ' + (data.message || JSON.stringify(data)));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    }
  };

  return (
    <form className="kp-address-form" onSubmit={handleSubmit}>
      <div className="kp-row">
        <input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} required />
      </div>
      <input name="email" placeholder="Email (optional)" value={form.email} onChange={handleChange} />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
      <textarea name="street_address" placeholder="Street address" value={form.street_address} onChange={handleChange} required />
      <div className="kp-row">
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required />
      </div>
      <div className="kp-row">
        <input name="zip_code" placeholder="ZIP / Pincode" value={form.zip_code} onChange={handleChange} required />
        <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required />
      </div>
      <label className="kp-default">
        <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} /> Set as default
      </label>

      <div className="kp-actions">
        <button type="submit" className="kp-save">Save</button>
        <button type="button" className="kp-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ShippingAddressForm;
