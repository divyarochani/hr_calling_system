import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { getAllCandidates } from '../../services/candidateService';

const InterviewCalendar = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('candidate:updated', fetchCandidates);
    socket.on('call:completed', fetchCandidates);

    return () => {
      socket.off('candidate:updated');
      socket.off('call:completed');
    };
  }, [socket]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await getAllCandidates();
      // FastAPI returns data directly
      const candidatesData = response.candidates || response || [];
      // Filter candidates with next round availability
      const scheduledCandidates = candidatesData.filter(
        c => (c.next_round_availability || c.nextRoundAvailability) && 
             ((c.call_status === 'Completed' || c.callStatus === 'Completed') || 
              (c.overall_score >= 7 || c.overallScore >= 7))
      );
      setCandidates(scheduledCandidates);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interview Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Schedule and manage interviews</p>
        </div>
        <button onClick={() => navigate('/schedule-interview')} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <Plus size={20} className="mr-2" />
          Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth();
              
              // Check if any candidate has interview on this specific date
              const hasInterview = candidates.some(c => {
                const availability = c.next_round_availability || c.nextRoundAvailability;
                if (!availability) return false;
                
                const availabilityLower = availability.toLowerCase();
                
                // Try to parse the date
                try {
                  // Check for explicit date match (e.g., "2026-02-20", "20/02/2026", "Feb 20")
                  const dateStr = availability;
                  const parsedDate = new Date(dateStr);
                  
                  if (!isNaN(parsedDate.getTime())) {
                    return parsedDate.getDate() === day &&
                           parsedDate.getMonth() === currentMonth &&
                           parsedDate.getFullYear() === currentYear;
                  }
                  
                  // Check for day number in text (e.g., "tomorrow", "20th", "on 20")
                  const dayPattern = new RegExp(`\\b${day}\\b`);
                  if (dayPattern.test(availabilityLower)) {
                    // Additional check: if it says "tomorrow" and tomorrow is this day
                    if (availabilityLower.includes('tomorrow')) {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.getDate() === day &&
                             tomorrow.getMonth() === currentMonth &&
                             tomorrow.getFullYear() === currentYear;
                    }
                    return true;
                  }
                  
                  // Check for day names (Monday, Tuesday, etc.)
                  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const targetDate = new Date(currentYear, currentMonth, day);
                  const targetDayName = dayNames[targetDate.getDay()];
                  
                  if (availability.includes(targetDayName)) {
                    return true;
                  }
                } catch (e) {
                  return false;
                }
                
                return false;
              });
              
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === currentMonth &&
                             new Date().getFullYear() === currentYear;
              
              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg border cursor-pointer transition-colors ${
                    isToday 
                      ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-500 dark:border-primary-400 font-bold' 
                      : hasInterview 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 font-semibold' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={`text-sm ${
                    isToday 
                      ? 'text-primary-700 dark:text-primary-300' 
                      : hasInterview
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Candidates for Next Round ({candidates.length})
          </h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <div key={candidate._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {candidate.candidateName || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {candidate.phoneNumber}
                        </div>
                        {candidate.domain && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.domain}</p>
                        )}
                      </div>
                      {candidate.overallScore && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          candidate.overallScore >= 7 ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' :
                          candidate.overallScore >= 5 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400'
                        }`}>
                          {candidate.overallScore}/10
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      <CalendarIcon size={12} className="mr-1" />
                      {candidate.nextRoundAvailability}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm">No candidates scheduled for next round</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewCalendar;
