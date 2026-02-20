import React, { useState } from 'react';
import { ArrowLeft, User, Mail, MessageSquare, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const QueryDetailView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [response, setResponse] = useState('');

  const query = {
    id: id,
    employee: 'Alice Brown',
    email: 'alice.brown@company.com',
    category: 'Payroll',
    query: 'I noticed a discrepancy in my last paycheck regarding tax deductions. Could you please review and clarify?',
    status: 'open',
    priority: 'high',
    date: '2026-02-10 14:30',
    conversation: [
      { id: 1, sender: 'employee', message: 'I noticed a discrepancy in my last paycheck regarding tax deductions.', timestamp: '2026-02-10 14:30' },
      { id: 2, sender: 'hr', message: 'Thank you for reaching out. I will review your paycheck details and get back to you shortly.', timestamp: '2026-02-10 14:45' },
    ]
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/employee-queries')} className="flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft size={20} className="mr-2" />
        Back to Queries
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{query.category} Query</h2>
                <p className="text-sm text-gray-500 mt-1">{query.date}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  query.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {query.priority}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  {query.status}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {query.conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.sender === 'employee' ? 'bg-gray-50' : 'bg-primary-50'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <MessageSquare size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {msg.sender === 'employee' ? query.employee : 'HR Team'}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.message}</p>
                </div>
              ))}
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
              <button className="btn-secondary">Mark as Resolved</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">{query.employee}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{query.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-left">Escalate to Manager</button>
              <button className="w-full btn-secondary text-left">Schedule Call</button>
              <button className="w-full btn-secondary text-left">Send Email</button>
              <button className="w-full btn-secondary text-left">Add to Knowledge Base</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryDetailView;
