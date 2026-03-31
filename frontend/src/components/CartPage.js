// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import Header from './Header';
// import Footer from './Footer';
// import './CartPage.css';

// const CartPage = () => {
//   const navigate = useNavigate();
//   const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
//   const [toast, setToast] = useState({ show: false, message: '' });

//   const handleQuantityChange = (productId, newQuantity) => {
//     if (newQuantity < 1) return;
//     updateQuantity(productId, parseInt(newQuantity));
//   };

//   const handleCheckout = () => {
//     const user = localStorage.getItem('user');
//     if (!user) {
//       setToast({ show: true, message: 'Please login to proceed to checkout' });
//       setTimeout(() => {
//         setToast({ show: false, message: '' });
//         navigate('/login');
//       }, 1200);
//       return;
//     }
//     navigate('/checkout');
//   };

//   if (cartItems.length === 0) {
//     return (
//       <div className="cart-page">
//         <Header />
//         <main className="cart-content">
//           <div className="cart-container">
//             <h1>Shopping Cart</h1>
//             <div className="empty-cart">
//               <div className="empty-cart-icon">🛒</div>
//               <h2>Your cart is empty</h2>
//               <p>Add some products to get started!</p>
//               <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
//                 Continue Shopping
//               </button>
//             </div>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="cart-page">
//       <Header />
//       <main className="cart-content">
//         <div className="cart-container">
//           <div className="cart-header">
//             <h1>Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h1>
//             <button className="clear-cart-btn" onClick={clearCart}>
//               Clear Cart
//             </button>
//           </div>

//           <div className="cart-layout">
//             <div className="cart-items">
//               {cartItems.map((item) => (
//                 <div key={item.id} className="cart-item">
//                   <div className="cart-item-image">
//                     {item.image ? (
//                       <img src={item.image} alt={item.name} />
//                     ) : (
//                       <div className="no-image">📦</div>
//                     )}
//                   </div>

//                   <div className="cart-item-details">
//                     <h3 className="cart-item-name">{item.name}</h3>
//                     <p className="cart-item-description">{item.description}</p>
//                     <span className="cart-item-age">{item.age_range}</span>
//                   </div>

//                   <div className="cart-item-quantity">
//                     <label>Quantity:</label>
//                     <div className="quantity-controls">
//                       <button
//                         className="qty-btn"
//                         onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                         disabled={item.quantity <= 1}
//                       >
//                         -
//                       </button>
//                       <input
//                         type="number"
//                         value={item.quantity}
//                         onChange={(e) => handleQuantityChange(item.id, e.target.value)}
//                         min="1"
//                         max={item.stock_quantity}
//                       />
//                       <button
//                         className="qty-btn"
//                         onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
//                         disabled={item.quantity >= item.stock_quantity}
//                       >
//                         +
//                       </button>
//                     </div>
//                     <span className="stock-info">
//                       (Max: {item.stock_quantity})
//                     </span>
//                   </div>

//                   <div className="cart-item-price">
//                     <div className="price-label">Price:</div>
//                     <div className="unit-price">₹{item.price}</div>
//                     <div className="total-price">₹{(item.price * item.quantity).toFixed(2)}</div>
//                   </div>

//                   <button
//                     className="remove-item-btn"
//                     onClick={() => removeFromCart(item.id)}
//                     title="Remove from cart"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>

//             <div className="cart-summary">
//               <h2>Order Summary</h2>
              
//               <div className="summary-row">
//                 <span>Subtotal:</span>
//                 <span>₹{getCartTotal().toFixed(2)}</span>
//               </div>

//               <div className="summary-row">
//                 <span>Shipping:</span>
//                 <span className="free">FREE</span>
//               </div>

//               {/* <div className="summary-row">
//                 <span>Tax (GST 18%):</span>
//                 <span>₹{(getCartTotal() * 0.18).toFixed(2)}</span>
//               </div> */}

//               <div className="summary-divider"></div>

//               <div className="summary-row total">
//                 <span>Total:</span>
//                 <span>₹{getCartTotal().toFixed(2)}</span>
//               </div>

//               <button className="checkout-btn" onClick={handleCheckout}>
//                 Proceed to Checkout
//               </button>

//               <button className="continue-shopping-link" onClick={() => navigate('/products')}>
//                 ← Continue Shopping
//               </button>

//               <div className="payment-methods">
//                 <p>We accept:</p>
//                 <div className="payment-icons">
//                   💳 💵 🏦
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//       <Footer />
//       {/* Centered Popup Toast */}
//       {toast.show && (
//         <div
//           style={{
//             position: 'fixed',
//             inset: 0,
//             background: 'rgba(0,0,0,0.2)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             zIndex: 2000,
//             backdropFilter: 'blur(2px)'
//           }}
//         >
//           <div
//             style={{
//               background: '#fff7eb',
//               color: '#273c2e',
//               border: '1px solid rgba(182, 158, 106, 0.35)',
//               borderRadius: 18,
//               boxShadow: '0 18px 40px rgba(39, 60, 46, 0.18)',
//               padding: '24px 28px',
//               width: 'min(92vw, 440px)',
//               textAlign: 'center',
//               transform: 'scale(1)',
//               animation: 'kpScaleIn 240ms ease-out',
//               fontWeight: 700,
//               position: 'relative'
//             }}
//           >
//             <div
//               style={{
//                 width: 54,
//                 height: 54,
//                 margin: '0 auto 12px',
//                 borderRadius: '50%',
//                 display: 'grid',
//                 placeItems: 'center',
//                 background: 'linear-gradient(135deg, #f59e0b, #d97706)',
//                 color: '#fff7eb',
//                 boxShadow: '0 8px 20px rgba(245,158,11,0.35)',
//                 border: '2px solid rgba(255,255,255,0.55)'
//               }}
//             >
//               !
//             </div>
//             <div style={{ fontSize: 18, letterSpacing: 0.2, marginBottom: 4 }}>
//               {toast.message}
//             </div>
//             <div style={{ fontSize: 13, fontWeight: 500, color: '#4f6354' }}>
//               Redirecting to login...
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CartPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';
import './CartPage.css';

const BACKEND_URL = 'http://localhost:5000'; // 🔴 change if needed

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [toast, setToast] = useState({ show: false, message: '' });

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, parseInt(newQuantity));
  };

  // ✅ NAVIGATE TO PRODUCT DETAILS
  const handleProductClick = (item) => {
    navigate(`/product/${item.id}`, { state: { product: item } });
  };

  const handleCheckout = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setToast({ show: true, message: 'Please login to proceed to checkout' });
      setTimeout(() => {
        setToast({ show: false, message: '' });
        navigate('/login');
      }, 1200);
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <Header />
        <main className="cart-content">
          <div className="cart-container">
            <h1>Shopping Cart</h1>
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some products to get started!</p>
              <button
                className="continue-shopping-btn"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Header />

      <main className="cart-content">
        <div className="cart-container">
          <div className="cart-header">
            <h1>
              Shopping Cart ({cartItems.length}{' '}
              {cartItems.length === 1 ? 'item' : 'items'})
            </h1>
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>

          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => {
                // ✅ IMAGE URL FIX
                const imageUrl = item.image
                  ? item.image.startsWith('http')
                    ? item.image
                    : `${BACKEND_URL}/uploads/${item.image}`
                  : null;

                return (
                  <div key={item.id} className="cart-item">
                    
                    {/* IMAGE */}
                    <div
                      className="cart-item-image"
                      onClick={() => handleProductClick(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}

                      <div
                        className="no-image"
                        style={{ display: imageUrl ? 'none' : 'flex' }}
                      >
                        📦
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div
                      className="cart-item-details"
                      onClick={() => handleProductClick(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-description">{item.description}</p>
                      <span className="cart-item-age">{item.age_range}</span>
                    </div>

                    {/* QUANTITY */}
                    <div className="cart-item-quantity">
                      <label>Quantity:</label>
                      <div className="quantity-controls">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          min="1"
                          max={item.stock_quantity}
                        />

                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock_quantity}
                        >
                          +
                        </button>
                      </div>
                      <span className="stock-info">
                        (Max: {item.stock_quantity})
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="cart-item-price">
                      <div className="price-label">Price:</div>
                      {((item.mrp && item.price && Number(item.mrp) > Number(item.price)) || (item.original_price && Number(item.original_price) > Number(item.price))) ? (
                        <div className="discounted-price-breakdown">
                          <div className="unit-price">
                            ₹{item.price}
                          </div>
                          <div className="original-price">
                            ₹{item.mrp || item.original_price}
                          </div>
                          <div className="product-discount">
                            {Math.round(((Number(item.mrp || item.original_price) - Number(item.price)) / Number(item.mrp || item.original_price)) * 100)}% off
                          </div>
                          <div className="product-saved">
                            You Saved (₹{(Number(item.mrp || item.original_price) - Number(item.price)).toFixed(0)})
                          </div>
                        </div>
                      ) : (
                        <div className="unit-price">₹{item.price}</div>
                      )}
                      <div className="total-price">
                        Total: ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* REMOVE */}
                    <button
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove from cart"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}
            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal (Original):</span>
                <span>₹{cartItems.reduce((sum, item) => sum + (item.original_price * item.quantity), 0).toFixed(2)}</span>
              </div>

              <div className="summary-row discount">
                <span>Discount:</span>
                <span>-₹{(cartItems.reduce((sum, item) => sum + (item.original_price * item.quantity), 0) - getCartTotal()).toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Subtotal (After Discount):</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span className="free">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <button
                className="continue-shopping-link"
                onClick={() => navigate('/products')}
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* TOAST */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            style={{
              background: '#fff7eb',
              padding: 24,
              borderRadius: 16,
              fontWeight: 700
            }}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
