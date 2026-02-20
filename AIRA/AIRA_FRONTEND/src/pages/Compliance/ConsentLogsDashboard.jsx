import React, { useState } from 'react';
import { Search, Filter, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

const ConsentLogsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const consentLogs = [
    { id: 1, caller: 'John Doe', phone: '+1 234-567-8900', consentType: 'Call Recording', status: 'granted', date: '2026-02-10 14:30', method: 'Verbal' },
    { id: 2, caller: 'Jane Smith', phone: '+1 234-567-8901', consentType: 'Data Processing', status: 'granted', date: '2026-02-10 13:15', method: 'Digital' },
    { id: 3, caller: 'Mike Johnson', phone: '+1 234-567-8902', consentType: 'Call Recording', status: 'denied', date: '2026-02-10 12:45', method: 'Verbal' },
    { id: 4, caller: 'Sarah Williams', phone: '+1 234-567-8903', consentType: 'Marketing', status: 'pending', date: '2026-02-10 11:20', method: 'Email' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consent Logs Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and manage user consent records</p>
        </div>
        <button className="btn-primary flex items-center">
          <Download size={20} className="mr-2" />
          Export Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Consents', value: '1,248', icon: CheckCircle, color: 'bg-blue-500' },
          { label: 'Granted', value: '1,156', icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Denied', value: '68', icon: XCircle, color: 'bg-red-500' },
          { label: 'Pending', value: '24', icon: Clock, color: 'bg-yellow-500' },
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
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search consent logs..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consent Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.caller}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.consentType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      log.status === 'granted' ? 'bg-green-100 text-green-800' :
                      log.status === 'denied' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status === 'granted' ? <CheckCircle size={12} className="mr-1" /> :
                       log.status === 'denied' ? <XCircle size={12} className="mr-1" /> :
                       <Clock size={12} className="mr-1" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.date}</td>
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

export default ConsentLogsDashboard;
