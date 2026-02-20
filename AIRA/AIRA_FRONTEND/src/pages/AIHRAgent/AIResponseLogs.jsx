import React, { useState } from 'react';
import { Search, Filter, Download, MessageSquare } from 'lucide-react';

const AIResponseLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const logs = [
    { id: 1, timestamp: '2026-02-10 14:30:25', query: 'What is the salary range?', response: 'The salary range for this position is $80,000 - $120,000 annually.', confidence: 96.5, status: 'success' },
    { id: 2, timestamp: '2026-02-10 14:28:15', query: 'When can I start?', response: 'The expected start date is within 2-4 weeks of offer acceptance.', confidence: 94.2, status: 'success' },
    { id: 3, timestamp: '2026-02-10 14:25:10', query: 'What are the benefits?', response: 'We offer comprehensive health insurance, 401k matching, and flexible work arrangements.', confidence: 98.1, status: 'success' },
    { id: 4, timestamp: '2026-02-10 14:22:05', query: 'Is remote work available?', response: 'Yes, we offer hybrid work with 3 days remote per week.', confidence: 92.8, status: 'success' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Response Logs</h1>
          <p className="text-gray-600 mt-1">View detailed AI conversation logs and responses</p>
        </div>
        <button className="btn-primary flex items-center">
          <Download size={20} className="mr-2" />
          Export Logs
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button className="btn-secondary flex items-center">
            <Filter size={20} className="mr-2" />
            Filter
          </button>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <MessageSquare className="text-primary-600 mr-2" size={20} />
                  <span className="text-sm text-gray-500">{log.timestamp}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {log.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {log.confidence}% confidence
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Query:</p>
                  <p className="text-sm text-gray-900">{log.query}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">AI Response:</p>
                  <p className="text-sm text-gray-700">{log.response}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIResponseLogs;
