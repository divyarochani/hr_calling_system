import React, { useState } from 'react';
import { ArrowLeft, User, Briefcase, Mail, Phone, MessageSquare, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const JobEnquiryDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [response, setResponse] = useState('');

  const enquiry = {
    id: id,
    candidate: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 234-567-8900',
    position: 'Software Engineer',
    query: 'I would like to know more about the salary range and benefits package for this position. Also, is there flexibility for remote work?',
    status: 'pending',
    priority: 'high',
    date: '2026-02-10 14:30',
    history: [
      { id: 1, type: 'query', message: 'Initial inquiry submitted', timestamp: '2026-02-10 14:30' },
      { id: 2, type: 'note', message: 'Assigned to HR Manager', timestamp: '2026-02-10 14:35' },
    ]
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/candidate-queries')} className="flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft size={20} className="mr-2" />
        Back to Queries
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Query Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Query</label>
                <p className="mt-1 text-gray-900">{enquiry.query}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      {enquiry.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <p className="mt-1">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      {enquiry.priority}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="input-field"
              rows="6"
              placeholder="Type your response here..."
            ></textarea>
            <div className="mt-4 flex space-x-3">
              <button className="btn-primary flex items-center">
                <Send size={18} className="mr-2" />
                Send Response
              </button>
              <button className="btn-secondary">Save Draft</button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
            <div className="space-y-3">
              {enquiry.history.map((item) => (
                <div key={item.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="text-gray-400 mt-0.5 mr-3" size={18} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">{enquiry.candidate}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{enquiry.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{enquiry.phone}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Briefcase className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Position</p>
                  <p className="text-sm font-medium text-gray-900">{enquiry.position}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-left">Schedule Call</button>
              <button className="w-full btn-secondary text-left">Send Email</button>
              <button className="w-full btn-secondary text-left">Escalate Query</button>
              <button className="w-full btn-secondary text-left">Mark as Resolved</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobEnquiryDetail;
