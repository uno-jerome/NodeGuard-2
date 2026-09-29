import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production';
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Authentication error: ${error.message}`,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password successfully updated.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to update password: ${error.message}`,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    }
    const user = await User.create({ name, email: email.toLowerCase().trim(), password, role: 'INVESTIGATOR' });
    return res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Registration failed: ${error.message}` });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('name email role createdAt').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'INVESTIGATOR', isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Active investigator account not found.' });
    }

    user.isActive = false;
    await user.save();

    return res.status(200).json({ success: true, message: 'Staff account deactivated.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid staff account ID.' });
  }
};

export default {
  login,
  changePassword,
  register,
  getUsers,
  deactivateUser,
};
