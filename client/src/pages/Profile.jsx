import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Lock, CheckCircle, AlertCircle, Calendar, Clock, Save } from 'lucide-react';
// import '../styles/Profile.css'; // Removed

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/users/profile', profileData);
      
      // Update stored user data
      const updatedUser = { ...user, ...response.data };
      login(updatedUser);
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({
        type: 'success',
        text: 'Password updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update password'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
          <p className="text-gray-500 text-lg">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col gap-8">
        <div className="text-center md:text-left border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-3">
            <User className="text-primary-600" size={32} />
            User Profile
          </h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>
        
        {message.text && (
          <div className={`p-4 rounded-xl flex items-start gap-3 border ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          } animate-fade-in`}>
            {message.type === 'success' ? <CheckCircle size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-all hover:shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <User size={20} className="text-primary-500" />
                Account Information
              </h2>
              <form onSubmit={updateProfile}>
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : <><Save size={18} /> Update Profile</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-all hover:shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <Lock size={20} className="text-primary-500" />
                Change Password
              </h2>
              <form onSubmit={updatePassword}>
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full md:w-auto"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-all hover:shadow-md h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <CheckCircle size={20} className="text-emerald-500" />
                Account Details
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1 flex items-center gap-2">
                    <Calendar size={14} /> Member Since
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1 flex items-center gap-2">
                    <Clock size={14} /> Last Updated
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(user.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-2xl">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-gray-800">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;