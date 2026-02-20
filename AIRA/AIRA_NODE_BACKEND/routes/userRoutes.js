const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserPermissions,
    updateUserPermissions,
    getDefaultPermissions,
} = require('../controllers/userController');

// User CRUD routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// User status
router.patch('/:id/toggle-status', toggleUserStatus);

// Permissions
router.get('/:id/permissions', getUserPermissions);
router.put('/:id/permissions', updateUserPermissions);
router.get('/role/:role/permissions', getDefaultPermissions);

module.exports = router;
