import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from "./config";
import './ProductsPage.css';

const TrendingProductsPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const productRefs = useRef({});

  // Fetch trending products
  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_BASE_URL}/api/best-selling?limit=100&t=${Date.now()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        console.log("Loaded Trending Products:", data.products);
      } else {
        setMessage("No trending products found");
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching trending products:", err);
      setMessage("Error loading trending products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
    });
  };

  // Apply sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'lowToHigh') return a.price - b.price;
    if (sortOrder === 'highToLow') return b.price - a.price;
    return 0;
  });

  if (loading) {
    return (
      <div className="products-page">
        <Header />
        <main className="products-content">
          <div className="loading">Loading trending products...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="products-page">
      <Header />
      <main className="products-layout">
        {/* Products Section - Full Width */}
        <section className="products-section full-width">
          <div className="products-header">
            <h1>🔥 Trending Products (Best Sellers)</h1>

            {/* 🔹 Sort By Dropdown */}
            <div className="sort-by">
              <label>Sort by:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="none">Most Popular</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>
          </div>

          {message && <div className="message error">{message}</div>}

          {sortedProducts.length === 0 ? (
            <div className="no-products">
              <p>No trending products found.</p>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  ref={(el) => (productRefs.current[product.id] = el)}
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="product-image-container">
                    {product.discount_percent > 0 && (
                      <div className="discount-badge">
                        {product.discount_percent}% OFF
                      </div>
                    )}

                    {(() => {
                      const raw = product.image_url || product.image || product.imageUrl || '';
                      let src = '';
                      if (raw && typeof raw === 'string') {
                        const trimmed = raw.trim();
                        if (trimmed.startsWith('http') || trimmed.startsWith('data:')) {
                          src = trimmed;
                        } else if (trimmed.startsWith('/')) {
                          src = `${API_BASE_URL}${trimmed}`;
                        } else if (trimmed !== '') {
                          src = `${API_BASE_URL}/${trimmed}`;
                        }
                      }

                      if (src) {
                        return (
                          <img
                            src={src}
                            alt={product.name}
                            loading="lazy"
                            className="product-image"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                          />
                        );
                      }

                      return (
                        <div className="no-product-image">
                          <span>📦</span>
                          <p>No Image</p>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="clamp-description">{product.description}</p>
                    <div className="product-footer">
                      <div className="price-box">
                        {product.mrp && product.price && Number(product.mrp) > Number(product.price) ? (
                          <>
                            <span className="product-price">
                              ₹{product.price}
                            </span>
                            <span className="product-mrp striked">
                              ₹{product.mrp}
                            </span>
                          </>
                        ) : (
                          <span className="product-price">
                            ₹{product.price || product.mrp}
                          </span>
                        )}
                      </div>

                      <button
                        className={`add-to-cart-btn ${
                          product.stock_quantity <= 0 ? 'disabled' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={product.stock_quantity <= 0}
                      >
                        {product.stock_quantity <= 0
                          ? 'Out of Stock'
                          : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TrendingProductsPage;
