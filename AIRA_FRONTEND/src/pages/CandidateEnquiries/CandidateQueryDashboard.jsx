import React, { useState } from 'react';
import { Search, Filter, UserSearch, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CandidateQueryDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const queries = [
    { id: 1, candidate: 'John Doe', position: 'Software Engineer', query: 'Salary and benefits inquiry', status: 'pending', priority: 'high', date: '2026-02-10 14:30' },
    { id: 2, candidate: 'Jane Smith', position: 'Product Manager', query: 'Interview schedule question', status: 'resolved', priority: 'medium', date: '2026-02-10 13:15' },
    { id: 3, candidate: 'Mike Johnson', position: 'UX Designer', query: 'Remote work policy', status: 'pending', priority: 'low', date: '2026-02-10 12:45' },
    { id: 4, candidate: 'Sarah Williams', position: 'Data Analyst', query: 'Application status', status: 'in-progress', priority: 'medium', date: '2026-02-10 11:20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidate Query Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage and respond to candidate inquiries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Queries', value: '48', color: 'bg-blue-500' },
          { label: 'Pending', value: '12', color: 'bg-yellow-500' },
          { label: 'In Progress', value: '8', color: 'bg-purple-500' },
          { label: 'Resolved', value: '28', color: 'bg-green-500' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search queries..."
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queries.map((query) => (
                <tr key={query.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{query.candidate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{query.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{query.query}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      query.priority === 'high' ? 'bg-red-100 text-red-800' :
                      query.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {query.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      query.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      query.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {query.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{query.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/job-enquiry/${query.id}`)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidateQueryDashboard;
