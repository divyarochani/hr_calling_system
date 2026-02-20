import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast/ToastContainer';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import { selectIsAuthenticated, selectUser, logoutUser } from './store/slices/authSlice';

// Authentication
import LoginPage from './pages/Authentication/LoginPage';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import SessionTimeout from './pages/Authentication/SessionTimeout';

// Dashboards
import AdminDashboard from './pages/UserManagement/AdminDashboard';
import HRManagerDashboard from './pages/UserManagement/HRManagerDashboard';
import RecruiterDashboard from './pages/UserManagement/RecruiterDashboard';
import UserAccessManagement from './pages/UserManagement/UserAccessManagement';
import RolePermissionConfig from './pages/UserManagement/RolePermissionConfig';

// VoIP Calling
import CallDashboard from './pages/VoIPCalling/CallDashboard';
import ActiveCallScreen from './pages/VoIPCalling/ActiveCallScreen';
import CallHistoryScreen from './pages/VoIPCalling/CallHistoryScreen';
import MakeCallPage from './pages/VoIPCalling/MakeCallPage';
import TransferredCalls from './pages/VoIPCalling/TransferredCalls';
import BulkImport from './pages/VoIPCalling/BulkImport';

// AI HR Agent
import AICallMonitoring from './pages/AIHRAgent/AICallMonitoring';
import AIResponseLogs from './pages/AIHRAgent/AIResponseLogs';

// Candidate Enquiries
import CandidateQueryDashboard from './pages/CandidateEnquiries/CandidateQueryDashboard';
import JobEnquiryDetail from './pages/CandidateEnquiries/JobEnquiryDetail';

// Candidate Screening
import CandidateScreeningForm from './pages/CandidateScreening/CandidateScreeningForm';
import ScreeningResultsDashboard from './pages/CandidateScreening/ScreeningResultsDashboard';
import CandidateDetailPage from './pages/CandidateScreening/CandidateDetailPage';
import ConversationHistory from './pages/CandidateScreening/ConversationHistory';
import ConversationDetail from './pages/CandidateScreening/ConversationDetail';
import NotInterestedCandidates from './pages/CandidateScreening/NotInterestedCandidates';
import UnsuccessfulCalls from './pages/CandidateScreening/UnsuccessfulCalls';

// Interview Scheduling
import InterviewCalendar from './pages/InterviewScheduling/InterviewCalendar';
import ScheduleInterviewForm from './pages/InterviewScheduling/ScheduleInterviewForm';

// Employee HR Enquiries
import EmployeeQueryDashboard from './pages/EmployeeEnquiries/EmployeeQueryDashboard';
import QueryDetailView from './pages/EmployeeEnquiries/QueryDetailView';

// Call Escalation
import EscalationQueueDashboard from './pages/CallEscalation/EscalationQueueDashboard';

// Call Recording
import CallRecordingLibrary from './pages/CallRecording/CallRecordingLibrary';
import TranscriptionViewer from './pages/CallRecording/TranscriptionViewer';

// Reports
import ExportData from './pages/Reports/ExportData';

// Notifications
import NotificationCenter from './pages/Notifications/NotificationCenter';

// Compliance
import ConsentLogsDashboard from './pages/Compliance/ConsentLogsDashboard';
import ComplianceStatusScreen from './pages/Compliance/ComplianceStatusScreen';

// Security
import SecurityMonitoringDashboard from './pages/Security/SecurityMonitoringDashboard';

// Monitoring
import SystemMonitoringDashboard from './pages/Monitoring/SystemMonitoringDashboard';

// Performance
import SystemHealthDashboard from './pages/Performance/SystemHealthDashboard';

// Deployment
import EnvironmentStatusDashboard from './pages/Deployment/EnvironmentStatusDashboard';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Map backend roles to frontend dashboard routes
  const getRoleRoute = (role) => {
    const roleMap = {
      'admin': 'admin-dashboard',
      'hr_manager': 'hr-manager-dashboard',
      'recruiter': 'recruiter-dashboard',
    };
    return roleMap[role] || 'recruiter-dashboard';
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/session-timeout" element={<SessionTimeout />} />

              <Route path="/" element={
                <PrivateRoute>
                  <Layout userRole={user?.role} onLogout={handleLogout} />
              </PrivateRoute>
            }>
              <Route index element={<Navigate to={`/${getRoleRoute(user?.role)}`} replace />} />
              <Route path="admin-dashboard" element={<AdminDashboard />} />
              <Route path="hr-manager-dashboard" element={<HRManagerDashboard />} />
              <Route path="recruiter-dashboard" element={<RecruiterDashboard />} />
              <Route path="user-access" element={<UserAccessManagement />} />
              <Route path="role-permissions" element={<RolePermissionConfig />} />
              <Route path="make-call" element={<MakeCallPage />} />
              <Route path="call-dashboard" element={<CallDashboard />} />
              <Route path="active-call" element={<ActiveCallScreen />} />
              <Route path="call-history" element={<CallHistoryScreen />} />
              <Route path="transferred-calls" element={<TransferredCalls />} />
              <Route path="bulk-import" element={<BulkImport />} />
              <Route path="candidate/:id" element={<CandidateDetailPage />} />
              <Route path="screening-results" element={<ScreeningResultsDashboard />} />
              <Route path="conversation-history" element={<ConversationHistory />} />
              <Route path="conversation/:id" element={<ConversationDetail />} />
              <Route path="not-interested" element={<NotInterestedCandidates />} />
              <Route path="unsuccessful-calls" element={<UnsuccessfulCalls />} />
              <Route path="interview-calendar" element={<InterviewCalendar />} />
              <Route path="call-recordings" element={<CallRecordingLibrary />} />
              <Route path="transcription/:id" element={<TranscriptionViewer />} />
              <Route path="export-data" element={<ExportData />} />
              <Route path="notifications" element={<NotificationCenter />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
