import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from "./config";
import ShippingAddressForm from './ShippingAddressForm';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal } = useCart();
  // ✅ Detect if coming from "Buy Now"
const singleProduct = location.state?.product;
const itemsToCheckout = singleProduct ? [singleProduct] : cartItems;


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [errors, setErrors] = useState({});
   // API and user info used by shipping/address logic
   const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
   const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
   const userIdForAddresses = currentUser?.id || null;

   // Shipping addresses state (integrated from ShippingAddresses page)
   const [addresses, setAddresses] = useState([]);
   const [showAddressForm, setShowAddressForm] = useState(false);
   const [editingAddress, setEditingAddress] = useState(null);
   const [selectedAddress, setSelectedAddress] = useState(null);
   const [addressesLoaded, setAddressesLoaded] = useState(userIdForAddresses ? false : true);

  

  useEffect(() => {
    if (userIdForAddresses) fetchAddresses();
  }, [userIdForAddresses]);

  const fetchAddresses = async () => {
    try {
      const url = `${API_BASE}/api/shipping-addresses?user_id=${userIdForAddresses}`;
      console.log('[checkout] fetchAddresses ->', url);
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      console.log('[checkout] fetchAddresses response=', data);
      if (data.success) setAddresses(data.addresses);
    } catch (err) {
      console.error('[checkout] fetchAddresses error', err);
    }
    finally {
      setAddressesLoaded(true);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      const url = `${API_BASE}/api/shipping-addresses/${id}`;
      console.log('[checkout] delete ->', url);
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      console.log('[checkout] delete response=', data);
      if (data.success) {
        if (selectedAddress && selectedAddress.id === id) setSelectedAddress(null);
        fetchAddresses();
      } else {
        alert('Failed to delete address');
      }
    } catch (err) {
      console.error('[checkout] delete error', err);
      alert('Error deleting address');
    }
  };

  const mapBackendToForm = (addr) => ({
    firstName: addr.first_name || '',
    lastName: addr.last_name || '',
    email: addr.email || '',
    phone: addr.phone || '',
    address: addr.street_address || '',
    city: addr.city || '',
    state: addr.state || '',
    zipCode: addr.zip_code || '',
    country: addr.country || 'India'
  });

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    const mapped = mapBackendToForm(addr);
    setFormData(mapped);
    // scroll to form area (optional)
    const el = document.querySelector('.shipping-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddressEdit = (addr) => {
    setEditingAddress(addr);
    setShowAddressForm(true);
  };

  const handleAddressSaved = (addr) => {
    // addr is backend saved object
    console.log('[checkout] address saved', addr);
    setShowAddressForm(false);
    setEditingAddress(null);
    fetchAddresses();
    // auto-select saved address
    setSelectedAddress(addr);
    setFormData(mapBackendToForm(addr));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5,6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be 5-6 digits';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If a saved address is selected, skip manual validation and use it
    let shippingAddressData = null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (selectedAddress) {
      shippingAddressData = {
        fullName: `${selectedAddress.first_name} ${selectedAddress.last_name}`,
        email: selectedAddress.email,
        phone: selectedAddress.phone,
        address: selectedAddress.street_address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zip_code,
        country: selectedAddress.country
      };
    } else {
      const newErrors = validate();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      shippingAddressData = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      };
    }

    // Calculate order totals
    const subtotal = singleProduct ? singleProduct.price : getCartTotal();
    const total = subtotal;

    // Prepare order data
    const orderData = {
      userId: user.id || null,
      items: singleProduct ? [singleProduct] : cartItems,
      subtotal: subtotal,
      total: total,
      shippingAddress: shippingAddressData
    };

    // Navigate to payment page with order data
    navigate('/payment', { state: { orderData } });
  };

  if (!itemsToCheckout || itemsToCheckout.length === 0) {
    return (
      <div className="checkout-page">
        <Header />
        <main className="checkout-content">
          <div className="checkout-container">
            <h1>Checkout</h1>
            <div className="empty-message">
              <p>Your cart is empty. Please add items before checking out.</p>
              <button onClick={() => navigate('/products')}>Go to Products</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header />
      <main className="checkout-content">
        
        <div className="checkout-container">
          <h1>Checkout</h1>
          
          <div className="checkout-layout">
            <div className="shipping-form-section">
              <h2>Shipping Information</h2>

              {/* Show form if no saved addresses yet, or when user clicks Add New */}
              {addresses.length === 0 && !showAddressForm ? (
                // First-time user: show the form directly
                <div className="kp-form-wrap">
                  <ShippingAddressForm 
                    userId={userIdForAddresses} 
                    initialData={null} 
                    onSaved={handleAddressSaved} 
                    onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }} 
                  />
                </div>
              ) : addresses.length > 0 ? (
                // User has saved addresses - show form only when editing
                <>
                  {showAddressForm ? (
                    <div className="kp-form-wrap">
                      <ShippingAddressForm 
                        userId={userIdForAddresses} 
                        initialData={editingAddress} 
                        onSaved={handleAddressSaved} 
                        onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }} 
                      />
                    </div>
                  ) : (
                    <div className="new-address-prompt">
                      <p>✓ Select a saved address from the right panel or create a new one</p>
                      <button 
                        type="button" 
                        className="add-address-btn-inline"
                        onClick={() => { setShowAddressForm(true); setEditingAddress(null); }}
                      >
                        + Add New Address
                      </button>
                    </div>
                  )}
                </>
              ) : null}

              {/* Continue to payment button - shown only when address is selected */}
              {addresses.length > 0 && selectedAddress && (
                <div className="form-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" className="back-btn" onClick={() => navigate('/cart')}>
                    ← Back to Cart
                  </button>
                  <button type="button" className="continue-btn" onClick={handleSubmit}>
                    Continue to Payment →
                  </button>
                </div>
              )}
            </div>

            <div className="right-sidebar">
              <div className="order-summary-section">
                <h2>Order Summary</h2>
                <div className="summary-items">
  {itemsToCheckout.map((item) => (
    <div key={item.id} className="summary-item">
      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <span className="item-qty">× {item.quantity || 1}</span>
      </div>
      <span className="item-price">
        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
      </span>
    </div>
  ))}
</div>

<div className="summary-totals">
  <div className="total-row">
    <span>Subtotal:</span>
    <span>₹{(Number(singleProduct ? singleProduct.price : getCartTotal())).toFixed(2)}</span>
  </div>
  <div className="total-row">
    <span>Shipping:</span>
    <span className="free">FREE</span>
  </div>
  <div className="total-divider"></div>
  <div className="total-row grand-total">
    <span>Total:</span>
    <span>₹{(Number(singleProduct ? singleProduct.price : getCartTotal())).toFixed(2)}</span>
  </div>
</div>
              </div>

              {/* Saved addresses section - under order summary */}
              {addresses.length > 0 && (
                <div className="saved-addresses-section">
                  <h2>Saved Addresses</h2>
                  <div className="saved-addresses-container">
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        className={`address-list-item-compact ${selectedAddress && selectedAddress.id === a.id ? 'selected' : ''}`}
                      >
                        <div className="address-details-compact">
                          <div className="address-name-row">
                            <span className="addr-name">{a.first_name} {a.last_name}</span>
                            {a.is_default && <span className="default-badge">Default</span>}
                          </div>
                          <div className="addr-phone">{a.phone}</div>
                          <div className="addr-street">{a.street_address}</div>
                          <div className="addr-city">{a.city}, {a.state} - {a.zip_code}</div>
                        </div>

                        <div className="address-footer-compact">
                          <label className="address-select">
                            <input
                              type="radio"
                              name="savedAddress"
                              className="address-radio"
                              checked={selectedAddress && selectedAddress.id === a.id}
                              onChange={() => handleAddressSelect(a)}
                            />
                            <span>Use</span>
                          </label>

                          <div className="address-actions-compact">
                            <button
                              type="button"
                              className="icon-btn-compact edit-btn"
                              onClick={() => handleAddressEdit(a)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="icon-btn-compact delete-btn"
                              onClick={() => deleteAddress(a.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
