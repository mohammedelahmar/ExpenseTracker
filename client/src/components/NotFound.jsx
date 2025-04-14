import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css'; // Assuming you'll create this CSS file

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;