import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IncidentProvider } from './context/IncidentContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import IncidentsPage from './components/IncidentsPage';
import IncidentDetailPage from './components/IncidentDetailPage';
import './styles.css';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="main-content">{children}</main>
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <IncidentProvider>
                <Layout><DashboardPage /></Layout>
              </IncidentProvider>
            </ProtectedRoute>
          } />
          <Route path="/incidents" element={
            <ProtectedRoute>
              <IncidentProvider>
                <Layout><IncidentsPage /></Layout>
              </IncidentProvider>
            </ProtectedRoute>
          } />
          <Route path="/incidents/:id" element={
            <ProtectedRoute>
              <IncidentProvider>
                <Layout><IncidentDetailPage /></Layout>
              </IncidentProvider>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
} 