import React, { useState } from 'react';
import { Calendar, Clock, User, Briefcase, MapPin, Users, Save } from 'lucide-react';

const ScheduleInterviewForm = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    candidate: '',
    position: '',
    interviewType: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    interviewers: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schedule Interview</h1>
        <p className="text-gray-600 mt-1">Set up a new interview with a candidate</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline mr-2" size={16} />
                Candidate Name *
              </label>
              <input
                type="text"
                value={formData.candidate}
                onChange={(e) => setFormData({...formData, candidate: e.target.value})}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="inline mr-2" size={16} />
                Position *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="input-field"
                required
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type *</label>
            <select
              value={formData.interviewType}
              onChange={(e) => setFormData({...formData, interviewType: e.target.value})}
              className="input-field"
              required
            >
              <option value="">Select Type</option>
              <option value="phone-screening">Phone Screening</option>
              <option value="technical">Technical Interview</option>
              <option value="hr-round">HR Round</option>
              <option value="final-round">Final Round</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline mr-2" size={16} />
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min) *</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="input-field"
                required
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Location / Meeting Link *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="input-field"
              placeholder="Conference Room A or https://meet.example.com/xyz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline mr-2" size={16} />
              Interviewers
            </label>
            <input
              type="text"
              value={formData.interviewers}
              onChange={(e) => setFormData({...formData, interviewers: e.target.value})}
              className="input-field"
              placeholder="Jane Smith, Mike Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="input-field"
              rows="4"
              placeholder="Any special instructions or notes..."
            ></textarea>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" className="btn-secondary flex items-center">
              <Save size={18} className="mr-2" />
              Save Draft
            </button>
            <button type="submit" className="btn-primary flex items-center">
              <Calendar size={18} className="mr-2" />
              Schedule Interview
            </button>
          </div>
        </form>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Scheduled!</h3>
            <p className="text-gray-600 mb-6">
              The interview has been scheduled successfully. Confirmation emails will be sent to all participants.
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              className="btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleInterviewForm;
