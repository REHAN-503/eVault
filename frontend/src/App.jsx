import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RequestAccess from './pages/RequestAccess';
import LawyerDashboard from './pages/LawyerDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AuditPage from './pages/AuditPage';
import DocumentDetail from './pages/DocumentDetail';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-center" richColors theme="light" />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/request-access" element={<RequestAccess />} />

          <Route path="/lawyer" element={<ProtectedRoute role="lawyer"><LawyerDashboard /></ProtectedRoute>} />
          <Route path="/lawyer/audit" element={<ProtectedRoute role="lawyer"><AuditPage role="lawyer" /></ProtectedRoute>} />

          <Route path="/judge" element={<ProtectedRoute role="judge"><JudgeDashboard /></ProtectedRoute>} />
          <Route path="/judge/audit" element={<ProtectedRoute role="judge"><AuditPage role="judge" /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute role="admin"><AuditPage role="admin" /></ProtectedRoute>} />

          <Route path="/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/audit" element={<ProtectedRoute role="client"><AuditPage role="client" /></ProtectedRoute>} />

          <Route path="/documents/:docId" element={<ProtectedRoute><DocumentDetail /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
