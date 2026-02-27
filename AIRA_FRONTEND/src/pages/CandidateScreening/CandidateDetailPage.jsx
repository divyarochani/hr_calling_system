import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, Calendar, DollarSign, Award, FileText, Play } from 'lucide-react';
import { getCandidateById } from '../../services/candidateService';
import { formatInIST } from '../../utils/dateUtils';

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
      // FastAPI returns data directly
      setCandidate(response.candidate || response);
      setCalls(response.calls || []);
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
              {candidate.candidate_name || candidate.phone_number}
            </h1>
            <p className="text-gray-600 mt-1">
              {candidate.current_role || 'Candidate'} 
              {candidate.current_company && ` at ${candidate.current_company}`}
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
              <span>{candidate.phone_number}</span>
            </div>
            {candidate.email && (
              <div className="flex items-center text-gray-700">
                <Mail size={18} className="mr-3 text-gray-400" />
                <span>{candidate.email}</span>
              </div>
            )}
            {candidate.current_location && (
              <div className="flex items-center text-gray-700">
                <MapPin size={18} className="mr-3 text-gray-400" />
                <span>{candidate.current_location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
          <div className="space-y-3">
            {candidate.experience_years && (
              <div className="flex items-start">
                <Briefcase size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-medium text-gray-900">{candidate.experience_years} years</p>
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
            {candidate.notice_period && (
              <div className="flex items-start">
                <Calendar size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Notice Period</p>
                  <p className="font-medium text-gray-900">{candidate.notice_period}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compensation */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compensation</h3>
          <div className="space-y-3">
            {candidate.current_ctc_lpa && (
              <div className="flex items-start">
                <DollarSign size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Current CTC</p>
                  <p className="font-medium text-gray-900">{candidate.current_ctc_lpa} LPA</p>
                </div>
              </div>
            )}
            {candidate.expected_ctc_lpa && (
              <div className="flex items-start">
                <DollarSign size={18} className="mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Expected CTC</p>
                  <p className="font-medium text-gray-900">{candidate.expected_ctc_lpa} LPA</p>
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
                  className={`h-3 rounded-full ${candidate.communication_score >= 7 ? 'bg-green-500' : candidate.communication_score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(candidate.communication_score || 0) * 10}%` }}
                ></div>
              </div>
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(candidate.communication_score)}`}>
                {candidate.communication_score || 'N/A'}/10
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Technical Score</p>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                <div
                  className={`h-3 rounded-full ${candidate.technical_score >= 7 ? 'bg-green-500' : candidate.technical_score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(candidate.technical_score || 0) * 10}%` }}
                ></div>
              </div>
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(candidate.technical_score)}`}>
                {candidate.technical_score || 'N/A'}/10
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Overall Score</p>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                <div
                  className={`h-3 rounded-full ${candidate.overall_score >= 7 ? 'bg-green-500' : candidate.overall_score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(candidate.overall_score || 0) * 10}%` }}
                ></div>
              </div>
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(candidate.overall_score)}`}>
                {candidate.overall_score || 'N/A'}/10
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
            {candidate.desired_role && (
              <div>
                <p className="text-sm text-gray-600">Desired Role</p>
                <p className="font-medium text-gray-900">{candidate.desired_role}</p>
              </div>
            )}
            {candidate.relocation_willing && (
              <div>
                <p className="text-sm text-gray-600">Willing to Relocate</p>
                <p className="font-medium text-gray-900 capitalize">{candidate.relocation_willing}</p>
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
                {formatInIST(candidate.created_at || candidate.createdAt, 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium text-gray-900">
                {formatInIST(candidate.updated_at || candidate.updatedAt, 'MMM dd, yyyy HH:mm')}
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
                  <tr key={call._id || call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatInIST(call.start_time || call.startTime, 'MMM dd, yyyy HH:mm')}
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
                      {(call.recording_url || call.recordingUrl) && (
                        <button
                          onClick={() => navigate(`/transcription/${call._id || call.id}`)}
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
