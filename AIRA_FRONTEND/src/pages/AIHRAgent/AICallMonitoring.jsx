import React from 'react';
import { Bot, Activity, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AICallMonitoring = () => {
  const stats = [
    { name: 'AI Accuracy', value: '94.5%', change: '+2.3%', icon: TrendingUp, color: 'bg-green-500' },
    { name: 'Active AI Agents', value: '8', change: '0', icon: Bot, color: 'bg-blue-500' },
    { name: 'Calls Handled', value: '342', change: '+15%', icon: Activity, color: 'bg-purple-500' },
    { name: 'Success Rate', value: '91.2%', change: '+1.8%', icon: CheckCircle, color: 'bg-green-500' },
  ];

  const performanceData = [
    { time: '00:00', accuracy: 92 },
    { time: '04:00', accuracy: 93 },
    { time: '08:00', accuracy: 95 },
    { time: '12:00', accuracy: 94 },
    { time: '16:00', accuracy: 96 },
    { time: '20:00', accuracy: 94 },
  ];

  const activeAgents = [
    { id: 1, name: 'AI Agent 1', status: 'active', calls: 45, accuracy: 95.2 },
    { id: 2, name: 'AI Agent 2', status: 'active', calls: 38, accuracy: 93.8 },
    { id: 3, name: 'AI Agent 3', status: 'active', calls: 52, accuracy: 96.1 },
    { id: 4, name: 'AI Agent 4', status: 'idle', calls: 0, accuracy: 94.5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Call Monitoring Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor AI agent performance and accuracy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Accuracy Trend (24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[85, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active AI Agents</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls Handled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{agent.calls}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{agent.accuracy}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
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

export default AICallMonitoring;
