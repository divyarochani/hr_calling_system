import React, { useState, useEffect } from 'react';
import { Phone, Loader, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';

const MakeCallPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const [callSid, setCallSid] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:status', (data) => {
      if (data.callSid === callSid) {
        setCallStatus(data.status);
        
        // Redirect to call dashboard when connected
        if (data.status === 'connected' || data.status === 'ongoing') {
          setTimeout(() => {
            navigate('/call-dashboard');
          }, 2000);
        }
        
        // Stop calling state if failed or missed
        if (data.status === 'failed' || data.status === 'missed') {
          setCalling(false);
        }
      }
    });

    return () => {
      socket.off('call:status');
    };
  }, [socket, callSid, navigate]);

  const handleMakeCall = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    // Basic phone number validation
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (cleanNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError(null);
    setCalling(true);
    setCallStatus('initiating');

    try {
      // Call Python backend to initiate call
      const pythonBackendUrl = process.env.REACT_APP_PYTHON_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.post(`${pythonBackendUrl}/call/outbound`, null, {
        params: { phone_number: cleanNumber }
      });

      if (response.data.success) {
        setCallSid(response.data.call_sid);
        setCallStatus('initiated');
      } else {
        setError(response.data.error || 'Failed to initiate call');
        setCalling(false);
        setCallStatus('failed');
      }
    } catch (err) {
      console.error('Error making call:', err);
      setError(err.response?.data?.error || 'Failed to connect to calling service');
      setCalling(false);
      setCallStatus('failed');
    }
  };

  const handleCancel = () => {
    setCalling(false);
    setCallStatus(null);
    setCallSid(null);
    setPhoneNumber('');
    setError(null);
  };

  const getStatusDisplay = () => {
    const statuses = {
      initiating: { text: 'Initiating call...', icon: Loader, color: 'text-blue-600', spin: true },
      initiated: { text: 'Call initiated', icon: Phone, color: 'text-blue-600', spin: false },
      ringing: { text: 'Ringing...', icon: Phone, color: 'text-yellow-600', spin: true },
      connected: { text: 'Connected! Redirecting...', icon: CheckCircle, color: 'text-green-600', spin: false },
      ongoing: { text: 'Call in progress', icon: CheckCircle, color: 'text-green-600', spin: false },
      failed: { text: 'Call failed', icon: XCircle, color: 'text-red-600', spin: false },
      missed: { text: 'Call not answered', icon: XCircle, color: 'text-red-600', spin: false },
    };

    return statuses[callStatus] || statuses.initiating;
  };

  const status = callStatus ? getStatusDisplay() : null;
  const StatusIcon = status?.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Make a Call</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Initiate an outbound call to a candidate</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {!calling ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                disabled={calling}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter phone number with country code (e.g., +1234567890)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleMakeCall}
              disabled={calling}
              className="w-full flex items-center justify-center text-lg py-3 px-6 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone size={24} className="mr-2" />
              Make Call
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                {StatusIcon && (
                  <StatusIcon 
                    size={64} 
                    className={`${status.color} ${status.spin ? 'animate-spin' : ''}`}
                  />
                )}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {status?.text}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Calling: {phoneNumber}
              </p>
              {callSid && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Call ID: {callSid}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {(callStatus === 'failed' || callStatus === 'missed') && (
              <button
                onClick={handleCancel}
                className="w-full px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Try Again
              </button>
            )}

            {callStatus === 'initiated' || callStatus === 'ringing' ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-400 text-sm text-center">
                  Waiting for candidate to answer...
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tips:</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Include country code (e.g., +1 for US)</li>
          <li>• Make sure the number is correct before calling</li>
          <li>• You'll be redirected to Call Dashboard when connected</li>
          <li>• The AI agent will handle the conversation automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default MakeCallPage;
