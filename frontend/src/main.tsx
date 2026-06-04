import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ArtemisProvider } from './services/ArtemisContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ArtemisProvider>
        <App />
      </ArtemisProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
