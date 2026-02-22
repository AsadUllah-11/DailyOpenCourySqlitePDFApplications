import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, ArrowRight } from 'lucide-react';
import './PendingPopup.css';

const PendingPopup = ({ pendingCount, onClose }) => {
  const navigate = useNavigate();

  const handleViewPending = () => {
    onClose();
    navigate('/applications?status=PENDING');
  };

  if (!pendingCount || pendingCount === 0) return null;

  return (
    <div className="pending-popup-overlay">
      <div className="pending-popup-card">
        <button className="pending-popup-close" onClick={onClose} title="Close">
          <X size={16} />
        </button>

        <div className="pending-popup-header">
          <div className="pending-popup-icon">
            <Clock size={22} />
          </div>
          <div>
            <p className="pending-popup-title">Pending Cases</p>
            <p className="pending-popup-count">{pendingCount}</p>
          </div>
        </div>

        <div className="pending-popup-body">
          <p className="pending-popup-message">
            You have {pendingCount} Pending {pendingCount === 1 ? 'Case' : 'Cases'}
          </p>
          <p className="pending-popup-sub">Tap below to review them now.</p>
        </div>

        <button className="pending-popup-btn" onClick={handleViewPending}>
          View Pending Cases
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PendingPopup;
