import React, { useState } from 'react';
import { AlertTriangle, Clock, User, Phone } from 'lucide-react';

const EscalationQueueDashboard = () => {
  const [filter, setFilter] = useState('all');

  const escalations = [
    { id: 1, caller: 'John Doe', reason: 'Complex salary negotiation', priority: 'high', waitTime: '15 min', assignedTo: 'Unassigned', status: 'pending' },
    { id: 2, caller: 'Jane Smith', reason: 'Policy clarification needed', priority: 'medium', waitTime: '8 min', assignedTo: 'Sarah Wilson', status: 'in-progress' },
    { id: 3, caller: 'Mike Johnson', reason: 'Complaint escalation', priority: 'high', waitTime: '22 min', assignedTo: 'Unassigned', status: 'pending' },
    { id: 4, caller: 'Emily Davis', reason: 'Technical issue with application', priority: 'low', waitTime: '5 min', assignedTo: 'Tom Brown', status: 'in-progress' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Call Escalation Queue</h1>
        <p className="text-gray-600 mt-1">Manage escalated calls and assign to HR staff</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Escalations', value: '24', icon: AlertTriangle, color: 'bg-red-500' },
          { label: 'Pending', value: '12', icon: Clock, color: 'bg-yellow-500' },
          { label: 'In Progress', value: '8', icon: User, color: 'bg-blue-500' },
          { label: 'Resolved Today', value: '15', icon: Phone, color: 'bg-green-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'in-progress', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wait Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {escalations.map((escalation) => (
                <tr key={escalation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{escalation.caller}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{escalation.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      escalation.priority === 'high' ? 'bg-red-100 text-red-800' :
                      escalation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <AlertTriangle size={12} className="mr-1" />
                      {escalation.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-gray-400" />
                      {escalation.waitTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{escalation.assignedTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      escalation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      escalation.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {escalation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {escalation.assignedTo === 'Unassigned' && (
                      <button className="text-primary-600 hover:text-primary-700 font-medium">
                        Assign to Me
                      </button>
                    )}
                    <button className="text-primary-600 hover:text-primary-700 font-medium">
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

export default EscalationQueueDashboard;
