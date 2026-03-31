const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ✅ DEFINE JWT SECRET (FIX)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-admin-secret-key';

// Optional safety check
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

// =====================
// ADMIN LOGIN
// =====================
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const [admins] = await db.query(
      'SELECT * FROM admin_users WHERE (username = ? OR email = ?) AND is_active = true',
      [username, username]
    );

    if (!admins.length) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const admin = admins[0];

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await db.query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete admin.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        last_login: admin.last_login
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// =====================
// VERIFY ADMIN TOKEN
// =====================
const verifyAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const [admins] = await db.query(
      'SELECT id, username, email, full_name, role, last_login FROM admin_users WHERE id = ? AND is_active = true',
      [decoded.id]
    );

    if (!admins.length) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin not found'
      });
    }

    res.json({ success: true, admin: admins[0] });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// =====================
// ADMIN LOGOUT
// =====================
const adminLogout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    await db.query(
      'UPDATE admin_users SET updated_at = NOW() WHERE id = ?',
      [decoded.id]
    );

    res.json({ success: true, message: 'Logout successful' });
  } catch {
    res.json({ success: true, message: 'Logout successful' });
  }
};

// =====================
// CHANGE PASSWORD
// =====================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const [admins] = await db.query(
      'SELECT * FROM admin_users WHERE id = ? AND is_active = true',
      [decoded.id]
    );

    if (!admins.length) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const admin = admins[0];

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE admin_users SET password = ? WHERE id = ?',
      [hashedPassword, admin.id]
    );

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

// =====================
// CREATE ADMIN
// =====================
const createAdmin = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const [requesters] = await db.query(
      'SELECT role FROM admin_users WHERE id = ?',
      [decoded.id]
    );

    if (!requesters.length || requesters[0].role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can create new admins'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO admin_users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, role || 'admin']
    );

    res.json({
      success: true,
      message: 'Admin created successfully',
      adminId: result.insertId
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating admin'
    });
  }
};

module.exports = {
  adminLogin,
  verifyAdmin,
  adminLogout,
  changePassword,
  createAdmin
};
