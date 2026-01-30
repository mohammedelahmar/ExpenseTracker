import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import GoalForm from '../components/goals/GoalForm';
import goalService from '../services/goalService';
// import '../styles/EditGoal.css'; // Removed
import { ArrowLeft } from 'lucide-react';

const EditGoal = () => {
  const { id } = useParams();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        setLoading(true);
        const data = await goalService.getGoalById(id);
        setGoal(data);
      } catch (err) {
        setError('Failed to load goal details');
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-gray-50">
        <div className="max-w-md mx-auto p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/goals" className="p-2 rounded-full bg-white text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Financial Goal</h1>
        </div>
        {goal && <GoalForm editGoal={goal} />}
      </div>
    </div>
  );
};

export default EditGoal;