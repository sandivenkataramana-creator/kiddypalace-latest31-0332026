import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, User, Home, MapPin, ChevronDown, ChevronRight, Menu, X, Phone } from 'lucide-react';
import logo from '../components/assets/kp-logo.png';
import { API_BASE_URL } from "./config";
import './Header.css';
import { useRef } from 'react';


const Header = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showStoresDropdown, setShowStoresDropdown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  // Multiple announcements support
  const [announcements, setAnnouncements] = useState([]);
  const [announcementSettings, setAnnouncementSettings] = useState({ displayDuration: 5000, gapDuration: 1000 });
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  // const typingTimeout = useRef(null);
  const typingTimer = useRef(null);

// const HIDE_STORES_DELAY = 600;     
// const storesTimerRef = useRef(null); // timer for Our Stores dropdown
  useEffect(() => {
  const handleClickOutside = (e) => {
    const searchBox = document.querySelector('.mini-search');
    const searchIcon = document.querySelector('.icon.search-icon');

    // If clicking inside search box → DO NOTHING
    if (searchBox && searchBox.contains(e.target)) {
      return;
    }

    // If clicking search icon → DO NOTHING (toggle handled separately)
    if (searchIcon && searchIcon.contains(e.target)) {
      return;
    }

    // Otherwise close
    setSearchOpen(false);
  };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
    // ✅ Fetch user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data:", e);
        setUser(null);
      }
    }
  }, []);

  // Fetch categories and listen for updates
  useEffect(() => {
    const fetchCategories = () => {
      fetch(`${API_BASE_URL}/api/categories`)
        .then((res) => res.json())
        .then((data) => setCategories(data))
        .catch((err) => console.error('Error fetching categories:', err));
    };
    fetchCategories();

    const handler = () => fetchCategories();
    window.addEventListener('categories-updated', handler);
    return () => window.removeEventListener('categories-updated', handler);
  }, []);

  // Fetch brands
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/brands`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(data);
        }
      })
      .catch((err) => console.error('Error fetching brands:', err));
  }, []);

useEffect(() => {
  let mounted = true;
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/announcements`);
      const data = await res.json();
      if (!mounted) return;
      setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
      if (data.settings) setAnnouncementSettings(data.settings);
      setCurrentAnnouncementIndex(0);
      setAnnouncementVisible(true);
    } catch (e) {
      console.error("Failed to load announcements", e);
      // fallback to legacy single announcement
      try {
        const res2 = await fetch(`${API_BASE_URL}/api/settings/top-announcement`);
        const d2 = await res2.json();
        if (d2 && d2.announcement) {
          setAnnouncements([{ id: Date.now(), text: d2.announcement }]);
        }
      } catch (er) {
        // ignore
      }
    }
  };

  fetchAnnouncements();
  const handler = () => fetchAnnouncements();
  window.addEventListener('announcements-updated', handler);
  return () => { mounted = false; window.removeEventListener('announcements-updated', handler); };
}, []);

// Rotation: show one announcement at time, pause (gap) between them
// useEffect(() => {
//   if (!announcements || announcements.length === 0) return;

//   // If there's only one announcement, just show it (no timers)
//   if (announcements.length === 1) {
//     setCurrentAnnouncementIndex(0);
//     setAnnouncementVisible(true);
//     return;
//   }

//   // Use timers stored in refs so we can clear them reliably
//   const displayDuration = (announcementSettings && announcementSettings.displayDuration) || 5000;
//   const gapDuration = (announcementSettings && announcementSettings.gapDuration) || 1000;

//   let idx = 0;
//   let displayTimer = null;
//   let gapTimer = null;

//   const schedule = () => {
//     setCurrentAnnouncementIndex(idx);
//     setAnnouncementVisible(true);
//     displayTimer = setTimeout(() => {
//       setAnnouncementVisible(false);
//       gapTimer = setTimeout(() => {
//         idx = (idx + 1) % announcements.length;
//         schedule();
//       }, gapDuration);
//     }, displayDuration);
//   };

//   schedule();

//   return () => {
//     if (displayTimer) clearTimeout(displayTimer);
//     if (gapTimer) clearTimeout(gapTimer);
//   };
// }, [announcements, announcementSettings]);

  // Restore previous search state after navigation (prevents visual disappearance)

useEffect(() => {
  if (!announcements || announcements.length === 0) return;

  if (announcements.length === 1) {
    setCurrentAnnouncementIndex(0);
    return;
  }

  const displayDuration = announcementSettings?.displayDuration || 5000;
  const gapDuration = announcementSettings?.gapDuration || 1000;

  const timer = setTimeout(() => {
    setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
  }, displayDuration + gapDuration);

  return () => clearTimeout(timer);
}, [announcements, announcementSettings, currentAnnouncementIndex]);



  useEffect(() => {
  try {
    const savedQuery = sessionStorage.getItem('header.searchQuery');
    const savedOpen = sessionStorage.getItem('header.searchOpen');
    if (savedQuery) setSearchQuery(savedQuery);
    if (savedOpen === 'true') setSearchOpen(true);
  } catch (e) {
    // ignore sessionStorage errors
  }
}, []);

useEffect(() => {
  try {
    sessionStorage.setItem('header.searchQuery', searchQuery || '');
    sessionStorage.setItem('header.searchOpen', searchOpen ? 'true' : 'false');
  } catch (e) {}
}, [searchQuery, searchOpen]);

const toggleDropdown = (name) => {
  setActiveDropdown((prev) => (prev === name ? null : name));
};
const toggleStoresDropdown = () => {
  setShowStoresDropdown((prev) => !prev);
};

  const handleLoginClick = () => navigate('/login');
  const handleSignupClick = () => navigate('/signup');
  const handleLogout = () => {
  // 🔒 Clear USER auth
  localStorage.removeItem('user');
  localStorage.removeItem('token');

  // 🔒 Clear ADMIN auth (THIS WAS MISSING)
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');

  setUser(null);
  setShowAuthDropdown(false);

  // Inform app about auth change
  try {
    window.dispatchEvent(new Event('user-changed'));
  } catch {}

  setToast({ show: true, message: 'Logged out successfully!' });
  setTimeout(() => setToast({ show: false, message: '' }), 1200);
};


//   const handleStoresEnter = () => {
  
//   if (storesTimerRef.current) {
//     clearTimeout(storesTimerRef.current);
//     storesTimerRef.current = null;
//   }
//   setShowStoresDropdown(true);
// };

// const handleStoresLeave = () => {

//   if (storesTimerRef.current) {
//     clearTimeout(storesTimerRef.current);
//   }
//   storesTimerRef.current = setTimeout(() => {
//     setShowStoresDropdown(false);
//   }, HIDE_STORES_DELAY); // 👈 change this value for more/less time
// };

  const handleMouseEnter = async (categoryId) => {
    setHoveredCategory(categoryId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/subcategories`);
      const data = await res.json();
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCategory(null);
    setSubcategories([]);
  };

  const handleNavigateCategory = (subcategory) => {
  navigate(`/products/by-subcategory/${encodeURIComponent(subcategory)}`);

  setHoveredCategory(null);
  setSubcategories([]);
  setActiveDropdown(null);   // ✅ This closes the entire dropdown
};

  const handleGiftCardsClick = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/giftcards`);
      const data = await res.json();
      let cards = [];
      if (Array.isArray(data)) cards = data;
      else if (data && data.success && Array.isArray(data.giftcards)) cards = data.giftcards;
      if (cards.length > 0) {
        navigate(`/giftcards/${cards[0].id}`);
      } else {
        // Fallback to home if none
        navigate('/');
        
      }
    } catch (e) {
      navigate('/');
    }
  };

  const capitalizeFirstLetter = (text = "") => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};


  return (
    <header className="header">
      <div className="top-announcement-container">
        {/* 📞 Phone Number on the Left */}
        <div className="top-contact">
          <a href="tel:+917075004435" className="top-contact-link">
            <Phone size={13} style={{ marginRight: '6px', color: '#ff4d4d' }} />
            +91 70750 04435
          </a>
        </div>

        {/* 💥 Existing Sale Text */}
        <div className="announcement-wrapper">
     
<div
  key={currentAnnouncementIndex}
  className="top-announcement-text"
  aria-live="polite"
  aria-atomic="true"
>
  {announcements && announcements.length > 0
    ? announcements[currentAnnouncementIndex].text
    : ""}
</div>



        </div>

        {/* 🌐 Social Icons + Our Stores */}
        <div className="top-right-section">
          <div className="social-icons">
            <a href="https://kiddypalace.in/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://kiddypalace.in/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            {/* <a href="https://kiddypalace.in/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a> */}
            {/* <a href="https://kiddypalace.in/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-pinterest-p"></i>
            </a> */}
          </div>
         {/* 
          <div
            className="stores-dropdown-wrapper"
            onMouseEnter={() => setShowStoresDropdown(true)}
            onMouseLeave={() => setShowStoresDropdown(false)}
          >
            <button className="stores-dropdown-trigger">
              <Home size={16} style={{ marginRight: '6px' }} />
              Our Stores
            </button>
            {showStoresDropdown && (
              <div className="stores-dropdown">
                <div className="stores-dropdown-item">
                  <MapPin size={16} />
                  <span>Narsingi - 70750 04435</span>
                 
                </div>
                <div className="stores-dropdown-item">
                  <MapPin size={16} />
                   <span>Nanakramguda - 92912 55974</span>
                  
                </div>
                <div className="stores-dropdown-item">
                  <MapPin size={16} />
                  <span>Nallagandla - 70758 84435</span>
                </div>
              </div>
            )}
          </div> */}
          {/* <div
  className="stores-dropdown-wrapper"
  onMouseEnter={handleStoresEnter}
  onMouseLeave={handleStoresLeave}
>
  <button className="stores-dropdown-trigger">
    <Home size={16} style={{ marginRight: '6px' }} />
    Our Stores
  </button>

 {showStoresDropdown && (
  <div
    className="stores-dropdown"
    onMouseEnter={handleStoresEnter}
    onMouseLeave={handleStoresLeave}
  > */}
    {/* Narsingi */}
   {/* <div className="stores-dropdown-item">
 
  <a
    href="https://www.google.com/maps/search/?api=1&query=Kiddy+Palace+Narsingi"
    target="_blank"
    rel="noopener noreferrer"
    className="location-icon"
    onClick={(e) => e.stopPropagation()}  // keeps dropdown from closing on parent clicks
  >
    <MapPin size={16} />
  </a>

  <span className="store-text">Narsingi - 70750 04435</span>
   
</div> */}


    {/* Nanakramguda */}
   {/* <div className="stores-dropdown-item">
 
  <a
    href="https://maps.app.goo.gl/GhHuPQJrWw1n2XF98"
    target="_blank"
    rel="noopener noreferrer"
    className="location-icon"
    onClick={(e) => e.stopPropagation()}  // keeps dropdown from closing on parent clicks
  >
    <MapPin size={16} />
  </a>

\
  <span className="store-text">Nanakramguda - 92912 55974</span>

</div> */}

    {/* Nallagandla */}
    {/* <div className="stores-dropdown-item">
  
  <a
    href="https://maps.app.goo.gl/F2n5Bmf44XNTkgTG9"
    target="_blank"
    rel="noopener noreferrer"
    className="location-icon"
    onClick={(e) => e.stopPropagation()}  // keeps dropdown from closing on parent clicks
  >
    <MapPin size={16} />
  </a>


  <span className="store-text"> Nallagandla - 70758 84435</span>
</div>

  </div>
)}

</div> */}
 
 <div
  className="stores-dropdown-wrapper"
  onMouseEnter={() => setShowStoresDropdown(true)}   // 👈 open on hover
  onMouseLeave={() => setShowStoresDropdown(false)}  // 👈 close on leave
>
  <button className="stores-dropdown-trigger">
    <Home size={16} style={{ marginRight: '6px' }} />
    Our Stores
  </button>

  {showStoresDropdown && (
    <div className="stores-dropdown">
   
      <div className="stores-dropdown-item">
        
                {/* Narsingi */}
        <a
          href="https://www.google.com/maps/search/?api=1&query=Kiddy+Palace+Narsingi"
          target="_blank"
          rel="noopener noreferrer"
          className="location-icon"
        >
          <MapPin size={30} />
        </a>
        <span className="store-text">Narsingi - 70750 04435</span>
      </div>

       {/* Nanakramguda */}
      <div className="stores-dropdown-item">
        <a
          href="https://maps.app.goo.gl/GhHuPQJrWw1n2XF98"
          target="_blank"
          rel="noopener noreferrer"
          className="location-icon"
        >
          <MapPin size={30} />
        </a>
        <span className="store-text">Nanakramguda - 92912 55974</span>
      </div>
      {/* Nallagandla */}

      <div className="stores-dropdown-item">
        <a
          href="https://maps.app.goo.gl/F2n5Bmf44XNTkgTG9"
          target="_blank"
          rel="noopener noreferrer"
          className="location-icon"
        >
          <MapPin size={30} />
        </a>
        <span className="store-text">Nallagandla - 70758 84435</span>
      </div>
    </div>
  )} 
 
</div>


        </div>
      </div>
      



      {/* 🔶 Main Navbar */}
      <div className="main-navbar">
        {/* Logo */}
        <div className="navbar-left">
          <a href="/"><img src={logo} alt="KP Logo" className="logo-img" /></a>
        </div>

        {/* Center Menu */}
        <div className="nav-center">
          <ul className="nav-list">
            <li
  className="nav-item"
  onClick={() => navigate('/about')}
  style={{ cursor: 'pointer' }}
>
  About
</li>

<li
  className="nav-item"
  onClick={() => navigate('/products')}
  style={{ cursor: 'pointer' }}
>
  All Products
</li>


            {/* Age Dropdown */}
           <li className={`nav-item ${activeDropdown === 'age' ? 'dropdown-open' : ''}`}>
  <button
    className="nav-btn"
    onClick={() => toggleDropdown('age')}
    
  >
    
    Age
    <ChevronDown
      size={12}
      strokeWidth={2.2}
      className={`dropdown-arrow ${activeDropdown === 'age' ? 'rotate' : ''}`}
    />
  </button>

  {activeDropdown === 'age' && (
    <ul className="simple-dropdown">
      <li onClick={() => { navigate('/products?age=0-18 Months'); setActiveDropdown(null); }}>0-18 Months</li>
      <li onClick={() => { navigate('/products?age=18-36 Months'); setActiveDropdown(null); }}>18-36 Months</li>
      <li onClick={() => { navigate('/products?age=3-5 Years'); setActiveDropdown(null); }}>3-5 Years</li>
      <li onClick={() => { navigate('/products?age=5-7 Years'); setActiveDropdown(null); }}>5-7 Years</li>
      <li onClick={() => { navigate('/products?age=7-9 Years'); setActiveDropdown(null); }}>7-9 Years</li>
      <li onClick={() => { navigate('/products?age=9-12 Years'); setActiveDropdown(null); }}>9-12 Years</li>
      <li onClick={() => { navigate('/products?age=12+ Years'); setActiveDropdown(null); }}>12+ Years</li>
    </ul>
  )}
</li>

   
           
            <li className="nav-item" onClick={() => {
              navigate('/products?new=true')}}>
              New Arrivals
            </li>

            {/* Categories Dropdown */}
            <li
              className="nav-item categories-wrapper"
              onMouseEnter={() => setActiveDropdown('categories')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="nav-btn">
                Categories
                <ChevronDown
                  size={12}
                  strokeWidth={2.2}
                  className={`dropdown-arrow ${activeDropdown === 'categories' ? 'rotate' : ''}`}
                />
              </button>

              {activeDropdown === 'categories' && (
                <div className="categories-panel">
                  <div className="panel-left">
                    <ul className="panel-categories">
                      {categories.map((cat) => (
                        <li
                      key={cat.sno}
                      className={`panel-category ${hoveredCategory === cat.sno ? 'active' : ''}`}
                      onMouseEnter={() => handleMouseEnter(cat.sno)}
                      onClick={() => {
                        navigate(`/products/by-category/${cat.sno}`);
                        setActiveDropdown(null);
                        setHoveredCategory(null);
                        setSubcategories([]);
                      }}
                    >
                      {cat.category_name}
                      <ChevronRight size={12} className="sub-arrow" />
                    </li>

                      ))}
                    </ul>
                  </div>

                  <div className="panel-right">
                    {/* <div className="subheading">Subcategories</div> */}
                    <ul className="panel-subcategories">
                      {subcategories.length > 0 ? (
                        subcategories.map((sub) => (
                          <li
                            key={sub.sno}
                            onClick={() => {
                              handleNavigateCategory(sub.subcategory_name)}}
                          >
                            {sub.subcategory_name}
                            <ChevronRight size={11} className="sub-arrow" />
                          </li>
                        ))
                      ) : (
                        <li className="empty">Hover a category to view subcategories</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* Brand Dropdown */}
           <li
  className={`nav-item ${activeDropdown === 'brand' ? 'dropdown-open' : ''}`}
>
  <button
    className="nav-btn"
    onClick={() => toggleDropdown('brand')}
  >
    Brand
    <ChevronDown
      size={12}
      strokeWidth={2.2}
      className={`dropdown-arrow ${activeDropdown === 'brand' ? 'rotate' : ''}`}
    />
  </button>

  {activeDropdown === 'brand' && (
    <ul className="simple-dropdown brand-dropdown">
      {brands.length > 0 ? (
        brands.map((brand, index) => (
          <li 
            key={index}
            onClick={() => { navigate(`/products?brand=${encodeURIComponent(brand.name)}`); setActiveDropdown(null); }}
          >
          {capitalizeFirstLetter(brand.name)}

          </li>
        ))
      ) : (
        <li className="empty">Loading brands...</li>
      )}
    </ul>
  )}
</li>

{/* 
            <li className="nav-item" onClick={() => navigate('/products?sort=new')}>
              Characters and Themes
            </li> */}
        
   <li 
  className="nav-item"
  onClick={() => navigate('/products?hasTag=true')}
>
  Characters & Themes
</li>

           <li className="nav-item" onClick={() => navigate('/products?customized=true')}>
              Customized Products
            </li>

             <li className="nav-item" onClick={() => navigate('/products?discount=high')}>
              Special Offers
            </li>
            {/* <li className="nav-item" onClick={() => navigate('/giftCards')}>
              Gift Cards
            </li> */}
            {/* ✅ Role-Based Admin Access */}
            {user?.role === 'super_admin' && (
  <li className="nav-item" onClick={() => navigate('/admin')
}>
    Admin Dashboard
  </li>
)}

          </ul>
        </div>

        {/* Right Icons */}
        <div className="navbar-right">
          {/* Hamburger Menu - Mobile Only */}
          <div className="hamburger-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </div>

          {/* Search Icon */}
          <div className="icon search-icon" onClick={() => setSearchOpen((prev) => !prev)}>
            <Search size={22} />
          </div>

          {searchOpen && (
  <div className="mini-search">
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => {
  const value = e.target.value;
  setSearchQuery(value);

  // debounce navigation to avoid fast unmounts / flicker
  if (typingTimer.current) clearTimeout(typingTimer.current);
  typingTimer.current = setTimeout(() => {
    if (value.trim().length >= 2) {
      // navigate but keep the search box open
      navigate(`/products?search=${encodeURIComponent(value.trim())}`);
    } else if (value.trim().length === 0) {
      navigate('/products');
    }
    // don't close the search box
  }, 300); // 300ms debounce
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
          // immediate navigate on Enter (clear pending debounce)
          if (typingTimer.current) clearTimeout(typingTimer.current);
          navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`);
          // keep searchOpen true
        }
      }}
      autoFocus

    />
  </div>
)}

          {/* 👤 Profile Section */}
          <div className="auth-container">
            {/* Profile Icon */}
            <div
              className="icon"
              onClick={() => setShowAuthDropdown(!showAuthDropdown)}
            >
              <User size={22} />
            </div>

            {/* Dropdown Menu */}
            <div className={`auth-dropdown ${showAuthDropdown ? 'show' : ''}`}>
              {user ? (
                <>
                  <span className="user-greeting">
                    Hi, {user.firstName || user.fullName} {user.role === 'super_admin' && '(Admin)'}
                  </span>
                  <button
                    className="orders-btn"
                    onClick={() => {
                      navigate('/orders');
                      setShowAuthDropdown(false);
                    }}
                  >
                    My Orders
                  </button>

                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="login-btn" onClick={handleLoginClick}>
                    Login
                  </button>
                  <button className="signup-btn" onClick={handleSignupClick}>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cart */}
          <div
            className="cart-icon-wrapper"
            onClick={() => navigate('/cart')}
            style={{ cursor: 'pointer', position: 'relative', marginRight: '20px' }}
          > 
            <div className="cart-icon">
              <ShoppingCart size={22} color="BLACK" />
            </div>
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <ul className="mobile-nav-list">
              <li
  className="mobile-nav-item"
  onClick={() => {
    navigate('/about');
    setMobileMenuOpen(false);
  }}
>
  About
</li>
<li
  className="mobile-nav-item"
  onClick={() => {
    navigate('/products');
    setMobileMenuOpen(false);
  }}
>
  All Products
</li>



              {/* Age */}
              <li className="mobile-accordion-item">
                <div 
                  className="mobile-accordion-header" 
                  onClick={() => toggleDropdown('age')}
                >
                  <span>Age</span>
                  <ChevronDown size={16} className={`dropdown-arrow ${activeDropdown === 'age' ? 'rotate' : ''}`} strokeWidth={2.5} />
                </div>
                {activeDropdown === 'age' && (
                  <ul className="mobile-sub-menu">
                    <li onClick={() => { navigate('/products?age=0-18 Months'); setMobileMenuOpen(false); }}>0-18 Months</li>
                    <li onClick={() => { navigate('/products?age=18-36 Months'); setMobileMenuOpen(false); }}>18-36 Months</li>
                    <li onClick={() => { navigate('/products?age=3-5 Years'); setMobileMenuOpen(false); }}>3-5 Years</li>
                    <li onClick={() => { navigate('/products?age=5-7 Years'); setMobileMenuOpen(false); }}>5-7 Years</li>
                    <li onClick={() => { navigate('/products?age=7-9 Years'); setMobileMenuOpen(false); }}>7-9 Years</li>
                    <li onClick={() => { navigate('/products?age=9-12 Years'); setMobileMenuOpen(false); }}>9-12 Years</li>
                    <li onClick={() => { navigate('/products?age=12+ Years'); setMobileMenuOpen(false); }}>12+ Years</li>
                  </ul>
                )}
              </li>

              {/* New Arrivals */}
              <li className="mobile-nav-item" onClick={() => { navigate('/products?sort=new'); setMobileMenuOpen(false); }}>New Arrivals</li>

              {/* Categories */}
              <li className="mobile-accordion-item">
                <div 
                  className="mobile-accordion-header" 
                  onClick={() => toggleDropdown('categories')}
                >
                  <span>Categories</span>
                  <ChevronDown size={16} className={`dropdown-arrow ${activeDropdown === 'categories' ? 'rotate' : ''}`} strokeWidth={2.5} />
                </div>
                {activeDropdown === 'categories' && (
                  <ul className="mobile-sub-menu" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <li className="view-all-sub" onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}>All Categories</li>
                    {categories.map((cat) => (
                      <li key={cat.sno} onClick={() => { navigate(`/products/by-category/${cat.sno}`); setMobileMenuOpen(false); setActiveDropdown(null); }}>
                        {cat.category_name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {/* Brand */}
              <li className="mobile-accordion-item">
                <div 
                  className="mobile-accordion-header" 
                  onClick={() => toggleDropdown('brand')}
                >
                  <span>Brand</span>
                  <ChevronDown size={16} className={`dropdown-arrow ${activeDropdown === 'brand' ? 'rotate' : ''}`} strokeWidth={2.5} />
                </div>
                {activeDropdown === 'brand' && (
                  <ul className="mobile-sub-menu" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <li className="view-all-sub" onClick={() => { navigate('/products?brand='); setMobileMenuOpen(false); }}>All Brands</li>
                    {brands.map((brand, idx) => (
                      <li key={idx} onClick={() => { navigate(`/products?brand=${encodeURIComponent(brand.name)}`); setMobileMenuOpen(false); }}>
                        {brand.name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {/* Characters and Themes */}
              {/* <li className="mobile-nav-item" onClick={() => { navigate('/products?sort=new'); setMobileMenuOpen(false); }}>Characters & Themes</li> */}
              <li
  className="mobile-nav-item" onClick={() => { navigate('/products?hasTag=true'); setMobileMenuOpen(false); }}> Characters & Themes </li>

              {/* Customized Products */}
              <li className="mobile-nav-item" onClick={() => { navigate('/products?customized=true'); setMobileMenuOpen(false); }}>Customized Products</li>

              {/* Special Offers */}
              <li className="mobile-nav-item" onClick={() => { navigate('/products?discount=high'); setMobileMenuOpen(false); }}>Special Offers</li>

              {/* Gift Cards */}
              <li className="mobile-nav-item" onClick={() => { navigate('/giftCards'); setMobileMenuOpen(false); }}>Gift Cards</li>

              {/* Admin Dashboard */}
             {user?.role === 'super_admin' && (
  <li
    className="mobile-nav-item"
    onClick={() => { navigate('/admin/adminpage'); setMobileMenuOpen(false); }}
  >
    Admin Dashboard
  </li>
)}

            </ul>

            <div className="mobile-menu-divider"></div>

            {/* Auth Section (mobile): show only when user is authenticated */}
            <div className="mobile-auth-section">
              {user ? (
                <>
                  <div className="mobile-user-greeting">Hi, {user.firstName || user.fullName}</div>
                  <button className="mobile-auth-btn orders-btn" onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}>My Orders</button>
                  <button className="mobile-auth-btn orders-btn" onClick={() => { navigate('/manage-addresses'); setMobileMenuOpen(false); }}>Manage Addresses</button>
                  <button className="mobile-auth-btn logout-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Logout</button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Centered Popup Toast for logout */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(2px)'
          }}
        >
          <div
            style={{
              background: '#fff7eb',
              color: '#273c2e',
              border: '1px solid rgba(182, 158, 106, 0.35)',
              borderRadius: 18,
              boxShadow: '0 18px 40px rgba(39, 60, 46, 0.18)',
              padding: '24px 28px',
              width: 'min(92vw, 440px)',
              textAlign: 'center',
              transform: 'scale(1)',
              animation: 'kpScaleIn 240ms ease-out',
              fontWeight: 700,
              position: 'relative'
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                margin: '0 auto 12px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #6fbf8c, #4f8f70)',
                color: '#fff7eb',
                boxShadow: '0 8px 20px rgba(111,191,140,0.35)',
                border: '2px solid rgba(255,255,255,0.55)'
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 18, letterSpacing: 0.2, marginBottom: 4 }}>
              {toast.message}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#4f6354' }}>
              See you soon!
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
