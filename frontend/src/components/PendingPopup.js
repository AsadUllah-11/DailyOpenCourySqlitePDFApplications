import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, ArrowRight } from 'lucide-react';
import './PendingPopup.css';

const PendingPopup = ({
  pendingCount,
  onClose,
  label = 'Pending',
  navigateTo = '/applications?status=PENDING',
  bottomOffset = '20px',
}) => {
  const navigate = useNavigate();

  const handleView = () => {
    onClose();
    navigate(navigateTo);
  };

  if (!pendingCount || pendingCount === 0) return null;

  return (
    <div className="pending-popup-overlay" style={{ bottom: bottomOffset }}>
      <div className="pending-popup-card">
        <button className="pending-popup-close" onClick={onClose} title="Close">
          <X size={14} />
        </button>

        <div className="pending-popup-header">
          <div className="pending-popup-icon">
            <Clock size={15} />
          </div>
          <div>
            <p className="pending-popup-title">{label}</p>
            <p className="pending-popup-count">{pendingCount}</p>
          </div>
        </div>

        <p className="pending-popup-message">
          You have {pendingCount} {label} {pendingCount === 1 ? 'Case' : 'Cases'}
        </p>

        <button className="pending-popup-btn" onClick={handleView}>
          View Cases
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default PendingPopup;
