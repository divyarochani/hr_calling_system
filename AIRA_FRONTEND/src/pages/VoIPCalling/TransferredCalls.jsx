import React, { useState, useEffect } from 'react';
import { PhoneForwarded, Phone, Calendar, User, ArrowRight } from 'lucide-react';
import { getAllCalls } from '../../services/callService';

const TransferredCalls = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTransferredCalls();
    }, []);

    const fetchTransferredCalls = async () => {
        try {
            setLoading(true);
            const response = await getAllCalls();
            // FastAPI returns data directly
            const callsData = response.calls || response || [];
            // Filter only transferred calls
            const transferredCalls = callsData.filter(
                call => (call.transfer_requested === true || call.transferRequested === true) && 
                        (call.transfer_number || call.transferNumber)
            );
            setCalls(transferredCalls);
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

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transferred Calls</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Calls that were transferred to human agents
                    </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Transfers: {calls.length}
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
                                From Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Transfer Flow
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                To Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {calls.map((call) => {
                            const candidateName = call.candidate_id?.candidate_name || call.candidateId?.candidateName;
                            const phoneNumber = call.phone_number || call.phoneNumber;
                            const transferNumber = call.transfer_number || call.transferNumber;
                            const createdAt = call.created_at || call.createdAt;
                            const callId = call._id || call.id;
                            
                            return (
                                <tr key={callId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                                        <div className="flex items-center justify-center">
                                            <PhoneForwarded className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                Transferred
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                            <Phone className="h-4 w-4 mr-1" />
                                            {transferNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {call.duration ? formatDuration(call.duration) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {formatDate(createdAt)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {calls.length === 0 && (
                    <div className="text-center py-12">
                        <PhoneForwarded className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transferred calls</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Calls transferred to human agents will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferredCalls;
