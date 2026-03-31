import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from "./config";
import './HomePage.css';
import slide1 from "../components/assets/slides/slide1.jpg";
import slide2 from "../components/assets/slides/slide2.jpg";
import slide3 from "../components/assets/slides/slide3.jpg";

// age images

import img018 from '../components/assets/slides/0-18.png';
import img1836 from '../components/assets/slides/18-36.png';
import img0305 from '../components/assets/slides/3-5.png';
import img0507 from '../components/assets/slides/5-7.png';
import img0709 from '../components/assets/slides/7-9.png';
import img0912 from '../components/assets/slides/9-12.png';
import img12 from '../components/assets/slides/12+.png';


//Import brand images

import barbie from "../components/assets/slides/barbie.jpg";

// 🖼 Import category images (hardcoded but matched by index)
import cat1 from "../components/assets/slides/wriring.jpeg";
import cat2 from "../components/assets/slides/paper products.jpg";
import cat3 from "../components/assets/slides/accessories.jpeg";
import cat4 from "../components/assets/slides/stationary.jpg";
import cat5 from "../components/assets/slides/games and toys.jpg";
import cat6 from "../components/assets/slides/arts and crafts.jpg";
import cat7 from "../components/assets/slides/party supplies.jpg";
import cat8 from "../components/assets/slides/Educational Meterials.jpg";
import cat9 from "../components/assets/slides/Files   folder.jpg";


const Slider = ({ slides = [], interval = 2000 }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const isHovering = useRef(false);
  


  useEffect(() => {
    start();
    return stop;
  }, [current]);

  const start = () => {
    stop();
    timerRef.current = setInterval(() => {
      if (!isHovering.current) {
        setCurrent((c) => (c + 1) % slides.length);
      }
    }, interval);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const next = () => {
    stop();
    setCurrent((c) => (c + 1) % slides.length);
  };

  const prev = () => {
    stop();
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    stop();
    setCurrent(index);
  };

  if (!slides.length) return null;

  return (
    <div
      className="fade-slider"
      onMouseEnter={() => (isHovering.current = true)}
      onMouseLeave={() => (isHovering.current = false)}
    >
      {slides.map((s, i) => (
        <div key={i} className={`fade-slide ${i === current ? "active" : ""}`}>
          <img src={s.image} alt={s.title} className="slide-img" />
          <div className="fade-overlay">
            <h1>{s.title}</h1>
            <p>{s.subtitle}</p>
            {s.cta && (
              <button className="cta-button" onClick={s.onClick}>
                {s.cta}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* 👇 Navigation Arrows (always visible) */}
      <button className="slider-btn prev" onClick={prev}>‹</button> 
      <button className="slider-btn next" onClick={next}>›</button> 
      

      {/* 👇 Navigation Dots (directly control slides) */}
      <div className="slider-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => goToSlide(i)}
          />
        ))}
      </div>
    </div>
  );
};


const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]); // 🎭 Fetch from database
  const [tagsLoading, setTagsLoading] = useState(false); // 🎭 Loading state for tags
const [specialOffers, setSpecialOffers] = useState([]);

  
// LOAD SPECIAL OFFERS
useEffect(() => {
  fetch(`${API_BASE_URL}/api/products?discount=high&time=` + Date.now())
    .then(res => res.json())
    .then(data => {
      console.log("Loaded Special Offers:", data.products);
      setSpecialOffers(data.products || []);
    })
    .catch(err => console.error("Error loading special offers:", err));
}, []);
  // 🖼 Hardcoded category image list
  const categoryImages = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, ];

useEffect(() => {
  fetchCategories();
  fetchProducts();
  fetchBrands();
  fetchTagsFromDatabase(); // 🎭 Fetch tags from database
}, []);

// 🎭 Fetch tags from database
const fetchTagsFromDatabase = async () => {
  try {
    setTagsLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/tags`);
    const data = await res.json();
    if (data.success && Array.isArray(data.tags)) {
      setTags(data.tags);
      console.log("📸 Loaded tags with images from database:", data.tags);
    }
  } catch (err) {
    console.error('Error loading tags from database:', err);
  } finally {
    setTagsLoading(false);
  }
};


  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await res.json();
      // Ensure data is always an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading categories', err);
      setCategories([]);
    }
  };

  //new arrivals logic
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  
  // LOAD NEW ARRIVALS FOR HOMEPAGE
useEffect(() => {
  fetch(`${API_BASE_URL}/api/new-arrivals?time=` + Date.now())
    .then(res => res.json())
    .then(data => {
      console.log("Loaded New Arrivals:", data.products);
      setNewArrivals(data.products || []);
    })
    .catch(err => console.error("Error loading new arrivals:", err));
}, []);

// LOAD TRENDING/BEST-SELLING PRODUCTS FOR HOMEPAGE
useEffect(() => {
  fetch(`${API_BASE_URL}/api/best-selling?limit=12&time=` + Date.now())
    .then(res => res.json())
    .then(data => {
      console.log("Loaded Trending Products:", data.products);
      setTrendingProducts(data.products || []);
    })
    .catch(err => console.error("Error loading trending products:", err));
}, []);


  const fetchSubcategories = async (catId) => {
    if (subcategories[catId]) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/subcategories/${catId}`);
      const data = await res.json();
      setSubcategories((prev) => ({ ...prev, [catId]: data }));
    } catch (err) {
      console.error('Error loading subcategories', err);
    }
  };
  
  const scrollCategories = (direction) => {
  const container = document.getElementById("categoryScroll");
  const scrollAmount = 300;

  if (direction === "left") {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
};


  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products?t=${Date.now()}`);
      const data = await res.json();
      setProducts(data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };



// ✅ FETCH BRANDS (FIXED DUPLICATE LOGIC)
const fetchBrands = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/brands`);
    const data = await res.json();

    /**
     * RULE:
     * Duplicate ONLY if:
     *  - brand name is same
     *  - AND logo is same
     */
    const uniqueBrandsMap = new Map();

    data.forEach((brand) => {
      const key = `${brand.name.toLowerCase()}|${brand.logo_url}`;
      if (!uniqueBrandsMap.has(key)) {
        uniqueBrandsMap.set(key, brand);
      }
    });

    setBrands(Array.from(uniqueBrandsMap.values()));
  } catch (err) {
    console.error("Error fetching brands:", err);
  }
};




  const prices = [
    { label: "₹99", value: 99, maxPrice:99},
    { label: "₹299", value: 299, maxPrice:299},
    { label: "₹499", value: 499, maxPrice:499},
    { label: "₹699", value: 699, maxPrice:699},
    { label: "₹999", value: 999, maxPrice:999},
    { label: "₹1200", value: 1200, maxPrice:1200},
  ];


  const ageRanges = [
    { label: '0 - 18 Months', age: '0-18 Months', icon: img018, color: '#FFB6C1' },
    { label: '18 - 36 Months', age: '18-36 Months', icon: img1836, color: '#87CEEB' },
    { label: '3 - 5 Years', age: '3-5 Years', icon: img0305, color: '#DDA0DD' },
    { label: '5 - 7 Years', age: '5-7 Years', icon: img0507, color: '#F0E68C' },
    { label: '7 - 9 Years', age: '7-9 Years', icon: img0709, color: '#B0E0E6' },
    { label: '9 - 12 Years', age: '9-12 Years', icon: img0912, color: '#98FB98' },
    { label: '12+ Years', age: '12+ years', icon: img12, color: '#FFA07A' },
  ];
  

  const slides = [
    {
      image: slide1,
      title: "New Arrivals!",
      subtitle: "Check out the latest products in our store.",
      cta: "Shop Now",
      onClick: () => navigate("/products"),
    },
    {
      image: slide2,
      title: "Mega Sale!",
      subtitle: "Up to 50% off on select items.",
      cta: "Grab Offers",
      onClick: () => navigate('/products?discount=high'),
    },
    {
      image: slide3,
      // title: "Fast Delivery",
      subtitle: "Get your orders delivered within 24 hours.",
      cta: "Order Now",
      onClick: () => navigate("/products"),
    },
  ];

  
  return (
    <div>
      <Header/>
      <div className="home-page">
      

      <Slider slides={slides} />

      {/* Shop by Price */}
      <div className="shop-section">
        <h2 className="section-title">Shop by Price</h2>
        <div className="offer-grid">
          {prices.map((price, index) => (
            <div
              key={index}
              className="offer-card"
              onClick={() => navigate(`/products?price=0-${price.maxPrice}`)}
            >
              <h3>Under</h3>
              <h2>{price.label}</h2>
            </div>
          ))}
        </div>
      </div>

      {/* Shop by Age */}
      <div className="shop-section">
        <h2 className="section-title">Shop by Age</h2>
        <div className="age-grid">
          {ageRanges.map((age) => (
            <div key={age.age} className="age-card" onClick={() => navigate(`/products?age=${age.age}`)} style={{ background: age.color }}>
              <img src={age.icon} alt={age.label} className="age-icon" />
              <h3>{age.label}</h3>
            </div>
          ))}
        </div>
      </div>

    {/* Shop by Categories */}
<div className="shop-section">
  <h2 className="section-title">Shop by Categories</h2>

  <div className="category-carousel">

    {/* Left Arrow */}
    <button className="cat-arrow left" onClick={() => scrollCategories("left")}>
      &#10094;
    </button>

    {/* Scrollable Categories */}
    <div className="category-grid" id="categoryScroll">
      {categories && Array.isArray(categories) && categories.slice(0, 9).map((cat, index) => (
        <div
          key={cat.sno}
          className="category-card"
          onClick={() => navigate(`/products/by-category/${cat.sno}`)}
        >
          <img
            src={categoryImages[index % categoryImages.length]}
            alt={cat.category_name}
            className="category-img"
          />
          <h3>{cat.category_name}</h3>
        </div>
      ))}
    </div>

    {/* Right Arrow */}
    <button className="cat-arrow right" onClick={() => scrollCategories("right")}>
      &#10095;
    </button>

  </div>
</div>

 {/* ⭐ NEW ARRIVALS SECTION */}
<div className="shop-section">
<div 
  className="section-header"
  style={{ 
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "20px"   // space below the whole header
  }}
>
  <h2 
    className="section-title" 
    style={{ 
      flex: 1, 
      textAlign: "center", 
      margin: 0,
      paddingBottom: "10px"   // extra space below ONLY New Arrivals text
    }}
  >
    New Arrivals
  </h2>

  <button
    className="view-all-btn"
    onClick={() => navigate("/products?new=true")}
    style={{ marginLeft: "auto" }}
  >
    View All
  </button>
</div>


<div className="new-grid">
  {newArrivals.slice(0, 6).map((item) => (
    <div
      key={item.id}
      className="new-card"
      onClick={() => navigate(`/product/${item.id}`)}
    >
      {/* 🔥 Discount badge */}
      {item.discount_percent > 0 && (
        <div className="discount-badge">
          {item.discount_percent}% OFF
        </div>
      )}

      <img
        src={
          item.image_url
            ? `${API_BASE_URL}${item.image_url}`
            : "/placeholder-product.png"
        }
        alt={item.name}
        loading="lazy"
        className="product-image"
      />

      <h3>{item.name}</h3>
      <p>₹{item.price}</p>
    </div>
  ))}
</div>
</div>


<div className="shop-section">
  <h2 className="section-title">Explore by Brand</h2>

  <div className="brand-carousel">
    <button
      className="brand-arrow left"
      onClick={() =>
        document
          .getElementById("brandScroll")
          .scrollBy({ left: -300, behavior: "smooth" })
      }
    >
      &#8249;
    </button>

    <div className="brand-scroll" id="brandScroll">
  {brands.map((brand) => (
    <div
      key={brand.id}
      className="brand-item"
      onClick={() => navigate(`/products?brand=${brand.name}`)}
    >
      <img
        src={`${API_BASE_URL}${brand.logo_url}`}
        alt={brand.name}
        onError={(e) => (e.target.src = "/placeholder-brand.png")}
      />
     <p className="brand-name">
  {brand.name.toUpperCase()}
</p>

    </div>
  ))}
</div>

    <button
      className="brand-arrow right"
      onClick={() =>
        document
          .getElementById("brandScroll")
          .scrollBy({ left: 300, behavior: "smooth" })
      }
    >
      &#8250;
    </button>
  </div>
</div>

{/* start trending prodects  */}

      {/* <div className="shop-section">
           <div className="section-header">
          <h2 className="section-title">Trending Products</h2>

                <button
                className="view-all-btn"
                onClick={() => navigate("/products/trending")}
              >
                View All
              </button>
            </div>

  <div className="trending-scroll-container">
    <button
      className="trending-scroll-btn left"
      onClick={() => {
        const container = document.getElementById("trendingScroll");
        container.scrollBy({ left: -300, behavior: "smooth" });
      }}
    >
      &#8249;
    </button>

    <div className="trending-scroll" id="trendingScroll">
      {trendingProducts && trendingProducts.length > 0 ? (
        trendingProducts.map((product) => (
          <div
            key={product.id}
            className="trending-product-card"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <div className="trending-product-image">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                  }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "150px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999"
                }}>
                  No Image
                </div>
              )}
              {product.discount > 0 && (
                <span className="trending-discount-badge">{product.discount}% OFF</span>
              )}
            </div>
            <div className="trending-product-info">
              <h3>{product.name}</h3>
              <div className="trending-product-price">
                <span className="price">₹{product.price}</span>
                {product.discount > 0 && (
                  <span className="original-price">₹{((product.price * 100) / (100 - product.discount)).toFixed(0)}</span>
                )}
              </div>
              <button 
                className="add-to-cart-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url
                  });
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center", width: "100%", color: "#999" }}>No trending products available</p>
      )}
    </div>

    <button
      className="trending-scroll-btn right"
      onClick={() => {
        const container = document.getElementById("trendingScroll");
        container.scrollBy({ left: 300, behavior: "smooth" });
      }}
    >
      &#8250;
    </button>
  </div>
    </div> */}
{/* end */}

<div className="shop-section">

<div className="section-header">
<h2 className="section-title">Trending Products</h2>

<button
className="view-all-btn"
onClick={() => navigate('/products?discount=high')}
>
View All
</button>

</div>

<div className="special-offer-grid">
{specialOffers.slice(0,6).map((item) => (

<div
key={item.id}
className="special-offer-card"
onClick={() => navigate(`/product/${item.id}`)}
>

{item.discount_percent > 0 && (
<div className="discount-badge">
{item.discount_percent}% OFF
</div>
)}

<img
className="product-image"
src={item.image_url
? `${API_BASE_URL}${item.image_url}`
: "/placeholder-product.png"}
alt={item.name}
loading="lazy"
/>

<h3>{item.name}</h3>
<p>₹{item.price}</p>

</div>

))}
</div>

</div>



      {/* Shop by Character */}
      <div className="shop-section">
        <h2 className="section-title">Shop by Character or Themes</h2>
        {tagsLoading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading characters...</p>
        ) : tags.length > 0 ? (
          <div className="character-carousel">
            <div className="character-scroll" id="characterScroll">
              {tags.map((char) => (
                <div
                  key={char.id}
                  className="character-item"
                  onClick={() => navigate(`/products?tag=${char.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {char.image ? (
                    <img 
                      src={`${API_BASE_URL}${char.image}`} 
                      alt={char.name}
                      onError={(e) => {
                        e.target.src = barbie; // Fallback image
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "200px",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      borderRadius: "8px"
                    }}>
                      No Image
                    </div>
                  )}
                  <p>{char.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>No characters/themes available yet</p>
        )}
      </div>

      <Footer />
      </div>
    </div>
  );
};

export default HomePage;