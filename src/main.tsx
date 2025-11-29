import './index.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import Providers from './providers';
import Router from './router';

createRoot(document.getElementById('root')!).render(
  <Providers>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </Providers>,
);
