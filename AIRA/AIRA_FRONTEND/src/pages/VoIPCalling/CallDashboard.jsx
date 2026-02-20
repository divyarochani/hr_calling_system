import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { getActiveCalls, getAllCalls } from '../../services/callService';
import { getDashboardStats } from '../../services/candidateService';
import { format } from 'date-fns';

const CallDashboard = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('all');
  const [activeCalls, setActiveCalls] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    callsToday: 0,
    activeCalls: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchActiveCalls = async () => {
    try {
      const response = await getActiveCalls();
      if (response.success) {
        setActiveCalls(response.data);
      }
    } catch (error) {
      console.error('Error fetching active calls:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) {
        setStats({
          totalCalls: response.data.totalCalls,
          callsToday: response.data.callsToday,
          activeCalls: response.data.activeCalls,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCalls();
    fetchStats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:status', (data) => {
      console.log('Call status update:', data);
      fetchActiveCalls();
      fetchStats();
    });

    socket.on('call:completed', () => {
      fetchActiveCalls();
      fetchStats();
    });

    return () => {
      socket.off('call:status');
      socket.off('call:completed');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Call Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage all calling activities</p>
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
                  <tr key={call._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {call.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        call.callType === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {call.callType}
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
                      {format(new Date(call.startTime), 'HH:mm:ss')}
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
