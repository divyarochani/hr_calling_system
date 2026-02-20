import React, { useState } from 'react';
import { Search, Filter, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeQueryDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const queries = [
    { id: 1, employee: 'Alice Brown', category: 'Payroll', query: 'Question about tax deductions', status: 'open', priority: 'high', date: '2026-02-10 14:30' },
    { id: 2, employee: 'Bob Wilson', category: 'Benefits', query: 'Health insurance coverage inquiry', status: 'in-progress', priority: 'medium', date: '2026-02-10 13:15' },
    { id: 3, employee: 'Carol Davis', category: 'Leave', query: 'Vacation days balance', status: 'resolved', priority: 'low', date: '2026-02-10 12:45' },
    { id: 4, employee: 'David Miller', category: 'Policy', query: 'Remote work policy clarification', status: 'open', priority: 'medium', date: '2026-02-10 11:20' },
  ];

  const categories = ['All', 'Payroll', 'Benefits', 'Leave', 'Policy', 'Training', 'Other'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee HR Queries</h1>
        <p className="text-gray-600 mt-1">Manage employee inquiries and requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Queries', value: '89', color: 'bg-blue-500' },
          { label: 'Open', value: '23', color: 'bg-yellow-500' },
          { label: 'In Progress', value: '15', color: 'bg-purple-500' },
          { label: 'Resolved', value: '51', color: 'bg-green-500' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category.toLowerCase())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === category.toLowerCase()
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{query.employee}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {query.category}
                    </span>
                  </td>
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
                      onClick={() => navigate(`/query-detail/${query.id}`)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View
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

export default EmployeeQueryDashboard;
