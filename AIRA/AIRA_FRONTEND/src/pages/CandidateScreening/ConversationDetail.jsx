import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bot, Phone, Mail, MapPin, Briefcase, Calendar, DollarSign } from 'lucide-react';
import { getConversationByCandidate } from '../../services/candidateService';

const ConversationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConversation();
    }, [id]);

    const fetchConversation = async () => {
        try {
            setLoading(true);
            const response = await getConversationByCandidate(id);
            setData(response.data);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                Error: {error || 'Conversation not found'}
            </div>
        );
    }

    const { candidate, conversation } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/conversation-history')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-white" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversation Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Candidate Info Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
                        <div className="flex items-center space-x-3 pb-4 border-b dark:border-gray-700">
                            <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {candidate.candidateName || 'Unknown'}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.currentRole || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm font-medium">{candidate.phoneNumber}</p>
                                </div>
                            </div>

                            {candidate.email && (
                                <div className="flex items-start space-x-2">
                                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium">{candidate.email}</p>
                                    </div>
                                </div>
                            )}

                            {candidate.currentLocation && (
                                <div className="flex items-start space-x-2">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Location</p>
                                        <p className="text-sm font-medium">{candidate.currentLocation}</p>
                                        {candidate.relocationWilling && (
                                            <p className="text-xs text-gray-500">
                                                Relocation: {candidate.relocationWilling === 'yes' ? 'Yes' : 'No'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {candidate.currentCompany && (
                                <div className="flex items-start space-x-2">
                                    <Briefcase className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Company</p>
                                        <p className="text-sm font-medium">{candidate.currentCompany}</p>
                                    </div>
                                </div>
                            )}

                            {candidate.experienceYears && (
                                <div className="flex items-start space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Experience</p>
                                        <p className="text-sm font-medium">{candidate.experienceYears} years</p>
                                    </div>
                                </div>
                            )}

                            {(candidate.currentCtcLpa || candidate.expectedCtcLpa) && (
                                <div className="flex items-start space-x-2">
                                    <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">CTC</p>
                                        {candidate.currentCtcLpa && (
                                            <p className="text-sm">Current: {candidate.currentCtcLpa} LPA</p>
                                        )}
                                        {candidate.expectedCtcLpa && (
                                            <p className="text-sm">Expected: {candidate.expectedCtcLpa} LPA</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scores */}
                        {candidate.overallScore && (
                            <div className="pt-4 border-t space-y-2">
                                <h3 className="text-sm font-semibold text-gray-700">Scores</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Communication</span>
                                        <span className="font-semibold">{candidate.communicationScore}/10</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Technical</span>
                                        <span className="font-semibold">{candidate.technicalScore}/10</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Overall</span>
                                        <span className={`font-semibold ${
                                            candidate.overallScore >= 7 ? 'text-green-600' :
                                            candidate.overallScore >= 5 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {candidate.overallScore}/10
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Next Round Availability */}
                        {candidate.nextRoundAvailability && (
                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Next Round</h3>
                                <p className="text-sm text-gray-600">{candidate.nextRoundAvailability}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversation Chat UI */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="bg-primary-600 text-white px-6 py-4">
                            <h2 className="text-lg font-semibold">Interview Conversation</h2>
                            <p className="text-sm text-primary-100">
                                {data.call ? formatDate(data.call.startTime) : ''}
                            </p>
                        </div>

                        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                            {conversation && conversation.length > 0 ? (
                                conversation.map((message, index) => {
                                    // Determine if this is an AIRA/agent message
                                    // Backend stores as 'agent' for AIRA and 'user' for candidate
                                    const isAIRA = message.role === 'agent' || message.role === 'assistant';
                                    
                                    return (
                                        <div
                                            key={index}
                                            className={`flex ${isAIRA ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`flex items-start space-x-2 max-w-[80%] ${
                                                isAIRA ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                                            }`}>
                                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                                    isAIRA ? 'bg-primary-100' : 'bg-gray-200'
                                                }`}>
                                                    {isAIRA ? (
                                                        <Bot className="h-5 w-5 text-primary-600" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-medium mb-1 ${
                                                        isAIRA ? 'text-gray-600' : 'text-gray-600 text-right'
                                                    }`}>
                                                        {isAIRA 
                                                            ? 'AIRA' 
                                                            : (candidate.candidateName || candidate.phoneNumber || 'Candidate')
                                                        }
                                                    </p>
                                                    <div className={`rounded-lg px-4 py-2 ${
                                                        isAIRA
                                                            ? 'bg-gray-100 text-gray-900'
                                                            : 'bg-primary-600 text-white'
                                                    }`}>
                                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    No conversation data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationDetail;
