import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getApplicationById, 
  updateApplicationStatus, 
  updateApplicationFeedback 
} from '../services/api';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  FileText,
  Clock,
  Tag,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import './ApplicationDetail.css';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const data = await getApplicationById(id);
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (! window.confirm(`Change status to ${newStatus}?`)) return;
    
    setUpdating(true);
    try {
      await updateApplicationStatus(id, newStatus);
      await fetchApplication();
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleFeedbackUpdate = async (feedback) => {
    if (!window.confirm(`Set feedback as ${feedback}?`)) return;
    
    setUpdating(true);
    try {
      await updateApplicationFeedback(id, feedback, '');
      await fetchApplication();
      alert('Feedback updated successfully');
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback');
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = (contact) => {
    window.location.href = `tel:${contact}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#f59e0b',
      'HEARD': '#10b981',
      'REFERRED': '#6366f1',
      'CLOSED': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getFeedbackColor = (feedback) => {
    const colors = {
      'POSITIVE': '#10b981',
      'NEGATIVE':  '#ef4444',
      'PENDING': '#6b7280'
    };
    return colors[feedback] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="error-container">
        <XCircle size={64} color="#ef4444" />
        <h2>Application Not Found</h2>
        <button onClick={() => navigate('/applications')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="application-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate('/applications')} className="back-button">
          <ArrowLeft size={20} />
          Back to Applications
        </button>
        <h2 className="detail-title">Application Details</h2>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Left Column - Main Info */}
        <div className="detail-main">
          {/* Card 1: Basic Information */}
          <div className="detail-card">
            <div className="card-header">
              <h3>Basic Information</h3>
              <div className="status-badges">
                <span 
                  className="status-badge-large" 
                  style={{ backgroundColor:  `${getStatusColor(application.status)}20`, color: getStatusColor(application. status) }}
                >
                  {application.status}
                </span>
                <span 
                  className="status-badge-large" 
                  style={{ backgroundColor: `${getFeedbackColor(application.feedback)}20`, color: getFeedbackColor(application.feedback) }}
                >
                  {application.feedback}
                </span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FileText size={18} />
                  SR Number
                </div>
                <div className="info-value">{application.sr_no}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <FileText size={18} />
                  Dairy Number
                </div>
                <div className="info-value">{application.dairy_no}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  Applicant Name
                </div>
                <div className="info-value primary-text">{application.name}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Phone size={18} />
                  Contact Number
                </div>
                <div className="info-value">
                  <button onClick={() => handleCall(application.contact)} className="contact-btn-detail">
                    <Phone size={16} />
                    {application.contact}
                  </button>
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Calendar size={18} />
                  Date
                </div>
                <div className="info-value">{formatDate(application.date)}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Clock size={18} />
                  Timeline
                </div>
                <div className="info-value">{application.timeline || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Location Details */}
          <div className="detail-card">
            <div className="card-header">
              <h3>Location Details</h3>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <MapPin size={18} />
                  Police Station
                </div>
                <div className="info-value">{application.police_station}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <MapPin size={18} />
                  Division
                </div>
                <div className="info-value">{application.division || 'N/A'}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <FileText size={18} />
                  Dairy PS
                </div>
                <div className="info-value">{application.dairy_ps || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Card 3: Case Details */}
          <div className="detail-card">
            <div className="card-header">
              <h3>Case Details</h3>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <Tag size={18} />
                  Category
                </div>
                <div className="info-value">{application.category}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  Marked To (SHO)
                </div>
                <div className="info-value">{application.marked_to || 'Not Assigned'}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  Marked By
                </div>
                <div className="info-value">{application.marked_by || 'N/A'}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Clock size={18} />
                  Days
                </div>
                <div className="info-value">{application.days || 'N/A'}</div>
              </div>
            </div>

            {application.remarks && (
              <div className="remarks-section">
                <div className="info-label">
                  <FileText size={18} />
                  Remarks
                </div>
                <div className="remarks-text">{application.remarks}</div>
              </div>
            )}
          </div>

          {/* Card 4: Timestamps */}
          <div className="detail-card">
            <div className="card-header">
              <h3>Record Information</h3>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <Calendar size={18} />
                  Created At
                </div>
                <div className="info-value">{formatDate(application.created_at)}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Calendar size={18} />
                  Updated At
                </div>
                <div className="info-value">{formatDate(application.updated_at)}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  Created By
                </div>
                <div className="info-value">{application.created_by_name || 'System'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="detail-sidebar">
          {/* Status Update Card */}
          <div className="action-card">
            <h3 className="action-card-title">Update Status</h3>
            <div className="action-buttons">
              <button
                onClick={() => handleStatusUpdate('PENDING')}
                disabled={updating || application.status === 'PENDING'}
                className="action-btn status-pending"
              >
                <Clock size={18} />
                Pending
              </button>
              <button
                onClick={() => handleStatusUpdate('HEARD')}
                disabled={updating || application.status === 'HEARD'}
                className="action-btn status-heard"
              >
                <CheckCircle size={18} />
                Heard
              </button>
              <button
                onClick={() => handleStatusUpdate('REFERRED')}
                disabled={updating || application.status === 'REFERRED'}
                className="action-btn status-referred"
              >
                <FileText size={18} />
                Referred
              </button>
              <button
                onClick={() => handleStatusUpdate('CLOSED')}
                disabled={updating || application. status === 'CLOSED'}
                className="action-btn status-closed"
              >
                <XCircle size={18} />
                Closed
              </button>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="action-card">
            <h3 className="action-card-title">Feedback</h3>
            <div className="action-buttons">
              <button
                onClick={() => handleFeedbackUpdate('POSITIVE')}
                disabled={updating || application.feedback === 'POSITIVE'}
                className="action-btn feedback-positive"
              >
                <ThumbsUp size={18} />
                Positive
              </button>
              <button
                onClick={() => handleFeedbackUpdate('NEGATIVE')}
                disabled={updating || application.feedback === 'NEGATIVE'}
                className="action-btn feedback-negative"
              >
                <ThumbsDown size={18} />
                Negative
              </button>
              <button
                onClick={() => handleFeedbackUpdate('PENDING')}
                disabled={updating || application.feedback === 'PENDING'}
                className="action-btn feedback-pending"
              >
                <Clock size={18} />
                Pending
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="action-card">
            <h3 className="action-card-title">Quick Actions</h3>
            <div className="action-buttons">
              <button
                onClick={() => handleCall(application.contact)}
                className="action-btn action-call"
              >
                <Phone size={18} />
                Call Applicant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;