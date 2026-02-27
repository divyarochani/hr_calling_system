import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Phone, Calendar, ClipboardCheck, 
  PhoneForwarded, UserX, PhoneOff, MessageSquare,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { getDashboardStats } from '../../services/candidateService';
import { useNavigate } from 'react-router-dom';

const RecruiterDashboard = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    candidatesToday: 0,
    totalCalls: 0,
    callsToday: 0,
    activeCalls: 0,
    screeningsCompleted: 0,
    screeningsToday: 0,
    interviewsScheduled: 0,
    avgCommunicationScore: 0,
    avgTechnicalScore: 0,
    avgOverallScore: 0,
    missedCallsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      // New backend returns data directly
      setStats({
        totalCandidates: response.total_candidates || 0,
        candidatesToday: response.candidates_today || 0,
        totalCalls: 0, // TODO: Get from calls endpoint
        callsToday: 0,
        activeCalls: 0,
        screeningsCompleted: response.screenings_completed || 0,
        screeningsToday: response.screenings_today || 0,
        interviewsScheduled: 0,
        avgCommunicationScore: 0,
        avgTechnicalScore: 0,
        avgOverallScore: response.avg_screening_score || 0,
        missedCallsToday: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:completed', () => {
      fetchStats();
    });

    socket.on('candidate:updated', () => {
      fetchStats();
    });

    socket.on('call:status', () => {
      fetchStats();
    });

    return () => {
      socket.off('call:completed');
      socket.off('candidate:updated');
      socket.off('call:status');
    };
  }, [socket]);

  const mainStats = [
    { 
      name: 'Total Candidates', 
      value: stats.totalCandidates, 
      today: stats.candidatesToday,
      icon: UserCheck, 
      color: 'bg-blue-500 dark:bg-blue-600',
      link: '/screening-results'
    },
    { 
      name: 'Total Calls', 
      value: stats.totalCalls, 
      today: stats.callsToday,
      icon: Phone, 
      color: 'bg-green-500 dark:bg-green-600',
      link: '/call-history'
    },
    { 
      name: 'Interviews Scheduled', 
      value: stats.interviewsScheduled, 
      icon: Calendar, 
      color: 'bg-purple-500 dark:bg-purple-600',
      link: '/interview-calendar'
    },
    { 
      name: 'Screenings Completed', 
      value: stats.screeningsCompleted, 
      today: stats.screeningsToday,
      icon: ClipboardCheck, 
      color: 'bg-yellow-500 dark:bg-yellow-600',
      link: '/conversation-history'
    },
  ];

  const activityStats = [
    {
      name: 'Active Calls',
      value: stats.activeCalls,
      icon: Activity,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      link: '/call-dashboard'
    },
    {
      name: 'Missed Calls Today',
      value: stats.missedCallsToday,
      icon: PhoneOff,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      link: '/unsuccessful-calls'
    },
  ];

  const scoreCards = [
    {
      name: 'Avg Communication',
      value: stats.avgCommunicationScore,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Avg Technical',
      value: stats.avgTechnicalScore,
      icon: ClipboardCheck,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      name: 'Avg Overall',
      value: stats.avgOverallScore,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recruiter Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your recruitment activities and performance</p>
      </div>

      {/* Main Stats */}
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
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  {stat.today !== undefined && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      +{stat.today} today
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity & Scores Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Activity</h3>
          <div className="space-y-4">
            {activityStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.name}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => navigate(stat.link)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${stat.bgColor} p-2 rounded-lg`}>
                      <Icon className={stat.color} size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.name}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Averages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Average Scores</h3>
          <div className="space-y-4">
            {scoreCards.map((score) => {
              const Icon = score.icon;
              return (
                <div key={score.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={score.color} size={20} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{score.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{score.value}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/10</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/make-call')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Phone className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Make Call</span>
          </button>
          <button
            onClick={() => navigate('/conversation-history')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <MessageSquare className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversations</span>
          </button>
          <button
            onClick={() => navigate('/interview-calendar')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Calendar className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</span>
          </button>
          <button
            onClick={() => navigate('/transferred-calls')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <PhoneForwarded className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transfers</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
