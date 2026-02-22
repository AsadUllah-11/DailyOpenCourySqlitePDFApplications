import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getApplicationById, 
  updateApplicationStatus, 
  updateApplicationFeedback,
  updateApplicationStipulatedTime,
  getPDFsByApplication,      // ⭐ NEW
  uploadPDFApplication,       // ⭐ NEW
  deletePDFApplication        // ⭐ NEW
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
  XCircle,
  Edit,
  File,           // ⭐ NEW
  Upload,         // ⭐ NEW
  Eye,            // ⭐ NEW
  Trash2,         // ⭐ NEW
  AlertCircle     // ⭐ NEW
} from 'lucide-react';
import './ApplicationDetail.css';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Edit States
  const [isEditingStipulatedTime, setIsEditingStipulatedTime] = useState(false);
  const [stipulatedTimeValue, setStipulatedTimeValue] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState('');

  // ⭐ NEW: PDF States
  const [pdfApplications, setPdfApplications] = useState([]);
  const [loadingPDFs, setLoadingPDFs] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfDescription, setPdfDescription] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    fetchApplication();
    fetchPDFs();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const data = await getApplicationById(id);
      setApplication(data);
      setStipulatedTimeValue(data.stipulated_time || '');
      setSelectedStatus(data.status);
      setSelectedFeedback(data.feedback);
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW: Fetch PDFs for this application
  const fetchPDFs = async () => {
    setLoadingPDFs(true);
    try {
      const response = await getPDFsByApplication(id);
      setPdfApplications(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setPdfApplications([]);
    } finally {
      setLoadingPDFs(false);
    }
  };

  // ⭐ NEW: Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    setUploadSuccess('');
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Please select a PDF file');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size should be less than 10MB');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setUploadSuccess('PDF file selected successfully!');
    }
  };

  // ⭐ NEW: Upload PDF
const handleUploadPDF = async () => {
  if (!selectedFile) {
    setUploadError('Please select a PDF file');
    return;
  }

  setUpdating(true);
  setUploadError('');
  setUploadSuccess('');

  const formData = new FormData();
  formData.append('application', id);  // ⚠️ Make sure 'id' is a number
  formData.append('pdf_file', selectedFile);
  formData.append('description', pdfDescription);

  // ⭐ ADD CONSOLE LOGS FOR DEBUGGING
  console.log('Uploading PDF:');
  console.log('- Application ID:', id);
  console.log('- File:', selectedFile);
  console.log('- Description:', pdfDescription);

  try {
    const response = await uploadPDFApplication(formData);
    console.log('Upload success:', response);
    setUploadSuccess('✅ PDF uploaded successfully!');
    
    setTimeout(() => {
      setShowUploadModal(false);
      setSelectedFile(null);
      setPdfDescription('');
      setUploadError('');
      setUploadSuccess('');
      fetchPDFs();
    }, 1500);
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error response:', error.response?.data);
    
    // ⭐ SHOW DETAILED ERROR
    const errorMessage = error.response?.data?.error 
      || error.response?.data?.message
      || error.message 
      || '❌ Failed to upload PDF';
    
    setUploadError(errorMessage);
  } finally {
    setUpdating(false);
  }
};
  // ⭐ NEW: Delete PDF
  const handleDeletePDF = async (pdfId) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) {
      return;
    }

    try {
      await deletePDFApplication(pdfId);
      alert('✅ PDF deleted successfully');
      fetchPDFs();
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Failed to delete PDF');
    }
  };

  // ⭐ NEW: View PDF
  const handleViewPDF = (pdfUrl) => {
    const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:8000${pdfUrl}`;
    window.open(fullUrl, '_blank');
  };

  // ⭐ NEW: Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const handleUpdateStipulatedTime = async () => {
    try {
      setUpdating(true);
      await updateApplicationStipulatedTime(id, stipulatedTimeValue);
      await fetchApplication();
      setIsEditingStipulatedTime(false);
      alert('✅ Stipulated time updated successfully!');
    } catch (error) {
      console.error('Error updating stipulated time:', error);
      alert('❌ Failed to update stipulated time');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelStipulatedTime = () => {
    setStipulatedTimeValue(application.stipulated_time || '');
    setIsEditingStipulatedTime(false);
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await updateApplicationStatus(id, selectedStatus);
      await fetchApplication();
      setIsEditingStatus(false);
      alert('✅ Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelStatus = () => {
    setSelectedStatus(application.status);
    setIsEditingStatus(false);
  };

  const handleUpdateFeedback = async () => {
    try {
      setUpdating(true);
      await updateApplicationFeedback(id, selectedFeedback, '');
      await fetchApplication();
      setIsEditingFeedback(false);
      alert('✅ Feedback updated successfully!');
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('❌ Failed to update feedback');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelFeedback = () => {
    setSelectedFeedback(application.feedback);
    setIsEditingFeedback(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    
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
      'PENDING': '#d32f2f',
      'HEARD': '#1976d2',
      'REFERRED': '#f57c00',
      'CLOSED': '#388e3c',
      'BLOCKED': '#e65100'
    };
    return colors[status] || '#757575';
  };

  const getFeedbackColor = (feedback) => {
    const colors = {
      'POSITIVE': '#4caf50',
      'NEGATIVE': '#f44336',
      'PENDING': '#9e9e9e'
    };
    return colors[feedback] || '#757575';
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
                  style={{ 
                    backgroundColor: `${getStatusColor(application.status)}20`, 
                    color: getStatusColor(application.status),
                    fontWeight: application.status === 'PENDING' ? '700' : '500'
                  }}
                >
                  {application.status}
                </span>
                {application.feedback !== 'PENDING' && (
                  <span 
                    className="status-badge-large" 
                    style={{ 
                      backgroundColor: `${getFeedbackColor(application.feedback)}20`, 
                      color: getFeedbackColor(application.feedback) 
                    }}
                  >
                    {application.feedback}
                  </span>
                )}
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

              <div className="info-item">
                <div className="info-label">
                  <Clock size={18} />
                  Days
                </div>
                <div className="info-value">{application.days || 'N/A'}</div>
              </div>

              {/* Stipulated Time - Editable */}
              <div className="info-item info-item-full">
                <div className="info-label">
                  <Clock size={18} />
                  Stipulated Time
                </div>
                <div className="info-value stipulated-time-container">
                  {isEditingStipulatedTime ? (
                    <div className="edit-section">
                      <input
                        type="text"
                        className="input-edit"
                        value={stipulatedTimeValue}
                        onChange={(e) => setStipulatedTimeValue(e.target.value)}
                        placeholder="Enter stipulated time (e.g., 30 days, 2 weeks)"
                        disabled={updating}
                      />
                      <div className="edit-actions">
                        <button
                          className="btn-save"
                          onClick={handleUpdateStipulatedTime}
                          disabled={updating}
                        >
                          {updating ? 'Saving...' : '✓ Save'}
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleCancelStipulatedTime}
                          disabled={updating}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="display-with-edit">
                      <span className={`value-display ${!application.stipulated_time ? 'nil' : ''}`}>
                        {application.stipulated_time || 'Nil'}
                      </span>
                      <button
                        className="btn-edit-inline"
                        onClick={() => setIsEditingStipulatedTime(true)}
                      >
                        <Edit size={16} /> Edit
                      </button>
                    </div>
                  )}
                </div>
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

          {/* Card 3: Case Details with Status & Feedback */}
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

              {/* Status - Editable */}
              <div className="info-item info-item-full">
                <div className="info-label">
                  <CheckCircle size={18} />
                  Status
                </div>
                <div className="info-value">
                  {isEditingStatus ? (
                    <div className="edit-section">
                      <select
                        className="select-edit"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        disabled={updating}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="HEARD">Heard</option>
                        <option value="REFERRED">Referred</option>
                        <option value="CLOSED">Closed</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                      <div className="edit-actions">
                        <button
                          className="btn-save"
                          onClick={handleUpdateStatus}
                          disabled={updating}
                        >
                          {updating ? 'Saving...' : '✓ Save'}
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleCancelStatus}
                          disabled={updating}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="display-with-edit">
                      <span 
                        className="status-display" 
                        style={{ 
                          backgroundColor: `${getStatusColor(application.status)}20`,
                          color: getStatusColor(application.status),
                          fontWeight: application.status === 'PENDING' ? '700' : '500'
                        }}
                      >
                        {application.status}
                      </span>
                      <button
                        className="btn-edit-inline"
                        onClick={() => setIsEditingStatus(true)}
                      >
                        <Edit size={16} /> Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback - Editable */}
              <div className="info-item info-item-full">
                <div className="info-label">
                  <ThumbsUp size={18} />
                  Feedback
                </div>
                <div className="info-value">
                  {isEditingFeedback ? (
                    <div className="edit-section">
                      <select
                        className="select-edit"
                        value={selectedFeedback}
                        onChange={(e) => setSelectedFeedback(e.target.value)}
                        disabled={updating}
                      >
                        <option value="POSITIVE">Positive</option>
                        <option value="NEGATIVE">Negative</option>
                      </select>
                      <div className="edit-actions">
                        <button
                          className="btn-save"
                          onClick={handleUpdateFeedback}
                          disabled={updating}
                        >
                          {updating ? 'Saving...' : '✓ Save'}
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleCancelFeedback}
                          disabled={updating}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="display-with-edit">
                      {application.feedback !== 'PENDING' ? (
                        <span 
                          className="feedback-display" 
                          style={{ 
                            backgroundColor: `${getFeedbackColor(application.feedback)}20`,
                            color: getFeedbackColor(application.feedback)
                          }}
                        >
                          {application.feedback === 'POSITIVE' ? (
                            <>
                              <ThumbsUp size={16} style={{ marginRight: '6px' }} /> Positive
                            </>
                          ) : (
                            <>
                              <ThumbsDown size={16} style={{ marginRight: '6px' }} /> Negative
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="feedback-display pending">
                          Not Set
                        </span>
                      )}
                      <button
                        className="btn-edit-inline"
                        onClick={() => setIsEditingFeedback(true)}
                      >
                        <Edit size={16} /> Edit
                      </button>
                    </div>
                  )}
                </div>
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

          {/* ⭐ NEW: Card 4: PDF Applications Management */}
          <div className="detail-card pdf-management-card">
            <div className="card-header">
              <h3>
                <File size={20} />
                PDF Applications
              </h3>
              <button 
                className="btn-upload-pdf"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={16} />
                Upload PDF
              </button>
            </div>

            {loadingPDFs ? (
              <div className="pdf-loading">
                <div className="spinner-small"></div>
                <p>Loading PDFs...</p>
              </div>
            ) : pdfApplications.length === 0 ? (
              <div className="no-pdf-message">
                <AlertCircle size={48} color="#999" />
                <p>No PDF application uploaded yet</p>
                <button 
                  className="btn-upload-first"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload size={16} />
                  Upload First PDF
                </button>
              </div>
            ) : (
              <div className="pdf-list-detail">
                {pdfApplications.map((pdf) => (
                  <div key={pdf.id} className="pdf-item-detail">
                    <div className="pdf-icon-large">
                      <File size={32} color="#0066cc" />
                    </div>
                    <div className="pdf-info-detail">
                      <h4>{pdf.file_name}</h4>
                      <div className="pdf-meta-detail">
                        <span>📦 {formatFileSize(pdf.file_size)}</span>
                        <span>📅 {formatDate(pdf.uploaded_at)}</span>
                        <span>👤 {pdf.uploaded_by_name || 'Unknown'}</span>
                      </div>
                      {pdf.description && (
                        <p className="pdf-description-detail">{pdf.description}</p>
                      )}
                    </div>
                    <div className="pdf-actions-detail">
                      <button
                        className="btn-pdf-action btn-view-pdf"
                        onClick={() => handleViewPDF(pdf.pdf_file)}
                        title="View PDF"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        className="btn-pdf-action btn-delete-pdf"
                        onClick={() => handleDeletePDF(pdf.id)}
                        title="Delete PDF"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 5: Timestamps */}
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

        {/* Right Column - Quick Actions Sidebar */}
        <div className="detail-sidebar">
          {/* Status Update Card */}
          <div className="action-card">
            <h3 className="action-card-title">Quick Status Update</h3>
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
                disabled={updating || application.status === 'CLOSED'}
                className="action-btn status-closed"
              >
                <XCircle size={18} />
                Closed
              </button>
              <button
                onClick={() => handleStatusUpdate('BLOCKED')}
                disabled={updating || application.status === 'BLOCKED'}
                className="action-btn status-blocked"
              >
                <XCircle size={18} />
                Blocked
              </button>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="action-card">
            <h3 className="action-card-title">Quick Feedback</h3>
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

      {/* ⭐ NEW: Upload PDF Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') {
            setShowUploadModal(false);
            setSelectedFile(null);
            setPdfDescription('');
            setUploadError('');
            setUploadSuccess('');
          }
        }}>
          <div className="modal-content upload-modal-detail">
            <div className="modal-header">
              <h2>Upload PDF Application</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setPdfDescription('');
                  setUploadError('');
                  setUploadSuccess('');
                }}
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="modal-body">
              {uploadError && <div className="alert alert-error">{uploadError}</div>}
              {uploadSuccess && <div className="alert alert-success">{uploadSuccess}</div>}

              <div className="upload-section">
                <h3>Application Details</h3>
                <div className="application-info-box">
                  <div><strong>Dairy No:</strong> {application.dairy_no}</div>
                  <div><strong>Applicant:</strong> {application.name}</div>
                  <div><strong>Police Station:</strong> {application.police_station}</div>
                </div>
              </div>

              <div className="upload-section">
                <h3>Select PDF File</h3>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden-file-input"
                    id="pdf-file-input"
                  />
                  <label htmlFor="pdf-file-input" className="file-upload-label-detail">
                    <Upload size={32} />
                    <span>{selectedFile ? 'Change PDF File' : 'Choose PDF File'}</span>
                    <small>Max 10MB</small>
                  </label>
                  
                  {selectedFile && (
                    <div className="file-selected-info">
                      <File size={20} />
                      <span>{selectedFile.name}</span>
                      <span className="file-size-badge">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="upload-section">
                <h3>Description (Optional)</h3>
                <textarea
                  value={pdfDescription}
                  onChange={(e) => setPdfDescription(e.target.value)}
                  placeholder="Add any notes or description about this PDF..."
                  rows="3"
                  className="textarea-description"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setPdfDescription('');
                  setUploadError('');
                  setUploadSuccess('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUploadPDF}
                disabled={!selectedFile || updating}
              >
                {updating ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;