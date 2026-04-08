import { Navigate, Outlet } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, setUser, logout } from '../../redux/authSlice';
import { useGetCurrentUserQuery } from '../../api/authApi';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (isError || (!isLoading && !serverUser)) {
      dispatch(logout()); // store.ts automatically resets cache on logout
      sessionStorage.setItem('auth_message', 'Your session has expired. Please sign in again.');
    }
  }, [isError, isLoading, serverUser, dispatch]);

  // Sync Redux + localStorage with the authoritative server role
  useEffect(() => {
    if (localUser && serverUser && serverUser.role !== localUser.role) {
      dispatch(setUser({ ...localUser, ...serverUser }));
    }
  }, [serverUser, localUser, dispatch]);

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
        <span style={{ fontSize: 14 }}>Verifying...</span>
      </div>
    );
  }

  if (isError || !serverUser) {
    // useEffect handled logout — just redirect
    return <Navigate to="/sign-in" replace />;
  }

  // The ONLY role check that matters — role from the server, not localStorage
  if (serverUser.role !== allowedRole) {
    return <Navigate to="/not-found" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
