import React from 'react';
import { Link } from 'react-router-dom';
import { useLottie } from 'lottie-react';
import '../styles/WelcomePage.css';

// Import your Lottie animations
const graphAnimationUrl = 'https://lottie.host/798e30a1-2411-4400-a7d9-95cb697826de/Af78fSvDGu.lottie';
const aiAnimationUrl = 'https://lottie.host/5dd31e3b-3a49-4518-8a24-75c741794e21/Z9wCI2Y2im.lottie';

const GraphAnimation = () => {
  const options = {
    animationData: graphAnimationUrl,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);
  return View;
};

const AiAnimation = () => {
  const options = {
    animationData: aiAnimationUrl,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);
  return View;
};

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
      
      {/* New Feature Showcase Sections with Animations */}
      <section className="feature-showcase">
        <div className="feature-block visualization-block">
          <div className="feature-animation">
            <iframe 
              src="https://lottie.host/embed/798e30a1-2411-4400-a7d9-95cb697826de/Af78fSvDGu.lottie" 
              className="lottie-animation"
            ></iframe>
          </div>
          <div className="feature-description">
            <h2>Advanced Visualization</h2>
            <p>Transform your financial data into intuitive visual representations. Our interactive charts and graphs make it easy to understand your spending patterns at a glance.</p>
            <ul className="feature-points">
              <li>Interactive pie and bar charts for expense categories</li>
              <li>Timeline views to track spending over time</li>
              <li>Customizable dashboards that focus on what matters to you</li>
              <li>Export and share reports with your financial advisor</li>
            </ul>
            <Link to="/register" className="btn btn-outline feature-btn">Explore Visualizations</Link>
          </div>
        </div>

        <div className="feature-block ai-block">
          <div className="feature-description">
            <h2>AI-Powered Insights</h2>
            <p>Leverage the power of artificial intelligence to optimize your finances. Our smart algorithms analyze your spending habits to provide personalized recommendations.</p>
            <ul className="feature-points">
              <li>Automated spending categorization using machine learning</li>
              <li>Personalized savings opportunities based on your habits</li>
              <li>Predictive analysis of upcoming expenses and cash flow</li>
              <li>Smart alerts for unusual spending patterns</li>
            </ul>
            <Link to="/register" className="btn btn-outline feature-btn">Discover AI Features</Link>
          </div>
          <div className="feature-animation">
            <iframe 
              src="https://lottie.host/embed/5dd31e3b-3a49-4518-8a24-75c741794e21/Z9wCI2Y2im.lottie" 
              className="lottie-animation"
            ></iframe>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Transform Your Financial Future?</h2>
        <p>Join thousands of users who have already taken control of their spending habits.</p>
        <Link to="/register" className="btn btn-primary cta-btn">Start Your Free Trial</Link>
      </section>
      
      <footer className="welcome-footer">
        <p>© 2025 Expense Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;