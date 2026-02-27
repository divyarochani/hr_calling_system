import { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { getActiveCalls, getAllCalls } from '../../services/callService';
import { format } from 'date-fns';

const CallDashboard = () => {
  const { socket, connected } = useSocket();
  const [activeCalls, setActiveCalls] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    callsToday: 0,
    activeCalls: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchActiveCalls = async () => {
    try {
      const response = await getActiveCalls();
      const calls = response.calls || [];
      setActiveCalls(calls);
      
      // Update active calls count in stats
      setStats(prev => ({
        ...prev,
        activeCalls: calls.length
      }));
      
      console.log(`✅ Fetched ${calls.length} active calls`);
    } catch (error) {
      console.error('❌ Error fetching active calls:', error);
    }
  };

  const fetchRecentCalls = async () => {
    try {
      const response = await getAllCalls({ limit: 10 });
      setRecentCalls(response.calls || []);
      console.log(`✅ Fetched ${response.calls?.length || 0} recent calls`);
    } catch (error) {
      console.error('❌ Error fetching recent calls:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getAllCalls({ limit: 1 });
      const totalCalls = response.total || 0;
      
      // Calculate calls today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all calls to count today's calls
      const allCallsResponse = await getAllCalls({ limit: 1000 });
      const allCalls = allCallsResponse.calls || [];
      
      const callsToday = allCalls.filter(call => {
        if (!call.start_time) return false;
        const callDate = new Date(call.start_time);
        return callDate >= today;
      }).length;
      
      setStats(prev => ({
        ...prev,
        totalCalls,
        callsToday
      }));
      
      console.log(`📊 Stats: Total=${totalCalls}, Today=${callsToday}`);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('🔄 Initial data fetch...');
    fetchActiveCalls();
    fetchRecentCalls();
    fetchStats();
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not available yet');
      return;
    }

    console.log('🔌 Setting up Socket.IO listeners...');

    // Listen for call status updates
    const handleCallStatus = (data) => {
      console.log('📡 Real-time: call:status', data);
      setLastUpdate(new Date());
      
      // Update active calls list
      setActiveCalls(prev => {
        const existingIndex = prev.findIndex(c => c.id === data.id);
        if (existingIndex >= 0) {
          // Update existing call
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...data };
          return updated;
        } else if (['initiated', 'ringing', 'connected', 'ongoing'].includes(data.status)) {
          // Add new active call
          return [...prev, data];
        }
        return prev;
      });
      
      // Refresh data
      fetchActiveCalls();
      fetchRecentCalls();
      fetchStats();
    };

    // Listen for call completed
    const handleCallCompleted = (data) => {
      console.log('📡 Real-time: call:completed', data);
      setLastUpdate(new Date());
      
      // Remove from active calls
      setActiveCalls(prev => prev.filter(c => c.id !== data.id));
      
      // Refresh data
      fetchActiveCalls();
      fetchRecentCalls();
      fetchStats();
    };

    socket.on('call:status', handleCallStatus);
    socket.on('call:completed', handleCallCompleted);

    return () => {
      console.log('🔌 Cleaning up Socket.IO listeners...');
      socket.off('call:status', handleCallStatus);
      socket.off('call:completed', handleCallCompleted);
    };
  }, [socket]);

  const statCards = [
    { name: 'Total Calls Today', value: stats.callsToday, icon: Phone, color: 'bg-blue-500' },
    { name: 'Active Calls', value: stats.activeCalls, icon: PhoneIncoming, color: 'bg-green-500' },
    { name: 'Total Calls', value: stats.totalCalls, icon: PhoneOutgoing, color: 'bg-purple-500' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      initiated: 'bg-blue-100 text-blue-800',
      ringing: 'bg-yellow-100 text-yellow-800',
      connected: 'bg-green-100 text-green-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      missed: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading call dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Call Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage all calling activities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{connected ? 'Live' : 'Offline'}</span>
          </div>
          <div className="text-xs text-gray-500">
            Last update: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Calls</h3>
        </div>

        {activeCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No active calls at the moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Started</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {call.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        call.call_type === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {call.call_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(call.start_time), 'HH:mm:ss')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Calls Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Calls</h3>
          <button
            onClick={() => window.location.href = '/call-history'}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </button>
        </div>

        {recentCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No recent calls
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {call.phone_number || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        call.call_type === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {call.call_type || 'outbound'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {call.start_time ? format(new Date(call.start_time), 'MMM dd, HH:mm') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallDashboard;
