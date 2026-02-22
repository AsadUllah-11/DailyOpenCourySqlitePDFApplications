import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, ChevronRight } from 'lucide-react';
import './PendingPopup.css';

const PendingPopup = ({
  pendingCount,
  onClose,
  label = 'Pending',
  navigateTo = '/applications?status=PENDING',
  bottomOffset = '20px',
  Icon = Clock,
  ActionIcon = ChevronRight,
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
          <X size={11} />
        </button>

        <div className="pending-popup-body">
          <div className="pending-popup-icon">
            <Icon size={13} />
          </div>
          <p className="pending-popup-message">
            You have <strong>{pendingCount}</strong> {label}{' '}
            {pendingCount === 1 ? 'Case' : 'Cases'}
          </p>
        </div>

        <div className="pending-popup-footer">
          <button
            className="pending-popup-action-btn"
            onClick={handleView}
            title="View Cases"
          >
            <ActionIcon size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingPopup;
