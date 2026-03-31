import React, { useEffect, useState } from 'react';
import ShippingAddressForm from './ShippingAddressForm';
import './ShippingAddresses.css';
import { API_BASE_URL } from "./config";

const ShippingAddresses = ({ user }) => {
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // API base can be configured via env `REACT_APP_API_BASE`, defaults to localhost:5000
  const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
  const userId = user?.id || null;

  useEffect(() => {
    if (userId) fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const url = `${API_BASE}/api/shipping-addresses?user_id=${userId}`;
      console.log('[shipping UI] fetchAddresses ->', url);
      const res = await fetch(url, { credentials: 'include' });
      console.log('[shipping UI] fetchAddresses status=', res.status);
      const data = await res.json();
      console.log('[shipping UI] fetchAddresses response=', data);
      if (data.success) setAddresses(data.addresses);
      else console.warn('[shipping UI] fetchAddresses returned success=false', data);
    } catch (err) { console.error('[shipping UI] fetchAddresses error', err); }
  };

  const handleSaved = (addr) => {
    fetchAddresses();
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      const url = `${API_BASE}/api/shipping-addresses/${id}`;
      console.log('[shipping UI] delete ->', url);
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      console.log('[shipping UI] delete status=', res.status);
      const data = await res.json();
      console.log('[shipping UI] delete response=', data);
      if (data.success) fetchAddresses();
      else alert('Failed to delete address: ' + (data.message || JSON.stringify(data)));
    } catch (err) { console.error('[shipping UI] delete error', err); alert('Error deleting address'); }
  };

  const handleSelect = (addr) => {
    // Save selected address to session and redirect to payment
    sessionStorage.setItem('selectedShippingAddress', JSON.stringify(addr));
    // navigate to payment page
    window.location.href = '/payment';
  };

  return (
    <div className="kp-shipping">
      <div className="kp-header">
        <h2>Shipping Addresses</h2>
        <button className="kp-add" onClick={() => { setShowForm(true); setEditing(null); }}>+ Add New Address</button>
      </div>

      {showForm && (
        <div className="kp-form-wrap">
          <ShippingAddressForm userId={userId} initialData={editing} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      <div className="kp-address-list">
        {addresses.length === 0 && <div className="kp-empty">No saved addresses yet.</div>}
        {addresses.map((a) => (
          <div className={`kp-address-card ${a.is_default ? 'default' : ''}`} key={a.id}>
            <div className="kp-address-top">
              <div className="kp-name">{a.first_name} {a.last_name} {a.is_default ? <span className="kp-default-badge">(Default)</span> : null}</div>
              <div className="kp-phone">📞 {a.phone}</div>
            </div>
            <div className="kp-street">🏠 {a.street_address}</div>
            <div className="kp-city">{a.city}, {a.state} - {a.zip_code}, {a.country}</div>

            <div className="kp-actions-row">
              <button className="kp-select" onClick={() => handleSelect(a)}>Select Address</button>
              <button className="kp-edit" onClick={() => { setEditing(a); setShowForm(true); }}>Edit</button>
              <button className="kp-delete" onClick={() => handleDelete(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingAddresses;
