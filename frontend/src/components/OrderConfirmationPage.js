import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
// import { API_BASE_URL } from "./config";
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const { orderId, orderData, paymentMethod } = location.state || {};

  useEffect(() => {
    if (!orderId || !orderData) {
      navigate('/');
      return;
    }
    
    // Clear cart after successful order
    clearCart();
  }, [orderId, orderData, navigate, clearCart]);

  if (!orderId || !orderData) {
    return null;
  }

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 5)); // 5 days from now
    return deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPaymentMethodDisplay = () => {
    switch(paymentMethod) {
      case 'upi':
        return '📱 UPI Payment';
      case 'card':
        return '💳 Credit/Debit Card';
      case 'netbanking':
        return '🏦 Net Banking';
      case 'cod':
        return '💵 Cash on Delivery';
      default:
        return 'Payment Method';
    }
  };

  return (
    <>
      <Header />
      <div className="order-confirmation-page">
        <div className="confirmation-container">
          {/* Success Animation */}
          <div className="success-animation">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="success-message">
            <h1>Order Placed Successfully! 🎉</h1>
            <p>Thank you for your purchase. Your order has been confirmed.</p>
          </div>

          {/* Order Details Card */}
          <div className="order-details-card">
            <div className="order-header">
              <div className="order-id-section">
                <h2>Order ID</h2>
                <p className="order-id">#{orderId}</p>
              </div>
              <div className="order-status">
                <span className="status-badge pending">⏳ Processing</span>
              </div>
            </div>

            <div className="order-info-grid">
              {/* Delivery Information */}
              <div className="info-card">
                <div className="info-icon">🚚</div>
                <h3>Estimated Delivery</h3>
                <p className="highlight">{getEstimatedDelivery()}</p>
                <p className="sub-text">Your order will be delivered in 5-7 business days</p>
              </div>

              {/* Payment Information */}
              <div className="info-card">
                <div className="info-icon">💰</div>
                <h3>Payment Method</h3>
                <p className="highlight">{getPaymentMethodDisplay()}</p>
                <p className="sub-text">
                  {paymentMethod === 'cod' 
                    ? 'Pay when you receive your order' 
                    : 'Payment completed successfully'}
                </p>
              </div>

              {/* Order Total */}
              <div className="info-card">
                <div className="info-icon">💳</div>
                <h3>Order Total</h3>
                <p className="highlight price">₹{(Number(orderData.total)).toFixed(2)}</p>
                <p className="sub-text">Including all taxes</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="shipping-section">
              <h3>📍 Shipping Address</h3>
              <div className="address-card">
                <p className="name">{orderData.shippingAddress.fullName}</p>
                <p>{orderData.shippingAddress.address}</p>
                <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.zipCode}</p>
                <p>📞 {orderData.shippingAddress.phone}</p>
                <p>✉️ {orderData.shippingAddress.email}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="items-section">
              <h3>📦 Order Items ({orderData.items.length})</h3>
              <div className="items-list">
                {orderData.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Quantity: {Number(item.quantity) || 1}</p>
                    </div>
                    <div className="item-price">
                      ₹{(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{(Number(orderData.subtotal)).toFixed(2)}</span>
                </div>
                {/* <div className="summary-row">
                  <span>GST (18%)</span>
                  <span>₹{orderData.gst.toFixed(2)}</span>
                </div> */}
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>₹{(Number(orderData.total)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Tracking Timeline */}
            <div className="timeline-section">
              <h3>📋 Order Status</h3>
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Order Placed</h4>
                    <p>Your order has been received</p>
                    <span className="timeline-date">Just now</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Processing</h4>
                    <p>We're preparing your items</p>
                    <span className="timeline-date">In progress</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Shipped</h4>
                    <p>Your order is on the way</p>
                    <span className="timeline-date">Pending</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Delivered</h4>
                    <p>Package delivered successfully</p>
                    <span className="timeline-date">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="btn-primary"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
              <p>📧 A confirmation email has been sent to <strong>{orderData.shippingAddress.email}</strong></p>
              <p>💬 Need help? <a href="/contact">Contact our support team</a></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
