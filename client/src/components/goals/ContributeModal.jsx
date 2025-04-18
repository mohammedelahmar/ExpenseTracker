import React, { useState } from 'react';
import '../../styles/ContributeModal.css';

const ContributeModal = ({ show, onHide, onContribute, goalName, remainingAmount }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  if (!show) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const contributionAmount = parseFloat(amount);
    
    if (!contributionAmount || contributionAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (contributionAmount > remainingAmount) {
      setAmount(remainingAmount.toString());
    }
    
    onContribute(contributionAmount);
    setAmount('');
    setError('');
  };

  return (
    <div className="modal-overlay">
      <div className="contribute-modal">
        <div className="modal-header">
          <h3>Add Contribution to {goalName}</h3>
          <button className="close-button" onClick={onHide}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="contributionAmount">Contribution Amount ($)</label>
            <input
              type="number"
              id="contributionAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-control"
              step="0.01"
              min="0.01"
              max={remainingAmount}
              required
              autoFocus
            />
            <small className="remaining-info">
              Remaining to goal: ${remainingAmount.toFixed(2)}
            </small>
          </div>
          
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              Add Contribution
            </button>
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;