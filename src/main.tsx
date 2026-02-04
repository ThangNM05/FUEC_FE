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

if (!GOOGLE_CLIENT_ID) {
  throw new Error('Missing Google Client ID');
}

  //test deploy
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
