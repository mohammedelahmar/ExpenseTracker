import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import { BrowserRouter } from 'react-router-dom'; // You'll also need this for routing

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_GOOGLE_CLIENT_ID is not set. Google OAuth will not function correctly.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Ensure the client ID matches exactly what's in Google Cloud Console */}
      <GoogleOAuthProvider clientId={clientId}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();