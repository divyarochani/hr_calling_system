const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Default permissions for each role
const defaultPermissions = {
    admin: {
        'User Management': ['View Users', 'Add Users', 'Edit Users', 'Delete Users'],
        'Call Management': ['Make Calls', 'View Call History', 'Access Recordings', 'Transfer Calls'],
        'AI Features': ['View AI Logs', 'Configure AI', 'Monitor AI Performance'],
        'Candidate Management': ['View Candidates', 'Screen Candidates', 'Schedule Interviews'],
        'System Settings': ['View Settings', 'Modify Settings', 'System Monitoring', 'Deployment'],
    },
    hr_manager: {
        'User Management': ['View Users'],
        'Call Management': ['Make Calls', 'View Call History', 'Access Recordings', 'Transfer Calls'],
        'AI Features': ['View AI Logs', 'Monitor AI Performance'],
        'Candidate Management': ['View Candidates', 'Screen Candidates', 'Schedule Interviews'],
        'System Settings': ['View Settings'],
    },
    recruiter: {
        'User Management': [],
        'Call Management': ['Make Calls', 'View Call History'],
        'AI Features': [],
        'Candidate Management': ['View Candidates', 'Screen Candidates', 'Schedule Interviews'],
        'System Settings': [],
    },
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'name email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, password, and role',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Validate role
        if (!['admin', 'hr_manager', 'recruiter'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role',
            });
        }

        // Create user with default permissions as plain object
        const user = await User.create({
            name,
            email,
            password,
            role,
            status: 'active',
            permissions: JSON.parse(JSON.stringify(defaultPermissions[role])), // Ensure plain object
            createdBy: req.user?._id, // If auth middleware is used
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'User created successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, status, password } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role && ['admin', 'hr_manager', 'recruiter'].includes(role)) {
            user.role = role;
            // Update permissions when role changes - use plain object
            user.permissions = JSON.parse(JSON.stringify(defaultPermissions[role]));
        }
        if (status && ['active', 'inactive'].includes(status)) {
            user.status = status;
        }
        if (password) {
            user.password = password; // Will be hashed by pre-save hook
        }

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: userResponse,
            message: 'User updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete the last admin user',
                });
            }
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Toggle user status
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.status = user.status === 'active' ? 'inactive' : 'active';
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: userResponse,
            message: `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get user permissions
exports.getUserPermissions = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: {
                role: user.role,
                permissions: user.permissions || defaultPermissions[user.role],
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update user permissions
exports.updateUserPermissions = async (req, res) => {
    try {
        const { permissions } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Ensure permissions is a plain object
        user.permissions = JSON.parse(JSON.stringify(permissions));
        user.markModified('permissions'); // Mark as modified for Mongoose
        await user.save();

        res.json({
            success: true,
            data: {
                role: user.role,
                permissions: user.permissions,
            },
            message: 'Permissions updated successfully',
        });
    } catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get default permissions for a role
exports.getDefaultPermissions = async (req, res) => {
    try {
        const { role } = req.params;

        if (!['admin', 'hr_manager', 'recruiter'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role',
            });
        }

        res.json({
            success: true,
            data: defaultPermissions[role],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
