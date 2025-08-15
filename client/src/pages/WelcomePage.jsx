import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Target, Camera, PieChart, Shield, Zap, BarChart3, Receipt, Brain, DollarSign, CreditCard, Star, LogIn, UserPlus, Users } from 'lucide-react';

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
  <div className={`group relative p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-gradient-to-br ${gradient} hover:shadow-2xl transition-all duration-500 hover:scale-105`}>
    <div className="absolute inset-0 bg-black/5 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="mb-4 lg:mb-6 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/20 backdrop-blur-sm w-fit">
        <Icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
      </div>
      <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-3">{title}</h3>
      <p className="text-white/80 leading-relaxed text-sm lg:text-base">{description}</p>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, content, avatar }) => (
  <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className="flex items-center mb-4 lg:mb-6">
      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg lg:text-xl">
        {avatar}
      </div>
      <div className="ml-4">
        <h4 className="font-semibold text-gray-900 text-base lg:text-lg">{name}</h4>
        <p className="text-gray-600 text-sm lg:text-base">{role}</p>
      </div>
      <div className="ml-auto flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 lg:h-5 lg:w-5 fill-current" />
        ))}
      </div>
    </div>
    <p className="text-gray-700 italic text-sm lg:text-base leading-relaxed">"{content}"</p>
  </div>
);

const WelcomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const features = [
    {
      icon: Receipt,
      title: "Smart Expense Management",
      description: "Add expenses effortlessly and manage custom themes. Upload receipts with our advanced OCR technology for automatic data extraction.",
      gradient: "from-blue-600 to-purple-700"
    },
    {
      icon: BarChart3,
      title: "Financial Reports",
      description: "Get comprehensive insights with expenses by category, monthly summaries, and detailed expense trends analysis.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: Brain,
      title: "Expense Analytics & Insights",
      description: "Leverage AI-powered analytics to understand your spending patterns and get personalized recommendations.",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: Target,
      title: "Financial Goals",
      description: "Set, track, and achieve your financial objectives with visual progress indicators and milestone celebrations.",
      gradient: "from-indigo-600 to-blue-700"
    },
    {
      icon: CreditCard,
      title: "Subscription Management",
      description: "Track and manage all your recurring subscriptions to avoid unwanted charges and optimize your monthly spending.",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: PieChart,
      title: "Category Management",
      description: "Create and customize expense categories that match your lifestyle and spending habits perfectly.",
      gradient: "from-amber-500 to-orange-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelance Designer",
      content: "This app has completely transformed how I manage my business expenses. The OCR feature is a game-changer!",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Software Engineer",
      content: "The analytics and insights help me understand exactly where my money goes. Finally achieved my savings goals!",
      avatar: "MC"
    },
    {
      name: "Emma Davis",
      role: "Marketing Manager",
      content: "Beautiful design and incredibly powerful features. The subscription tracking alone saves me hundreds monthly.",
      avatar: "ED"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10" />
        
        {/* Floating Auth Buttons - Top Right */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <button 
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 border border-white/20"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
          <button 
            onClick={handleRegister}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Get Started</span>
          </button>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Brand Logo */}
            <div className="flex items-center justify-center gap-3 mb-8 lg:mb-12">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <span className="text-2xl lg:text-3xl font-black text-gray-900">ExpenseTracker Pro</span>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-blue-600 mb-6 lg:mb-8 shadow-lg">
              <Zap className="h-4 w-4" />
              <span>Most Advanced Expense Tracker</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 lg:mb-8 leading-tight px-4">
              Master Your
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Transform your financial management with AI-powered insights, smart receipt scanning, 
              and beautiful visualizations. Join thousands who've taken control of their money.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center mb-12 lg:mb-16 px-4">
              <button 
                onClick={handleRegister}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleLogin}
                className="group bg-white/90 backdrop-blur-sm text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200"
              >
                Sign In
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
              {[
                { number: 50000, label: "Active Users", suffix: "+" },
                { number: 2500000, label: "Tracked Expenses", suffix: "+" },
                { number: 98, label: "Satisfaction Rate", suffix: "%" },
                { number: 150000, label: "Hours Saved", suffix: "+" }
              ].map((stat, index) => (
                <div key={index} className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg">
                  <div className="text-2xl lg:text-3xl font-black text-gray-900 mb-1">
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 lg:mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Powerful features designed to make financial management effortless, intelligent, and rewarding.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Feature Showcase */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* OCR Feature */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 lg:mb-20">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Camera className="h-4 w-4" />
                OCR Technology
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 lg:mb-6">
                Snap, Scan, Save
                <br />
                <span className="text-blue-600">Automatically</span>
              </h3>
              <p className="text-base lg:text-lg text-gray-600 mb-6 lg:mb-8 leading-relaxed">
                Our advanced OCR technology instantly extracts data from your receipts. 
                Just snap a photo and watch as amounts, dates, and merchant details 
                are automatically captured and categorized.
              </p>
              <ul className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                {[
                  "99.9% accuracy in text recognition",
                  "Support for 50+ languages",
                  "Auto-categorization with AI",
                  "Cloud backup for all receipts"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    <span className="text-gray-700 text-sm lg:text-base">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleRegister}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Try OCR Now
              </button>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 lg:p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <div className="bg-white rounded-2xl p-4 lg:p-6 transform -rotate-1">
                  <Camera className="h-12 w-12 lg:h-16 lg:w-16 text-blue-600 mb-4 mx-auto" />
                  <div className="space-y-3">
                    <div className="h-3 lg:h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 lg:h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 lg:h-4 bg-blue-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Feature */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 lg:p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <div className="bg-white rounded-2xl p-4 lg:p-6">
                  <BarChart3 className="h-12 w-12 lg:h-16 lg:w-16 text-emerald-600 mb-4 mx-auto" />
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Food & Dining</span>
                      <span className="font-semibold">$842</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full w-3/4 transition-all duration-1000" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transportation</span>
                      <span className="font-semibold">$425</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-1/2 transition-all duration-1000 delay-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BarChart3 className="h-4 w-4" />
                Smart Analytics
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 lg:mb-6">
                Insights That
                <br />
                <span className="text-emerald-600">Drive Results</span>
              </h3>
              <p className="text-base lg:text-lg text-gray-600 mb-6 lg:mb-8 leading-relaxed">
                Get personalized insights and recommendations based on your spending patterns. 
                Our AI analyzes your habits to help you make smarter financial decisions 
                and reach your goals faster.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6 lg:mb-8">
                {[
                  { label: "Categories", value: "Auto-detected" },
                  { label: "Predictions", value: "ML-powered" },
                  { label: "Reports", value: "Real-time" },
                  { label: "Insights", value: "Personalized" }
                ].map((item, index) => (
                  <div key={index} className="text-center p-3 lg:p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors duration-300">
                    <div className="font-bold text-emerald-600 text-sm lg:text-base">{item.value}</div>
                    <div className="text-xs lg:text-sm text-gray-600">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Loved by <span className="text-blue-600">50,000+</span> Users
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">Don't just take our word for it</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
            Ready to Transform Your
            <br />
            Financial Future?
          </h2>
          <p className="text-lg lg:text-xl text-white/90 mb-8 lg:mb-10 max-w-2xl mx-auto">
            Join thousands of users who've already taken control of their finances. 
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center mb-8 lg:mb-12">
            <button 
              onClick={handleRegister}
              className="group bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleLogin}
              className="group bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Sign In
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm lg:text-base">Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm lg:text-base">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm lg:text-base">Free Trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold">ExpenseTracker Pro</h3>
            </div>
            <p className="text-gray-400 text-sm lg:text-base">The future of financial management</p>
          </div>
          <div className="border-t border-gray-800 pt-6 lg:pt-8">
            <p className="text-gray-400 text-sm lg:text-base">© 2025 ExpenseTracker Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;