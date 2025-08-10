import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import ReportDashboard from './pages/ReportDashboard';
import Profile from './pages/Profile';
import ExpenseManagement from './pages/ExpenseManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/expenses" element={<ExpenseManagement />} />
        {/* <Route path="/reports" element={<ReportDashboard />} /> */}
        <Route path="/profile" element={<Profile />} />
        {/* Add more routes as needed */}
        {/* Example: <Route path="/dashboard" element={<DashboardPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
