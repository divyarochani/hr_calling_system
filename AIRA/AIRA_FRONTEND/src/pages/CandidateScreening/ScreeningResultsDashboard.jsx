import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { getAllCandidates, getDashboardStats } from '../../services/candidateService';
import { format } from 'date-fns';

const ScreeningResultsDashboard = () => {
  const { socket } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    screeningsCompleted: 0,
    avgOverallScore: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      const response = await getAllCandidates();
      if (response.success) {
        // Filter only candidates with scores
        const screened = response.data.filter(c => c.overallScore !== null);
        setCandidates(screened);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) {
        setStats({
          screeningsCompleted: response.data.screeningsCompleted,
          avgOverallScore: response.data.avgOverallScore,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('candidate:updated', () => {
      fetchCandidates();
      fetchStats();
    });

    socket.on('call:completed', () => {
      fetchCandidates();
      fetchStats();
    });

    return () => {
      socket.off('candidate:updated');
      socket.off('call:completed');
    };
  }, [socket]);

  const filteredCandidates = candidates.filter(candidate =>
    (candidate.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     candidate.phoneNumber?.includes(searchTerm))
  );

  const passed = candidates.filter(c => c.overallScore >= 7).length;
  const failed = candidates.filter(c => c.overallScore < 7).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading screening results...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Screening Results Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and analyze candidate screening results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Screened', value: stats.screeningsCompleted, icon: TrendingUp, color: 'bg-blue-500' },
          { label: 'Passed (≥7)', value: passed, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Failed (<7)', value: failed, icon: XCircle, color: 'bg-red-500' },
          { label: 'Avg Score', value: stats.avgOverallScore, icon: TrendingUp, color: 'bg-purple-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
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
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No screening results yet. Results will appear here after calls are completed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Comm Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tech Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Overall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {candidate.candidateName || candidate.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {candidate.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {candidate.desiredRole || candidate.currentRole || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {candidate.experienceYears ? `${candidate.experienceYears} yrs` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {candidate.communicationScore || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {candidate.technicalScore || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              candidate.overallScore >= 8 ? 'bg-green-500' : 
                              candidate.overallScore >= 7 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(candidate.overallScore / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{candidate.overallScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        candidate.overallScore >= 7 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {candidate.overallScore >= 7 ? 'passed' : 'failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(candidate.updatedAt), 'MMM dd, yyyy')}
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

export default ScreeningResultsDashboard;
