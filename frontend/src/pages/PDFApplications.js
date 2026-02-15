import React, { useState, useEffect } from 'react';
import {
  verifyDairyNumber,
  uploadPDFApplication,
  getPDFApplications,
  deletePDFApplication,
  getPDFStats,
} from '../services/api';
import { FiUpload, FiSearch, FiEye, FiTrash2, FiFile, FiCheckCircle, FiX } from 'react-icons/fi';
import './PDFApplications.css';

const PDFApplications = () => {
  const [pdfList, setPdfList] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, total_size_mb: 0 });

  // Upload form states
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [dairyNo, setDairyNo] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPDFs();
    fetchStats();
  }, []);

  useEffect(() => {
    // Filter PDFs based on search term
    if (searchTerm.trim() === '') {
      setFilteredPdfs(pdfList);
    } else {
      const filtered = pdfList.filter(
        (pdf) =>
          pdf.dairy_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pdf.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pdf.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPdfs(filtered);
    }
  }, [searchTerm, pdfList]);

  const fetchPDFs = async () => {
    setLoading(true);
    try {
      const response = await getPDFApplications();
      setPdfList(response.data.results || response.data);
      setFilteredPdfs(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setError('Failed to load PDF applications');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getPDFStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerifyDairyNo = async () => {
    if (!dairyNo.trim()) {
      setError('Please enter a diary number');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setVerifying(true);
    setError('');
    setApplicationData(null);
    setSuccess('');

    try {
      const response = await verifyDairyNumber(dairyNo);
      if (response.data.exists) {
        setApplicationData(response.data.application);
        setSuccess('Application found! You can now upload the PDF.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Application not found with this diary number');
      setApplicationData(null);
      setTimeout(() => setError(''), 5000);
    } finally {
      setVerifying(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setError('');
    setSuccess('');
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        setSelectedFile(null);
        e.target.value = '';
        setTimeout(() => setError(''), 3000);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError('File size should be less than 10MB');
        setSelectedFile(null);
        e.target.value = '';
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSelectedFile(file);
      setSuccess('PDF file selected successfully!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleUpload = async () => {
    if (!applicationData) {
      setError('Please verify diary number first');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!selectedFile) {
      setError('Please select a PDF file');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('application', applicationData.id);
    formData.append('pdf_file', selectedFile);
    formData.append('description', description);

    try {
      await uploadPDFApplication(formData);
      setSuccess('PDF uploaded successfully!');
      
      // Reset form
      setTimeout(() => {
        resetUploadForm();
        fetchPDFs();
        fetchStats();
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to upload PDF. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetUploadForm = () => {
    setShowUploadForm(false);
    setDairyNo('');
    setApplicationData(null);
    setSelectedFile(null);
    setDescription('');
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) {
      return;
    }

    try {
      await deletePDFApplication(id);
      setSuccess('PDF deleted successfully');
      fetchPDFs();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete PDF');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewPDF = (pdfUrl) => {
    // Handle both relative and absolute URLs
    const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:8000${pdfUrl}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="pdf-applications-container">
      {/* HEADER WITH STATS AND UPLOAD BUTTON */}
      <div className="pdf-header">
        <div className="pdf-title-section">
          <h1>📄 PDF Applications</h1>
          <p className="subtitle">Upload and manage application PDFs</p>
        </div>
        
        {/* Stats Cards - Inline with header */}
        <div className="stats-cards">
          <div className="stat-card stat-card-single">
            <FiFile className="stat-icon" />
            <div>
              <h3>{stats.total}</h3>
              <p>Total PDFs</p>
            </div>
          </div>
        </div>
        
        <button 
          className="btn-upload-primary" 
          onClick={() => setShowUploadForm(true)}
        >
          <FiUpload /> Upload New PDF
        </button>
      </div>

      {/* Global alerts */}
      {error && !showUploadForm && (
        <div className="alert alert-error">{error}</div>
      )}
      {success && !showUploadForm && (
        <div className="alert alert-success">{success}</div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') {
            resetUploadForm();
          }
        }}>
          <div className="modal-content upload-modal">
            <div className="modal-header">
              <h2>Upload PDF Application</h2>
              <button className="close-btn" onClick={resetUploadForm}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Step 1: Verify Diary Number */}
              <div className="form-step">
                <h3>Step 1: Verify Diary Number</h3>
                <div className="form-group">
                  <label>Diary Number *</label>
                  <div className="input-group">
                    <input
                      type="text"
                      value={dairyNo}
                      onChange={(e) => setDairyNo(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleVerifyDairyNo();
                        }
                      }}
                      placeholder="Enter diary number"
                      disabled={applicationData !== null}
                      autoFocus
                    />
                    <button
                      onClick={handleVerifyDairyNo}
                      disabled={verifying || applicationData !== null}
                      className="btn-verify"
                    >
                      {verifying ? 'Verifying...' : applicationData ? 'Verified ✓' : 'Verify'}
                    </button>
                  </div>
                </div>

                {applicationData && (
                  <div className="application-details">
                    <FiCheckCircle className="success-icon" />
                    <div className="details-grid">
                      <div>
                        <strong>Diary No:</strong> {applicationData.dairy_no}
                      </div>
                      <div>
                        <strong>Applicant:</strong> {applicationData.name}
                      </div>
                      <div>
                        <strong>Contact:</strong> {applicationData.contact}
                      </div>
                      <div>
                        <strong>Police Station:</strong> {applicationData.police_station}
                      </div>
                      <div>
                        <strong>Division:</strong> {applicationData.division}
                      </div>
                      <div>
                        <strong>Status:</strong> <span className="status-badge">{applicationData.status}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Upload PDF */}
              {applicationData && (
                <div className="form-step">
                  <h3>Step 2: Select PDF File</h3>
                  
                  <div className="form-group">
                    <label htmlFor="pdfFileInput">PDF File *</label>
                    <div className="file-upload-wrapper">
                      <input
                        id="pdfFileInput"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden-file-input"
                      />
                      <label htmlFor="pdfFileInput" className="file-upload-label">
                        <FiUpload size={20} />
                        <span>{selectedFile ? 'Change PDF File' : 'Choose PDF File'}</span>
                      </label>
                    </div>
                    
                    {selectedFile && (
                      <div className="file-info">
                        <FiFile />
                        <span className="file-name">{selectedFile.name}</span>
                        <span className="file-size">
                          ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                    )}
                    
                    {!selectedFile && (
                      <p className="file-hint">Click to browse and select a PDF file (Max 10MB)</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="descriptionInput">Description (Optional)</label>
                    <textarea
                      id="descriptionInput"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add any notes or description..."
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={resetUploadForm}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUpload}
                disabled={!applicationData || !selectedFile || loading}
              >
                {loading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by diary number, name, or file name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* PDF List */}
      <div className="pdf-list">
        {loading && <div className="loading">Loading PDFs...</div>}

        {!loading && filteredPdfs.length === 0 && (
          <div className="no-data">
            <FiFile size={48} />
            <p>No PDF applications found</p>
            <button 
              className="btn-upload-secondary" 
              onClick={() => setShowUploadForm(true)}
            >
              <FiUpload /> Upload Your First PDF
            </button>
          </div>
        )}

        {!loading && filteredPdfs.length > 0 && (
          <div className="pdf-grid">
            {filteredPdfs.map((pdf) => (
              <div key={pdf.id} className="pdf-card">
                <div className="pdf-icon">
                  <FiFile size={40} />
                </div>
                <div className="pdf-info">
                  <h3>{pdf.file_name}</h3>
                  <div className="pdf-meta">
                    <span className="dairy-no">📋 {pdf.dairy_no}</span>
                    <span className="applicant-name">👤 {pdf.applicant_name}</span>
                    <span className="police-station">🏢 {pdf.police_station}</span>
                    <span className="file-size">📦 {pdf.file_size_mb} MB</span>
                    <span className="upload-date">
                      📅 {new Date(pdf.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  {pdf.description && (
                    <p className="pdf-description">{pdf.description}</p>
                  )}
                </div>
                <div className="pdf-actions">
                  <button
                    className="btn-icon btn-view"
                    onClick={() => handleViewPDF(pdf.pdf_file)}
                    title="View PDF"
                  >
                    <FiEye />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(pdf.id)}
                    title="Delete PDF"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFApplications;