import React, { useState, useEffect } from 'react';
import { Search, Play, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { getAllCalls } from '../../services/callService';
import { formatInIST } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config/api.config';

const CallRecordingLibrary = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [recordings, setRecordings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRecordings = async () => {
    try {
      const response = await getAllCalls();
      // FastAPI returns data directly
      const callsData = response.calls || response || [];
      // Filter only completed calls with recordings
      const completedCalls = callsData.filter(
        call => call.status === 'completed' && (call.recording_url || call.recordingUrl)
      );
      setRecordings(completedCalls);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:completed', () => {
      fetchRecordings();
    });

    return () => {
      socket.off('call:completed');
    };
  }, [socket]);

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDownloadRecording = (call) => {
    const recordingUrl = call.recording_url || call.recordingUrl;
    if (recordingUrl) {
      const link = document.createElement('a');
      link.href = recordingUrl;
      link.download = `recording_${call.phone_number || call.phoneNumber}_${formatInIST(call.start_time || call.startTime, 'yyyyMMdd_HHmmss')}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadTranscript = (call) => {
    const transcriptUrl = call.transcript_url || call.transcriptUrl;
    if (transcriptUrl) {
      const link = document.createElement('a');
      link.href = transcriptUrl;
      link.download = `transcript_${call.phone_number || call.phoneNumber}_${formatInIST(call.start_time || call.startTime, 'yyyyMMdd_HHmmss')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredRecordings = recordings.filter(recording =>
    (recording.phone_number || recording.phoneNumber)?.includes(searchTerm) ||
    (recording.candidate_id?.candidate_name || recording.candidateId?.candidateName)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading recordings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Call Recording Library</h1>
        <p className="text-gray-600 mt-1">Access and manage all call recordings and transcripts</p>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by phone number or candidate name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {filteredRecordings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm 
              ? 'No recordings found matching your search' 
              : 'No recordings available yet. Recordings will appear here after calls are completed.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recording</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transcript</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecordings.map((recording) => {
                  const phoneNumber = recording.phone_number || recording.phoneNumber;
                  const candidateName = recording.candidate_id?.candidate_name || recording.candidateId?.candidateName;
                  const startTime = recording.start_time || recording.startTime;
                  const recordingUrl = recording.recording_url || recording.recordingUrl;
                  const transcriptUrl = recording.transcript_url || recording.transcriptUrl;
                  const recordingId = recording._id || recording.id;
                  
                  return (
                    <tr key={recordingId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {candidateName || phoneNumber || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDuration(recording.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatInIST(startTime, 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {recordingUrl ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Processing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transcriptUrl ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Processing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/transcription/${recordingId}`)}
                            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            title="Play & View"
                          >
                            <Play size={16} className="mr-1" />
                            Play
                          </button>
                          {recordingUrl && (
                            <button
                              onClick={() => handleDownloadRecording(recording)}
                              className="text-green-600 hover:text-green-700 font-medium flex items-center"
                              title="Download Recording"
                            >
                              <Download size={16} className="mr-1" />
                              Audio
                            </button>
                          )}
                          {transcriptUrl && (
                            <button
                              onClick={() => handleDownloadTranscript(recording)}
                              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                              title="Download Transcript"
                            >
                              <FileText size={16} className="mr-1" />
                              Text
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallRecordingLibrary;
