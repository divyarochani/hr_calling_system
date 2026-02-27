import { useState, useEffect } from 'react';
import { Users, Phone, Bot, TrendingUp, Activity, AlertCircle, Shield, Database } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { getDashboardStats } from '../../services/candidateService';
import { getAllCalls, getActiveCalls } from '../../services/callService';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { socket, connected } = useSocket();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalCalls: 0,
    activeCalls: 0,
    avgOverallScore: 0,
    screeningsCompleted: 0,
  });
  const [callData, setCallData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchStats = async () => {
    try {
      const [statsRes, callsRes, activeCallsRes] = await Promise.all([
        getDashboardStats(),
        getAllCalls(),
        getActiveCalls()
      ]);
      
      console.log('📊 Fetching dashboard stats...');
      
      // New backend returns data directly (no .success wrapper)
      setStats({
        totalCandidates: statsRes.total_candidates || 0,
        candidatesToday: statsRes.candidates_today || 0,
        totalCalls: callsRes.total || 0,
        activeCalls: activeCallsRes.calls?.length || 0,
        avgOverallScore: statsRes.avg_screening_score || 0,
        screeningsCompleted: statsRes.screenings_completed || 0,
        screeningsToday: statsRes.screenings_today || 0,
        interviewsScheduled: statsRes.interviews_scheduled || 0,
      });

      // Process call data for charts (last 7 days)
      if (callsRes.calls) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayStart = new Date(date.setHours(0, 0, 0, 0));
          const dayEnd = new Date(date.setHours(23, 59, 59, 999));
          
          const callsOnDay = callsRes.calls.filter(call => {
            if (!call.start_time) return false;
            const callDate = new Date(call.start_time);
            return callDate >= dayStart && callDate <= dayEnd;
          }).length;
          
          last7Days.push({ name: dayName, calls: callsOnDay });
        }
        setCallData(last7Days);
      }
      
      setLastUpdate(new Date());
      console.log('✅ Dashboard stats updated');
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    console.log('🔄 Initial dashboard data fetch...');
    fetchStats();
  }, []);

  // Real-time Socket.IO updates
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not available for dashboard');
      return;
    }

    console.log('🔌 Setting up dashboard Socket.IO listeners...');

    const handleCallStatus = (data) => {
      console.log('📡 Dashboard: call:status', data);
      fetchStats();
    };

    const handleCallCompleted = (data) => {
      console.log('📡 Dashboard: call:completed', data);
      fetchStats();
    };

    const handleCandidateUpdated = (data) => {
      console.log('📡 Dashboard: candidate:updated', data);
      fetchStats();
    };

    socket.on('call:status', handleCallStatus);
    socket.on('call:completed', handleCallCompleted);
    socket.on('candidate:updated', handleCandidateUpdated);

    return () => {
      console.log('🔌 Cleaning up dashboard Socket.IO listeners...');
      socket.off('call:status', handleCallStatus);
      socket.off('call:completed', handleCallCompleted);
      socket.off('candidate:updated', handleCandidateUpdated);
    };
  }, [socket]);

  const mainStats = [
    { 
      name: 'Total Users', 
      value: stats.totalCandidates, 
      change: `${stats.candidatesToday || 0} today`, 
      icon: Users, 
      color: 'bg-blue-500 dark:bg-blue-600' 
    },
    { 
      name: 'Active Calls', 
      value: stats.activeCalls, 
      change: 'Real-time', 
      icon: Phone, 
      color: 'bg-green-500 dark:bg-green-600' 
    },
    { 
      name: 'AI Accuracy', 
      value: `${stats.avgOverallScore || 0}/10`, 
      change: 'Avg Score', 
      icon: Bot, 
      color: 'bg-purple-500 dark:bg-purple-600' 
    },
    { 
      name: 'Screenings', 
      value: stats.screeningsCompleted, 
      change: `${stats.screeningsToday || 0} today`, 
      icon: Activity, 
      color: 'bg-yellow-500 dark:bg-yellow-600' 
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">System overview and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            connected ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{connected ? 'Live Updates' : 'Offline'}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Updated: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Call Volume (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={callData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Bar dataKey="calls" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Call Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={callData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Line type="monotone" dataKey="calls" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Shield className="text-primary-600 dark:text-primary-400 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Server</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Service</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Database className="text-primary-600 dark:text-primary-400 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Calls</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalCalls}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Screenings</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.screeningsCompleted}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interviews Scheduled</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.interviewsScheduled || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
