import React, { useState, useEffect } from 'react';
import { Shield, Save } from 'lucide-react';
import { useToast } from '../../components/Toast/ToastContainer';
import { getAllUsers, updateUserPermissions, getDefaultPermissions } from '../../services/userService';

const RolePermissionConfig = () => {
  const toast = useToast();
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);

  const permissions = {
    'User Management': ['View Users', 'Add Users', 'Edit Users', 'Delete Users'],
    'Call Management': ['Make Calls', 'View Call History', 'Access Recordings', 'Transfer Calls'],
    'AI Features': ['View AI Logs', 'Configure AI', 'Monitor AI Performance'],
    'Candidate Management': ['View Candidates', 'Screen Candidates', 'Schedule Interviews'],
    'System Settings': ['View Settings', 'Modify Settings', 'System Monitoring', 'Deployment'],
  };

  const [userPermissions, setUserPermissions] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions();
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
        if (response.data.length > 0) {
          setSelectedUser(response.data[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async () => {
    if (!selectedUser) return;

    try {
      setLoadingPermissions(true);
      console.log('Loading permissions for user:', selectedUser.name);
      console.log('User permissions:', selectedUser.permissions);
      
      // Convert Map to object if needed
      let perms = {};
      
      if (selectedUser.permissions) {
        // If permissions is a Map object from MongoDB
        if (selectedUser.permissions instanceof Map) {
          perms = Object.fromEntries(selectedUser.permissions);
        } else if (typeof selectedUser.permissions === 'object') {
          perms = selectedUser.permissions;
        }
      }
      
      console.log('Processed permissions:', perms);
      
      // If user has custom permissions, use them
      if (Object.keys(perms).length > 0) {
        setUserPermissions(perms);
      } else {
        // Otherwise get defaults for their role
        console.log('Fetching default permissions for role:', selectedUser.role);
        const response = await getDefaultPermissions(selectedUser.role);
        console.log('Default permissions response:', response);
        
        if (response.success) {
          setUserPermissions(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const togglePermission = (category, permission) => {
    setUserPermissions(prev => {
      const categoryPerms = prev[category] || [];
      const newCategoryPerms = categoryPerms.includes(permission)
        ? categoryPerms.filter(p => p !== permission)
        : [...categoryPerms, permission];
      
      return {
        ...prev,
        [category]: newCategoryPerms
      };
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const response = await updateUserPermissions(selectedUser._id, userPermissions);
      if (response.success) {
        toast.success('Permissions updated successfully');
        fetchUsers(); // Refresh user list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleUserChange = (userId) => {
    const user = users.find(u => u._id === userId);
    setSelectedUser(user);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role & Permission Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure access permissions for users</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || !selectedUser}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} className="mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select User</label>
          <select
            value={selectedUser?._id || ''}
            onChange={(e) => handleUserChange(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email}) - {user.role.replace('_', ' ')}
              </option>
            ))}
          </select>
          {selectedUser && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Current Role: <span className="font-medium capitalize">{selectedUser.role.replace('_', ' ')}</span>
            </p>
          )}
        </div>

        {selectedUser && !loadingPermissions && (
          <div className="space-y-6">
            {Object.entries(permissions).map(([category, perms]) => (
              <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <Shield className="text-primary-600 dark:text-primary-400 mr-2" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {perms.map((perm) => {
                    const isChecked = userPermissions[category]?.includes(perm) || false;
                    return (
                      <label key={perm} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(category, perm)}
                          className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {loadingPermissions && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {!selectedUser && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No users available. Please create users first.
          </div>
        )}
      </div>
    </div>
  );
};

export default RolePermissionConfig;
