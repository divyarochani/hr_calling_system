import React, { useState } from 'react';
import { Save, Send, User } from 'lucide-react';

const CandidateScreeningForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    education: '',
    skills: '',
    availability: '',
    expectedSalary: '',
    notes: ''
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidate Screening Form</h1>
        <p className="text-gray-600 mt-1">Complete candidate screening and evaluation</p>
      </div>

      <div className="card">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field"
                placeholder="john@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input-field"
                placeholder="+1 234-567-8900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position Applied *</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="input-field"
              >
                <option value="">Select Position</option>
                <option value="software-engineer">Software Engineer</option>
                <option value="product-manager">Product Manager</option>
                <option value="ux-designer">UX Designer</option>
                <option value="data-analyst">Data Analyst</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              className="input-field"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education *</label>
            <textarea
              value={formData.education}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
              className="input-field"
              rows="3"
              placeholder="Bachelor's in Computer Science, XYZ University"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Skills *</label>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              className="input-field"
              rows="3"
              placeholder="React, Node.js, Python, AWS..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                className="input-field"
                placeholder="Immediate / 2 weeks notice"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
              <input
                type="text"
                value={formData.expectedSalary}
                onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})}
                className="input-field"
                placeholder="$80,000 - $100,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Screening Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="input-field"
              rows="4"
              placeholder="Add any additional notes or observations..."
            ></textarea>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" className="btn-secondary flex items-center">
              <Save size={18} className="mr-2" />
              Save Draft
            </button>
            <button type="submit" className="btn-primary flex items-center">
              <Send size={18} className="mr-2" />
              Submit Screening
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateScreeningForm;
