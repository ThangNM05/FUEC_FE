import { Navigate, Outlet } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, setUser, logout } from '../../redux/authSlice';
import { useGetCurrentUserQuery } from '../../api/authApi';

interface ProtectedRouteProps {
  allowedRole: string;
}

/**
 * ProtectedRoute verifies the user's role by calling /Auth/me on the BE.
 * This prevents privilege escalation by NOT trusting the role stored in localStorage.
 * The JWT token itself cannot be tampered with — role comes from server.
 */
function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const localUser = useSelector(selectCurrentUser);

  // If no token at all, redirect to sign-in immediately
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Call /Auth/me to get the REAL role from server (verified via JWT)
  // This cannot be faked by editing localStorage
  const { data: serverUser, isLoading, isError } = useGetCurrentUserQuery();

  if (isLoading) {
    // Show a minimal loading state while verifying with BE
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f8fafc',
          flexDirection: 'column',
          gap: '12px',
          fontFamily: 'Inter, sans-serif',
          color: '#64748b',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #e2e8f0',
            borderTopColor: '#F37022',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 14 }}>Đang xác thực...</span>
      </div>
    );
  }

  if (isError || !serverUser) {
    // Token invalid / expired → force logout
    dispatch(logout());
    return <Navigate to="/sign-in" replace />;
  }

  // Sync Redux + localStorage with the authoritative server role
  // This keeps the UI consistent without being the source-of-truth for auth
  if (localUser && serverUser.role !== localUser.role) {
    dispatch(setUser({ ...localUser, ...serverUser }));
  }

  // The ONLY role check that matters — role from the server, not localStorage
  if (serverUser.role !== allowedRole) {
    return <Navigate to="/not-found" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
