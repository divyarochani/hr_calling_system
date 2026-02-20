import React from 'react';
import { Shield, Lock, AlertTriangle, Eye, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SecurityMonitoringDashboard = () => {
  const securityMetrics = [
    { id: 1, name: 'Encryption Status', status: 'active', value: '100%', icon: Lock, color: 'text-green-500' },
    { id: 2, name: 'Failed Login Attempts', status: 'normal', value: '3', icon: AlertTriangle, color: 'text-yellow-500' },
    { id: 3, name: 'Active Sessions', status: 'normal', value: '42', icon: Eye, color: 'text-blue-500' },
    { id: 4, name: 'Security Score', status: 'excellent', value: '98/100', icon: Shield, color: 'text-green-500' },
  ];

  const securityData = [
    { time: '00:00', threats: 2 },
    { time: '04:00', threats: 1 },
    { time: '08:00', threats: 3 },
    { time: '12:00', threats: 0 },
    { time: '16:00', threats: 1 },
    { time: '20:00', threats: 2 },
  ];

  const securityAlerts = [
    { id: 1, type: 'warning', message: 'Multiple failed login attempts detected', severity: 'medium', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'Security patch applied successfully', severity: 'low', time: '5 hours ago' },
    { id: 3, type: 'success', message: 'All systems passed security scan', severity: 'low', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Monitoring Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor system security and threats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {securityMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <Icon className={metric.color} size={24} />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  metric.status === 'active' || metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                  metric.status === 'normal' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {metric.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{metric.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Threats (24 Hours)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={securityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Encryption Status</h3>
          <div className="space-y-4">
            {[
              { name: 'Data at Rest', status: 'AES-256', enabled: true },
              { name: 'Data in Transit', status: 'TLS 1.3', enabled: true },
              { name: 'Database Encryption', status: 'Enabled', enabled: true },
              { name: 'Backup Encryption', status: 'Enabled', enabled: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Lock className="text-green-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.status}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Alerts</h3>
        <div className="space-y-3">
          {securityAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
              <AlertTriangle className={`mt-0.5 mr-3 ${
                alert.severity === 'high' ? 'text-red-500' :
                alert.severity === 'medium' ? 'text-yellow-500' :
                'text-blue-500'
              }`} size={20} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityMonitoringDashboard;
