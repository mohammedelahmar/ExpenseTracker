import React from 'react';
import GoalForm from '../components/goals/GoalForm.jsx';
// import '../styles/AddGoal.css'; // Removed
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddGoal = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/goals" className="p-2 rounded-full bg-white text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Financial Goal</h1>
        </div>
        <GoalForm />
      </div>
    </div>
  );
};

export default AddGoal;