import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Seal from '../components/Seal';

export default function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4">
        <Seal status="pending" size={48} animate={false} />
        <p className="text-sm text-slate font-medium">Loading registry session…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.toLowerCase();
  const requiredRole = role?.toLowerCase();

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
}
