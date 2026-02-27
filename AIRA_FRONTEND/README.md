# HR AI Calling System - Enterprise Frontend

A complete, modular, enterprise-grade HR AI Calling System frontend built with React, Tailwind CSS, and modern UI components.

## 🚀 Features

### Complete Module Coverage (16 Modules)

1. **Authentication Module**
   - Login Page with role-based access
   - Forgot Password functionality
   - Session Timeout handling

2. **User Management Module**
   - Admin Dashboard
   - HR Manager Dashboard
   - Recruiter Dashboard
   - User Access Management
   - Role & Permission Configuration

3. **VoIP Calling Module**
   - Call Dashboard (Inbound & Outbound)
   - Active Call Screen with controls
   - Call History with filters

4. **AI HR Agent Module**
   - AI Call Monitoring Dashboard
   - AI Response Logs with confidence scores

5. **Candidate Enquiries Module**
   - Candidate Query Dashboard
   - Job Enquiry Detail View

6. **Candidate Screening Module**
   - Candidate Screening Form
   - Screening Results Dashboard

7. **Interview Scheduling Module**
   - Interview Calendar View
   - Schedule Interview Form

8. **Employee HR Enquiries Module**
   - Employee Query Dashboard
   - Query Detail View with chat

9. **Call Escalation Module**
   - Escalation Queue Dashboard
   - Priority indicators

10. **Call Recording Module**
    - Call Recording Library
    - Transcription Viewer with audio player

11. **Notifications Module**
    - Notification Center
    - Real-time alerts

12. **Compliance Module**
    - Consent Logs Dashboard
    - Compliance Status Screen

13. **Security Module**
    - Security Monitoring Dashboard
    - Encryption status indicators

14. **Monitoring Module**
    - System Monitoring Dashboard
    - Audit Logs

15. **Performance Module**
    - System Health Dashboard
    - Performance metrics

16. **Deployment Module**
    - Environment Status Dashboard
    - Deployment history

## 🛠️ Tech Stack

- **React** - Frontend framework
- **React Router** - Navigation and routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation

## 📦 Installation

```bash
# Navigate to project directory
cd hr-ai-calling-system

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## 🎨 UI Components

### Reusable Components
- **Layout** - Responsive sidebar navigation
- **Cards** - Consistent card styling
- **Buttons** - Primary and secondary button styles
- **Input Fields** - Form inputs with validation
- **Tables** - Data tables with sorting
- **Charts** - Performance and analytics charts
- **Modals** - Confirmation and form modals
- **Badges** - Status indicators
- **Notifications** - Alert popups

### Design Principles
- Clean, modern enterprise design
- Consistent color scheme and typography
- Responsive layouts for all screen sizes
- Accessibility-friendly UI
- Clear visual hierarchy
- Intuitive navigation

## 🔐 Role-Based Access

### Admin
- Full system access
- User management
- System configuration
- Deployment controls
- Security monitoring

### HR Manager
- Call management
- AI monitoring
- Candidate management
- Employee queries
- Compliance oversight

### Recruiter
- Call operations
- Candidate screening
- Interview scheduling
- Query management

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Collapsible sidebar
- Adaptive tables and charts

## 🎯 Key Features

### Dashboard Analytics
- Real-time metrics
- Interactive charts
- Performance indicators
- Trend analysis

### Call Management
- Live call controls
- Call history tracking
- Recording playback
- Transcription viewing

### AI Integration
- AI performance monitoring
- Confidence scoring
- Response logging
- Accuracy metrics

### Compliance & Security
- Consent management
- Audit trails
- Encryption status
- Security alerts

## 📂 Project Structure

```
hr-ai-calling-system/
├── public/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       └── Layout.jsx
│   ├── pages/
│   │   ├── Authentication/
│   │   ├── UserManagement/
│   │   ├── VoIPCalling/
│   │   ├── AIHRAgent/
│   │   ├── CandidateEnquiries/
│   │   ├── CandidateScreening/
│   │   ├── InterviewScheduling/
│   │   ├── EmployeeEnquiries/
│   │   ├── CallEscalation/
│   │   ├── CallRecording/
│   │   ├── Notifications/
│   │   ├── Compliance/
│   │   ├── Security/
│   │   ├── Monitoring/
│   │   ├── Performance/
│   │   └── Deployment/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

## 🚦 Getting Started

1. **Login**: Use the login page to access the system
   - Select your role (Admin/HR Manager/Recruiter)
   - Enter credentials

2. **Navigation**: Use the sidebar to navigate between modules

3. **Dashboard**: View role-specific dashboard with key metrics

4. **Modules**: Access different modules based on your role permissions

## 🔧 Configuration

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Primary color palette
- Custom utility classes
- Responsive breakpoints

### Environment Variables
Create a `.env` file for configuration:
```
REACT_APP_API_URL=your_api_url
REACT_APP_ENV=development
```

## 📊 Data Visualization

- Line charts for trends
- Bar charts for comparisons
- Area charts for cumulative data
- Progress bars for metrics
- Status indicators

## 🔒 Security Features

- Role-based access control
- Session management
- Encrypted data transmission
- Audit logging
- Compliance tracking

## 🎨 Customization

### Colors
Modify `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Components
All components are modular and can be easily customized in their respective files.

## 📝 License

This project is proprietary and confidential.

## 👥 Support

For support and questions, contact the development team.

---

Built with ❤️ for enterprise HR operations
