import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, Calendar, DollarSign, Award, FileText, Play } from 'lucide-react';
import { getCandidateById } from '../../services/candidateService';
import { format } from 'date-fns';

const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      const response = await getCandidateById(id);
      if (response.success) {
        setCandidate(response.data.candidate);
        setCalls(response.data.calls || []);
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      screening: 'bg-blue-100 text-blue-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      interviewed: 'bg-indigo-100 text-indigo-800',
      selected: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading candidate details...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Candidate not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/call-history')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Call History
        </button>
      </div>

      {/* Header Card */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {candidate.candidateName || candidate.phoneNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              {candidate.currentRole || 'Candidate'} 
              {candidate.currentCompany && ` at ${candidate.currentCompany}`}
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(candidate.status)}`}>
            {candidate.status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Phone size={18} className="mr-3 text-gray-400" />
              <span>{candidate.phoneNumber}</span>
            </div>
            {candidate.email && (
              <div className="flex items-center text-gray-700">
                <Mail size={18} className="mr-3 text-gray-400" />
                <span>{candidate.email}</span>
              </div>
            )}
            {candidate.currentLocation && (
              <div className="flex items-center text-gray-700">
                <MapPin size={18} className="mr-3 text-gray-400" />
                <span>{candidate.currentLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
          <div className="space-y-3">
            {candidate.experienceYears && (
              <div className="flex items-start">
                <Briefcase size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-medium text-gray-900">{candidate.experienceYears} years</p>
                </div>
              </div>
            )}
            {candidate.domain && (
              <div className="flex items-start">
                <Award size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Domain</p>
                  <p className="font-medium text-gray-900">{candidate.domain}</p>
                </div>
              </div>
            )}
            {candidate.noticePeriod && (
              <div className="flex items-start">
                <Calendar size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Notice Period</p>
                  <p className="font-medium text-gray-900">{candidate.noticePeriod}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compensation */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compensation</h3>
          <div className="space-y-3">
            {candidate.currentCtcLpa && (
              <div className="flex items-start">
                <DollarSign size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Current CTC</p>
                  <p className="font-medium text-gray-900">{candidate.currentCtcLpa} LPA</p>
                </div>
              </div>
            )}
            {candidate.expectedCtcLpa && (
              <div className="flex items-start">
                <DollarSign size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Expected CTC</p>
                  <p className="font-medium text-gray-900">{candidate.expectedCtcLpa} LPA</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Communication Score</p>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                <div
                  className={`h-3 rounded-full ${candidate.communicationScore >= 7 ? 'bg-green-500' : candidate.communicationScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(candidate.communicationScore || 0) * 10}%` }}
                ></div>
              </div>
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(candidate.communicationScore)}`}>
                {candidate.communicationScore || 'N/A'}/10
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Technical Score</p>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                <div
                  className={`h-3 rounded-full ${candidate.technicalScore >= 7 ? 'bg-green-500' : candidate.technicalScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(candidate.technicalScore || 0) * 10}%` }}
                ></div>
              </div>
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(candidate.technicalScore)}`}>
                {candidate.technicalScore || 'N/A'}/10
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Overall Score</p>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                <div
                  className={`h-3 rounded-full ${candidate.overallScore >= 7 ? 'bg-green-500' : candidate.overallScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(candidate.overallScore || 0) * 10}%` }}
                ></div>
              </div>
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(candidate.overallScore)}`}>
                {candidate.overallScore || 'N/A'}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Preferences</h3>
          <div className="space-y-2">
            {candidate.desiredRole && (
              <div>
                <p className="text-sm text-gray-600">Desired Role</p>
                <p className="font-medium text-gray-900">{candidate.desiredRole}</p>
              </div>
            )}
            {candidate.relocationWilling && (
              <div>
                <p className="text-sm text-gray-600">Willing to Relocate</p>
                <p className="font-medium text-gray-900 capitalize">{candidate.relocationWilling}</p>
              </div>
            )}
            {candidate.interested && (
              <div>
                <p className="text-sm text-gray-600">Interest Level</p>
                <p className="font-medium text-gray-900 capitalize">{candidate.interested}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">First Contact</p>
              <p className="font-medium text-gray-900">
                {format(new Date(candidate.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium text-gray-900">
                {format(new Date(candidate.updatedAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call History */}
      {calls.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calls.map((call) => (
                  <tr key={call._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(call.startTime), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {Math.floor(call.duration / 60)}:{String(call.duration % 60).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        call.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {call.recordingUrl && (
                        <button
                          onClick={() => navigate(`/transcription/${call._id}`)}
                          className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                        >
                          <Play size={16} className="mr-1" />
                          View Recording
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetailPage;
