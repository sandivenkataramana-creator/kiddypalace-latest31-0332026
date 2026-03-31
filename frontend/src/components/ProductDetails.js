import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams,  } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';   
import ProductEditModal from './ProductEditModal';
import { API_BASE_URL } from "./config";
import './ProductDetails.css';


const ProductDetails = () => {

//   const isAdmin = !!localStorage.getItem("adminToken");
// const isAdmin = !!localStorage.getItem("adminToken");
// const [images, setImages] = useState([]);
const [uploadImages, setUploadImages] = useState([]);
const [settingMainImage, setSettingMainImage] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [product, setProduct] = useState(() => (location.state && location.state.product) ? location.state.product : null);
  const [loading, setLoading] = useState(!((location.state && location.state.product)));
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [activeImage, setActiveImage] = useState(null);

  // ============ ALL HOOKS MUST BE HERE BEFORE ANY EARLY RETURNS ============

  // Admin check
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");

    // Must have BOTH
    if (!adminToken || !adminUser) {
      setIsAdminLoggedIn(false);
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminUser);

      // 🔒 STRICT ROLE CHECK (THIS WAS MISSING)
      if (parsedAdmin?.role === "admin" || parsedAdmin?.role === "super_admin") {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    } catch (error) {
      setIsAdminLoggedIn(false);
    }
  }, []);

  // Get productId
  const productId = useMemo(() => {
    if (location.state && location.state.product?.id) return location.state.product.id;
    if (params && params.id) return params.id;
    return null;
  }, [location.state, params]);

  // Keep product in sync with location state
  useEffect(() => {
    if (location.state && location.state.product) {
      setProduct(location.state.product);
    }
  }, [location.state]);

  // Fetch product by ID - ALWAYS fetch to get complete data including images
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        // Only show loading if we don't have product data yet
        if (!product) {
          setLoading(true);
        }
        const res = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch product");
        }

        setProduct(data.product);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Build imageSources from product
  const imageSources = useMemo(() => {
    if (!product) return [];
    
    // If product_images exists and is an array, use it
    if (Array.isArray(product.product_images) && product.product_images.length > 0) {
      return product.product_images.map((img, idx) => ({
        id: img.id ?? `img-${idx}`,
        url: `${API_BASE_URL}${img.image_url}`,
      }));
    }
    
    // Fallback: if only image_url exists, use that
    if (product.image_url) {
      return [{
        id: 'primary-image',
        url: `${API_BASE_URL}${product.image_url}`,
      }];
    }
    
    return [];
  }, [product]);

  // Set active image when imageSources changes
  useEffect(() => {
    if (imageSources.length > 0) {
      setActiveImage((prev) =>
        prev && imageSources.some((i) => i.id === prev.id)
          ? prev
          : imageSources[0]
      );
    } else {
      setActiveImage(null);
    }
  }, [imageSources]);

  // ============ HELPER FUNCTIONS ============



  // ============ CONDITIONAL RENDERS ============


  // Re-check admin status when navigating back to this component
  // useEffect(() => {
  //   const checkAdminLogin = () => {
  //     const adminToken = localStorage.getItem('adminToken');
  //     const adminUser = localStorage.getItem('adminUser');
  //     const user = localStorage.getItem('user');
      
  //     console.log('🔍 Re-checking admin on pathname change... token:', adminToken, 'adminUser:', adminUser, 'user:', user); // Debug log
      
  //     let isAdmin = false;
      
  //     // Check method 1: adminToken + adminUser
  //     if (adminToken && adminUser && adminUser !== 'undefined') {
  //       try {
  //         const parsedAdmin = JSON.parse(adminUser);
  //         isAdmin = !!parsedAdmin && (!!parsedAdmin.id || !!parsedAdmin.user_id);
  //         console.log('✅ Admin on pathname change (via token):', isAdmin); // Debug log
  //       } catch (e) {
  //         console.error('❌ Error on pathname change:', e); // Debug log
  //       }
  //     }
      
  //     // Check method 2: user with super_admin role
  //     if (!isAdmin && user && user !== 'undefined') {
  //       try {
  //         const parsedUser = JSON.parse(user);
  //         isAdmin = !!parsedUser && parsedUser.role === 'super_admin';
  //         console.log('✅ Admin on pathname change (via role):', isAdmin); // Debug log
  //       } catch (e) {
  //         console.error('❌ Error parsing user on pathname:', e); // Debug log
  //       }
  //     }
      
  //     setIsAdminLoggedIn(isAdmin);
  //   };
  //   checkAdminLogin();
  // }, [location.pathname]);

  // useEffect(() => {
  //   if (!productId) return;

  //   const needsRefresh =
  //     !product ||
  //     String(product.id) !== String(productId) ||
  //     !Array.isArray(product.imageGallery);

  //   if (!needsRefresh) return;

  //   const controller = new AbortController();
  //   const fetchProduct = async () => {
  //     try {
  //       if (!product) {
  //         setLoading(true);
  //       }
  //       const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, { signal: controller.signal });
  //       const data = await res.json();
  //       if (!res.ok || !data.success) {
  //         throw new Error(data.message || 'Failed to fetch product');
  //       }
  //       setProduct(data.product);
  //     } catch (e) {
  //       if (e.name !== 'AbortError') {
  //         setError(e.message || 'Failed to load product');
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchProduct();
  //   return () => controller.abort();
  // }, [productId, product]);

  if (loading) {
    return (
      <div className="no-product">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="no-product">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="no-product">
        <p>Product not found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // const images = product.images || [product.image]; // handle multiple images

  const handleImageUpload = async () => {
  if (!uploadImages || uploadImages.length === 0) {
    return;
  }

  const formData = new FormData();
  for (let img of uploadImages) {
    formData.append("images", img);
  }
const token = localStorage.getItem("adminToken");
if (!token) {
  alert("Admin session expired. Please login again.");
  return;
}

  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${product.id}/images`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
  },
  body: formData
});


    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");

    // 🔄 Fetch updated product (NO PAGE RELOAD)
    const refreshed = await fetch(
      `${API_BASE_URL}/api/products/${product.id}`
    ).then((r) => r.json());

    setProduct(refreshed.product);
    setUploadImages([]); // reset selection
  } catch (err) {
    alert(err.message);
  }
};

// useEffect(() => {
//   if (uploadImages.length > 0) {
//     handleImageUpload();
//   }
// }, [uploadImages]);

console.log("IMAGE GALLERY:", product?.product_images);



const handleDeleteImage = async (imageId) => {
  if (!window.confirm("Delete this image?")) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/products/${product.id}/images/${imageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Delete failed");

    // refresh product
    const refreshed = await fetch(
      `${API_BASE_URL}/api/products/${product.id}`
    ).then((r) => r.json());

    setProduct(refreshed.product);
    setActiveImage(null);
  } catch (err) {
    alert(err.message);
  }
};

// Set image as main/display image for product list
const handleSetMainImage = async (imageId) => {
  if (!product?.id) {
    alert("❌ Product ID not found");
    return;
  }

  setSettingMainImage(true);
  try {
    const url = `${API_BASE_URL}/api/products/${product.id}/set-main-image`;
    console.log("Setting main image with URL:", url);
    console.log("Image ID:", imageId);
    
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageId }),
    });

    const data = await res.json();
    console.log("Response:", data);
    
    if (!res.ok) throw new Error(data.message || "Failed to set main image");

    // refresh product
    const refreshed = await fetch(
      `${API_BASE_URL}/api/products/${product.id}`
    ).then((r) => r.json());

    setProduct(refreshed.product);
    alert("✅ Image set as display image!");
  } catch (err) {
    console.error("Error setting main image:", err);
    alert("❌ " + err.message);
  } finally {
    setSettingMainImage(false);
  }
};

const handleClearMainImage = async () => {
  if (!product?.id) {
    alert("❌ Product ID not found");
    return;
  }

  setSettingMainImage(true);
  try {
    const url = `${API_BASE_URL}/api/products/${product.id}/clear-main-image`;
    console.log("Clearing main image with URL:", url);
    
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log("Response:", data);
    
    if (!res.ok) throw new Error(data.message || "Failed to clear main image");

    // refresh product
    const refreshed = await fetch(
      `${API_BASE_URL}/api/products/${product.id}`
    ).then((r) => r.json());

    setProduct(refreshed.product);
    alert("✅ Display image cleared!");
  } catch (err) {
    console.error("Error clearing main image:", err);
    alert("❌ " + err.message);
  } finally {
    setSettingMainImage(false);
  }
};
// useEffect(() => {
//   if (imageSources.length > 0) {
//     setActiveImage((prev) =>
//       prev && imageSources.some((i) => i.id === prev.id)
//         ? prev
//         : imageSources[0]
//     );
//   } else {
//     setActiveImage(null);
//   }
// }, [imageSources]);




  return (
    <div className="product-details-page">
      <Header />

      <main className="product-details-content">
        {/* Breadcrumb */}
        {/* <div className="breadcrumb">
          <span onClick={() => navigate('/')}>Home</span> &gt; {product?.category || 'Category'} &gt; {product?.name || 'Product'}
        </div> */}

        {/* Product Section */}
        <div className="product-details-container">
          {/* Left: Images */}
          <div className="product-images">
          {/* <div className="thumbnails">
  {imageSources.map((img, i) => (
    <img
      key={i}
      src={img}
      alt={`thumb-${i}`}
      className={`thumbnail ${activeImage === img ? 'active' : ''}`}
      onClick={() => setActiveImage(img)}
    />
  ))} */}

<div className="thumbnails">
  {imageSources.map((img) => (
    <div key={img.id} className="thumbnail-wrapper">
      <img
        src={img.url}
        alt="thumbnail"
        className={`thumbnail ${
          activeImage?.id === img.id ? "active" : ""
        }`}
        onClick={() => setActiveImage(img)}
        onError={(e) => {
          console.error('Failed to load thumbnail:', img.url);
          e.target.src = '/images/ironman.jpg';
        }}
      />

      {/* �️ SET AS MAIN IMAGE BUTTON (ADMIN ONLY) */}
      {isAdminLoggedIn && (
        <button
          className="set-main-image-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleSetMainImage(img.id);
          }}
          disabled={settingMainImage}
          title="Set as display image for product list"
        >
          ⭐
        </button>
      )}

      {/* �🗑️ DELETE BUTTON (ADMIN ONLY) */}
     {isAdminLoggedIn && (
  <button
    className="delete-thumb-btn"
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteImage(img.id);
    }}
  >
    🗑️
  </button>
)}

    </div>
  ))}

  {isAdminLoggedIn && (
  <>
    <label className="thumbnail add-thumbnail">
      +
      <input
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={(e) =>
          setUploadImages(Array.from(e.target.files || []))
        }
      />
    </label>

    {uploadImages.length > 0 && (
      <button
        className="upload-btn"
        onClick={handleImageUpload}
      >
        Upload Images
      </button>
    )}

    {product?.image_url && (
      <button
        className="upload-btn clear-selection-btn"
        onClick={handleClearMainImage}
        disabled={settingMainImage}
        title="Remove the manually selected display image"
      >
        ❌ Clear Selection
      </button>
    )}
  </>
)}

</div>

  {/* ➕ Admin Add Image Button */}
  {/* {isAdminLoggedIn && (
    <label className="thumbnail add-thumbnail">
      +
      <input
  type="file"
  multiple
  accept="image/*"
  onChange={(e) => setUploadImages(Array.from(e.target.files))}
/>

    </label>
  )} */}
{/* </div> */}

           <div className="main-image">
  {activeImage ? (
    <img
      src={activeImage.url}
      alt={product?.name || 'Product image'}
      className="product-main-image"
      onError={(e) => {
        console.error('Failed to load image:', activeImage.url);
        e.target.src = '/images/ironman.jpg';
      }}
    />
  ) : (
    <div className="no-image-placeholder">
      📦 No Image
    </div>
  )}
</div>

          </div>

          {/* Right: Product Info */}
          <div className="product-info-section">
            {console.log('ProductDetails product:', product)}
            <h2 className="brand">{product.brand_name || product.brand || 'Brand Name'}</h2>
            <h1>{product.name}</h1>
            <p className="description">{product.description}</p>
           {/* <div className="product-meta">
  {product.age_range && (
    <p className="age-range">Age Range: {product.age_range}</p>
  )}

  {product.gender && (
    <p className="gender">Gender: {product.gender}</p>
  )}
</div> */}

           <div className="price-section">
  {(() => {
    const mrp = Number(product.mrp);
    const price = Number(product.price);
    if (mrp && price && mrp > price) {
      const discountPercent = Math.round(((mrp - price) / mrp) * 100);
      const saved = mrp - price;
      return (
        <>
          <span className="product-price" style={{ color: '#222', fontWeight: 'bold', fontSize: '2rem', marginRight: 8 }}>
            ₹{price.toFixed(2)}
          </span>
          <span className="product-mrp" style={{ textDecoration: 'line-through', color: '#888', marginRight: 8, fontSize: '1.2rem' }}>
            MRP ₹{mrp.toFixed(2)}
          </span>
          <span className="product-discount" style={{ color: 'green', marginRight: 8, fontWeight: 'bold', fontSize: '1.1rem' }}>
            {discountPercent}% off
          </span>
          <span className="product-saved" style={{ color: 'green', fontWeight: 'bold', fontSize: '1.1rem' }}>
            You Saved(₹{saved.toFixed(0)})
          </span>
        </>
      );
    }
    // No discount
    return (
      <span className="product-price" style={{ color: '#222', fontWeight: 'bold', fontSize: '2rem' }}>
        ₹{mrp || price}
      </span>
    );
  })()}
</div>




            <p className="stock-status">{product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</p>

            <div className="actions">
              <button className="add-btn" onClick={() => addToCart({ ...product, original_price: product.mrp })}>add to cart</button>
              <button className="buy-btn" onClick={() => navigate('/checkout', { state: { product } })}>Buy Now</button>
              {isAdminLoggedIn && (
  <button className="edit-btn" onClick={() => setShowEditModal(true)}>
    Edit Product
  </button>
)}

            </div>
          </div>
        </div>

        {/* ✅ Product Info (Dynamic from Database) */}
        <div className="product-info">
          <h2>{product.name}</h2>
         
        </div>





      </main>

      <Footer />

      {showEditModal && (
        <ProductEditModal
          product={product}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedProduct) => {
            setProduct(updatedProduct);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProductDetails;
