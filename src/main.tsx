import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'sonner';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConfigProvider } from 'antd';

import { store } from './redux/store';
import Router from './router';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID);
console.log('🔑 Client ID Length:', GOOGLE_CLIENT_ID?.length);
console.log('🔑 Client ID First 20 chars:', GOOGLE_CLIENT_ID?.substring(0, 20));

if (!GOOGLE_CLIENT_ID) {
  throw new Error('Missing Google Client ID');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#F37022',
            colorLink: '#F37022',
            colorLinkHover: '#d95f19',
            borderRadius: 8,
          },
        }}
      >
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </GoogleOAuthProvider>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
);
