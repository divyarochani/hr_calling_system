import React, { useState, useEffect } from 'react';
import { Phone, Users, Calendar, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { getDashboardStats, getAllCandidates } from '../../services/candidateService';
import { getAllCalls } from '../../services/callService';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const HRManagerDashboard = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCalls: 0,
    callsToday: 0,
    interviewsScheduled: 0,
    totalCandidates: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, callsRes, candidatesRes] = await Promise.all([
        getDashboardStats(),
        getAllCalls(),
        getAllCandidates()
      ]);
      
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // Build recent activities from calls and candidates
      const activities = [];
      
      if (callsRes.success) {
        callsRes.data.slice(0, 5).forEach(call => {
          if (call.status === 'completed') {
            activities.push({
              id: call._id,
              action: `Call completed with ${call.candidateId?.candidateName || call.phoneNumber}`,
              time: call.endTime || call.startTime,
              type: 'call'
            });
          }
        });
      }

      if (candidatesRes.success) {
        candidatesRes.data.slice(0, 3).forEach(candidate => {
          if (candidate.nextRoundAvailability) {
            activities.push({
              id: candidate._id,
              action: `Interview scheduled for ${candidate.candidateName || candidate.phoneNumber}`,
              time: candidate.updatedAt,
              type: 'interview'
            });
          }
        });
      }

      // Sort by time and take top 5
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:completed', fetchData);
    socket.on('candidate:updated', fetchData);

    return () => {
      socket.off('call:completed');
      socket.off('candidate:updated');
    };
  }, [socket]);

  const mainStats = [
    { 
      name: 'Today\'s Calls', 
      value: stats.callsToday, 
      icon: Phone, 
      color: 'bg-blue-500 dark:bg-blue-600',
      link: '/call-history'
    },
    { 
      name: 'Pending Queries', 
      value: stats.missedCallsToday || 0, 
      icon: MessageSquare, 
      color: 'bg-yellow-500 dark:bg-yellow-600',
      link: '/unsuccessful-calls'
    },
    { 
      name: 'Interviews Scheduled', 
      value: stats.interviewsScheduled || 0, 
      icon: Calendar, 
      color: 'bg-green-500 dark:bg-green-600',
      link: '/interview-calendar'
    },
    { 
      name: 'Active Candidates', 
      value: stats.totalCandidates, 
      icon: Users, 
      color: 'bg-purple-500 dark:bg-purple-600',
      link: '/screening-results'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HR Manager Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your HR operations efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Clock className="text-primary-600 dark:text-primary-400 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
          </div>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <p className="text-sm text-gray-900 dark:text-white flex-1">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent activities
            </div>
          )}
        </div>

        {/* Performance Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-primary-600 dark:text-primary-400 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Calls</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalCalls}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Screenings Completed</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.screeningsCompleted}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Overall Score</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.avgOverallScore}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/conversation-history')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <MessageSquare className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Conversations</span>
          </button>
          <button
            onClick={() => navigate('/interview-calendar')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Calendar className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Interview</span>
          </button>
          <button
            onClick={() => navigate('/screening-results')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Users className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Candidates</span>
          </button>
          <button
            onClick={() => navigate('/export-data')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <TrendingUp className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRManagerDashboard;
