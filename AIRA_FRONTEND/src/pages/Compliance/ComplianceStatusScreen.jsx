import React from 'react';
import { Shield, CheckCircle, AlertTriangle, FileText, Lock } from 'lucide-react';

const ComplianceStatusScreen = () => {
  const complianceItems = [
    { id: 1, category: 'GDPR Compliance', status: 'compliant', lastCheck: '2026-02-10', score: 98, items: ['Data encryption', 'Consent management', 'Right to deletion'] },
    { id: 2, category: 'HIPAA Compliance', status: 'compliant', lastCheck: '2026-02-09', score: 95, items: ['PHI protection', 'Access controls', 'Audit logs'] },
    { id: 3, category: 'SOC 2 Type II', status: 'review-needed', lastCheck: '2026-02-08', score: 88, items: ['Security policies', 'Incident response', 'Change management'] },
    { id: 4, category: 'ISO 27001', status: 'compliant', lastCheck: '2026-02-10', score: 96, items: ['Information security', 'Risk assessment', 'Business continuity'] },
  ];

  const recentAudits = [
    { id: 1, type: 'Data Protection Audit', date: '2026-02-05', result: 'Passed', auditor: 'External Auditor' },
    { id: 2, type: 'Security Assessment', date: '2026-01-28', result: 'Passed', auditor: 'Internal Team' },
    { id: 3, type: 'Compliance Review', date: '2026-01-15', result: 'Minor Issues', auditor: 'Compliance Officer' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Status</h1>
        <p className="text-gray-600 mt-1">Monitor compliance standards and regulations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Overall Score', value: '94%', icon: Shield, color: 'bg-green-500' },
          { label: 'Compliant', value: '3/4', icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Review Needed', value: '1', icon: AlertTriangle, color: 'bg-yellow-500' },
          { label: 'Last Audit', value: 'Feb 10', icon: FileText, color: 'bg-blue-500' },
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
        {complianceItems.map((item) => (
          <div key={item.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Shield className="text-primary-600 mr-3" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.category}</h3>
                  <p className="text-sm text-gray-500">Last checked: {item.lastCheck}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status === 'compliant' ? 'Compliant' : 'Review Needed'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Compliance Score</span>
                <span className="text-sm font-semibold text-gray-900">{item.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.score >= 95 ? 'bg-green-500' : item.score >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Key Requirements:</p>
              <ul className="space-y-1">
                {item.items.map((requirement, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500 mr-2" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Audits</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auditor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{audit.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{audit.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      audit.result === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {audit.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{audit.auditor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                      View Report
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

export default ComplianceStatusScreen;
