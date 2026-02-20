import React, { useState, useEffect } from 'react';
import { UserX, Phone, Calendar, AlertCircle } from 'lucide-react';
import { getNotInterestedCandidates } from '../../services/candidateService';
import { useSocket } from '../../context/SocketContext';

const NotInterestedCandidates = () => {
    const { socket } = useSocket();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCandidates();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('call:completed', () => {
            fetchCandidates();
        });

        socket.on('candidate:updated', () => {
            fetchCandidates();
        });

        return () => {
            socket.off('call:completed');
            socket.off('candidate:updated');
        };
    }, [socket]);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const response = await getNotInterestedCandidates();
            setCandidates(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReasonBadgeColor = (status) => {
        switch (status) {
            case 'Not Interested':
                return 'bg-red-100 text-red-800';
            case 'Screen Rejected':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredCandidates = candidates.filter(candidate => {
        if (filter === 'all') return true;
        return candidate.callStatus === filter;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Not Interested Candidates</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {candidates.length}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        All ({candidates.length})
                    </button>
                    <button
                        onClick={() => setFilter('Not Interested')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'Not Interested'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Not Interested ({candidates.filter(c => c.callStatus === 'Not Interested').length})
                    </button>
                    <button
                        onClick={() => setFilter('Screen Rejected')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'Screen Rejected'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Screen Rejected ({candidates.filter(c => c.callStatus === 'Screen Rejected').length})
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Candidate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Phone Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Reason
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Domain
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCandidates.map((candidate) => (
                            <tr key={candidate._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <UserX className="h-5 w-5 text-gray-400 mr-2" />
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {candidate.candidateName || 'Unknown'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Phone className="h-4 w-4 mr-1" />
                                        {candidate.phoneNumber}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getReasonBadgeColor(candidate.callStatus)}`}>
                                        {candidate.callStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            {candidate.disconnectionReason || 'No reason provided'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {candidate.domain || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {formatDate(candidate.createdAt)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCandidates.length === 0 && (
                    <div className="text-center py-12">
                        <UserX className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No candidates found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {filter === 'all' 
                                ? 'No rejected or not interested candidates yet.'
                                : `No candidates with status "${filter}".`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotInterestedCandidates;
