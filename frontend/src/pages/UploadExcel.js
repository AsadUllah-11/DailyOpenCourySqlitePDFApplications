import React, { useState } from 'react';
import { uploadExcel } from '../services/api';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target. files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const data = await uploadExcel(file);
      setResult(data);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (error) {
      setResult({
        error: error.response?.data?.error || 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="page-header">
        <h2>Upload Excel File</h2>
        <p>Import open court applications from Excel file</p>
      </div>

      <div className="upload-card">
        <div className="upload-icon">
          <FileSpreadsheet size={64} color="#3b82f6" />
        </div>

        <h3>Upload Excel File</h3>
        <p className="upload-description">
          Select an Excel file (. xlsx or .xls) containing open court applications data
        </p>

        <div className="upload-section">
          <input
            id="file-input"
            type="file"
            accept=". xlsx,.xls"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <Upload size={20} />
            {file ? file.name : 'Choose File'}
          </label>

          {file && (
            <button 
              onClick={handleUpload} 
              className="upload-btn"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          )}
        </div>

        {result && (
          <div className={`result-box ${result.error ? 'result-error' : 'result-success'}`}>
            {result.error ?  (
              <>
                <XCircle size={24} />
                <h4>Upload Failed</h4>
                <p>{result.error}</p>
              </>
            ) : (
              <>
                <CheckCircle size={24} />
                <h4>Upload Successful!</h4>
                <div className="result-stats">
                  <div className="stat">
                    <strong>{result.created}</strong>
                    <span>New Records</span>
                  </div>
                  <div className="stat">
                    <strong>{result.updated}</strong>
                    <span>Updated Records</span>
                  </div>
                </div>
                {result.errors && result.errors.length > 0 && (
                  <div className="errors-list">
                    <AlertCircle size={20} />
                    <h5>Errors:</h5>
                    <ul>
                      {result.errors.slice(0, 10).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="upload-instructions">
          <h4>File Format Requirements:</h4>
          <ul>
            <li>File must be in .xlsx or .xls format</li>
            <li>First row should contain headers</li>
            <li>Required columns: Sr. No, Dairy No, Name, Contact, Police Station, Division, Category</li>
            <li>Date column should be in valid date format</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadExcel;