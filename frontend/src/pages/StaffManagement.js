import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  getAllStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff,
  getPoliceStations,
  getDivisions
} from '../services/api';
import './StaffManagement.css';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    police_station: '',
    division: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter staff based on search
    if (searchTerm) {
      const filtered = staffList.filter(staff => 
        staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.police_station.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff(staffList);
    }
  }, [searchTerm, staffList]);

 const fetchData = async () => {
  setLoading(true);
  try {
    const [staff, ps, divs] = await Promise.all([
      getAllStaff(),
      getPoliceStations(),
      getDivisions()
    ]);
    
    setStaffList(staff);
    setFilteredStaff(staff);
    
    // ⭐ FIX: Remove duplicates using Set, remove empty values, and sort
    const uniquePS = [...new Set(ps.filter(Boolean).map(s => s.trim()))].sort();
    const uniqueDivs = [...new Set(divs.filter(Boolean).map(s => s.trim()))].sort();
    
    setPoliceStations(uniquePS);
    setDivisions(uniqueDivs);
    
    console.log('✅ Loaded unique police stations:', uniquePS.length);
    console.log('✅ Loaded unique divisions:', uniqueDivs.length);
  } catch (error) {
    console.error('Error fetching data:', error);
    showNotification('Failed to load staff data', 'error');
  } finally {
    setLoading(false);
  }
};

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      police_station: '',
      division: ''
    });
    setFormErrors({});
    setShowPassword(false);
    setShowModal(true);
  };

  const openEditModal = (staff) => {
    setModalMode('edit');
    setSelectedStaff(staff);
    setFormData({
      username: staff.username,
      password: '', // Don't populate password
      email: staff.email || '',
      first_name: staff.first_name || '',
      last_name: staff.last_name || '',
      phone: staff.phone || '',
      police_station: staff.police_station || '',
      division: staff.division || ''
    });
    setFormErrors({});
    setShowPassword(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStaff(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      police_station: '',
      division: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (modalMode === 'create' && !formData.password) {
      errors.password = 'Password is required';
    }

    if (modalMode === 'create' && formData.password && formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }

    if (!formData.police_station) {
      errors.police_station = 'Police station is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data (remove password if empty in edit mode)
      const submitData = { ...formData };
      if (modalMode === 'edit' && !submitData.password) {
        delete submitData.password;
      }

      if (modalMode === 'create') {
        await createStaff(submitData);
        showNotification('Staff account created successfully!', 'success');
      } else {
        await updateStaff(selectedStaff.id, submitData);
        showNotification('Staff account updated successfully!', 'success');
      }

      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving staff:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save staff account';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staff) => {
    if (!window.confirm(`Are you sure you want to delete staff account "${staff.username}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      await deleteStaff(staff.id);
      showNotification('Staff account deleted successfully!', 'success');
      fetchData();
    } catch (error) {
      console.error('Error deleting staff:', error);
      showNotification('Failed to delete staff account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading && staffList.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading staff management...</p>
      </div>
    );
  }

  return (
    <div className="staff-management-page">
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="staff-header">
        <div className="header-left">
          <h1 className="page-title">
            <Users size={32} />
            Staff Management
          </h1>
          <p className="page-subtitle">
            Manage staff accounts and permissions • Total: <strong>{filteredStaff.length}</strong> staff members
          </p>
        </div>
        <button className="btn-create-staff" onClick={openCreateModal}>
          <Plus size={20} />
          Add New Staff
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, username, email or police station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Police Station</th>
              <th>Division</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  <Users size={48} />
                  <p>{searchTerm ? 'No staff found matching your search' : 'No staff accounts yet'}</p>
                  {!searchTerm && (
                    <button className="btn-create-inline" onClick={openCreateModal}>
                      <Plus size={18} />
                      Create First Staff Account
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => (
                <tr key={staff.id}>
                  <td className="username-cell">
                    <Shield size={16} />
                    <strong>{staff.username}</strong>
                  </td>
                  <td>{staff.first_name || staff.last_name ? `${staff.first_name} ${staff.last_name}`.trim() : '-'}</td>
                  <td className="email-cell">
                    {staff.email ? (
                      <>
                        <Mail size={14} />
                        {staff.email}
                      </>
                    ) : '-'}
                  </td>
                  <td className="phone-cell">
                    {staff.phone ? (
                      <>
                        <Phone size={14} />
                        {staff.phone}
                      </>
                    ) : '-'}
                  </td>
                  <td className="station-cell">
                    <MapPin size={14} />
                    {staff.police_station || '-'}
                  </td>
                  <td className="division-cell">
                    <Building size={14} />
                    {staff.division || '-'}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action btn-edit" 
                      onClick={() => openEditModal(staff)}
                      title="Edit Staff"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-action btn-delete" 
                      onClick={() => handleDelete(staff)}
                      title="Delete Staff"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? <Plus size={24} /> : <Edit size={24} />}
                {modalMode === 'create' ? 'Create New Staff Account' : 'Edit Staff Account'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-grid">
                {/* Username */}
                <div className="form-group">
                  <label>
                    <Shield size={16} />
                    Username <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className={formErrors.username ? 'input-error' : ''}
                  />
                  {formErrors.username && <span className="error-text">{formErrors.username}</span>}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label>
                    <Shield size={16} />
                    Password {modalMode === 'create' && <span className="required">*</span>}
                    {modalMode === 'edit' && <span className="optional">(leave empty to keep current)</span>}
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={modalMode === 'create' ? 'Enter password' : 'Enter new password'}
                      className={formErrors.password ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                </div>

                {/* First Name */}
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                </div>

                {/* Last Name */}
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label>
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={formErrors.email ? 'input-error' : ''}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>
                    <Phone size={16} />
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Police Station */}
                <div className="form-group full-width">
                  <label>
                    <MapPin size={16} />
                    Police Station <span className="required">*</span>
                  </label>
                  <select
                    name="police_station"
                    value={formData.police_station}
                    onChange={handleInputChange}
                    className={formErrors.police_station ? 'input-error' : ''}
                  >
                    <option value="">-- Select Police Station --</option>
                    {policeStations.map((ps, index) => (
                      <option key={index} value={ps}>{ps}</option>
                    ))}
                  </select>
                  {formErrors.police_station && <span className="error-text">{formErrors.police_station}</span>}
                </div>

                {/* Division */}
                <div className="form-group full-width">
                  <label>
                    <Building size={16} />
                    Division
                  </label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Division --</option>
                    {divisions.map((div, index) => (
                      <option key={index} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Saving...' : (modalMode === 'create' ? 'Create Staff' : 'Update Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;