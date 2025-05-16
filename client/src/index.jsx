import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import { BrowserRouter } from 'react-router-dom'; // You'll also need this for routing

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Ensure the client ID matches exactly what's in Google Cloud Console */}
      <GoogleOAuthProvider clientId="777108414774-se1rqrsg8rdosj7i6jdgkj50gtrsetg8.apps.googleusercontent.com">
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();