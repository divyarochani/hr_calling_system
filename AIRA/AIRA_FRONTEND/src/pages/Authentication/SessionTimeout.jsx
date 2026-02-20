import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, LogIn } from 'lucide-react';

const SessionTimeout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <Clock className="mx-auto text-yellow-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h1>
          <p className="text-gray-600 mb-6">
            Your session has timed out due to inactivity. Please log in again to continue.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center">
            <LogIn size={20} className="mr-2" />
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;
