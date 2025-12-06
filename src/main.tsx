import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';

import './index.css';
import Router from './router';
import { store } from './redux/store';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/sign-in">
        <BrowserRouter>
          <Router />
        </BrowserRouter>
        <Toaster />
      </ClerkProvider>
    </Provider>
  </StrictMode>,
);
