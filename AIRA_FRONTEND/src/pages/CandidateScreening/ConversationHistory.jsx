import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Calendar, User } from 'lucide-react';
import { getAllCandidates } from '../../services/candidateService';
import { useSocket } from '../../context/SocketContext';

const ConversationHistory = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { socket } = useSocket();

    useEffect(() => {
        fetchCandidates();
    }, []);

    useEffect(() => {
        if (!socket) return;

        console.log('Setting up Socket.io listeners for Conversation History');

        socket.on('call:completed', (data) => {
            console.log('Received call:completed event:', data);
            fetchCandidates();
        });

        socket.on('candidate:updated', (data) => {
            console.log('Received candidate:updated event:', data);
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
            const response = await getAllCandidates();
            // FastAPI returns data directly
            const candidatesData = response.candidates || response || [];
            // Filter only candidates with completed calls
            const completedCandidates = candidatesData.filter(
                c => c.call_status === 'Completed' || c.overall_score !== null || c.overallScore !== null
            );
            setCandidates(completedCandidates);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShowConversation = (candidateId) => {
        navigate(`/conversation/${candidateId}`);
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversation History</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Conversations: {candidates.length}
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
                                Domain
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {candidates.map((candidate) => {
                            const candidateName = candidate.candidate_name || candidate.candidateName;
                            const phoneNumber = candidate.phone_number || candidate.phoneNumber;
                            const overallScore = candidate.overall_score || candidate.overallScore;
                            const createdAt = candidate.created_at || candidate.createdAt;
                            const candidateId = candidate._id || candidate.id;
                            
                            return (
                                <tr key={candidateId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 text-gray-400 mr-2" />
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {candidateName || 'Unknown'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Phone className="h-4 w-4 mr-1" />
                                            {phoneNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                            {candidate.domain || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {overallScore ? (
                                                <span className={`font-semibold ${
                                                    overallScore >= 7 ? 'text-green-600 dark:text-green-400' :
                                                    overallScore >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {overallScore}/10
                                                </span>
                                            ) : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {formatDate(createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleShowConversation(candidateId)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            <MessageSquare className="h-4 w-4 mr-1" />
                                            Show Conversation
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {candidates.length === 0 && (
                    <div className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No conversations yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Completed interviews will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationHistory;
