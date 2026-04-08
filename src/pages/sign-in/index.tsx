import './sign-in.css';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // Import GoogleLogin component
import { toast } from 'sonner';

import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import { useGoogleLoginMutation } from '../../api/authApi';

import img_fpt from '../../assets/img_fpt.svg';
import img_error from '../../assets/error.jpeg';

function SignInPage() {
  const [loginError, setLoginError] = useState(false);
  const [failedEmail, setFailedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show toast if user was redirected due to an expired session
  useEffect(() => {
    const msg = sessionStorage.getItem('auth_message');
    if (msg) {
      toast.warning(msg, { duration: 5000 });
      sessionStorage.removeItem('auth_message');
    }
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [googleLoginApi, { isLoading: isApiLoading }] = useGoogleLoginMutation();

  const handleRetry = () => {
    setLoginError(false);
    setFailedEmail('');
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      if (!credentialResponse.credential) throw new Error("No credential received");

      // Send ID Token to backend
      const result = await googleLoginApi({ idToken: credentialResponse.credential }).unwrap();

      dispatch(setCredentials({ user: result.user, token: result.accessToken }));

      toast.success(`Welcome back, ${result.user.fullName}!`);

      // Redirect based on role
      if (result.user.role === 'Admin') {
        navigate('/admin', { replace: true });
      } else if (result.user.role === 'Teacher') {
        navigate('/teacher', { replace: true });
      } else {
        // Default to student or other roles
        navigate('/student', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);

      // Decode token to get email for error message if possible
      try {
        if (credentialResponse.credential) {
          const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
          if (payload.email) setFailedEmail(payload.email);
          else setFailedEmail('your account');
        }
      } catch (e) {
        setFailedEmail('your account');
      }

      setLoginError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setFailedEmail('your account');
    setLoginError(true);
    setIsLoading(false);
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg-pattern"></div>
      <div className="login-bg-circle login-bg-circle-1"></div>
      <div className="login-bg-circle login-bg-circle-2"></div>

      <div className="login-content">
        {/* Logo and Title */}
        <div className="login-brand-center">
          <div className="login-logo-center">
            <img src={img_fpt} alt="FPT Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
          <h1 className="login-title">EduConnect</h1>
        </div>

        {/* Login Card or Error View */}
        <div className="login-card">
          {loginError ? (
            <div className="error-view">
              <div className="error-icon-container">
                <img src={img_error} alt="Error" className="error-image" />
              </div>
              <p className="error-message">
                Oops, <span className="error-email">{failedEmail}</span> don't have permission to access the platform
              </p>
              <p className="error-support-text">
                Please contact <a href="mailto:educonnectadm@gmail.com" className="support-link">educonnectadm@gmail.com</a> for support.
              </p>
              <button className="btn-retry" onClick={handleRetry}>
                Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="login-welcome">Welcome Back</h2>
              <p className="login-subtitle">Sign in to access your learning portal</p>

              <div className="login-form-new">
                {/* Google Sign In Wrapper */}
                <div className="social-buttons" style={{ marginTop: 0, position: 'relative' }}>
                  {/* The actual working Google Button (Invisible overlay) */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.01, overflow: 'hidden', zIndex: 10 }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      type="standard"
                      theme="filled_blue"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      width="350" // ensure it covers the underlying button
                    />
                  </div>

                  {/* The Custom UI Button (Visual only) */}
                  <button
                    type="button"
                    className="btn-social btn-social-full"
                    disabled={isLoading || isApiLoading}
                    style={{ pointerEvents: 'none' }} // Let clicks pass through to the overlay? No, overlay is on top.
                  >
                    <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </div>

              {/* Footer */}
              <p className="login-footer-text">
                © 2026 FUEC - FPT University. All rights reserved.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
