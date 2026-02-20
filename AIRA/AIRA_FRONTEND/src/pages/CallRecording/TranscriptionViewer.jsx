import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Download, FileText, Volume2 } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const TranscriptionViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  const [call, setCall] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetchCallData();
  }, [id]);

  const fetchCallData = async () => {
    try {
      const response = await api.get(`/api/calls/${id}`);
      if (response.data.success) {
        setCall(response.data.data);
        
        // Parse transcript if available
        if (response.data.data.summary) {
          try {
            const parsed = JSON.parse(response.data.data.summary);
            setTranscript(parsed);
          } catch (e) {
            console.error('Error parsing transcript:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching call data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDownloadRecording = () => {
    if (call?.recordingUrl) {
      const link = document.createElement('a');
      link.href = call.recordingUrl;
      link.download = `recording_${call.phoneNumber}_${format(new Date(call.startTime), 'yyyyMMdd_HHmmss')}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadTranscript = () => {
    if (transcript) {
      const dataStr = JSON.stringify(transcript, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transcript_${call.phoneNumber}_${format(new Date(call.startTime), 'yyyyMMdd_HHmmss')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading recording...</div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Recording not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/call-recordings')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Recordings
        </button>
        <div className="flex gap-2">
          {call.recordingUrl && (
            <button
              onClick={handleDownloadRecording}
              className="btn-secondary flex items-center"
            >
              <Download size={20} className="mr-2" />
              Download Audio
            </button>
          )}
          {transcript && (
            <button
              onClick={handleDownloadTranscript}
              className="btn-secondary flex items-center"
            >
              <FileText size={20} className="mr-2" />
              Download Transcript
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Call Recording & Transcript</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Candidate</p>
            <p className="font-medium text-gray-900">{call.candidateId?.candidateName || call.phoneNumber || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <p className="font-medium text-gray-900">{call.phoneNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date & Time</p>
            <p className="font-medium text-gray-900">
              {format(new Date(call.startTime), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium text-gray-900">
              {formatTime(call.duration)}
            </p>
          </div>
        </div>

        {call.recordingUrl ? (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Volume2 className="text-primary-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Audio Recording</h3>
            </div>
            
            <audio
              ref={audioRef}
              src={call.recordingUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${duration ? (currentTime / duration) * 100 : 0}%, #E5E7EB ${duration ? (currentTime / duration) * 100 : 0}%, #E5E7EB 100%)`
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Recording is being processed. Please check back later.</p>
          </div>
        )}

        {transcript && transcript.conversation && transcript.conversation.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Transcript</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transcript.conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary-100 text-primary-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1">
                      {message.role === 'user' ? 'Candidate' : 'AIRA'}
                    </p>
                    <p className="text-sm">{message.text}</p>
                    {message.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(message.timestamp), 'HH:mm:ss')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600">Transcript is being processed. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionViewer;
