import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import './ApplicationModal.css';

const ApplicationModal = ({ isOpen, onClose, onSave, application, policeStations, categories }) => {
  const [formData, setFormData] = useState({
    sr_no: '',
    dairy_no: '',
    name: '',
    contact: '',
    police_station: '',
    division: '',
    category: '',
    marked_to: '',
    marked_by: '',
    date: '',
    timeline: '',
    status: 'PENDING',
    feedback: 'PENDING',
    days: '',
    dairy_ps: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (application) {
      // Edit mode - populate form
      setFormData({
        sr_no: application.sr_no || '',
        dairy_no: application.dairy_no || '',
        name: application.name || '',
        contact: application.contact || '',
        police_station: application.police_station || '',
        division: application.division || '',
        category: application.category || '',
        marked_to: application.marked_to || '',
        marked_by: application.marked_by || '',
        date: application.date || '',
        timeline: application.timeline || '',
        status: application.status || 'PENDING',
        feedback: application.feedback || 'PENDING',
        days: application.days || '',
        dairy_ps: application.dairy_ps || '',
        remarks: application.remarks || ''
      });
    } else {
      // Add mode - reset form
      setFormData({
        sr_no: '',
        dairy_no: '',
        name: '',
        contact: '',
        police_station: '',
        division: '',
        category: '',
        marked_to: '',
        marked_by: '',
        date: '',
        timeline: '',
        status: 'PENDING',
        feedback: 'PENDING',
        days: '',
        dairy_ps: '',
        remarks: ''
      });
    }
    setErrors({});
  }, [application, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.sr_no) newErrors.sr_no = 'SR No is required';
    if (!formData.dairy_no) newErrors.dairy_no = 'Dairy No is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.contact) newErrors.contact = 'Contact is required';
    if (!formData.police_station) newErrors.police_station = 'Police Station is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Failed to save application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{application ? 'Edit Application' : 'Add New Application'}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* SR NO */}
            <div className="form-group">
              <label>SR NO <span className="required">*</span></label>
              <input
                type="number"
                name="sr_no"
                value={formData.sr_no}
                onChange={handleChange}
                disabled={!!application}
                className={errors.sr_no ? 'error' : ''}
              />
              {errors.sr_no && <span className="error-text">{errors.sr_no}</span>}
            </div>

            {/* DAIRY NO */}
            <div className="form-group">
              <label>Dairy NO <span className="required">*</span></label>
              <input
                type="text"
                name="dairy_no"
                value={formData.dairy_no}
                onChange={handleChange}
                className={errors.dairy_no ? 'error' : ''}
              />
              {errors.dairy_no && <span className="error-text">{errors.dairy_no}</span>}
            </div>

            {/* NAME */}
            <div className="form-group full-width">
              <label>Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* CONTACT */}
            <div className="form-group">
              <label>Contact <span className="required">*</span></label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className={errors.contact ? 'error' : ''}
              />
              {errors.contact && <span className="error-text">{errors.contact}</span>}
            </div>

            {/* POLICE STATION */}
            <div className="form-group">
              <label>Police Station <span className="required">*</span></label>
              <select
                name="police_station"
                value={formData.police_station}
                onChange={handleChange}
                className={errors.police_station ? 'error' : ''}
              >
                <option value="">Select Police Station</option>
                {policeStations.map((ps, idx) => (
                  <option key={idx} value={ps}>{ps}</option>
                ))}
              </select>
              {errors.police_station && <span className="error-text">{errors.police_station}</span>}
            </div>

            {/* DIVISION */}
            <div className="form-group">
              <label>Division</label>
              <input
                type="text"
                name="division"
                value={formData.division}
                onChange={handleChange}
              />
            </div>

            {/* CATEGORY */}
            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select Category</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            {/* MARKED TO */}
            <div className="form-group">
              <label>Marked To</label>
              <input
                type="text"
                name="marked_to"
                value={formData.marked_to}
                onChange={handleChange}
              />
            </div>

            {/* MARKED BY */}
            <div className="form-group">
              <label>Marked By</label>
              <input
                type="text"
                name="marked_by"
                value={formData.marked_by}
                onChange={handleChange}
              />
            </div>

            {/* DATE */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            {/* TIMELINE */}
            <div className="form-group">
              <label>Timeline</label>
              <input
                type="text"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
              />
            </div>

            {/* DAYS */}
            <div className="form-group">
              <label>Days</label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
              />
            </div>

            {/* STATUS */}
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="PENDING">Pending</option>
                <option value="HEARD">Heard</option>
                <option value="REFERRED">Referred</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* FEEDBACK */}
            <div className="form-group">
              <label>Feedback</label>
              <select
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
              >
                <option value="PENDING">Pending</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEGATIVE">Negative</option>
              </select>
            </div>

            {/* DAIRY PS */}
            <div className="form-group">
              <label>Dairy PS</label>
              <input
                type="text"
                name="dairy_ps"
                value={formData.dairy_ps}
                onChange={handleChange}
              />
            </div>

            {/* REMARKS */}
            <div className="form-group full-width">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {application ? 'Update' : 'Save'} Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;