import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { TokenProvider } from './context/TokenContext';

console.log('App Startup - Env Variables:');
console.log('REACT_APP_DATABASE_URL:', process.env.REACT_APP_DATABASE_URL || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <TokenProvider>
          <App />
        </TokenProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error.message);
}