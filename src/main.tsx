import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'sonner';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConfigProvider, App } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

import { store } from './redux/store';
import Router from './router';
import ScrollToTop from './components/shared/ScrollToTop';
import { NotificationProvider } from './contexts/NotificationContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('Missing Google Client ID');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <StyleProvider hashPriority="high">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#F37022',
              colorLink: '#F37022',
              colorLinkHover: '#d95f19',
              borderRadius: 8,
              zIndexPopupBase: 2000,
            },
          }}
        >
          <App>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <NotificationProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Router />
                </BrowserRouter>
                <Toaster richColors position="top-right" />
              </NotificationProvider>
            </GoogleOAuthProvider>
          </App>
        </ConfigProvider>
      </StyleProvider>
    </Provider>
  </StrictMode>,
);
