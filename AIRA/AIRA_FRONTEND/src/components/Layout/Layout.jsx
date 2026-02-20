import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, Users, Phone, ClipboardCheck, 
  Calendar, Mic, Bell, Shield, 
  Activity, Settings, LogOut, Menu, X, Moon, Sun, PhoneForwarded, Upload, FileDown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { selectUser } from '../../store/slices/authSlice';

const Layout = ({ userRole, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const user = useSelector(selectUser);

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    if (userRole === 'admin') return '/admin-dashboard';
    if (userRole === 'hr_manager') return '/hr-manager-dashboard';
    if (userRole === 'recruiter') return '/recruiter-dashboard';
    return '/recruiter-dashboard'; // default
  };

  // Permission mapping for each menu item
  const navigation = [
    { 
      name: 'Dashboard', 
      href: getDashboardRoute(), 
      icon: LayoutDashboard, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: null // Dashboard is always visible
    },
    { 
      name: 'User Management', 
      href: '/user-access', 
      icon: Users, 
      roles: ['admin'], // Only admin can manage users
      requiredPermission: null // Admin always has access
    },
    { 
      name: 'Role & Permissions', 
      href: '/role-permissions', 
      icon: Settings, 
      roles: ['admin'], // Only admin can manage roles and permissions
      requiredPermission: null // Admin always has access
    },
    { 
      name: 'Make Call', 
      href: '/make-call', 
      icon: Phone, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Call Management', permission: 'Make Calls' }
    },
    { 
      name: 'Bulk Import', 
      href: '/bulk-import', 
      icon: Upload, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Call Management', permission: 'Make Calls' }
    },
    { 
      name: 'Call Dashboard', 
      href: '/call-dashboard', 
      icon: Phone, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Call Management', permission: 'View Call History' }
    },
    { 
      name: 'Call History', 
      href: '/call-history', 
      icon: Phone, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Call Management', permission: 'View Call History' }
    },
    { 
      name: 'Transferred Calls', 
      href: '/transferred-calls', 
      icon: PhoneForwarded, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Call Management', permission: 'Transfer Calls' }
    },
    { 
      name: 'Conversation History', 
      href: '/conversation-history', 
      icon: Mic, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Candidate Management', permission: 'View Candidates' }
    },
    { 
      name: 'Screening Results', 
      href: '/screening-results', 
      icon: ClipboardCheck, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Candidate Management', permission: 'Screen Candidates' }
    },
    { 
      name: 'Not Interested', 
      href: '/not-interested', 
      icon: Shield, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Candidate Management', permission: 'View Candidates' }
    },
    { 
      name: 'Unsuccessful Calls', 
      href: '/unsuccessful-calls', 
      icon: Activity, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Call Management', permission: 'View Call History' }
    },
    { 
      name: 'Interview Calendar', 
      href: '/interview-calendar', 
      icon: Calendar, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Candidate Management', permission: 'Schedule Interviews' }
    },
    { 
      name: 'Call Recordings', 
      href: '/call-recordings', 
      icon: Mic, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'Call Management', permission: 'Access Recordings' }
    },
    { 
      name: 'Export Data', 
      href: '/export-data', 
      icon: FileDown, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: { category: 'System Settings', permission: 'View Settings' }
    },
    { 
      name: 'Notifications', 
      href: '/notifications', 
      icon: Bell, 
      roles: ['admin', 'hr_manager', 'recruiter'],
      requiredPermission: null // Notifications are always visible
    },
  ];

  // Check if user has permission
  const hasPermission = (requiredPermission) => {
    if (!requiredPermission) return true; // No permission required
    if (userRole === 'admin') return true; // Admin has all permissions
    if (!user || !user.permissions) return false;
    
    const { category, permission } = requiredPermission;
    const userPermissions = user.permissions[category];
    
    if (!userPermissions || !Array.isArray(userPermissions)) return false;
    return userPermissions.includes(permission);
  };

  // Filter navigation based on role and permissions
  const filteredNavigation = navigation.filter(item => {
    // Check if user's role is allowed
    if (!item.roles.includes(userRole)) return false;
    
    // Admin sees everything in their role list
    if (userRole === 'admin') return true;
    
    // Check if user has required permission
    return hasPermission(item.requiredPermission);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="ml-4 text-xl font-bold text-primary-600 dark:text-primary-400">HR AI Calling System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <Link to="/notifications" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{userRole?.replace('_', ' ')}</p>
                  <p className="text-gray-500 dark:text-gray-400">user@company.com</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="mt-5 px-2 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            // Check if current path matches the item href, or if it's a dashboard route
            const isDashboardRoute = location.pathname.includes('-dashboard');
            const isActive = location.pathname === item.href || 
                           (isDashboardRoute && item.name === 'Dashboard');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
