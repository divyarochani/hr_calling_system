import React, { useState, useEffect } from 'react';
import { PhoneOff, Phone, Calendar, Clock, AlertCircle, PhoneCall } from 'lucide-react';
import { getUnsuccessfulCalls } from '../../services/candidateService';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const UnsuccessfulCalls = () => {
    const { socket } = useSocket();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [retrying, setRetrying] = useState({});

    useEffect(() => {
        fetchCandidates();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Listen for call status updates
        socket.on('call:status', () => {
            fetchCandidates();
        });

        socket.on('call:completed', () => {
            fetchCandidates();
        });

        socket.on('candidate:updated', () => {
            fetchCandidates();
        });

        return () => {
            socket.off('call:status');
            socket.off('call:completed');
            socket.off('candidate:updated');
        };
    }, [socket]);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const response = await getUnsuccessfulCalls();
            setCandidates(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRetryCall = async (candidate) => {
        try {
            setRetrying(prev => ({ ...prev, [candidate._id]: true }));
            
            // Make the call
            const response = await api.post('/api/calls/retry', {
                phoneNumber: candidate.phoneNumber,
                candidateId: candidate._id
            });

            if (response.data.success) {
                alert(`Call initiated to ${candidate.candidateName || candidate.phoneNumber}`);
                // Refresh the list after a delay
                setTimeout(fetchCandidates, 2000);
            }
        } catch (err) {
            alert(`Failed to retry call: ${err.message}`);
        } finally {
            setRetrying(prev => ({ ...prev, [candidate._id]: false }));
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

    const getScheduledStatus = (candidate) => {
        if (!candidate.nextRoundAvailability) return null;
        
        try {
            const timeString = candidate.nextRoundAvailability.toLowerCase().trim();
            const now = new Date();
            let scheduledTime = null;
            
            // Try parsing with Date constructor first
            const directParse = new Date(candidate.nextRoundAvailability);
            if (!isNaN(directParse.getTime()) && directParse.getFullYear() > 2000) {
                scheduledTime = directParse;
            }
            // Parse "tomorrow" with optional time
            else if (timeString.includes('tomorrow')) {
                scheduledTime = new Date(now);
                scheduledTime.setDate(scheduledTime.getDate() + 1);
                
                // Extract time if present (e.g., "tomorrow 3 PM", "tomorrow at 15:00")
                const timeMatch = timeString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
                if (timeMatch) {
                    let hour = parseInt(timeMatch[1]);
                    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
                    const meridiem = timeMatch[3]?.toLowerCase();
                    
                    if (meridiem === 'pm' && hour !== 12) hour += 12;
                    if (meridiem === 'am' && hour === 12) hour = 0;
                    
                    scheduledTime.setHours(hour, minute, 0, 0);
                } else {
                    // Default to 10 AM if no time specified
                    scheduledTime.setHours(10, 0, 0, 0);
                }
            }
            // Parse day names (monday, tuesday, etc.)
            else if (timeString.match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/)) {
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const targetDay = days.findIndex(d => timeString.includes(d));
                
                if (targetDay !== -1) {
                    scheduledTime = new Date(now);
                    const currentDay = scheduledTime.getDay();
                    let daysToAdd = targetDay - currentDay;
                    if (daysToAdd <= 0) daysToAdd += 7; // Next week
                    scheduledTime.setDate(scheduledTime.getDate() + daysToAdd);
                    
                    // Extract time if present
                    const timeMatch = timeString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
                    if (timeMatch) {
                        let hour = parseInt(timeMatch[1]);
                        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
                        const meridiem = timeMatch[3]?.toLowerCase();
                        
                        if (meridiem === 'pm' && hour !== 12) hour += 12;
                        if (meridiem === 'am' && hour === 12) hour = 0;
                        
                        scheduledTime.setHours(hour, minute, 0, 0);
                    } else {
                        scheduledTime.setHours(10, 0, 0, 0);
                    }
                }
            }
            // Parse relative times like "in 2 hours", "after 30 minutes"
            else if (timeString.match(/(\d+)\s*(hour|minute|day)/)) {
                const match = timeString.match(/(\d+)\s*(hour|minute|day)/);
                const value = parseInt(match[1]);
                const unit = match[2];
                
                scheduledTime = new Date(now);
                if (unit.includes('hour')) {
                    scheduledTime.setHours(scheduledTime.getHours() + value);
                } else if (unit.includes('minute')) {
                    scheduledTime.setMinutes(scheduledTime.getMinutes() + value);
                } else if (unit.includes('day')) {
                    scheduledTime.setDate(scheduledTime.getDate() + value);
                }
            }
            
            // If still no valid time, just show the text
            if (!scheduledTime || isNaN(scheduledTime.getTime())) {
                return { text: candidate.nextRoundAvailability, isPast: false };
            }
            
            const timeDiff = scheduledTime - now;
            const isPast = timeDiff < 0;
            const hours = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60));
            const minutes = Math.floor((Math.abs(timeDiff) % (1000 * 60 * 60)) / (1000 * 60));
            
            if (isPast) {
                return { text: `Scheduled (processing)`, isPast: true };
            } else if (hours < 1 && minutes < 60) {
                return { text: `Calling in ${minutes} min`, isPast: false, soon: true };
            } else if (hours < 24) {
                return { text: `Calling in ${hours}h ${minutes}m`, isPast: false };
            } else {
                const days = Math.floor(hours / 24);
                return { text: `Calling in ${days}d ${hours % 24}h`, isPast: false };
            }
        } catch (e) {
            return { text: candidate.nextRoundAvailability, isPast: false };
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Rescheduled':
                return 'bg-yellow-100 text-yellow-800';
            case 'Disconnected':
                return 'bg-red-100 text-red-800';
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unsuccessful Calls</h1>
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
                        onClick={() => setFilter('Rescheduled')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'Rescheduled'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Rescheduled ({candidates.filter(c => c.callStatus === 'Rescheduled').length})
                    </button>
                    <button
                        onClick={() => setFilter('Disconnected')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'Disconnected'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Disconnected ({candidates.filter(c => c.callStatus === 'Disconnected').length})
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
                                Reschedule Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Call Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCandidates.map((candidate) => (
                            <tr key={candidate._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <PhoneOff className="h-5 w-5 text-gray-400 mr-2" />
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
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(candidate.callStatus)}`}>
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
                                    {candidate.callStatus === 'Rescheduled' && candidate.nextRoundAvailability ? (
                                        <div className="flex flex-col">
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 mb-1">
                                                <Clock className="h-4 w-4 mr-1 text-yellow-600 dark:text-yellow-400" />
                                                {candidate.nextRoundAvailability}
                                            </div>
                                            {(() => {
                                                const status = getScheduledStatus(candidate);
                                                if (status) {
                                                    return (
                                                        <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center ${
                                                            status.isPast 
                                                                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                                : status.soon
                                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 animate-pulse'
                                                                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                        }`}>
                                                            {status.soon && '🔔 '}
                                                            {status.text}
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">N/A</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {formatDate(candidate.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleRetryCall(candidate)}
                                        disabled={retrying[candidate._id]}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <PhoneCall className="h-4 w-4 mr-1" />
                                        {retrying[candidate._id] ? 'Calling...' : 'Retry Call'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCandidates.length === 0 && (
                    <div className="text-center py-12">
                        <PhoneOff className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No unsuccessful calls</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {filter === 'all' 
                                ? 'All calls completed successfully.'
                                : `No calls with status "${filter}".`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnsuccessfulCalls;
