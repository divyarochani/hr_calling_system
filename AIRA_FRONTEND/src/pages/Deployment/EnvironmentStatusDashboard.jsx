import React from 'react';
import { Server, CheckCircle, XCircle, Clock, GitBranch, Package } from 'lucide-react';

const EnvironmentStatusDashboard = () => {
  const environments = [
    {
      name: 'Production',
      status: 'healthy',
      version: 'v2.4.1',
      deployed: '2026-02-08 10:30',
      uptime: '99.98%',
      instances: 8,
      url: 'https://hr-ai.company.com'
    },
    {
      name: 'Staging',
      status: 'healthy',
      version: 'v2.5.0-rc1',
      deployed: '2026-02-10 09:15',
      uptime: '99.95%',
      instances: 4,
      url: 'https://staging-hr-ai.company.com'
    },
    {
      name: 'Development',
      status: 'deploying',
      version: 'v2.5.0-dev',
      deployed: '2026-02-10 14:20',
      uptime: '99.90%',
      instances: 2,
      url: 'https://dev-hr-ai.company.com'
    },
    {
      name: 'Testing',
      status: 'healthy',
      version: 'v2.5.0-beta',
      deployed: '2026-02-09 16:45',
      uptime: '99.92%',
      instances: 2,
      url: 'https://test-hr-ai.company.com'
    }
  ];

  const deploymentHistory = [
    { id: 1, version: 'v2.4.1', environment: 'Production', status: 'success', date: '2026-02-08 10:30', deployedBy: 'admin@company.com' },
    { id: 2, version: 'v2.5.0-rc1', environment: 'Staging', status: 'success', date: '2026-02-10 09:15', deployedBy: 'devops@company.com' },
    { id: 3, version: 'v2.4.0', environment: 'Production', status: 'success', date: '2026-02-05 14:20', deployedBy: 'admin@company.com' },
    { id: 4, version: 'v2.3.9', environment: 'Production', status: 'failed', date: '2026-02-03 11:10', deployedBy: 'admin@company.com' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'deploying':
        return <Clock className="text-yellow-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Server className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Environment Status Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor deployment status across all environments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Environments', value: '4', icon: Server, color: 'bg-blue-500' },
          { label: 'Healthy', value: '3', icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Deploying', value: '1', icon: Clock, color: 'bg-yellow-500' },
          { label: 'Current Version', value: 'v2.4.1', icon: Package, color: 'bg-purple-500' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {environments.map((env) => (
          <div key={env.name} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getStatusIcon(env.status)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
                  <p className="text-sm text-gray-500">{env.url}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                env.status === 'healthy' ? 'bg-green-100 text-green-800' :
                env.status === 'deploying' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {env.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Version</p>
                <p className="text-sm font-medium text-gray-900 flex items-center mt-1">
                  <GitBranch size={14} className="mr-1" />
                  {env.version}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Instances</p>
                <p className="text-sm font-medium text-gray-900 flex items-center mt-1">
                  <Server size={14} className="mr-1" />
                  {env.instances} active
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Uptime</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{env.uptime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Deployed</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{env.deployed}</p>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button className="btn-secondary flex-1 text-sm">View Logs</button>
              <button className="btn-secondary flex-1 text-sm">Rollback</button>
              {env.name !== 'Production' && (
                <button className="btn-primary flex-1 text-sm">Deploy</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Environment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deployed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deploymentHistory.map((deployment) => (
                <tr key={deployment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <Package size={14} className="mr-2 text-gray-400" />
                      {deployment.version}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{deployment.environment}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      deployment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {deployment.status === 'success' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                      {deployment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{deployment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{deployment.deployedBy}</td>
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

export default EnvironmentStatusDashboard;
