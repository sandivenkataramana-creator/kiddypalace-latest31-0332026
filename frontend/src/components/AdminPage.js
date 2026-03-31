import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./AdminPage.css";
import axios from "axios";
import { API_BASE_URL } from "./config";
import AnnouncementEditor from "./announcementEditor";
import Select from "react-select";

const getAdminHeaders = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};



const AdminPage = () => {
  const navigate = useNavigate();


   // ✅ State declarations
  const [products, setProducts] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadSearch, setUploadSearch] = useState("");


  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("add");
  // 🏷️ Brand states
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState(null);
  const [brands, setBrands] = useState([]);
  // 🏷️ Bulk brand upload states
const [brandFiles, setBrandFiles] = useState([]);
const [brandUploading, setBrandUploading] = useState(false);
const [brandMessage, setBrandMessage] = useState("");
// 🏷️ Brand edit states
const [editingBrandId, setEditingBrandId] = useState(null);
const [editingBrandName, setEditingBrandName] = useState("");
const [updatingBrand, setUpdatingBrand] = useState(false);


  const [adminUser, setAdminUser] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [excelFile, setExcelFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('');
  const [adminOrders, setAdminOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('all');
  const [announcement, setAnnouncement] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Multiple announcements management
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [editingAnnouncementText, setEditingAnnouncementText] = useState("");
  const [announcementSettings, setAnnouncementSettings] = useState({ displayDuration: 5000, gapDuration: 1000 });
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // Announcements helpers
  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/announcements`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
      if (data.settings) setAnnouncementSettings(data.settings);
    } catch (e) {
      console.error("Failed to load announcements", e);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return showToast('⚠️ Please enter announcement text', 'warn');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/settings/announcements`, { text: newAnnouncementText }, { headers: getAdminHeaders() });
      if (res.data && res.data.success) {
        showToast('✅ Announcement added', 'success');
        setNewAnnouncementText('');
        fetchAnnouncements();
        try { window.dispatchEvent(new Event('announcements-updated')); } catch {}
      }
    } catch (err) {
      console.error('Add announcement failed', err);
      showToast('❌ Failed to add announcement', 'error');
    }
  };

  const startEditAnnouncement = (ann) => {
    setEditingAnnouncementId(ann.id);
    setEditingAnnouncementText(ann.text);
  };

  const saveEditAnnouncement = async (id) => {
    if (!editingAnnouncementText.trim()) return showToast('⚠️ Please enter announcement text', 'warn');
    try {
      const res = await axios.put(`${API_BASE_URL}/api/settings/announcements/${id}`, { text: editingAnnouncementText }, { headers: getAdminHeaders() });
      if (res.data && res.data.success) {
        showToast('✅ Announcement updated', 'success');
        setEditingAnnouncementId(null);
        setEditingAnnouncementText('');
        fetchAnnouncements();
        try { window.dispatchEvent(new Event('announcements-updated')); } catch {}
      }
    } catch (err) {
      console.error('Update announcement failed', err);
      showToast('❌ Failed to update announcement', 'error');
    }
  };

  const deleteAnnouncement = (id) => {
    askConfirm('Are you sure you want to delete this announcement?', async () => {
      try {
        await axios.delete(`${API_BASE_URL}/api/settings/announcements/${id}`, { headers: getAdminHeaders() });
        showToast('✅ Announcement deleted', 'success');
        fetchAnnouncements();
        try { window.dispatchEvent(new Event('announcements-updated')); } catch {}
      } catch (err) {
        console.error('Delete announcement failed', err);
        showToast('❌ Failed to delete announcement', 'error');
      }
    });
  };

  const saveAnnouncementSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('⚠️ Please login as admin before saving settings', 'error');
        return;
      }
      const payload = {
        displayDuration: Number(announcementSettings.displayDuration) || 5000,
        gapDuration: Number(announcementSettings.gapDuration) || 1000
      };
      const res = await axios.put(`${API_BASE_URL}/api/settings/announcements/settings`, payload, { headers: getAdminHeaders() });
      if (res.data && res.data.success) {
        showToast('✅ Announcement settings saved', 'success');
        fetchAnnouncements();
        try { window.dispatchEvent(new Event('announcements-updated')); } catch {}
      }
    } catch (err) {
      console.error('Save announcement settings failed', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to save settings';
      showToast(`❌ ${msg}`, 'error');
    }
  };
  

    // 📝 About Page States
const [aboutContent, setAboutContent] = useState("");
const [savingAbout, setSavingAbout] = useState(false);
// 👔 Careers Page States
const [careersContent, setCareersContent] = useState("");
const [savingCareers, setSavingCareers] = useState(false);

// 🔹 Category → Subcategory → Products flow
const [selectedCategory, setSelectedCategory] = useState(null);
const [selectedSubcategory, setSelectedSubcategory] = useState(null);

// 🔍 Search states
const [subcategorySearch, setSubcategorySearch] = useState("");
const [productSearch, setProductSearch] = useState("");

// 📦 Products under selected subcategory
const [subcategoryProducts, setSubcategoryProducts] = useState([]);


  // 🎭 Tags Management States
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagSlugInput, setTagSlugInput] = useState("");
  const [tagImageFile, setTagImageFile] = useState(null);
  const [tagImagePreview, setTagImagePreview] = useState(null);
  const [addingTag, setAddingTag] = useState(false);
  const [tagMessage, setTagMessage] = useState("");
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null); // 🎭 For editing tags
  const [bulkBulkFile, setBulkBulkFile] = useState(null); // 🎭 For bulk upload
  const [bulkTagsLoading, setBulkTagsLoading] = useState(false); // 🎭 Bulk loading state
  const fileInputRef = useRef(null); // 🎭 Ref for file input
  const bulkFileInputRef = useRef(null); // 🎭 Ref for bulk file input

  // 🏬 Stores Management States
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [savingStore, setSavingStore] = useState(false);
  const [storeMessage, setStoreMessage] = useState('');
  const [storeForm, setStoreForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    image_url: '',
    open_hours: ''
  });
  const [storeImageFile, setStoreImageFile] = useState(null);
  const [storeImagePreview, setStoreImagePreview] = useState(null);
  
  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', kind: 'success' });
  const showToast = (message, kind = 'success', duration = 1200) => {
    setToast({ show: true, message, kind });
    setTimeout(() => setToast({ show: false, message: '', kind }), duration);
  };
  const [confirmState, setConfirmState] = useState({
    open: false,
    message: '',
    onConfirm: null,
  });
  const askConfirm = (message, onConfirm) => {
    setConfirmState({ open: true, message, onConfirm });
  };
  const handleConfirmYes = () => {
    const fn = confirmState.onConfirm;
    setConfirmState({ open: false, message: '', onConfirm: null });
    if (typeof fn === 'function') fn();
  };
  const handleConfirmNo = () => {
    setConfirmState({ open: false, message: '', onConfirm: null });
  };

  
// Bulk upload states (for products)
const [bulkFile, setBulkFile] = useState(null);
const [bulkMessage, setBulkMessage] = useState("");
const [bulkLoading, setBulkLoading] = useState(false);
const [acceptedReportUrl, setAcceptedReportUrl] = useState(null);
const [rejectedReportUrl, setRejectedReportUrl] = useState(null);
const [acceptedRowsPreview, setAcceptedRowsPreview] = useState([]);
const [rejectedRowsPreview, setRejectedRowsPreview] = useState([]);

// 📊 Upload History states
const [uploadHistory, setUploadHistory] = useState([]);
const [uploadHistoryLoading, setUploadHistoryLoading] = useState(false);
const [uploadHistoryPage, setUploadHistoryPage] = useState(1);
const [uploadHistoryTotal, setUploadHistoryTotal] = useState(0);

// Bulk delete states
const [deleteFile, setDeleteFile] = useState(null);
const [deleteMessage, setDeleteMessage] = useState("");
const [deleteLoading, setDeleteLoading] = useState(false);
const [deletedReportUrl, setDeletedReportUrl] = useState(null);
const [notFoundReportUrl, setNotFoundReportUrl] = useState(null);
const [deletedRowsPreview, setDeletedRowsPreview] = useState([]);
const [notFoundRowsPreview, setNotFoundRowsPreview] = useState([]);

// 📊 Fetch upload history
const fetchUploadHistory = async (page = 1) => {
  try {
    setUploadHistoryLoading(true);
    const url = `${API_BASE_URL}/api/upload-history?page=${page}&limit=10`;
    console.log('📊 Fetching upload history from:', url);
    
    const res = await fetch(url);
    const data = await res.json();
    
    console.log('📊 Upload history response:', data);
    
    if (data.success) {
      setUploadHistory(data.uploads || []);
      setUploadHistoryPage(page);
      setUploadHistoryTotal(data.pagination?.totalRecords || 0);
      console.log('✅ Upload history loaded:', data.uploads?.length, 'records');
    } else {
      console.error('❌ Upload history failed:', data.message);
    }
  } catch (err) {
    console.error('❌ Error fetching upload history:', err);
  } finally {
    setUploadHistoryLoading(false);
  }
};

// Fetch upload history on component mount
useEffect(() => {
  fetchUploadHistory(1);
}, []);

// 📥 Download report file
const downloadReportFile = (reportType, reportName) => {
  const url = `${API_BASE_URL}/api/upload-report/${reportType}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Delete an upload record
const deleteUploadRecord = (uploadId) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return showToast('⚠️ Please login as admin to delete records', 'error');

  askConfirm('Are you sure you want to delete this upload record? This will remove it from the database.', async () => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/upload-history/${uploadId}`, { headers: getAdminHeaders() });
      if (res.data && res.data.success) {
        showToast('✅ Upload record deleted', 'success');
        // refresh current page
        fetchUploadHistory(uploadHistoryPage);
      } else {
        showToast(res.data?.message || '❌ Failed to delete record', 'error');
      }
    } catch (err) {
      console.error('Delete upload record failed:', err);
      showToast('❌ Failed to delete upload record', 'error');
    }
  });
};

// Handle bulk product upload (Excel/CSV/TXT)
const handleBulkProductUpload = async (e) => {
  e.preventDefault();

  if (!bulkFile) {
    setBulkMessage("⚠️ Please select a file first.");
    return;
  }

  const token = localStorage.getItem('adminToken');
  if (!token) {
    setBulkMessage('⚠️ Access denied. Please login as admin before uploading.');
    return;
  }

  const formData = new FormData();
  formData.append("file", bulkFile);

  try {
    setBulkLoading(true);
    setBulkMessage("Uploading... ⏳");
    setAcceptedReportUrl(null);
    setRejectedReportUrl(null);

    const response = await axios.post(
      `${API_BASE_URL}/api/upload-excel`,
      formData,
      { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
    );

    if (response.data && response.data.success) {
      const saved = response.data.savedCount || 0;
      const updated = response.data.updatedCount || 0;
      const totalSaved = response.data.acceptedCount || saved + updated;
      setBulkMessage(`✅ Processed ${response.data.totalRows} rows. New saved: ${saved}, Updated: ${updated}, Rejected: ${response.data.rejectedCount}`);
      setAcceptedReportUrl(response.data.acceptedFileUrl);
      setRejectedReportUrl(response.data.rejectedFileUrl);
      setAcceptedRowsPreview(response.data.acceptedRows || []);
      setRejectedRowsPreview(response.data.rejectedRows || []);
      // Refresh product list if any saved/updated
      if (totalSaved > 0) fetchProducts();
      // Refresh upload history
      console.log('📊 Refreshing upload history after upload...');
      setTimeout(() => fetchUploadHistory(1), 500);
    } else {
      setBulkMessage('⚠️ Import completed with issues');
    }
  } catch (error) {
    console.error('Bulk import error:', error);
    // Show more actionable message on auth failure
    if (error?.response?.status === 401 || error?.response?.data?.message === 'Access denied. No token provided') {
      setBulkMessage('⚠️ Access denied. Please login as admin and retry.');
    } else {
      const msg = error?.response?.data?.message || '❌ Upload failed';
      setBulkMessage(msg);
    }
  } finally {
    setBulkLoading(false);
  }
};

// Handle bulk delete by product codes
const handleBulkDeleteUpload = async (e) => {
  e.preventDefault();

  if (!deleteFile) {
    setDeleteMessage("⚠️ Please select a file first.");
    return;
  }

  const token = localStorage.getItem('adminToken');
  if (!token) {
    setDeleteMessage('⚠️ Access denied. Please login as admin before uploading.');
    return;
  }

  const formData = new FormData();
  formData.append("file", deleteFile);

  try {
    setDeleteLoading(true);
    setDeleteMessage("Deleting... ⏳");
    setDeletedReportUrl(null);
    setNotFoundReportUrl(null);

    const response = await axios.post(
      `${API_BASE_URL}/api/bulk-delete`,
      formData,
      { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
    );

    if (response.data && response.data.success) {
      setDeleteMessage(`✅ Deleted ${response.data.deletedCount} products. Not found: ${response.data.notFoundCount}`);
      setDeletedReportUrl(response.data.deletedFileUrl);
      setNotFoundReportUrl(response.data.notFoundFileUrl);
      setDeletedRowsPreview(response.data.deletedRows || []);
      setNotFoundRowsPreview(response.data.notFoundRows || []);
      if ((response.data.deletedCount || 0) > 0) fetchProducts();
    } else {
      setDeleteMessage('⚠️ Bulk delete completed with issues');
    }
  } catch (error) {
    console.error('Bulk delete error:', error);
    if (error?.response?.status === 401) {
      setDeleteMessage('⚠️ Access denied. Please login as admin and retry.');
    } else {
      const msg = error?.response?.data?.message || '❌ Delete failed';
      setDeleteMessage(msg);
    }
  } finally {
    setDeleteLoading(false);
  }
};



// 🏷️ Handle brand file selection
const handleBrandFilesChange = (e) => {
  const files = Array.from(e.target.files || []);
  setBrandFiles(files);
};


 // ✅ Billing state
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedBillingProduct, setSelectedBillingProduct] = useState("");
  const [billingQuantity, setBillingQuantity] = useState(1);
  // Quick add to bag quantities per product in Manage tab
  const [quickAddQty, setQuickAddQty] = useState({});
  
  // New product form state
 const [newProduct, setNewProduct] = useState({
  product_name: '',
  product_price: '',
  product_brand: '',
  product_description: "",
  product_code: "",
  age_range: '',
  gender: '',
  specifications: '',
  product_details: '',
  brand_name: '',
  product_highlights: '',
  category_id: '',
  subcategory_id: '',
  stock_quantity: '',
  discount: '',
  mrp: ''

});

  const [newProductImages, setNewProductImages] = useState([]);
  
  // Edit stock state
  const [editingProductId, setEditingProductId] = useState(null);
  const [editStockValue, setEditStockValue] = useState('');

useEffect(() => {
  let hasAdminAccess = false;
  let adminData = null;

  // Method 1: Check for adminToken and adminUser (from AdminLogin)
  const adminToken = localStorage.getItem("adminToken");
  const admin = localStorage.getItem("adminUser");

  if (adminToken && admin) {
    try {
      const parsedAdmin = JSON.parse(admin);
      if (parsedAdmin?.role === "admin" || parsedAdmin?.role === "super_admin") {
        hasAdminAccess = true;
        adminData = parsedAdmin;
      }
    } catch (error) {
      // Ignore parse errors
    }
  }

  // Method 2: Check if user logged in via profile has admin role (from LoginPage)
  if (!hasAdminAccess) {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.role === "admin" || parsedUser?.role === "super_admin") {
          hasAdminAccess = true;
          adminData = parsedUser;
          // Also set adminToken and adminUser for consistency with other components
          localStorage.setItem("adminToken", token);
          localStorage.setItem("adminUser", JSON.stringify(parsedUser));
        }
      } catch (error) {
        // Ignore parse errors
      }
    }
  }

  if (!hasAdminAccess) {
    navigate("/admin/login");
    return;
  }

  // Set admin user data if found
  if (adminData) {
    setAdminUser(adminData);
  }

  fetchProducts(); // ✅ THIS fixes Manage Products (0)
  fetchTags(); // ✅ Fetch tags for tag management section
  // Fetch stores for admin stores tab
  if (typeof fetchStores === 'function') fetchStores();
}, [navigate]);




//const [categories, setCategories] = useState([]);
//const [subcategories, setSubcategories] = useState([]);
const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`);
    const data = await res.json();
    setCategories(data);
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

useEffect(() => {
  fetchCategories();
}, []);

const handleCategoryChange = (e) => {
  const categoryId = e.target.value;
  setNewProduct({ ...newProduct, category_id: categoryId });

  // fetch subcategories
  fetch(`${API_BASE_URL}/api/categories/${categoryId}/subcategories`)
    .then(res => res.json())
    .then(data => setSubcategories(data));
};

// Add category & subcategory handlers
const handleAddCategory = async (e) => {
  e.preventDefault();
  if (!newCategoryName.trim()) return showToast('⚠️ Category name required', 'error');
  const token = localStorage.getItem('adminToken');
  if (!token) return showToast('⚠️ Please login as admin', 'error');
  try {
    const res = await axios.post(`${API_BASE_URL}/api/categories`, { category_name: newCategoryName.trim() }, { headers: { Authorization: `Bearer ${token}` } });
    if (res.data?.success) {
      showToast('✅ Category added');
      setNewCategoryName('');
      fetchCategories();
      window.dispatchEvent(new Event('categories-updated'));
    } else {
      showToast(res.data?.message || 'Failed to add category', 'error');
    }
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to add category';
    showToast(msg, 'error');
  }
};

const handleAddSubcategory = async (e) => {
  e.preventDefault();
  if (!selectedParentCategoryId) return showToast('⚠️ Select parent category', 'error');
  if (!newSubcategoryName.trim()) return showToast('⚠️ Subcategory name required', 'error');
  const token = localStorage.getItem('adminToken');
  if (!token) return showToast('⚠️ Please login as admin', 'error');
  try {
    const res = await axios.post(`${API_BASE_URL}/api/subcategories`, { subcategory_name: newSubcategoryName.trim(), category_id: selectedParentCategoryId }, { headers: { Authorization: `Bearer ${token}` } });
    if (res.data?.success) {
      showToast('✅ Subcategory added');
      setNewSubcategoryName('');
      // If the added subcategory belongs to currently selected category in new product form, refresh subcategories
      if (newProduct.category_id === selectedParentCategoryId) {
        fetch(`${API_BASE_URL}/api/categories/${selectedParentCategoryId}/subcategories`)
          .then(res => res.json())
          .then(data => setSubcategories(data));
      }
      window.dispatchEvent(new Event('categories-updated'));
      // refresh local list too
      fetchSubcategories();
    } else {
      showToast(res.data?.message || 'Failed to add subcategory', 'error');
    }
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to add subcategory';
    showToast(msg, 'error');
  }
};

// Categories management: additional state & helpers
const [showCategoriesPanel, setShowCategoriesPanel] = useState(false);
const [categoriesSearch, setCategoriesSearch] = useState('');
const [allSubcategories, setAllSubcategories] = useState([]);
const [editing, setEditing] = useState(null); // { type: 'category'|'subcategory', id }
const [editName, setEditName] = useState('');
const [editParentCategoryId, setEditParentCategoryId] = useState('');
const [loadingCategoryAction, setLoadingCategoryAction] = useState(false);

const fetchSubcategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/subcategories`);
    const data = await res.json();
    setAllSubcategories(data);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
  }
};

useEffect(() => {
  // refresh subcategories when panel opens
  if (showCategoriesPanel) fetchSubcategories();
}, [showCategoriesPanel]);

// When user navigates to the Categories tab, refresh lists
useEffect(() => {
  if (activeTab === 'categories') {
    fetchCategories();
    fetchSubcategories();
    setCategoriesSearch('');
  }
}, [activeTab]);

// Start edit
const startEdit = (type, item) => {
  setEditing({ type, id: item.id });
  setEditName(item.name || '');
  setEditParentCategoryId(item.category_id || '');
};

const cancelEdit = () => {
  setEditing(null);
  setEditName('');
  setEditParentCategoryId('');
};

const saveEdit = async () => {
  if (!editing) return;
  const token = localStorage.getItem('adminToken');
  if (!token) return showToast('⚠️ Please login as admin', 'error');

  setLoadingCategoryAction(true);
  try {
    if (editing.type === 'category') {
      const res = await axios.put(`${API_BASE_URL}/api/categories/${editing.id}`, { category_name: editName }, { headers: getAdminHeaders() });
      if (res.data?.success) {
        showToast('✅ Category updated');
      } else {
        showToast(res.data?.message || 'Failed to update category', 'error');
      }
    } else if (editing.type === 'subcategory') {
      const res = await axios.put(`${API_BASE_URL}/api/subcategories/${editing.id}`, { subcategory_name: editName, category_id: editParentCategoryId }, { headers: getAdminHeaders() });
      if (res.data?.success) {
        showToast('✅ Subcategory updated');
      } else {
        showToast(res.data?.message || 'Failed to update subcategory', 'error');
      }
    }

    // Refresh lists
    fetchCategories();
    fetchSubcategories();
    window.dispatchEvent(new Event('categories-updated'));
    cancelEdit();
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to save';
    showToast(msg, 'error');
  } finally {
    setLoadingCategoryAction(false);
  }
};

const deleteItem = async (type, id) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return showToast('⚠️ Please login as admin', 'error');
  try {
    if (type === 'category') {
      const res = await axios.delete(`${API_BASE_URL}/api/categories/${id}`, { headers: getAdminHeaders() });
      if (res.data?.success) showToast('✅ Category deleted'); else showToast(res.data?.message || 'Failed to delete', 'error');
    } else {
      const res = await axios.delete(`${API_BASE_URL}/api/subcategories/${id}`, { headers: getAdminHeaders() });
      if (res.data?.success) showToast('✅ Subcategory deleted'); else showToast(res.data?.message || 'Failed to delete', 'error');
    }
    fetchCategories();
    fetchSubcategories();
    window.dispatchEvent(new Event('categories-updated'));
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to delete';
    showToast(msg, 'error');
  }
};

// 📦 Fetch products by subcategory
const fetchProductsBySubcategory = async (subcategoryId) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/products?subcategory_id=${subcategoryId}`
    );
    const data = await res.json();

    if (Array.isArray(data)) {
      setSubcategoryProducts(data);
    } else if (Array.isArray(data.products)) {
      setSubcategoryProducts(data.products);
    } else {
      setSubcategoryProducts([]);
    }
  } catch (err) {
    console.error('Error fetching products by subcategory:', err);
    setSubcategoryProducts([]);
  }
};






  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      // Add timestamp to force fresh data from server
      const response = await fetch(
  `${API_BASE_URL}/api/products?showAll=true&t=${Date.now()}`,
  {
    headers: getAdminHeaders(),
  }
);

      const data = await response.json();
      
      // if (data.success) {
      //   setProducts(data.products);
      //   // console.log('Products loaded:', data.products);
      // } else {
      //   setMessage('Failed to load products');
      // }
      if (Array.isArray(data)) {
  setProducts(data);
} else if (data.success && Array.isArray(data.products)) {
  setProducts(data.products);
} else {
  setProducts([]);
  setMessage("No products found");
}

    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('Error connecting to server. Make sure backend is running.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      setSelectedFiles([]);
      setMessage('');
      return;
    }

    const MAX_FILES = 5;
    let infoMessage = '';

    if (files.length > MAX_FILES) {
      infoMessage = `You can upload a maximum of ${MAX_FILES} images at a time.`;
    }

    const selected = files.slice(0, MAX_FILES);
    const oversized = selected.find((file) => file.size > 2 * 1024 * 1024);

    if (oversized) {
      setMessage('Each image must be less than 2MB.');
      e.target.value = '';
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(selected);
    setMessage(infoMessage);
  };

  // Delete a single image from selected files
  const handleDeleteSingleImage = (indexToDelete) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToDelete);
    setSelectedFiles(updatedFiles);
    
    // Reset file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    
    if (updatedFiles.length === 0) {
      setMessage('');
    }
  };

  // Delete all selected images
  const handleDeleteAllImages = () => {
    setSelectedFiles([]);
    setMessage('');
    
    // Reset file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleProductSelect = (e) => {
    setSelectedProductId(e.target.value);
    setMessage('');
  };

  // 🚀 Bulk upload images by product_code (filename)
const handleBulkImageUpload = async (e) => {
  e.preventDefault();

  if (selectedFiles.length === 0) {
    setMessage("⚠️ Please select images for bulk upload");
    return;
  }

  setLoading(true);
  const formData = new FormData();
  selectedFiles.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/products/bulk-images`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast("✅ Bulk images uploaded successfully!", "success", 1600);
      setSelectedFiles([]);
      setMessage("");
      document.getElementById("file-input").value = "";
      fetchProducts();
    } else {
      setMessage(data.message || "❌ Bulk upload failed");
    }
  } catch (err) {
    console.error("Bulk upload error:", err);
    showToast("❌ Error in bulk upload", "error", 1600);
  } finally {
    setLoading(false);
  }
};


  const handleUpload = async (e) => {
    e.preventDefault();

   if (selectedFiles.length === 0 || !selectedProductId) {
  setMessage('Please select a product for single upload, or use Bulk Upload.');
  return;
}


    setLoading(true);
    const formData = new FormData();
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => formData.append('images', file));
      formData.append('primaryImageIndex', '0');
    }
    try {
     const response = await fetch(`${API_BASE_URL}/api/products/${selectedProductId}/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: formData,
      });

      // const data = await response.json();

      let responseBody = '';
      let data = '' ;  

      try {
        responseBody = await response.text();
        data = responseBody ? JSON.parse(responseBody) : null;
      } catch (parseError) {
        console.warn('Unable to parse upload response as JSON:', parseError);
      }

      if (response.ok && data?.success) {
        setPopupMessage('Image uploaded successfully!');
        setShowPopup(true);
        // Hide popup after 1 seconds
        setTimeout(() => setShowPopup(false), 1000);
        setSelectedFiles([]);
        setSelectedProductId('');
        setMessage('');
        // Refresh products
        fetchProducts();
        // Reset file input
        document.getElementById('file-input').value = '';
      } else {
        const errorMessage = data?.message || responseBody || 'Failed to upload image';
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Error uploading image', 'error', 1600);
    } finally {
      setLoading(false);
    }
  };

  // Handle new product form changes
  const handleNewProductChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewProductImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      setNewProductImages([]);
      setMessage('');
      return;
    }

    const MAX_FILES = 5;
    let infoMessage = '';

    if (files.length > MAX_FILES) {
      infoMessage = `You can upload a maximum of ${MAX_FILES} images per product.`;
    }

    const selectedFiles = files.slice(0, MAX_FILES);
    const oversized = selectedFiles.find((file) => file.size > 2 * 1024 * 1024);

    if (oversized) {
      setMessage('Each image must be less than 2MB.');
      e.target.value = '';
      setNewProductImages([]);
      return;
    }

    setNewProductImages(selectedFiles);
    setMessage(infoMessage);
  };

 const handleAddProduct = async (e) =>{
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
      formData.append('name', newProduct.product_name);
      formData.append('product_code', newProduct.product_code || '');
    formData.append('description', newProduct.product_description || '');
    formData.append('price', newProduct.product_price);
    formData.append('category_id', newProduct.category_id || null);
    formData.append('subcategory_id', newProduct.subcategory_id || null);
    formData.append('stock_quantity', newProduct.stock_quantity || 0);
    formData.append('age_range', newProduct.age_range || '');
    formData.append('gender', newProduct.gender || '');
    formData.append('highlights', newProduct.product_highlights || '');
    formData.append('specifications', newProduct.specifications || '');
    formData.append('product_details', newProduct.product_details || '');
    formData.append('brand_name', newProduct.brand_name || '');
    formData.append('mrp', newProduct.mrp);
    formData.append('discount', newProduct.discount);


    if (newProductImages.length > 0) {
      newProductImages.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to add product');

    showToast('✅ Product added successfully!', 'success', 1200);
    setNewProduct({
      product_name: '',
      product_code: '',
      product_price: '',
      product_brand: '',
      description: '',
      age_range: '',
      gender: '',
      specifications: '',
    
      brand_name: '',
      product_highlights: '',
      category_id: '',
      subcategory_id: '',
      stock_quantity: '',
      discount: '',
      mrp: ''
    });
    setNewProductImages([]);
    document.getElementById('product_image').value = '';
    fetchProducts();
  } catch (error) {
    console.error('Error adding product:', error);
    showToast('❌ Error adding product: ' + error.message, 'error', 1600);
  } finally {
    setLoading(false);
  }
};

// 🏷️ Fetch brands
const fetchBrands = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/brands`);
    const data = await res.json();

    // ✅ Always set array
    if (Array.isArray(data)) {
      setBrands(data);
    } else if (Array.isArray(data.brands)) {
      setBrands(data.brands);
    } else {
      console.warn("Unexpected brands response:", data);
      setBrands([]);
    }
  } catch (err) {
    console.error("Failed to fetch brands", err);
    setBrands([]);
  }
};





// 🏷️ Bulk brand upload
const handleBulkBrandUpload = async (e) => {
  e.preventDefault();

  if (brandFiles.length === 0) {
    setBrandMessage("⚠️ Please select brand logo files");
    return;
  }

  try {
    setBrandUploading(true);
    setBrandMessage("Uploading brands...");

    const formData = new FormData();
    brandFiles.forEach((file) => {
      formData.append("logos", file);
    });

    // ✅ FIXED ENDPOINT
    const res = await fetch(`${API_BASE_URL}/api/brands/bulk`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setBrandMessage(`✅ ${data.message}`);
      setBrandFiles([]);
      fetchBrands();
    } else {
      setBrandMessage(data.message || "❌ Upload failed");
    }
  } catch (err) {
    console.error(err);
    setBrandMessage("❌ Error uploading brands");
  } finally {
    setBrandUploading(false);
  }
};

// 🎭 TAGS MANAGEMENT FUNCTIONS
const fetchTags = async () => {
  try {
    setLoadingTags(true);
    const res = await fetch(`${API_BASE_URL}/api/tags`);
    const data = await res.json();
    if (data.success) {
      setTags(data.tags || []);
    }
  } catch (err) {
    console.error("Error fetching tags:", err);
    showToast("❌ Failed to fetch tags", 'error');
  } finally {
    setLoadingTags(false);
  }
};

const handleAddTag = async (e) => {
  e.preventDefault();
  if (!tagInput.trim()) {
    showToast("⚠️ Please enter a tag name", 'warn');
    return;
  }

  try {
    setAddingTag(true);
    const authToken = localStorage.getItem("adminToken");
    
    // 🎭 Handle both add and edit
    if (editingTagId) {
      // UPDATE existing tag
      const formData = new FormData();
      formData.append('name', tagInput.trim());
      formData.append('slug', tagSlugInput.trim() || tagInput.trim().toLowerCase().replace(/\s+/g, '-'));
      if (tagImageFile && typeof tagImageFile === 'object' && tagImageFile.type) {
        formData.append('image', tagImageFile);
      }
      
      const res = await fetch(`${API_BASE_URL}/api/tags/${editingTagId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        showToast(`✅ Tag "${tagInput}" updated successfully!`, 'success');
        setTagInput("");
        setTagSlugInput("");
        setTagImageFile(null);
        setTagImagePreview(null);
        setEditingTagId(null);
        setShowTagForm(false);
        fetchTags();
      } else {
        showToast(`❌ ${data.message || "Failed to update tag"}`, 'error');
      }
    } else {
      // CREATE new tag
      const formData = new FormData();
      formData.append('name', tagInput.trim());
      formData.append('slug', tagSlugInput.trim() || tagInput.trim().toLowerCase().replace(/\s+/g, '-'));
      if (tagImageFile) {
        formData.append('image', tagImageFile);
      }
      
      const res = await fetch(`${API_BASE_URL}/api/tags`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        showToast(`✅ Tag "${tagInput}" added successfully!`, 'success');
        setTagInput("");
        setTagSlugInput("");
        setTagImageFile(null);
        setTagImagePreview(null);
        setShowTagForm(false);
        fetchTags();
      } else {
        showToast(`❌ ${data.message || "Failed to add tag"}`, 'error');
      }
    }
  } catch (err) {
    console.error("Error saving tag:", err);
    showToast("❌ Error saving tag", 'error');
  } finally {
    setAddingTag(false);
  }
};

const handleTagImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showToast("❌ Image size must be less than 5MB", 'error');
      return;
    }
    
    setTagImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setTagImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

const handleDeleteTag = (tagId, tagName) => {
  askConfirm(
    `Are you sure you want to delete the tag "${tagName}"? Products with this tag will still exist but won't have this tag assigned.`,
    async () => {
      try {
        const authToken = localStorage.getItem("adminToken");
        
        const res = await fetch(`${API_BASE_URL}/api/tags/${tagId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          showToast(`✅ Tag "${tagName}" deleted successfully!`, 'success');
          fetchTags();
        } else {
          showToast(`❌ ${data.message || "Failed to delete tag"}`, 'error');
        }
      } catch (err) {
        console.error("Error deleting tag:", err);
        showToast("❌ Error deleting tag", 'error');
      }
    }
  );
};

// 🎭 Handle Edit Tag
const handleEditTag = (tag) => {
  setEditingTagId(tag.id);
  setTagInput(tag.name);
  setTagSlugInput(tag.slug);
  setTagImagePreview(tag.image ? `${API_BASE_URL}${tag.image}` : null);
  setShowTagForm(true);
  // Scroll to form
  setTimeout(() => {
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
};

// 🎭 Handle Bulk Upload
const handleBulkUpload = async () => {
  if (!bulkBulkFile) {
    showToast("❌ Please select a file", 'error');
    return;
  }

  try {
    setBulkTagsLoading(true);
    const formData = new FormData();
    formData.append('file', bulkBulkFile);

    const authToken = localStorage.getItem("adminToken");
    const res = await fetch(`${API_BASE_URL}/api/tags/bulk-upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      showToast(`✅ ${data.message || "Tags uploaded successfully!"}`, 'success');
      setBulkBulkFile(null);
      bulkFileInputRef.current.value = '';
      fetchTags();
    } else {
      showToast(`❌ ${data.message || "Failed to upload tags"}`, 'error');
    }
  } catch (err) {
    console.error("Error uploading bulk tags:", err);
    showToast("❌ Error uploading tags", 'error');
  } finally {
    setBulkTagsLoading(false);
  }
};

// 🎭 Download Excel Template
const downloadExcelTemplate = () => {
  const csvContent = `name,slug,image_url
Marvel,marvel,/uploads/tags/marvel.jpg
DC,dc,/uploads/tags/dc.jpg
Disney Princess,disney-princess,/uploads/tags/disney.jpg
Harry Potter,harry-potter,/uploads/tags/harry.jpg`;
  
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
  element.setAttribute("download", "tags_template.csv");
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// 🏬 Stores Management - functions
const fetchStores = async () => {
  try {
    setLoadingStores(true);
    const res = await fetch(`${API_BASE_URL}/api/stores`);
    const data = await res.json();
    if (data && data.stores) setStores(data.stores);
    else setStores([]);
  } catch (err) {
    console.error('Error fetching stores:', err);
    showToast('❌ Failed to fetch stores', 'error');
    setStores([]);
  } finally {
    setLoadingStores(false);
  }
};

const handleStoreChange = (e) => {
  const { name, value } = e.target;
  setStoreForm({ ...storeForm, [name]: value });
};

const handleStoreImageChange = (e) => {
  const file = e.target.files?.[0] || null;
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      showToast('❌ Image must be less than 10MB', 'error');
      return;
    }
    setStoreImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setStoreImagePreview(reader.result);
    reader.readAsDataURL(file);
  } else {
    setStoreImageFile(null);
    setStoreImagePreview(null);
  }
};

const uploadStoreImage = async (storeId) => {
  if (!storeImageFile) return null;
  try {
    const authToken = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('image', storeImageFile);
    const res = await fetch(`${API_BASE_URL}/api/stores/${storeId}/image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });
    const data = await res.json();
    if (data.success && data.image_url) {
      return data.image_url;
    } else {
      showToast(`❌ ${data.message || 'Failed to upload image'}`, 'error');
      return null;
    }
  } catch (err) {
    console.error('Upload store image error', err);
    showToast('❌ Error uploading image', 'error');
    return null;
  }
};

const handleEditStore = (store) => {
  setEditingStoreId(store.id);
  setStoreForm({
    name: store.name || '',
    address: store.address || '',
    city: store.city || '',
    state: store.state || '',
    postal_code: store.postal_code || '',
    phone: store.phone || '',
    email: store.email || '',
    latitude: store.latitude || '',
    longitude: store.longitude || '',
    image_url: store.image_url || '',
    open_hours: store.open_hours || ''
  });
  // show existing image as preview if available
  if (store.image_url) {
    setStoreImagePreview(store.image_url.startsWith('http') ? store.image_url : `${API_BASE_URL}${store.image_url}`);
  } else {
    setStoreImagePreview(null);
  }
  setStoreImageFile(null);
  setShowStoreForm(true);
  setTimeout(() => { document.querySelector('.tab-content form')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
};

const handleDeleteStore = (storeId, storeName) => {
  askConfirm(`Are you sure you want to delete the store "${storeName}"?`, async () => {
    try {
      const authToken = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/stores/${storeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Store "${storeName}" deleted`, 'success');
        fetchStores();
      } else {
        showToast(`❌ ${data.message || 'Failed to delete store'}`, 'error');
      }
    } catch (err) {
      console.error('Delete store error:', err);
      showToast('❌ Error deleting store', 'error');
    }
  });
};

const handleStoreSubmit = async (e) => {
  e.preventDefault();
  if (!storeForm.name?.trim()) { showToast('⚠️ Name is required', 'warn'); return; }
  try {
    setSavingStore(true);
    const authToken = localStorage.getItem('adminToken');
    const method = editingStoreId ? 'PUT' : 'POST';
    const url = editingStoreId ? `${API_BASE_URL}/api/stores/${editingStoreId}` : `${API_BASE_URL}/api/stores`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(storeForm)
    });
    const data = await res.json();

    if (data.success) {
      // If image file present, upload it after creating/updating store
      let storeId = editingStoreId || data.storeId || data.storeId || data.insertId;
      // some endpoints return insertId or storeId; try to infer
      if (!storeId && !editingStoreId && data.storeId) storeId = data.storeId;

      if (!storeId) {
        // For update, we already know editingStoreId
        storeId = editingStoreId;
      }

      if (storeImageFile && storeId) {
        const uploaded = await uploadStoreImage(storeId);
        if (uploaded) {
          showToast('✅ Image uploaded', 'success');
          setStoreForm({ ...storeForm, image_url: uploaded });
        }
      }

      showToast(editingStoreId ? '✅ Store updated' : '✅ Store created', 'success');
      setStoreForm({ name: '', address: '', city: '', state: '', postal_code: '', phone: '', email: '', latitude: '', longitude: '', image_url: '', open_hours: '' });
      setStoreImageFile(null);
      setStoreImagePreview(null);
      setShowStoreForm(false);
      setEditingStoreId(null);
      fetchStores();
    } else {
      showToast(`❌ ${data.message || 'Failed to save store'}`, 'error');
    }
  } catch (err) {
    console.error('Save store error:', err);
    showToast('❌ Error saving store', 'error');
  } finally {
    setSavingStore(false);
  }
};

// Gift Card States
const [newGiftCard, setNewGiftCard] = useState({
  title: '',
  brand: '',
  sku: '',
  base_price: '',
  price_options: '',
  description: ''
});
const [giftCardImages, setGiftCardImages] = useState([]);

// Handle form input changes
const handleGiftCardChange = (e) => {
  setNewGiftCard({ ...newGiftCard, [e.target.name]: e.target.value });
};

// Handle image change
const handleGiftCardImageChange = (e) => {
  const files = Array.from(e.target.files || []);
  const valid = files.filter(f => f.size <= 2 * 1024 * 1024);
  if (valid.length !== files.length) {
    showToast("Each image must be less than 2MB", 'warn', 1600);
  }
  setGiftCardImages(valid);
};

// Handle Gift Card submit
const handleAddGiftCard = async (e) => {
  e.preventDefault();
  if (!giftCardImages || giftCardImages.length === 0) {
    showToast("Please upload at least one image", 'warn', 1600);
    return;
  }

  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("title", newGiftCard.title);
    formData.append("brand", newGiftCard.brand);
    formData.append("sku", newGiftCard.sku);
    formData.append("base_price", newGiftCard.base_price);
    formData.append("price_options", newGiftCard.price_options);
    formData.append("description", newGiftCard.description);
    giftCardImages.forEach((file) => formData.append("images", file));

    const response = await axios.post(`${API_BASE_URL}/api/giftcards`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.success) {
      showToast("🎁 Gift Card added successfully!", 'success', 1200);
      setNewGiftCard({
        title: '',
        brand: '',
        sku: '',
        base_price: '',
        price_options: '',
        description: ''
      });
      setGiftCardImages([]);
      // Refresh available gift cards below
      fetchGiftCards();
    } else {
      showToast(response.data.message || "Failed to add gift card", 'error', 1600);
    }
  } catch (error) {
    console.error("Gift Card Error:", error);
    showToast("Error adding gift card", 'error', 1600);
  } finally {
    setLoading(false);
  }
};


// 🎁 Manage Gift Cards State
const [giftCards, setGiftCards] = useState([]);
const [loadingGiftCards, setLoadingGiftCards] = useState(false);

// Fetch all gift cards
const fetchGiftCards = async () => {
  try {
    setLoadingGiftCards(true);
    const response = await axios.get(`${API_BASE_URL}/api/giftcards`);
    if (response.data.success) {
      setGiftCards(response.data.giftcards);
    } else {
      console.error("Failed to fetch gift cards");
    }
  } catch (error) {
    console.error("Error fetching gift cards:", error);
  } finally {
    setLoadingGiftCards(false);
  }
};

// Delete a gift card
const handleDeleteGiftCard = (id) => {
  askConfirm("Are you sure you want to delete this gift card?", async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/giftcards/${id}`);
      if (response.data.success) {
        showToast("Gift Card deleted successfully!", 'success', 1200);
        fetchGiftCards();
      } else {
        showToast(response.data.message || "Failed to delete gift card", 'error', 1600);
      }
    } catch (error) {
      console.error("Error deleting gift card:", error);
      showToast("Error deleting gift card", 'error', 1600);
    }
  });
};

// Load gift cards when Add Gift Card tab is active (so list shows below form)
useEffect(() => {
  if (activeTab === "giftcard") {
    fetchGiftCards();
  }
}, [activeTab]);

// Fetch all customer orders (no admin token required)
const fetchAdminOrders = async (status = ordersStatusFilter) => {
  setLoadingOrders(true);
  setOrdersError("");
  try {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE_URL}/api/orders${query}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error('Server returned invalid response. Please check the server logs.');
    }

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || `Failed to load orders: ${res.status} ${res.statusText}`);
    }
    
    setAdminOrders(Array.isArray(data.orders) ? data.orders : []);
  } catch (err) {
    console.error('Error fetching orders:', err);
    setOrdersError(err.message || 'Unable to fetch orders right now.');
  } finally {
    setLoadingOrders(false);
  }
};

// Load orders when Orders tab becomes active
useEffect(() => {
  if (activeTab === 'orders') {
    fetchAdminOrders();
  }
}, [activeTab]);

// Load brands when brands tab becomes active

useEffect(() => {
  if (activeTab === "brands") {
    fetchBrands();
  }
}, [activeTab]);




// Refetch when filter changes while on orders tab
useEffect(() => {
  if (activeTab === 'orders') {
    fetchAdminOrders(ordersStatusFilter);
  }
}, [ordersStatusFilter]);
useEffect(() => {
  setSelectedSubcategory(null);
  setSubcategoryProducts([]);
  setSubcategorySearch('');
  setProductSearch('');
}, [selectedCategory]);



const handleAcceptOrder = (orderId) => {
  askConfirm('Are you sure you want to accept this order?', async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned invalid response. Please check the server logs.');
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Failed to accept order: ${res.status} ${res.statusText}`);
      }
      
      showToast('✅ Order accepted successfully! Status changed from pending to accepted.', 'success', 2000);
      // Refresh orders to show updated status
      fetchAdminOrders();
    } catch (err) {
      console.error('Error accepting order:', err);
      showToast(err.message || 'Could not accept the order. Please try again later.', 'error', 2000);
    }
  });
};

const handleCancelOrder = (orderId) => {
  askConfirm('Are you sure you want to cancel this order?', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        showToast('Order cancelled successfully!', 'success', 2000);
        fetchAdminOrders(); // refresh list
      } else {
        showToast(data.message || 'Failed to cancel order', 'error', 2000);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      showToast('Something went wrong while cancelling the order', 'error', 2000);
    }
  });
};


  // Logout function
  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (adminToken) {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/');
    }
  };

  // Update stock quantity
  const handleUpdateStock = async (productId) => {
    if (!editStockValue || editStockValue < 0) {
      setMessage('Please enter a valid stock quantity');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_quantity: parseInt(editStockValue) }),
      });

      const data = await response.json();

      if (data.success) {
         // Set popup instead of just message
        setPopupMessage(`✅ Stock updated successfully to ${editStockValue} units!`);
        setShowPopup(true);

        // Hide popup after 2 seconds
      setTimeout(() => setShowPopup(false), 2000);

        setEditingProductId(null);
        setEditStockValue('');
        fetchProducts();
      } else {
        setMessage(data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Update stock error:', error);
      setMessage('Error updating stock');
    }
  };

  const startEditingStock = (productId, currentStock) => {
    setEditingProductId(productId);
    setEditStockValue(currentStock);
  };

  const cancelEditingStock = () => {
    setEditingProductId(null);
    setEditStockValue('');
  };

  // Delete product
  const handleDeleteProduct = (productId) => {
    askConfirm('Are you sure you want to delete this product?', async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          showToast('Product deleted successfully!', 'success', 1200);
          fetchProducts();
        } else {
          showToast(data.message || 'Failed to delete product', 'error', 1600);
        }
      } catch (error) {
        console.error('Delete error:', error);
        showToast('Error deleting product', 'error', 1600);
      }
    });
  };

    // Delete Brand Logo

//   const handleDeleteBrand = async (brandId) => {
//   askConfirm("Are you sure you want to delete this brand?", async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/brands/${brandId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//         },
//       });

//       const data = await res.json();

//       if (data.success) {
//         showToast("Brand deleted successfully!", "success", 1200);
//         fetchBrands(); // refresh brand list
//       } else {
//         showToast(data.message || "Failed to delete brand", "error", 1600);
//       }
//     } catch (err) {
//       console.error("Delete brand error:", err);
//       showToast("Error deleting brand", "error", 1600);
//     }
//   });
// };


const handleDeleteBrand = (brandId) => {
  askConfirm("Are you sure you want to delete this brand?", async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        showToast("Admin session expired. Please login again.", "error", 1600);
       navigate('/admin-login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/brands/${brandId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      showToast("✅ Brand deleted successfully!", "success", 1200);
      fetchBrands();
    } catch (err) {
      console.error("Delete brand error:", err);
      showToast(err.message || "Error deleting brand", "error", 1600);
    }
  });
};

// 🏷️ Handle edit brand name
const handleEditBrand = (brand) => {
  setEditingBrandId(brand.id);
  setEditingBrandName(brand.name);
};

// 🏷️ Handle save brand name
const handleSaveBrandName = async (brandId) => {
  if (!editingBrandName.trim()) {
    showToast("⚠️ Brand name cannot be empty", "error", 1200);
    return;
  }

  try {
    setUpdatingBrand(true);
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      showToast("Admin session expired. Please login again.", "error", 1600);
      navigate('/admin-login');
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/brands/${brandId}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: editingBrandName.trim() }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Update failed");
    }

    showToast("✅ Brand name updated successfully!", "success", 1200);
    setEditingBrandId(null);
    setEditingBrandName("");
    fetchBrands();
  } catch (err) {
    console.error("Update brand error:", err);
    showToast(err.message || "Error updating brand", "error", 1600);
  } finally {
    setUpdatingBrand(false);
  }
};

// 🏷️ Handle cancel edit
const handleCancelEditBrand = () => {
  setEditingBrandId(null);
  setEditingBrandName("");
};


  // Delete product image
  const handleDeleteProductImage = (productId) => {
    askConfirm('Are you sure you want to delete this image?', async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}/image`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          showToast('Image deleted successfully!', 'success', 1200);
          fetchProducts();
        } else {
          showToast(data.message || 'Failed to delete image', 'error', 1600);
        }
      } catch (error) {
        console.error('Delete image error:', error);
        showToast('Error deleting image', 'error', 1600);
      } finally {
        setLoading(false);
      }
    });
  };

  // Billing functions
  const handleAddToBill = () => {
    if (!selectedBillingProduct || billingQuantity <= 0) {
      setMessage('Please select a product and enter quantity');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedBillingProduct));
    if (!product) {
      setMessage('Product not found');
      return;
    }

    if (billingQuantity > product.stock_quantity) {
      setMessage(`Only ${product.stock_quantity} items available in stock`);
      return;
    }

    // Check if product already in bill
    const existingItemIndex = billItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      const updatedItems = [...billItems];
      updatedItems[existingItemIndex].quantity += billingQuantity;
      setBillItems(updatedItems);
    } else {
      // Add new item
      setBillItems([...billItems, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: billingQuantity,
      }]);
    }

    setSelectedBillingProduct('');
    setBillingQuantity(1);
    setMessage('');
  };

  // Quick add to bag from Manage tab card
  const handleQuickAddToBill = (productId) => {
    const qty = parseInt(quickAddQty[productId] ?? 1, 10);
    if (!qty || qty <= 0) {
      setMessage('Please enter a valid quantity');
      return;
    }

    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
      setMessage('Product not found');
      return;
    }

    if (qty > product.stock_quantity) {
      setMessage(`Only ${product.stock_quantity} items available in stock`);
      return;
    }

    const existingItemIndex = billItems.findIndex(item => item.id === product.id);
    if (existingItemIndex >= 0) {
      const updatedItems = [...billItems];
      updatedItems[existingItemIndex].quantity += qty;
      setBillItems(updatedItems);
    } else {
      setBillItems([...billItems, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: qty,
      }]);
    }

    setQuickAddQty(prev => ({ ...prev, [productId]: 1 }));
    setMessage('');
    setPopupMessage('Added to bag');
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 800);
  };

  const handleRemoveFromBill = (productId) => {
    setBillItems(billItems.filter(item => item.id !== productId));
  };

  const handleUpdateBillQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromBill(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock_quantity) {
      setMessage(`Only ${product.stock_quantity} items available in stock`);
      return;
    }

    setBillItems(billItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const calculateBillTotal = () => {
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // const gst = subtotal * 0.18;
    const total = subtotal;
    return { subtotal, total };
  };

  const handlePrintBill = () => {
    if (billItems.length === 0) {
      setMessage('Add items to the bill first');
      return;
    }

    const { subtotal, total } = calculateBillTotal();
    const billDate = new Date().toLocaleString();

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - Kiddy Palace</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
          }
          .bill-header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .bill-info {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          .text-right {
            text-align: right;
          }
          .total-section {
            margin-left: auto;
            width: 300px;
            border-top: 2px solid #333;
            padding-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .grand-total {
            font-weight: bold;
            font-size: 1.2em;
            border-top: 2px solid #333;
            margin-top: 10px;
            padding-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="bill-logoo">
      <div 
  class="bill-logoo" 
  style="display:flex; align-items:center; justify-content:center; text-align:center; gap:12px; width:100%;"
>
  
  <img
    src="/kp-logo copy.png"
    alt="Kiddy Palace Logo"
    style="width:70px; height:auto; display:block; margin-bottom:20px;"
  />

  <div class="header-text" style="display:flex; flex-direction:column; justify-content:center;">
    <h2 class="store-title" style="margin:0; font-size:22px;">Kiddy Palace STORE</h2>
    <p class="invoice-text" style="margin:2px 0 0; font-size:14px;">Tax Invoice</p>
  </div>

</div>
 <br>
        <div class="bill-info">
          <p><strong>Date:</strong> ${billDate}</p>
          ${customerName ? `<p><strong>Customer:</strong> ${customerName}</p>` : ''}
          ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
        </div>
      
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th class="text-right">Price (₹)</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${billItems.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td class="text-right">₹${item.price.toFixed(2)}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
         
          <div class="total-row grand-total">
            <span>Total Amount:</span>
            <span>₹${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>*** This is a computer generated invoice ***</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleClearBill = () => {
    if (billItems.length > 0 && !window.confirm('Are you sure you want to clear the bill?')) {
      return;
    }
    setBillItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setMessage('');
  };

// 🔍 Filter products for Upload tab search (by name or code)
// const filteredUploadProducts = products.filter((p) => {
//   const q = searchQuery.toLowerCase();
//   return (
//     p.name?.toLowerCase().includes(q) ||
//     p.product_code?.toLowerCase().includes(q)
//   );
// });
const filteredUploadProducts = products.filter((p) => {
  const q = uploadSearch.trim().toLowerCase();
  if (!q) return true; // show all if empty

  return (
    p.name?.toLowerCase().includes(q) ||
    p.product_code?.toLowerCase().includes(q)
  );
});

// ✅ Options for react-select in Upload tab
const uploadOptions = products.map((p) => ({
  value: p.id,
  label: `${p.product_code ? p.product_code + " - " : ""}${p.name} - ₹${p.price} (Stock: ${p.stock_quantity})`
}));


// 📥 Download Product Excel Template
const downloadProductTemplate = () => {
  const csvContent = `product_name,product_code,description,price,mrp,discount,brand_name,category_id,subcategory_id,stock_quantity,age_range,gender,highlights,specifications,product_details
Building Blocks Set,BB001,Colorful building blocks,499,599,10,Lego,1,2,50,3-5 Years,Unisex,Safe plastic blocks,100 pieces set,Best toy for kids
Toy Car,TC002,Remote control car,899,999,5,HotWheels,1,3,30,5-7 Years,Boys,Fast speed,Rechargeable battery,Durable design`;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
  );
  element.setAttribute("download", "product_template.csv");
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};


  return (
    <div className="admin-page">
      <Header />
      <main className="admin-content">
        <div className="admin-container">
          <div className="admin-header">
            <div>
              <h1>Admin Dashboard</h1>
              {adminUser && (
                <p className="admin-welcome">Welcome, {adminUser.full_name} ({adminUser.role})</p>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
  <button 
    className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
    onClick={() => { setActiveTab('add'); setMessage(''); }}
  >
    ➕ Add New Product
  </button>

  <button 
    className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
    onClick={() => { setActiveTab('upload'); setMessage(''); }}
  >
    📸 Upload Product Images
  </button>

  <button 
    className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
    onClick={() => { setActiveTab('manage'); setMessage(''); }}
  >
    📦 Manage Products
  </button>

  <button 
    className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
    onClick={() => { setActiveTab('billing'); setMessage(''); }}
  >
    💳 Billing (POS)
  </button>

  {/* ✅ New Gift Card Tab */}
  <button 
    className={`tab-btn ${activeTab === 'giftcard' ? 'active' : ''}`}
    onClick={() => { setActiveTab('giftcard'); setMessage(''); }}
  >
    🎁 Add Gift Card
  </button>

  <button 
    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
    onClick={() => { setActiveTab('orders'); setMessage(''); }}
  >
    📬 Orders
  </button>

  <button 
  className={`tab-btn ${activeTab === 'announcement' ? 'active' : ''}`}
  onClick={() => setActiveTab('announcement')}
  >
    📢 Announcement
  </button>


  <button 
   className={`tab-btn ${activeTab === 'announcement' ? 'active' : ''}`}
  onClick={() => setActiveTab("brands")}>
    Brands
  </button>

  <button 
    className={`tab-btn ${activeTab === 'tags' ? 'active' : ''}`}
    onClick={() => { setActiveTab('tags'); setTagMessage(''); }}
  >
    🎭 Manage Tags
  </button>

  <button
    className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
    onClick={() => { setActiveTab('stores'); setStoreMessage && setStoreMessage(''); fetchStores && fetchStores(); }}
  >
    🏬 Manage Stores
  </button>

<button 
  className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
  onClick={() => setActiveTab('about')}
>
  📝 Edit About Page
</button>

<button 
  className={`tab-btn ${activeTab === 'careers' ? 'active' : ''}`}
  onClick={() => setActiveTab('careers')}
>
  👔 Edit Careers Page
</button>


<button
  className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
  onClick={() => setActiveTab('categories')}
>
  🗂️ Categories
</button>

<button
  className={`tab-btn ${activeTab === 'bulkUploadHistory' ? 'active' : ''}`}
  onClick={() => { setActiveTab('bulkUploadHistory'); fetchUploadHistory(1); }}
>
  📊 Upload History
</button>

</div>


                   {/* Add New Product Tab */}
                   {activeTab === 'add' && (
            <div className="tab-content">
              <h2>Add New Product</h2>
              <form onSubmit={handleAddProduct} className="product-form">

                {/* Product Name */}
                <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product_name">Product Name *</label>
                  <input
                    type="text"
                    id="product_name"
                    name="product_name"
                    value={newProduct.product_name}
                    onChange={handleNewProductChange}
                    placeholder="e.g., Building Blocks Set"
                    required
                  />
                </div>

                <div className="form-group">
                    <label htmlFor="product_code">Product Code</label>
                    <input
                      type="text"
                      id="product_code"
                      name="product_code"
                      value={newProduct.product_code}
                      onChange={handleNewProductChange}
                      placeholder="Enter your product code"
                      // required
                    />
                  </div>
                    
                {/* Category & Subcategory */}
                
                  <div className="form-group">
                    <label htmlFor="category_id">Category *</label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={newProduct.category_id || ''}
                      onChange={handleCategoryChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.sno} value={cat.sno}>{cat.category_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subcategory_id">Subcategory *</label>
                    <select
                      id="subcategory_id"
                      name="subcategory_id"
                      value={newProduct.subcategory_id || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, subcategory_id: e.target.value })}
                      required
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map(sub => (
                        <option key={sub.sno} value={sub.sno}>{sub.subcategory_name}</option>
                      ))}
                    </select>
                  </div>
               

                {/* Descriptions and Details */}
                {/* <div className="form-row"> */}
                  <div className="form-group">
                    <label htmlFor="product_description">Description</label>
                    <textarea
                      id="product_description"
                      name="product_description"
                      value={newProduct.product_description}
                      onChange={handleNewProductChange}
                      placeholder="Enter product description..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="product_highlights">Product Highlights</label>
                    <textarea
                      id="product_highlights"
                      name="product_highlights"
                      value={newProduct.product_highlights}
                      onChange={handleNewProductChange}
                      placeholder="Enter product highlights..."
                      rows="3"
                    />
                  </div>

                 

                  <div className="form-group">
                    <label htmlFor="specifications">Product Specifications</label>
                    <textarea
                      id="specifications"
                      name="specifications"
                      value={newProduct.specifications}
                      onChange={handleNewProductChange}
                      placeholder="Enter product specifications..."
                      rows="3"
                    />
                  </div>


                  <div className="form-group">
                    <label htmlFor="brand_name">Brand Name</label>
                    <select
                      id="brand_name"
                      name="brand_name"
                      value={newProduct.brand_name}
                      onChange={handleNewProductChange}
                    >
                      <option value="">Select Brand</option>
                      <option value="Picasso">Picasso</option>
                      <option value="Linograph">Linograph</option>
                      <option value="Mattel">Mattel</option>
                      <option value="Sakura">Sakura</option>
                      <option value="Market">Market</option>
                      <option value="Maped">Maped</option>
                      <option value="3M">3M</option>
                      <option value="Apsara">Apsara</option>
                      <option value="DELI">DELI</option>
                      <option value="Camel">Camel</option>
                      <option value="CASIO">CASIO</option>
                      <option value="ABRO">ABRO</option>
                    </select>
                  </div>
                {/* </div> */}

                {/* Price, Stock, Age Range, Gender */}
              {/* <div className="form-row"> */}
                <div className="form-group">
                    <label htmlFor="mrp">MRP (₹) *</label>
                    <input
                      type="number"
                      id="mrp"
                      name="mrp"
                      value={newProduct.mrp}
                      onChange={handleNewProductChange}
                      placeholder="Enter MRP"
                      min="0"
                      // required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="discount">Discount (%) *</label>
                    <input
                      type="number"
                      id="discount"
                      name="discount"
                      value={newProduct.discount}
                      onChange={handleNewProductChange}
                      placeholder="Enter Discount Percentage"
                      min="0"
                      max="100"
                      // required
                    />
                  </div>

                
                  <div className="form-group">
                    <label htmlFor="product_price">Price (₹) *</label>
                    <input
                      type="number"
                      id="product_price"
                      name="product_price"
                      value={newProduct.product_price}
                      onChange={handleNewProductChange}
                      placeholder="Enter product price"
                      step="0.00"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock_quantity">Stock Quantity *</label>
                    <input
                      type="number"
                      id="stock_quantity"
                      name="stock_quantity"
                      value={newProduct.stock_quantity}
                      onChange={handleNewProductChange}
                      placeholder="Enter stock quantity"
                      min="0"
                      required
                    />
                  </div>

          

                  <div className="form-group">
                    <label htmlFor="age_range">Age Range</label>
                    <select
                      id="age_range"
                      name="age_range"
                      value={newProduct.age_range}
                      onChange={handleNewProductChange}
                    >
                      <option value="">Select Age Range</option>
                      <option value="0-18 Months">0-18 Months</option>
                      <option value="18-36 Months">18-36 Months</option>
                      <option value="3-5 Years">3-5 Years</option>
                      <option value="5-7 Years">5-7 Years</option>
                      <option value="7-9 Years">7-9 Years</option>
                      <option value="9-12 Years">9-12 Years</option>
                      <option value="12+ Years">12+ Years</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={newProduct.gender || ''}
                      onChange={handleNewProductChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                </div>
               
                
                {/* Product Image */}
                <div className="form-group" >
                  <div className="bulk-file-label">
                  <label htmlFor="product_image" >Product Images (Optional, up to 5 files, max 2MB each)</label>
                  <input
                    type="file"
                    id="product_image"
                    accept="image/*"
                    multiple
                    onChange={handleNewProductImageChange}
                  />
                  {newProductImages.length > 0 && (
                    <div className="file-info">
                      <p>✓ Selected {newProductImages.length} image{newProductImages.length > 1 ? 's' : ''}:</p>
                      <ul>
                        {newProductImages.map((file, index) => (
                          <li key={`${file.name}-${index}`}>
                            {file.name} ({(file.size / 1024).toFixed(0)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                </div>
                

                {/* Submit Button */}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? '⏳ Adding Product...' : '➕ Add Product'}
                </button>
              </form><br></br>
              <br></br>


              
             
              {/* Bulk Upload via Excel */}
              <div className="bulk-upload-section">
                <h3>📦 Bulk Upload via Excel</h3>
                <p className="bulk-info">
                  Upload multiple products at once using an Excel file (.xlsx or .xls)
                </p>

                <form onSubmit={handleBulkProductUpload} className="bulk-upload-form">
                  <label htmlFor="bulk-file" className="bulk-file-label">
                    {bulkFile ? bulkFile.name : "Choose file (.xlsx, .xls, .csv, .txt)"}
                  </label>
                  <input
                    id="bulk-file"
                    type="file"
                    accept=".xls,.xlsx,.csv,.txt,.tsv"
                    onChange={(e) => setBulkFile(e.target.files[0])}
                  />

                  <button type="submit" className="bulk-upload-btn" disabled={bulkLoading}>
                    {bulkLoading ? "Uploading..." : "Upload File"}
                  </button>
                </form>

                {bulkMessage && <p className="bulk-message">{bulkMessage}</p>}

                {bulkMessage && bulkMessage.includes('✅ Processed') && (
                  <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '6px'
                  }}>
                    <button
                      onClick={() => downloadReportFile('accepted', 'Accepted_Products')}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      📥 Download Accepted Products
                    </button>
                    <button
                      onClick={() => downloadReportFile('rejected', 'Rejected_Products')}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      📥 Download Rejected with Reasons
                    </button>
                  </div>
                )}
                


 <div className="excel-format-box">
                  <h4>🧾 Excel Format Example:</h4>
                  <ul>
                    <li><b>Required Columns:</b> name, description, price, brand_name, category, subcategory_id, stock_quantity</li>
                    <li><b>Optional Columns:</b> age_range, gender, highlights, specifications</li>
                    <li>Images can be added later manually.</li>
                  </ul>
                </div> 



<button
  type="button"
  onClick={downloadProductTemplate}
  style={{
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    marginBottom: "12px"
  }}
>
  📥 Download Excel Template
</button>

              </div>
            </div>
          )}

          {/* 📊 Bulk Upload History Tab */}
          {activeTab === 'bulkUploadHistory' && (
            <div className="tab-content">
              <h2>📊 Bulk Upload History</h2>
              
              {uploadHistoryLoading ? (
                <p>Loading upload history...</p>
              ) : uploadHistory.length === 0 ? (
                <p className="empty-state">No upload history found yet</p>
              ) : (
                <>
                  <div className="upload-history-table-wrapper">
                    <table className="upload-history-table">
                      <thead>
                        <tr>
                          <th>Upload Date</th>
                          <th>Total Rows</th>
                          <th>Accepted</th>
                          <th>Rejected</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadHistory.map((upload) => (
                          <tr key={upload.upload_id}>
                            <td>{new Date(upload.uploaded_at).toLocaleString()}</td>
                            <td>{upload.total_rows}</td>
                            <td className="success">{upload.accepted_rows}</td>
                            <td className="error">{upload.rejected_rows}</td>
                            <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              {upload.accepted_rows > 0 && (
                                <button
                                  onClick={() => downloadReportFile('accepted', `accepted_products_${upload.upload_id}`)}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                  }}
                                  title="Download accepted/inserted products"
                                >
                                  ✅ Accepted
                                </button>
                              )}
                              {upload.rejected_rows > 0 && (
                                <button
                                  onClick={() => downloadReportFile('rejected', `rejected_products_${upload.upload_id}`)}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                  }}
                                  title="Download rejected products with reasons"
                                >
                                  ❌ Rejected
                                </button>
                              )}
                              {/* Delete record */}
                              <button
                                onClick={() => deleteUploadRecord(upload.upload_id)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                                title="Delete upload history record"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Download Info */}
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#1e40af'
                  }}>
                    <strong>💡 Tip:</strong> Click the green <strong>✅ Accepted</strong> button to download successfully added products. Click the red <strong>❌ Rejected</strong> button to see why products were rejected with detailed reasons for each item.
                  </div>

                  {/* Pagination */}
                  {uploadHistoryTotal > 10 && (
                    <div className="pagination" style={{ marginTop: '20px' }}>
                      <button 
                        onClick={() => fetchUploadHistory(uploadHistoryPage - 1)}
                        disabled={uploadHistoryPage === 1}
                      >
                        ← Previous
                      </button>
                      <span>Page {uploadHistoryPage}</span>
                      <button 
                        onClick={() => fetchUploadHistory(uploadHistoryPage + 1)}
                        disabled={uploadHistoryPage * 10 >= uploadHistoryTotal}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}




          {/* Orders Tab */}
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="tab-content">
              <h2>Customer Orders {adminOrders.length > 0 ? `(${adminOrders.length})` : ''}</h2>

              {/* Filters */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                margin: '12px 0 20px 0',
                flexWrap: 'wrap'
              }}>
                <label style={{ fontWeight: 600 }}>Filter by status:</label>
                <select
                  value={ordersStatusFilter}
                  onChange={(e) => setOrdersStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white'
                  }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="accepted">Accepted</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {ordersStatusFilter !== 'all' && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      padding: '6px 12px',
                      background: '#eef2ff',
                      color: '#3730a3',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {ordersStatusFilter}
                    </span>
                    <button
                      onClick={() => setOrdersStatusFilter('all')}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {loadingOrders && <div style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>}
              {ordersError && !loadingOrders && <p style={{ color: 'red', padding: '20px' }}>{ordersError}</p>}

              {!loadingOrders && !ordersError && adminOrders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No orders found.</p>
                </div>
              )}

              {!loadingOrders && !ordersError && adminOrders.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {adminOrders.map(order => {
                    const orderDate = order.created_at 
                      ? new Date(order.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Unknown date';

                    const statusColors = {
                      pending: '#f59e0b',
                      accepted: '#10b981',
                      processing: '#3b82f6',
                      shipped: '#8b5cf6',
                      delivered: '#059669',
                      cancelled: '#ef4444'
                    };

                    return (
                      <div 
                        key={order.id} 
                        style={{
                          background: 'rgba(255, 247, 235, 0.92)',
                          borderRadius: '12px',
                          padding: '24px',
                          border: '1px solid rgba(182, 158, 106, 0.25)',
                          boxShadow: '0 4px 12px rgba(39, 60, 46, 0.08)'
                        }}
                      >

                        {/* Order header */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '20px',
                          paddingBottom: '16px',
                          borderBottom: '2px solid rgba(182, 158, 106, 0.3)'
                        }}>
                          <div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#273c2e', fontSize: '1.4rem' }}>
                              Order #{order.order_number}
                            </h3>
                            <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                              📅 Placed on: {orderDate}
                            </p>
                          </div>
                          <div style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            background: statusColors[order.order_status] || '#6b7280',
                            color: 'white',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            fontSize: '0.9rem'
                          }}>
                            {order.order_status || 'pending'}
                          </div>
                        </div>

                        {/* Customer info */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ margin: '0 0 12px 0', color: '#273c2e', fontSize: '1.1rem' }}>
                            👤 Customer Information
                          </h4>
                          <div style={{ 
                            background: 'white', 
                            padding: '16px', 
                            borderRadius: '8px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '12px'
                          }}>
                            <div><strong>Name:</strong> {order.shipping_full_name || 'N/A'}</div>
                            <div><strong>Email:</strong> {order.shipping_email || 'N/A'}</div>
                            <div><strong>Phone:</strong> {order.shipping_phone || 'N/A'}</div>
                          </div>
                        </div>

                        {/* Shipping */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ margin: '0 0 12px 0', color: '#273c2e', fontSize: '1.1rem' }}>
                            📍 Shipping Address
                          </h4>
                          <div style={{ 
                            background: 'white', 
                            padding: '16px', 
                            borderRadius: '8px',
                            lineHeight: '1.8'
                          }}>
                            {order.shipping_full_name && <div>{order.shipping_full_name}</div>}
                            <div>{order.shipping_address || 'N/A'}</div>
                            <div>
                              {order.shipping_city || ''}{order.shipping_state ? `, ${order.shipping_state}` : ''} {order.shipping_zip_code || ''}
                            </div>
                            <div>{order.shipping_country || 'India'}</div>
                          </div>
                        </div>

                        {/* Items */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ margin: '0 0 12px 0', color: '#273c2e', fontSize: '1.1rem' }}>
                            🛍️ Products Ordered
                          </h4>
                          <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
                            {Array.isArray(order.items) && order.items.length > 0 ? (
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ borderBottom: '2px solid #ede6d9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Product Name</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Quantity</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Price</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                      <td style={{ padding: '12px 10px' }}>{item.product_name}</td>
                                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>{item.quantity}</td>
                                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>₹{item.product_price}</td>
                                      <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600' }}>
                                        ₹{item.item_total}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p>No items found</p>
                            )}
                          </div>
                        </div>

                        {/* Summary */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ marginBottom: '12px' }}>💰 Order Summary</h4>
                          <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Subtotal:</span>
                              <span>₹{order.subtotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              {/* <span>GST (18%):</span>
                              <span>₹{order.gst_amount}</span> */}
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              borderTop: '2px solid #ede6d9',
                              marginTop: '10px',
                              paddingTop: '10px',
                              fontWeight: '700',
                              fontSize: '1.1rem'
                            }}>
                              <span>Total Amount:</span>
                              <span>₹{order.total_amount}</span>
                            </div>
                          </div>
                        </div>

                        

                        {order.order_status === 'pending' && (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
    
    {/* Cancel Button */}
    <button
      onClick={() => handleCancelOrder(order.id)}
      style={{
        padding: '12px 24px',
        background: '#ef4444',
        color: 'white',
        borderRadius: '8px',
        fontWeight: '600'
      }}
    >
      ✗ Cancel Order
    </button>

    {/* Accept Button */}
    <button
      onClick={() => handleAcceptOrder(order.id)}
      style={{
        padding: '12px 24px',
        background: '#10b981',
        color: 'white',
        borderRadius: '8px',
        fontWeight: '600'
      }}
    >
      ✓ Accept Order
    </button>

  </div>
)}

                        {order.order_status === 'accepted' && (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
    
    {/* Cancel Button */}
    <button
      onClick={() => handleCancelOrder(order.id)}
      style={{
        padding: '12px 24px',
        background: '#ef4444',
        color: 'white',
        borderRadius: '8px',
        fontWeight: '600'
      }}
    >
      ✗ Cancel Order
    </button>

  </div>
)}
</div>
    );
  })}
  </div>
              )}
            </div>
          )}

{/* 🌟 ANNOUNCEMENT TAB (NEW) */}
{activeTab === 'announcement' && (
  <div className="tab-content">
    <h2>📢 Top Announcements</h2>

    <div style={{ marginBottom: 12 }}>
      <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Enter announcement text (max 2000 chars)"
          value={newAnnouncementText}
          onChange={(e) => setNewAnnouncementText(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <button type="submit" className="submit-btn">➕ Add</button>
      </form>
    </div>

    <div style={{ marginTop: 12 }}>
      <h3>Existing Announcements ({announcements.length})</h3>

      {announcementsLoading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p style={{ color: '#666' }}>No announcements. Add one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {announcements.map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px', border: '1px solid #f1f5f9', borderRadius: 8 }}>
              {editingAnnouncementId === a.id ? (
                <>
                  <input
                    value={editingAnnouncementText}
                    onChange={(e) => setEditingAnnouncementText(e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                  <button onClick={() => saveEditAnnouncement(a.id)} className="save-stock-btn">Save</button>
                  <button onClick={() => { setEditingAnnouncementId(null); setEditingAnnouncementText(''); }} className="cancel-stock-btn">Cancel</button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>{a.text}</div>
                  <button onClick={() => startEditAnnouncement(a)} className="edit-stock-btn">✏️ Edit</button>
                  <button onClick={() => deleteAnnouncement(a.id)} className="delete-btn">🗑️ Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

  </div>
)}

{activeTab === 'about' && (
  <div className="tab-content">
    <h2>📝 Edit About Page</h2>

    <div className="form-group">
      <label>About Page Content</label>
      <textarea
        value={aboutContent}
        onChange={(e) => setAboutContent(e.target.value)}
        rows={10}
        placeholder="Write About page content here..."
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />
    </div>

    <button
      className="submit-btn"
      disabled={savingAbout}
      onClick={async () => {
        try {
          setSavingAbout(true);
          await axios.put(
            `${API_BASE_URL}/api/about`,
            { content: aboutContent },
            { headers: getAdminHeaders() }
          );
          showToast("✅ About page updated successfully!", "success");
        } catch {
          showToast("❌ Failed to update About page", "error");
        } finally {
          setSavingAbout(false);
        }
      }}
    >
      {savingAbout ? "Saving..." : "Save About Page"}
    </button>
  </div>
)}

{activeTab === "categories" && (
  <div className="tab-content categories-wrapper">

    {/* ADD CATEGORY */}
    <div className="category-section">
      <h3>➕ Add Category</h3>
      <form onSubmit={handleAddCategory} className="category-form">
        <input
          type="text"
          placeholder="Category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button>Add</button>
      </form>


      
    </div>

    {/* ADD SUBCATEGORY */}
    <div className="category-section">
      <h3>➕ Add Subcategory</h3>
      <form onSubmit={handleAddSubcategory} className="category-form">
        <select
          value={selectedParentCategoryId}
          onChange={(e) => setSelectedParentCategoryId(e.target.value)}
        >
          <option value="">Parent Category</option>
          {categories.map(c => (
            <option key={c.sno} value={c.sno}>
              {c.category_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Subcategory name"
          value={newSubcategoryName}
          onChange={(e) => setNewSubcategoryName(e.target.value)}
        />
        <button>Add</button>
      </form>
    </div>

   


    {/* CATEGORIES LIST */}

    {/* Search placed above the lists */}
    <div style={{ marginTop: 12, marginBottom: 6 }}>
      <input
        className="category-search"
        placeholder="🔍 Search categories or subcategories..."
        value={categoriesSearch}
        onChange={(e) => setCategoriesSearch(e.target.value)}
        style={{ padding: '10px 12px', width: '100%', borderRadius: 8, border: '1px solid #e5e7eb' }}
      />
    </div>

    <div className="category-section">
     

      {(() => {
        const q = categoriesSearch.trim().toLowerCase();
        if (!q) {
          return <div className="placeholder-box">📁 Categories</div>;
        }
        const matchedCats = categories.filter(c => c.category_name.toLowerCase().includes(q));
        if (matchedCats.length === 0) return <div>No categories found</div>;
        return matchedCats.map(cat => (
          <div key={cat.sno} className="category-row">
            {editing?.type === "category" && editing.id === cat.sno ? (
              <div className="category-edit">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button className="btn-save" onClick={saveEdit}>Save</button>
                <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <strong>{cat.category_name}</strong>
                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => startEdit("category", { id: cat.sno, name: cat.category_name })}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deleteItem("category", cat.sno)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ));
      })()}
    </div>

    {/* SUBCATEGORIES LIST */}
    <div className="category-section">
      

      {(() => {
        const q = categoriesSearch.trim().toLowerCase();
        if (!q) return <div className="placeholder-box">📁 Subcategories</div>;
        const matchedSubs = allSubcategories.filter(s => s.subcategory_name.toLowerCase().includes(q));
        if (matchedSubs.length === 0) return <div>No subcategories found</div>;
        return matchedSubs.map(sub => (
          <div key={sub.sno} className="category-row">
            {editing?.type === "subcategory" && editing.id === sub.sno ? (
              <div className="category-edit">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <select
                  value={editParentCategoryId}
                  onChange={(e) => setEditParentCategoryId(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.sno} value={c.sno}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
                <button className="btn-save" onClick={saveEdit}>Save</button>
                <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{sub.subcategory_name}</span>
                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => startEdit("subcategory", { id: sub.sno, name: sub.subcategory_name, category_id: sub.category_id })}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deleteItem("subcategory", sub.sno)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ));
      })()}
    </div>

  </div>
)}



{activeTab === 'careers' && (
  <div className="tab-content">
    <h2>👔 Edit Careers Page</h2>

    <div className="form-group">
      <label>Careers Page Content</label>
      <textarea
        value={careersContent}
        onChange={(e) => setCareersContent(e.target.value)}
        rows={10}
        placeholder="Write Careers page content here..."
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />
    </div>

    <button
      className="submit-btn"
      disabled={savingCareers}
      onClick={async () => {
        try {
          setSavingCareers(true);
          await axios.put(
            `${API_BASE_URL}/api/careers`,
            { content: careersContent },
            { headers: getAdminHeaders() }
          );
          showToast("✅ Careers page updated successfully!", "success");
        } catch {
          showToast("❌ Failed to update Careers page", "error");
        } finally {
          setSavingCareers(false);
        }
      }}
    >
      {savingCareers ? "Saving..." : "Save Careers Page"}
    </button>
  </div>
)}



          {/* Upload Images Tab */}
          {activeTab === 'upload' && (
            <div className="tab-content">
              <h2>Upload Product Images</h2>
              <form onSubmit={handleUpload} className="upload-form">
                <div className="form-group">
                  
                 <Select
                    options={uploadOptions}
                    isLoading={loadingProducts}
                    placeholder="Search & select product..."
                    value={uploadOptions.find(
                      (opt) => opt.value === Number(selectedProductId)
                    )}
                    onChange={(opt) => setSelectedProductId(opt ? opt.value : "")}
                    isClearable

                    /* 🔽 FIX: open menu upwards */
                    menuPlacement="top"

                    /* 🔽 FIX: render menu in body so footer can't overlap */
                    menuPortalTarget={document.body}

                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />

                </div>


            <div className="form-group" >
             <label htmlFor="file-input" className="upload-label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="upload-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                <polyline points="7 9 12 4 17 9" />
                <line x1="12" y1="4" x2="12" y2="16" />
              </svg>
              Upload Images
            </label>


              <input
                type="file"
                id="file-input"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                required
              
              />

              {selectedFiles.length > 0 && (
                    <div className="file-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <p style={{ margin: 0 }}>✓ Selected {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''}:</p>
                        <button
                          type="button"
                          onClick={handleDeleteAllImages}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}
                        >
                          🗑️ Delete All
                        </button>
                      </div>
                      <ul style={{ margin: '12px 0 0 0', listStyle: 'none', padding: 0 }}>
                        {selectedFiles.map((file, index) => (
                          <li key={`${file.name}-${index}`} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: '#f9f5f0',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            border: '1px solid #e5ddd4'
                          }}>
                            <span>{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingleImage(index)}
                              style={{
                                padding: '4px 8px',
                                background: '#fbbf24',
                                color: '#1f2937',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
            </div>



                <div className="upload-btn-group">
  {/* Single product upload */}
  <button type="submit" className="upload-btn" disabled={loading}>
    {loading ? '⏳ Uploading...' : '📸 Upload to Selected Product'}
  </button>

  {/* Bulk upload */}
  {/* <button
    type="button"
    className="upload-btn bulk-upload-btn"
    disabled={loading}
    onClick={handleBulkImageUpload}
  >
    🚀 Bulk Upload by Code
  </button> */}
</div>

              </form>
            </div>
          )}
{/* Manage Products Tab */}
{activeTab === "manage" && (
<div
  className="tab-content"
  style={{
    border: "none",
    padding: "0 20px",
    width: "100%",
    maxWidth: "100vw",   // 🔥 FORCE FULL SCREEN
  }}
>

    {/* Heading + Search */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: "18px",
      }}
    >
      <h2 style={{ margin: 0 }}>
        Manage Products (
        {products.filter((p) => {
          const name = (p.name || p.product_name || "").toLowerCase();
          const code = (p.product_code || "").toLowerCase();
          const query = searchQuery.toLowerCase();
          return name.includes(query) || code.includes(query);
        }).length}
        )
      </h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or product code..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: "10px 14px",
          width: "280px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          fontSize: "15px",
        }}
      />
    </div>

    {/* Product Grid */}
    <div className="products-grid">
      {products
        .filter((p) => {
          const name = (p.name || p.product_name || "").toLowerCase();
          const code = (p.product_code || "").toLowerCase();
          const query = searchQuery.toLowerCase();
          return name.includes(query) || code.includes(query);
        })

        .map((product) => (
          <div key={product.id} className="product-card-admin">
            <div className="product-image-section">
              
            {(() => {
  const rawImage =
    product.image ||
    product.image_url ||
    product.images?.[0]?.url ||
    product.images?.[0] ||
    "";

  // Normalize & validate
  let imageSrc = "";
  if (typeof rawImage === "string" && rawImage.trim() !== "") {
    imageSrc = rawImage.startsWith("http")
      ? rawImage
      : `${API_BASE_URL}${rawImage}`;
  }

  // ❌ Invalid / empty / broken → show No Image ONLY
  if (!imageSrc || imageSrc.includes("undefined")) {
    return <div className="no-image">📦 No Image</div>;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <img
        src={imageSrc}
        alt={product.name || product.product_name}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onError={(e) => {
          // stop retry loop completely
          e.currentTarget.onerror = null;
          e.currentTarget.style.display = "none";
        }}
      />

      <button
        onClick={() => handleDeleteProductImage(product.id)}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "rgba(239, 68, 68, 0.9)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          cursor: "pointer",
        }}
        title="Delete Image"
      >
        🗑️
      </button>
    </div>
  );
})()}


            </div>

            <div className="product-info-section">
              <h3>{product.name}</h3>

              {/* Quick Add */}
              <div
                className="quick-add-row"
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  margin: "6px 0 10px",
                }}
              >
                <input
                  type="number"
                  min="1"
                  value={quickAddQty[product.id] ?? 1}
                  onChange={(e) =>
                    setQuickAddQty((prev) => ({
                      ...prev,
                      [product.id]: parseInt(e.target.value || "1", 10),
                    }))
                  }
                  style={{
                    width: "72px",
                    padding: "6px 8px",
                    border: "1px solid #2e79e3 ",
                    borderRadius: "6px",
                  }}
                />

                <button
                  className="add-to-bag-btn"
                  onClick={() => handleQuickAddToBill(product.id)}
                  style={{
                    padding: "8px 12px",
                    background: "#E74C8B",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Add to Bag
                </button>
              </div>

              <p className="product-desc">{product.description}</p>

              <div className="product-meta">
                <span className="meta-item">💰 ₹{product.price}</span>
                <span className="meta-item">🎯 {product.age_range}</span>
              </div>

              {/* Stock Editing */}
              {editingProductId === product.id ? (
                <div className="stock-edit-section">
                  <label>Update Stock:</label>
                  <div className="stock-edit-controls">
                    <input
                      type="number"
                      min="0"
                      value={editStockValue}
                      onChange={(e) => setEditStockValue(e.target.value)}
                      className="stock-input"
                    />

                    <button
                      className="save-stock-btn"
                      onClick={() => handleUpdateStock(product.id)}
                    >
                      ✓ Save
                    </button>

                    <button
                      className="cancel-stock-btn"
                      onClick={cancelEditingStock}
                    >
                      ✗ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="stock-display">
                  <span className="meta-item stock-info">
                    📦 Stock: <strong>{product.stock_quantity}</strong> units
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="product-actions">
                <button
  className="edit-stock-btn"
  onClick={() => window.open(`/product/${product.id}`, "_blank")}
  style={{
    background: "#4CAF50",
    padding: "8px 12px",
  }}
>
  👁️ View Details
</button>

                {/* <button
                  className="edit-stock-btn"
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{
                    background: '#4CAF50',
                    padding: '8px 12px',
                  }}
                >
                  👁️ View Details
                </button> */}

                {editingProductId !== product.id && (
                  <button
                    className="edit-stock-btn"
                    onClick={() =>
                      startEditingStock(product.id, product.stock_quantity)
                    }
                  >
                    ✏️ Edit Stock
                  </button>
                )}

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  </div>
)}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            
            <div className="tab-content"
            style={{
              width:'1200px',
            }}>
             
              <h2>💳 Offline Billing (POS)</h2>
              
              <div className="billing-container">
                 
                {/* Left Section - Add Items */}
                <div className="billing-left">
                  <div className="currentbill">
                  <div className="customer-info-section">
                    <h3>Customer Information (Optional)</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="customer-name">Customer Name</label>
                        <input
                          type="text"
                          id="customer-name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                        />
                      
                      <div className="form-group">
                        <label htmlFor="customer-phone">Phone Number</label>
                        <input
                          type="tel"
                          id="customer-phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Enter phone number"
                        />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="add-item-section">
                    <h3>Add Items to Bill</h3>
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label htmlFor="billing-product-select">Select Product</label>
                        <select
                          id="billing-product-select"
                          value={selectedBillingProduct}
                          onChange={(e) => setSelectedBillingProduct(e.target.value)}
                        >
                          <option value="">-- Choose a Product --</option>
                          {products.filter(p => p.stock_quantity > 0).map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ₹{product.price} (Stock: {product.stock_quantity})
                            </option>
                          ))}
                        </select>
                      
                      <div className="form-group">
                        <label htmlFor="billing-quantity">Quantity</label>
                        <input
                          type="number"
                          id="billing-quantity"
                          value={billingQuantity}
                          onChange={(e) => setBillingQuantity(parseInt(e.target.value) || 1)}
                          min="1"
                        />
                         <div className="form-group" >
                        <button 
                          type="button" 
                          className="add-item-btn"
                          onClick={handleAddToBill}
                        >
                          ➕ Add to Bill
                        </button>
                        </div>
                      </div>
                     
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                {/* Right Section - Bill Display */}
                 
                <div className="billing-right">
                  <div className="bill-display">
                    <h3>Current Bill</h3>
                    
                   </div>
                    {billItems.length === 0 ? (
                      <div className="empty-bill">
                        <p>No items added yet</p>
                      </div>
                    ) : (
                      <>
                        <div className="bill-items">
                          <table className="bill-table">
                            <thead>
                              <tr>
                                
                                <th>Product</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {billItems.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.name}</td>
                                  <td>₹{item.price.toFixed(2)}</td>
                                  <td>
                                    <div className="quantity-controls">
                                      <button 
                                        onClick={() => handleUpdateBillQuantity(item.id, item.quantity - 1)}
                                        className="qty-btn"
                                      >
                                        −
                                      </button>
                                      <span>{item.quantity}</span>
                                      <button 
                                        onClick={() => handleUpdateBillQuantity(item.id, item.quantity + 1)}
                                        className="qty-btn"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                  <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                  <td>
                                    <button 
                                      onClick={() => handleRemoveFromBill(item.id)}
                                      className="remove-item-btn"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="bill-summary">
                          <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₹{calculateBillTotal().subtotal.toFixed(2)}</span>
                          </div>
                          {/* <div className="summary-row">
                            <span>GST (18%):</span>
                            <span>₹{calculateBillTotal().gst.toFixed(2)}</span>
                          </div> */}
                          <div className="summary-row total">
                            <span>Total Amount:</span>
                            <span>₹{calculateBillTotal().total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="bill-actions">
                          <button 
                            onClick={handlePrintBill}
                            className="print-btn"
                          >
                            🖨️ Print Bill
                          </button>
                          <button 
                            onClick={handleClearBill}
                            className="clear-btn"
                          >
                            🗑️ Clear Bill
                          </button>
                        </div>
                      </>
                    )}
                  
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'giftcard' && (
  <div className="tab-content">
    <div>
      <h2>🎁 Add Gift Card</h2>
    </div>
    
    <div>
      <form
        onSubmit={handleAddGiftCard}
        className="product-form"
        encType="multipart/form-data"
      >
        <div className="form-group">
          <div>
            <label>Gift Card Title *</label>
            <input
              type="text"
              name="title"
              value={newGiftCard.title}
              onChange={handleGiftCardChange}
              placeholder="e.g., The Toycra Gift Card"
              required
            />
          </div>

          <div>
            <label>Brand *</label>
            <input
              type="text"
              name="brand"
              value={newGiftCard.brand}
              onChange={handleGiftCardChange}
              placeholder="e.g., Toycra"
              required
            />
          </div>

         
      </div>

        <div className="form-group">
          <div>
            <label>SKU *</label>
            <input
              type="text"
              name="sku"
              value={newGiftCard.sku}
              onChange={handleGiftCardChange}
              placeholder="e.g., TG500"
              required
            />
          </div>
          
          <div>
            <label>Base Price *</label>
            <input
              type="number"
              name="base_price"
              value={newGiftCard.base_price}
              onChange={handleGiftCardChange}
              placeholder="500"
              required
          />
          </div>
        </div>

        <div className="form-group">
          <div>
            <label>Available Values (comma separated)</label>
            <input
              type="text"
              name="price_options"
              value={newGiftCard.price_options}
              onChange={handleGiftCardChange}
              placeholder="500,1000,2000,5000"
            />
          </div>

          <div>
            <label>Description *</label>
            <textarea
              name="description"
              value={newGiftCard.description}
              onChange={handleGiftCardChange}
              placeholder="Write a short description..."
              rows="3"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Upload Images *</label>
          <input type="file" accept="image/*" onChange={handleGiftCardImageChange} multiple required />
          {giftCardImages && giftCardImages.length > 0 && (
            <p className="file-info">{giftCardImages.length} file(s) selected</p>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Uploading...' : '🎁 Add Gift Card'}
        </button>
      </form>
    </div>

    {/* Available gift cards list */}
    <div style={{ marginTop: '24px' }}>
      <h3>Available Gift Cards</h3>
      {loadingGiftCards ? (
        <p>Loading gift cards...</p>
      ) : (
        <div className="products-grid">
          {giftCards.length === 0 ? (
            <p>No gift cards available.</p>
          ) : (
            giftCards.map((gc) => (
              <div key={gc.id} className="product-card-admin">
                <div className="product-image-section">
                  {gc.image_url ? (
                    <img src={`${API_BASE_URL}${gc.image_url}`} alt={gc.title} />
                  ) : (
                    <div className="no-image">📦 No Image</div>
                  )}
                </div>
                <div className="product-info-section">
                  <h3>{gc.title}</h3>
                  <div className="product-meta">
                    <span className="meta-item">Brand: {gc.brand}</span>
                    <span className="meta-item">SKU: {gc.sku}</span>
                  </div>
                  <div className="product-meta">
                    <span className="meta-item">
                      Price: ₹{(() => {
                        try {
                          const opts = gc.price_options ? JSON.parse(gc.price_options) : [];
                          if (Array.isArray(opts) && opts.length > 0) return Number(opts[0]);
                        } catch (_) {}
                        return Number(gc.base_price || 0);
                      })()}
                    </span>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteGiftCard(gc.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  </div>
  )}

{activeTab === "brands" && (
  <div className="tab-content">
    <h2>📦 Bulk Upload Brands</h2>

    <form onSubmit={handleBulkBrandUpload} className="product-form">

  <div className="form-group">

    {/* CLICKABLE BUTTON TO OPEN FILE PICKER */}
    <label
      htmlFor="brand-files"
      style={{
        display: "inline-block",
        padding: "14px 24px",
        background: "#2563eb",
        color: "#fff",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        marginBottom: "12px"
      }}
    >
      📁 Select Brand Logos
    </label>

    {/* REAL FILE INPUT (HIDDEN) */}
   <input
  id="brand-files"
  type="file"
  accept="image/*"
  multiple
  onChange={handleBrandFilesChange}
  style={{ display: "none" }}
/>


    {brandFiles.length > 0 && (
      <p className="file-info">
        ✅ {brandFiles.length} file(s) selected
      </p>
    )}
  </div>

  <button
    type="submit"
    className="submit-btn"
    disabled={brandUploading}
  >
    {brandUploading ? "Uploading..." : "🚀 Upload Brands"}
  </button>

  {brandMessage && (
    <p style={{ marginTop: "10px" }}>{brandMessage}</p>
  )}

</form>


    {/* <h3 style={{ marginTop: " 
    0px" }}>Existing Brands</h3> */}

    <h3 style={{ marginTop: "24px" }}>Existing Brands</h3>
    <div style={{ position: "relative", marginBottom: "20px" }}>
      {/* Left Scroll Button */}
      <button
        onClick={() => {
          const container = document.getElementById('brandsScrollContainer');
          if (container) {
            container.scrollBy({ left: -300, behavior: 'smooth' });
          }
        }}
        style={{
          position: "absolute",
          left: "0",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}
        title="Scroll Left"
      >
        ◀
      </button>

      {/* Right Scroll Button */}
      <button
        onClick={() => {
          const container = document.getElementById('brandsScrollContainer');
          if (container) {
            container.scrollBy({ left: 300, behavior: 'smooth' });
          }
        }}
        style={{
          position: "absolute",
          right: "0",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}
        title="Scroll Right"
      >
        ▶
      </button>

      {/* Brands Scroll Container */}
      <div id="brandsScrollContainer" className="brand-scroll" style={{
        paddingLeft: "50px",
        paddingRight: "50px",
        scrollBehavior: "smooth",
        display: "flex",
        gap: "15px",
        overflowX: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#ddd #f0f0f0"
      }}>
  {Array.isArray(brands) && brands.map((b) => (
    <div key={b.id} className="brand-item" style={{ position: "relative", minWidth: "150px", flexShrink: 0 }}>

      {/* ❌ DELETE BUTTON */}
      <button
        className="brand-delete-btn"
        onClick={() => handleDeleteBrand(b.id)}
        title="Delete Brand"
      >
        ✖
      </button>

      {/* ✏️ EDIT BUTTON */}
      <button
        className="brand-edit-btn"
        onClick={() => handleEditBrand(b)}
        title="Edit Brand Name"
        style={{
          position: "absolute",
          top: "8px",
          right: "32px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold",
          zIndex: 5,
        }}
      >
        ✏️
      </button>

      <img src={`${API_BASE_URL}${b.logo_url}`} alt={b.name} />
      
      {/* Show edit input if editing this brand */}
      {editingBrandId === b.id ? (
        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <input
            type="text"
            value={editingBrandName}
            onChange={(e) => setEditingBrandName(e.target.value)}
            placeholder="Enter brand name"
            style={{
              padding: "6px 8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          />
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => handleSaveBrandName(b.id)}
              disabled={updatingBrand}
              style={{
                flex: 1,
                padding: "4px 8px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: updatingBrand ? "not-allowed" : "pointer",
                opacity: updatingBrand ? 0.6 : 1,
              }}
            >
              {updatingBrand ? "..." : "Save"}
            </button>
            <button
              onClick={handleCancelEditBrand}
              disabled={updatingBrand}
              style={{
                flex: 1,
                padding: "4px 8px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: updatingBrand ? "not-allowed" : "pointer",
                opacity: updatingBrand ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p>{b.name}</p>
      )}
    </div>
  ))}
</div>
    </div>

  </div>
)}

{activeTab === "stores" && (
  <div className="tab-content">
    <h2>🏬 Manage Stores</h2>

    <div style={{ marginBottom: "20px", padding: "14px", backgroundColor: "#f8fafc", borderRadius: "10px" }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <button
          onClick={() => { setShowStoreForm(!showStoreForm); if (!showStoreForm && typeof fetchStores === 'function') fetchStores(); }}
          style={{ padding: '10px 18px', backgroundColor: showStoreForm ? '#dc2626' : '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          {showStoreForm ? '❌ Cancel' : '➕ Add New Store'}
        </button>

        <button
          onClick={() => fetchStores()}
          style={{ padding: '10px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          🔄 Refresh
        </button>

        {storeMessage && <div style={{ marginLeft: 10, color: storeMessage.includes('✅') ? '#10b981' : '#dc2626' }}>{storeMessage}</div>}
      </div>

      {showStoreForm && (
        <form onSubmit={handleStoreSubmit} style={{ marginTop: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Name *</label>
              <input name="name" value={storeForm.name} onChange={handleStoreChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>City</label>
              <input name="city" value={storeForm.city} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Address</label>
              <input name="address" value={storeForm.address} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>State</label>
              <input name="state" value={storeForm.state} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Postal Code</label>
              <input name="postal_code" value={storeForm.postal_code} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Phone</label>
              <input name="phone" value={storeForm.phone} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input name="email" value={storeForm.email} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Latitude</label>
              <input name="latitude" value={storeForm.latitude} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Longitude</label>
              <input name="longitude" value={storeForm.longitude} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Store Image (upload or URL)</label>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button type="button" onClick={() => document.getElementById('store-image-file')?.click()} style={{ padding: '10px 14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>📁 Upload Image</button>
                <input id="store-image-file" type="file" accept="image/*" onChange={handleStoreImageChange} style={{ display: 'none' }} />

                <input name="image_url" value={storeForm.image_url} onChange={handleStoreChange} placeholder="or enter image URL (optional)" style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
              </div>

              {storeImagePreview && (
                <div style={{ marginTop: 10 }}>
                  <img src={storeImagePreview} alt="Preview" style={{ maxWidth: 160, maxHeight: 120, objectFit: 'cover', borderRadius: 6, border: '2px solid #e6ffed' }} />
                  <div style={{ marginTop: 6 }}>
                    <button type="button" onClick={() => { setStoreImageFile(null); setStoreImagePreview(null); }} style={{ padding: '6px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Open Hours (optional)</label>
              <input name="open_hours" value={storeForm.open_hours} onChange={handleStoreChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button type="submit" disabled={savingStore} style={{ padding: '10px 20px', backgroundColor: savingStore ? '#999' : '#10b981', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700 }}>
              {savingStore ? 'Saving...' : (editingStoreId ? '✏️ Update Store' : '✅ Create Store')}
            </button>
            {editingStoreId && (
              <button type="button" onClick={() => { setEditingStoreId(null); setStoreForm({ name: '', address: '', city: '', state: '', postal_code: '', phone: '', email: '', latitude: '', longitude: '', image_url: '', open_hours: '' }); setShowStoreForm(false); }} style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700 }}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}
    </div>

    <div style={{ marginTop: 18 }}>
      <h3>Existing Stores ({stores.length})</h3>

      {loadingStores ? (
        <p>Loading stores...</p>
      ) : stores.length === 0 ? (
        <p style={{ color: '#666' }}>No stores yet. Add one above.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {stores.map(store => (
            <div key={store.id} style={{ padding: 14, borderRadius: 8, backgroundColor: '#fff', border: '1px solid #e6e6e6' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 110, height: 90, backgroundColor: '#fafafa', borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {store.image_url ? <img src={`${API_BASE_URL}${store.image_url}`} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display='none'} /> : <div style={{ color: '#888' }}>No Image</div>}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{store.name}</h4>
                  <p style={{ margin: '6px 0', color: '#666' }}>{store.address}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#999' }}>{store.city} {store.state} {store.postal_code}</p>
                  <p style={{ marginTop: 6, fontSize: 13 }}>{store.phone} {store.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => handleEditStore(store)} style={{ flex: 1, padding: 10, backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700 }}>✏️ Edit</button>
                <button onClick={() => handleDeleteStore(store.id, store.name)} style={{ flex: 1, padding: 10, backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700 }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{activeTab === "tags" && (
  <div className="tab-content">
    <h2>🎭 Manage Characters & Themes (Tags)</h2>

    {/* Add New Tag Form */}
    <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
      <button
        onClick={() => setShowTagForm(!showTagForm)}
        style={{
          padding: "12px 24px",
          backgroundColor: showTagForm ? "#dc2626" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          marginBottom: "15px",
          fontSize: "16px"
        }}
      >
        {showTagForm ? "❌ Cancel" : "➕ Add New Tag"}
      </button>

      {showTagForm && (
        <form onSubmit={handleAddTag} style={{ marginTop: "15px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Tag Name *
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g., Marvel, Disney, Barbie"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Tag Slug (Optional - auto-generated if blank)
            </label>
            <input
              type="text"
              value={tagSlugInput}
              onChange={(e) => setTagSlugInput(e.target.value)}
              placeholder="e.g., marvel, disney, barbie"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              required={false}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              🖼️ Tag Image (Optional - 5MB max)
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px dashed #2563eb",
                borderRadius: "6px",
                backgroundColor: "#f0f9ff",
                color: "#2563eb",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#e0f2fe";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#f0f9ff";
              }}
            >
              📁 {tagImageFile ? `📸 ${tagImageFile.name}` : "Click to Select Image"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleTagImageChange}
              style={{ display: "none" }}
            />
            {tagImagePreview && (
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <img 
                  src={tagImagePreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: "150px", 
                    maxHeight: "150px", 
                    borderRadius: "6px",
                    border: "2px solid #10b981"
                  }} 
                />
                <p style={{ fontSize: "12px", color: "#10b981", marginTop: "5px", fontWeight: "600" }}>
                  ✅ Image selected: {tagImageFile?.name}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={addingTag}
              style={{
                flex: 1,
                padding: "12px 24px",
                backgroundColor: addingTag ? "#999" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: addingTag ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "16px"
              }}
            >
              {addingTag ? "Adding..." : (editingTagId ? "✏️ Update Tag" : "✅ Add Tag with Image")}
            </button>
            {editingTagId && (
              <button
                type="button"
                onClick={() => {
                  setEditingTagId(null);
                  setTagInput("");
                  setTagSlugInput("");
                  setTagImageFile(null);
                  setTagImagePreview(null);
                }}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                ❌ Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {tagMessage && (
        <p style={{ marginTop: "10px", color: tagMessage.includes("✅") ? "#10b981" : "#dc2626" }}>
          {tagMessage}
        </p>
      )}
    </div>

    {/* 🎭 Bulk Upload Section */}
    <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#fef3c7", borderRadius: "10px", border: "2px solid #f59e0b" }}>
      <h3 style={{ marginTop: 0 }}>📊 Bulk Upload Tags (Excel)</h3>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
        Upload an Excel file with columns: <strong>name, slug, image_url</strong><br/>
        Download template: <a href="#" onClick={(e) => {
          e.preventDefault();
          downloadExcelTemplate();
        }} style={{ color: "#2563eb", textDecoration: "underline" }}>📥 Download Template</a>
      </p>
      <button
        type="button"
        onClick={() => bulkFileInputRef.current?.click()}
        style={{
          padding: "12px 24px",
          backgroundColor: "#f59e0b",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          marginBottom: "10px"
        }}
      >
        📁 Choose Excel File
      </button>
      <input
        ref={bulkFileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => setBulkBulkFile(e.target.files?.[0] || null)}
        style={{ display: "none" }}
      />
      {bulkBulkFile && (
        <div style={{ marginTop: "10px" }}>
          <p style={{ fontSize: "12px", color: "#666" }}>
            ✅ File selected: {bulkBulkFile.name}
          </p>
          <button
            type="button"
            onClick={handleBulkUpload}
            disabled={bulkTagsLoading}
            style={{
              padding: "10px 20px",
              backgroundColor: bulkTagsLoading ? "#999" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: bulkTagsLoading ? "not-allowed" : "pointer",
              fontWeight: "600"
            }}
          >
            {bulkTagsLoading ? "Uploading..." : "⬆️ Upload Tags"}
          </button>
        </div>
      )}
    </div>

    {/* Existing Tags List */}
    <div>
      <h3>Existing Tags ({tags.length})</h3>
      
      {loadingTags ? (
        <p>Loading tags...</p>
      ) : tags.length === 0 ? (
        <p style={{ color: "#666" }}>No tags yet. Create your first tag above!</p>
      ) : (
        <div style={{ position: "relative", marginTop: "15px" }}>
          {/* Left Scroll Button */}
          <button
            onClick={() => {
              const container = document.getElementById('tagsScrollContainer');
              if (container) {
                container.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
            style={{
              position: "absolute",
              left: "0",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}
            title="Scroll Left"
          >
            ◀
          </button>

          {/* Right Scroll Button */}
          <button
            onClick={() => {
              const container = document.getElementById('tagsScrollContainer');
              if (container) {
                container.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
            style={{
              position: "absolute",
              right: "0",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}
            title="Scroll Right"
          >
            ▶
          </button>

          {/* Tags Scroll Container */}
          <div
            id="tagsScrollContainer"
            style={{
              display: "flex",
              gap: "15px",
              overflowX: "auto",
              paddingRight: "50px",
              paddingLeft: "50px",
              scrollBehavior: "smooth",
              scrollbarWidth: "thin",
              scrollbarColor: "#ddd #f0f0f0"
            }}
          >
          {tags.map((tag) => (
            <div
              key={tag.id}
              style={{
                padding: "15px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minWidth: "280px",
                maxWidth: "280px",
                flexShrink: 0
              }}
            >
              {tag.image && (
                <img 
                  src={`${API_BASE_URL}${tag.image}`} 
                  alt={tag.name}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "6px"
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div>
                <h4 style={{ margin: "0 0 5px 0", color: "#1f2937" }}>{tag.name}</h4>
                <p style={{ margin: "0", fontSize: "12px", color: "#4b5563" }}>
 ID: {tag.id} </p>
                <p style={{ margin: "0", color: "#999", fontSize: "12px" }}>
                  slug: {tag.slug}
                </p>
              </div>
              
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleEditTag(tag)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px"
                  }}
                  title={`Edit ${tag.name} tag`}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px"
                  }}
                  title={`Delete ${tag.name} tag`}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}
        
        {/* Legacy small popup */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-box">
              <p>{popupMessage}</p>
            </div>
          </div>
        )}

        {/* Centered polished toast (unified across admin actions) */}
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
                  background:
                    toast.kind === 'error'
                      ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                      : toast.kind === 'warn'
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'linear-gradient(135deg, #6fbf8c, #4f8f70)',
                  color: '#fff7eb',
                  boxShadow:
                    toast.kind === 'error'
                      ? '0 8px 20px rgba(239,68,68,0.35)'
                      : toast.kind === 'warn'
                      ? '0 8px 20px rgba(245,158,11,0.35)'
                      : '0 8px 20px rgba(111,191,140,0.35)',
                  border: '2px solid rgba(255,255,255,0.55)'
                }}
              >
                {toast.kind === 'error' ? '!' : '✓'}
              </div>
              <div style={{ fontSize: 18, letterSpacing: 0.2, marginBottom: 4 }}>
                {toast.message}
              </div>
            </div>
          </div>
        )}

        {/* Centered confirm modal for destructive actions */}
        {confirmState.open && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.25)',
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
                width: 'min(92vw, 480px)',
                textAlign: 'center',
                animation: 'kpScaleIn 240ms ease-out',
                fontWeight: 700
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
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff7eb',
                  boxShadow: '0 8px 20px rgba(245,158,11,0.35)',
                  border: '2px solid rgba(255,255,255,0.55)'
                }}
              >
                !
              </div>
              <div style={{ fontSize: 18, letterSpacing: 0.2, marginBottom: 12 }}>
                {confirmState.message}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="save-stock-btn" onClick={handleConfirmYes} style={{ minWidth: 100 }}>
                  Yes
                </button>
                <button className="cancel-stock-btn" onClick={handleConfirmNo} style={{ minWidth: 100 }}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}


      </main>
      <Footer />
    </div>
  );
};

export default AdminPage