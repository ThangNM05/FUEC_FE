import './sign-in.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import { useGoogleLoginMutation } from '../../api/authApi';

import img_fpt from '../../assets/img_fpt.svg';

function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [googleLoginApi, { isLoading: isApiLoading }] = useGoogleLoginMutation();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        console.log('Google Auth Response:', tokenResponse);
        // Using access_token as idToken for now, assuming backend handles it or we adjust backend later.
        // If backend fails, we need to switch to <GoogleLogin/> component to get real ID Token.
        const result = await googleLoginApi({ idToken: tokenResponse.access_token }).unwrap();

        dispatch(setCredentials({ user: result.user, token: result.token }));

        toast.success(`Welcome back, ${result.user.fullName}!`);

        // Redirect based on role
        if (result.user.role === 'Admin') {
          navigate('/admin');
        } else if (result.user.role === 'Teacher') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
      } catch (err: any) {
        console.error('Login error:', err);
        toast.error('Failed to login with Google.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error('Google Login Failed');
      setIsLoading(false);
    },
  });

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
          <h2 className="login-welcome">Welcome Back</h2>
          <p className="login-subtitle">Sign in to access your learning portal</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-form-new">
            {/* Google Sign In Button */}
            <div className="social-buttons" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn-social btn-social-full"
                onClick={() => login()}
                disabled={isLoading || isApiLoading}
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
          <p className="login-footer-text" style={{ textAlign: 'center', marginTop: '20px' }}>
            © 2025 FUEC - FPT University. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
