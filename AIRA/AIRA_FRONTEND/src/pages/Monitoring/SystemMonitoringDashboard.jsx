import React from 'react';
import { Activity, Database, Cpu, HardDrive, Users, Phone } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SystemMonitoringDashboard = () => {
  const systemMetrics = [
    { name: 'CPU Usage', value: '45%', icon: Cpu, color: 'bg-blue-500', status: 'normal' },
    { name: 'Memory Usage', value: '62%', icon: HardDrive, color: 'bg-green-500', status: 'normal' },
    { name: 'Database Load', value: '38%', icon: Database, color: 'bg-purple-500', status: 'normal' },
    { name: 'Active Users', value: '248', icon: Users, color: 'bg-yellow-500', status: 'normal' },
  ];

  const performanceData = [
    { time: '00:00', cpu: 35, memory: 55, calls: 20 },
    { time: '04:00', cpu: 28, memory: 48, calls: 15 },
    { time: '08:00', cpu: 52, memory: 68, calls: 45 },
    { time: '12:00', cpu: 48, memory: 65, calls: 52 },
    { time: '16:00', cpu: 45, memory: 62, calls: 48 },
    { time: '20:00', cpu: 38, memory: 58, calls: 32 },
  ];

  const callMetrics = [
    { name: 'Mon', calls: 120, avgDuration: 8.5 },
    { name: 'Tue', calls: 145, avgDuration: 7.8 },
    { name: 'Wed', calls: 132, avgDuration: 9.2 },
    { name: 'Thu', calls: 168, avgDuration: 8.1 },
    { name: 'Fri', calls: 155, avgDuration: 7.5 },
    { name: 'Sat', calls: 89, avgDuration: 6.8 },
    { name: 'Sun', calls: 76, avgDuration: 7.2 },
  ];

  const auditLogs = [
    { id: 1, action: 'User login', user: 'admin@company.com', timestamp: '2026-02-10 14:30:25', status: 'success' },
    { id: 2, action: 'Configuration change', user: 'hr.manager@company.com', timestamp: '2026-02-10 14:15:10', status: 'success' },
    { id: 3, action: 'Failed login attempt', user: 'unknown@email.com', timestamp: '2026-02-10 13:45:33', status: 'failed' },
    { id: 4, action: 'Data export', user: 'admin@company.com', timestamp: '2026-02-10 13:20:15', status: 'success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor system performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {metric.status}
                  </span>
                </div>
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance (24 Hours)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="memory" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Metrics (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={callMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Accuracy Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Overall Accuracy', value: '94.5%', change: '+2.3%', trend: 'up' },
            { label: 'Response Time', value: '1.2s', change: '-0.3s', trend: 'up' },
            { label: 'Success Rate', value: '91.2%', change: '+1.8%', trend: 'up' },
          ].map((metric, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              <p className={`text-sm mt-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Logs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
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

export default SystemMonitoringDashboard;
