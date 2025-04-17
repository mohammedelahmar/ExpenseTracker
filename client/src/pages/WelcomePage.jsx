import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/WelcomePage.css';

const WelcomePage = () => {
  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <h1>Expense Tracker</h1>
        <p className="tagline">Simplify your finances, amplify your savings</p>
      </header>

      <section className="welcome-content">
        <div className="welcome-info">
          <h2>Take Control of Your Finances</h2>
          <p>
            Expense Tracker helps you manage your personal finances effectively. 
            Track expenses, set budgets, analyze spending patterns, and make 
            informed financial decisions.
          </p>
          
          <h3>Key Features</h3>
          <ul className="features-list">
            <li>
              <span className="feature-icon">📊</span>
              <span className="feature-text">Track and categorize expenses</span>
            </li>
            <li>
              <span className="feature-icon">📈</span>
              <span className="feature-text">Generate visual spending reports</span>
            </li>
            <li>
              <span className="feature-icon">🏷️</span>
              <span className="feature-text">Create custom expense categories</span>
            </li>
            <li>
              <span className="feature-icon">📅</span>
              <span className="feature-text">Set and monitor monthly budgets</span>
            </li>
            <li>
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Secure and private financial tracking</span>
            </li>
          </ul>
        </div>
        
        <div className="auth-container">
          <div className="auth-card">
            <h2>Get Started Today</h2>
            <p>Join thousands of users who have taken control of their finances</p>
            
            <div className="auth-buttons">
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
              <Link to="/login" className="btn btn-outline">Sign In</Link>
            </div>
            
            <div className="testimonial">
              <p>"This app has completely transformed how I manage my expenses. Highly recommend!"</p>
              <span className="testimonial-author">— Sarah M.</span>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="welcome-footer">
        <p>© 2025 Expense Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;