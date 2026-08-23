import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent benign Vite HMR WebSocket disconnects or unhandled rejections from interfering with the application
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (
      reason.includes('WebSocket closed without opened') ||
      reason.includes('failed to connect to websocket') ||
      reason.includes('WebSocket')
    ) {
      event.preventDefault();
      console.debug('Handled Vite HMR connection notice:', reason);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
