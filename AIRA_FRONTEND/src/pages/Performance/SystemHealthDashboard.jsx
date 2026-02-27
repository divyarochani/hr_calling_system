import React from 'react';
import { Activity, Server, Zap, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SystemHealthDashboard = () => {
  const healthMetrics = [
    { name: 'System Uptime', value: '99.98%', icon: Activity, color: 'bg-green-500', status: 'excellent' },
    { name: 'Response Time', value: '145ms', icon: Zap, color: 'bg-blue-500', status: 'good' },
    { name: 'Error Rate', value: '0.02%', icon: AlertCircle, color: 'bg-green-500', status: 'low' },
    { name: 'Retry Success', value: '98.5%', icon: RefreshCw, color: 'bg-purple-500', status: 'excellent' },
  ];

  const uptimeData = [
    { date: 'Feb 04', uptime: 99.95 },
    { date: 'Feb 05', uptime: 99.98 },
    { date: 'Feb 06', uptime: 99.99 },
    { date: 'Feb 07', uptime: 99.97 },
    { date: 'Feb 08', uptime: 99.98 },
    { date: 'Feb 09', uptime: 99.99 },
    { date: 'Feb 10', uptime: 99.98 },
  ];

  const loadData = [
    { time: '00:00', load: 45, concurrent: 120 },
    { time: '04:00', load: 28, concurrent: 85 },
    { time: '08:00', load: 72, concurrent: 245 },
    { time: '12:00', load: 85, concurrent: 312 },
    { time: '16:00', load: 68, concurrent: 268 },
    { time: '20:00', load: 52, concurrent: 198 },
  ];

  const performanceMetrics = [
    { component: 'API Gateway', status: 'healthy', responseTime: '45ms', uptime: '99.99%' },
    { component: 'Database', status: 'healthy', responseTime: '12ms', uptime: '99.98%' },
    { component: 'AI Service', status: 'healthy', responseTime: '230ms', uptime: '99.95%' },
    { component: 'VoIP Service', status: 'healthy', responseTime: '85ms', uptime: '99.97%' },
    { component: 'Storage', status: 'healthy', responseTime: '28ms', uptime: '99.99%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor system performance, reliability, and scalability</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                    metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                    metric.status === 'good' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Uptime (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[99.9, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Load & Concurrent Users</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={loadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="concurrent" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uptime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceMetrics.map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Server className="text-gray-400 mr-2" size={18} />
                      <span className="text-sm font-medium text-gray-900">{metric.component}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      <Activity size={12} className="mr-1" />
                      {metric.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{metric.responseTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{metric.uptime}</td>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Retry Mechanism</h4>
          <p className="text-2xl font-bold text-gray-900">98.5%</p>
          <p className="text-sm text-green-600 mt-1">Success Rate</p>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>• Auto-retry on failure</p>
            <p>• Max 3 attempts</p>
            <p>• Exponential backoff</p>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Scalability</h4>
          <p className="text-2xl font-bold text-gray-900">500+</p>
          <p className="text-sm text-blue-600 mt-1">Concurrent Users</p>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>• Auto-scaling enabled</p>
            <p>• Load balancing active</p>
            <p>• 99.9% availability</p>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Performance</h4>
          <p className="text-2xl font-bold text-gray-900">145ms</p>
          <p className="text-sm text-purple-600 mt-1">Avg Response Time</p>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>• CDN enabled</p>
            <p>• Caching optimized</p>
            <p>• Database indexed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;
