// frontend/src/pages/Applications.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getApplications,
  exportApplications,  // ⚡ ADD THIS
  getPoliceStations, 
  getCategories,
  updateApplicationStatus,
  updateApplicationFeedback 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Phone, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Download,
  Maximize2,
  Minimize2,
  User,
  MapPin,
  Tag,
  Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './Applications.css';

// ✅ HELPER FUNCTION: Remove duplicates (case-insensitive)
const getUniqueValues = (array) => {
  if (!Array.isArray(array)) return [];
  
  const seen = new Map();
  
  array.forEach(item => {
    if (item && typeof item === 'string') {
      const normalized = item.trim().toLowerCase();
      if (normalized && !seen.has(normalized)) {
        seen.set(normalized, item.trim());
      }
    }
  });
  
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
};

const Applications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ⚡ PAGINATION STATE (Server-Side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Data State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [policeStations, setPoliceStations] = useState([]);
  const [selectedPS, setSelectedPS] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState('');
  
  // Date Filter State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Sorting State
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // ⭐ Fullscreen & Modal States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // ⚡ DEBOUNCE SEARCH (wait 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ⚡ FETCH DATA WHEN FILTERS CHANGE (Server-Side)
  useEffect(() => {
    fetchApplications();
  }, [page, pageSize, debouncedSearch, statusFilter, selectedPS, selectedCategory, feedbackFilter, fromDate, toDate, sortField, sortDirection]);

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchApplications = async () => {
    setLoading(page === 1);
    setRefreshing(page !== 1);
    try {
      // ⚡ BUILD ORDERING STRING
      const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;
      
      // ⚡ CALL API WITH PAGINATION AND FILTERS
      const data = await getApplications({
        page,
        page_size: pageSize,
        search: debouncedSearch,
        status: statusFilter,
        police_station: selectedPS,
        category: selectedCategory,
        feedback: feedbackFilter,
        from_date: fromDate,
        to_date: toDate,
        ordering
      });
      
      // ⚡ SET PAGINATED DATA
      setApplications(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
      
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [psData, catData] = await Promise.all([
        getPoliceStations(),
        getCategories()
      ]);
      
      // ✅ Deduplicate police stations
      const uniquePS = getUniqueValues(psData);
      setPoliceStations(uniquePS);
      
      // ✅ Deduplicate categories
      const uniqueCat = getUniqueValues(catData);
      setCategories(uniqueCat);
      
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleFeedbackUpdate = async (id, feedback) => {
    try {
      await updateApplicationFeedback(id, feedback, '');
      fetchApplications();
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback');
    }
  };

  const handleCall = (contact) => {
    window.location.href = `tel:${contact}`;
  };

  // ⭐ Fullscreen Toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ⭐ View Details in Modal
  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setShowDetailModal(true);
  };

  // ⭐ Close Modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedApplication(null);
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ⚡ EXPORT ALL MATCHING RECORDS TO EXCEL
// At the top, update imports:

// Replace the exportAllToExcel function with this:
const exportAllToExcel = async () => {
  const hasFilters = search || statusFilter || selectedPS || selectedCategory || feedbackFilter || fromDate || toDate;
  
  const confirmMessage = hasFilters
    ? `Export all ${totalCount} filtered applications to Excel?`
    : `Export ALL ${totalCount} applications from database to Excel?`;
  
  if (!window.confirm(confirmMessage)) {
    return;
  }

  setExporting(true);
  try {
    console.log('📥 Fetching all matching applications...');
    
    // ⚡ BUILD ORDERING STRING
    const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;
    
    // ⚡ USE NEW EXPORT ENDPOINT (NO PAGINATION LIMIT)
    const data = await exportApplications({
      search: debouncedSearch,
      status: statusFilter,
      police_station: selectedPS,
      category: selectedCategory,
      feedback: feedbackFilter,
      from_date: fromDate,
      to_date: toDate,
      ordering
    });
    
    const allData = data.results || [];
    
    if (allData.length === 0) {
      alert('⚠️ No data to export!');
      return;
    }

    console.log(`📊 Exporting ${allData.length} applications...`);

    // Prepare data for export
    const exportData = allData.map((app) => ({
      'SR NO': app.sr_no || '',
      'DAIRY NO': app.dairy_no || '',
      'NAME': app.name || '',
      'CONTACT': app.contact || '',
      'POLICE STATION': app.police_station || '',
      'DIVISION': app.division || 'N/A',
      'CATEGORY': app.category || '',
      'MARKED TO': app.marked_to || 'N/A',
      'MARKED BY': app.marked_by || 'N/A',
      'STATUS': app.status || '',
      'FEEDBACK': app.feedback || '',
      'DATE': app.date ? formatDate(app.date) : 'N/A',
      'TIMELINE': app.timeline || 'N/A',
      'DAYS': app.days || 'N/A',
      'DAIRY PS': app.dairy_ps || 'N/A',
      'REMARKS': app.remarks || ''
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 8 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 20 },
      { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 40 }
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');

    // Generate filename
    const today = new Date().toISOString().split('T')[0];
    let filename = hasFilters 
      ? `Filtered_Applications_${today}` 
      : `All_Applications_${today}`;
    
    if (fromDate && toDate) {
      filename += `_${fromDate}_to_${toDate}`;
    } else if (fromDate) {
      filename += `_from_${fromDate}`;
    } else if (toDate) {
      filename += `_until_${toDate}`;
    }
    
    if (selectedPS) {
      filename += `_${selectedPS.replace(/\s+/g, '_')}`;
    }
    
    if (statusFilter) {
      filename += `_${statusFilter}`;
    }
    
    filename += '.xlsx';

    // Save file
    XLSX.writeFile(wb, filename);

    const message = hasFilters
      ? `✅ Successfully exported ${exportData.length} filtered applications!`
      : `✅ Successfully exported ALL ${exportData.length} applications!`;
    alert(message);
  } catch (error) {
    console.error('Error exporting applications:', error);
    alert('❌ Failed to export applications. Please try again.');
  } finally {
    setExporting(false);
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'PENDING': 'badge badge-warning',
      'HEARD': 'badge badge-success',
      'REFERRED': 'badge badge-info',
      'CLOSED': 'badge badge-secondary'
    };
    return classes[status] || 'badge badge-secondary';
  };

  const getFeedbackBadgeClass = (feedback) => {
    const classes = {
      'POSITIVE': 'badge badge-success',
      'NEGATIVE': 'badge badge-danger',
      'PENDING': 'badge badge-secondary'
    };
    return classes[feedback] || 'badge badge-secondary';
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('');
    setSelectedPS('');
    setSelectedCategory('');
    setFeedbackFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ChevronDown size={14} className="sort-icon-inactive" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp size={14} className="sort-icon-active" /> : 
      <ChevronDown size={14} className="sort-icon-active" />;
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`pagination-btn ${page === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  if (loading && !refreshing) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  const hasActiveFilters = search || statusFilter || selectedPS || selectedCategory || feedbackFilter || fromDate || toDate;

  return (
    <div className={`applications-table-page ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Header */}
      <div className="page-header-section">
        <div>
          <h2 className="page-title">Open Court Applications</h2>
          <p className="page-subtitle">
            Showing {applications.length} of <strong>{totalCount}</strong> total applications
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>
        <div className="header-actions">
          {/* ⚡ SMART Export All Button */}
          <button 
            onClick={exportAllToExcel} 
            className="export-excel-btn"
            disabled={exporting || totalCount === 0}
            title={hasActiveFilters ? `Export all ${totalCount} filtered applications` : `Export ALL ${totalCount} applications`}
          >
            {exporting ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Export All ({totalCount})
              </>
            )}
          </button>
          
          <button onClick={handleRefresh} className="refresh-btn" disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            Refresh
          </button>
          
          {/* ⭐ Fullscreen Button */}
          <button 
            onClick={toggleFullscreen} 
            className="fullscreen-btn"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Single Row Filters */}
      <div className="filters-container-compact">
        <div className="search-box-main">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, dairy no, contact, SR no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="clear-icon-btn">
              <X size={18} />
            </button>
          )}
        </div>

        {/* From Date Input */}
        <div className="date-input-wrapper">
          <Calendar size={18} className="date-icon" />
          <input
            type="date"
            className="filter-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From Date"
            title="From Date"
          />
          {fromDate && (
            <button onClick={() => setFromDate('')} className="clear-date-btn">
              <X size={14} />
            </button>
          )}
        </div>

        {/* To Date Input */}
        <div className="date-input-wrapper">
          <Calendar size={18} className="date-icon" />
          <input
            type="date"
            className="filter-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To Date"
            title="To Date"
          />
          {toDate && (
            <button onClick={() => setToDate('')} className="clear-date-btn">
              <X size={14} />
            </button>
          )}
        </div>

        <select 
          className="filter-select-compact" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="HEARD">Heard</option>
          <option value="REFERRED">Referred</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select 
          className="filter-select-compact" 
          value={selectedPS} 
          onChange={(e) => setSelectedPS(e.target.value)}
        >
          <option value="">All Police Stations</option>
          {policeStations.map((ps, idx) => (
            <option key={idx} value={ps}>{ps}</option>
          ))}
        </select>

        <select 
          className="filter-select-compact" 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          className="filter-select-compact" 
          value={feedbackFilter} 
          onChange={(e) => setFeedbackFilter(e.target.value)}
        >
          <option value="">All Feedback</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEGATIVE">Negative</option>
          <option value="PENDING">Pending</option>
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-all-btn">
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Table with Scrollbars */}
      <div className="table-container">
        <div className="table-scroll-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('sr_no')} className="sortable-header">
                  <div className="th-content">
                    SR NO <SortIcon field="sr_no" />
                  </div>
                </th>
                <th onClick={() => handleSort('dairy_no')} className="sortable-header">
                  <div className="th-content">
                    DAIRY NO <SortIcon field="dairy_no" />
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="sortable-header">
                  <div className="th-content">
                    NAME <SortIcon field="name" />
                  </div>
                </th>
                <th>CONTACT</th>
                <th onClick={() => handleSort('police_station')} className="sortable-header">
                  <div className="th-content">
                    POLICE STATION <SortIcon field="police_station" />
                  </div>
                </th>
                <th onClick={() => handleSort('division')} className="sortable-header">
                  <div className="th-content">
                    DIVISION <SortIcon field="division" />
                  </div>
                </th>
                <th onClick={() => handleSort('category')} className="sortable-header">
                  <div className="th-content">
                    CATEGORY <SortIcon field="category" />
                  </div>
                </th>
                <th onClick={() => handleSort('marked_to')} className="sortable-header">
                  <div className="th-content">
                    MARKED TO <SortIcon field="marked_to" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="sortable-header">
                  <div className="th-content">
                    STATUS <SortIcon field="status" />
                  </div>
                </th>
                <th onClick={() => handleSort('feedback')} className="sortable-header">
                  <div className="th-content">
                    FEEDBACK <SortIcon field="feedback" />
                  </div>
                </th>
                <th onClick={() => handleSort('date')} className="sortable-header">
                  <div className="th-content">
                    DATE <SortIcon field="date" />
                  </div>
                </th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="12" className="no-data-cell">
                    <FileText size={48} color="#ccc" />
                    <p>No applications found</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="data-row">
                    <td className="cell-sr">{app.sr_no}</td>
                    <td className="cell-dairy">{app.dairy_no}</td>
                    <td className="cell-name">{app.name}</td>
                    <td className="cell-contact">
                      <button 
                        onClick={() => handleCall(app.contact)} 
                        className="phone-btn"
                        title="Call"
                      >
                        <Phone size={14} />
                        {app.contact}
                      </button>
                    </td>
                    <td className="cell-ps">{app.police_station}</td>
                    <td className="cell-division">{app.division || 'N/A'}</td>
                    <td className="cell-category">{app.category}</td>
                    <td className="cell-marked">{app.marked_to || 'N/A'}</td>
                    <td className="cell-status">
                      <span className={getStatusBadgeClass(app.status)}>
                        {app.status}
                      </span>
                    </td>
                    <td className="cell-feedback">
                      <span className={getFeedbackBadgeClass(app.feedback)}>
                        {app.feedback}
                      </span>
                    </td>
                    <td className="cell-date">{formatDate(app.date)}</td>
                    <td className="cell-actions">
                      <button 
                        onClick={() => handleViewDetails(app)}
                        className="view-btn"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⚡ PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {applications.length} of {totalCount} entries (Page {page} of {totalPages})
          </div>
          <div className="pagination-controls">
            <button 
              onClick={() => setPage(1)} 
              disabled={page === 1}
              className="pagination-btn"
            >
              <ChevronsLeft size={18} />
            </button>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={18} />
            </button>
            
            {renderPaginationButtons()}
            
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="pagination-btn"
            >
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => setPage(totalPages)} 
              disabled={page === totalPages}
              className="pagination-btn"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
          <div className="items-per-page">
            <label>Items per page:</label>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      )}

      {/* ⭐ Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="modal-overlay-detail" onClick={closeDetailModal}>
          <div className="modal-content-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-detail">
              <h2>Application Details</h2>
              <button onClick={closeDetailModal} className="modal-close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="modal-body-detail">
              {/* Basic Information */}
              <div className="detail-section-modal">
                <h3>Basic Information</h3>
                <div className="status-badges-modal">
                  <span className={getStatusBadgeClass(selectedApplication.status)}>
                    {selectedApplication.status}
                  </span>
                  <span className={getFeedbackBadgeClass(selectedApplication.feedback)}>
                    {selectedApplication.feedback}
                  </span>
                </div>
                <div className="info-grid-modal">
                  <div className="info-item-modal">
                    <FileText size={18} className="info-icon-modal" />
                    <div>
                      <label>SR Number:</label>
                      <span>{selectedApplication.sr_no}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <FileText size={18} className="info-icon-modal" />
                    <div>
                      <label>Dairy Number:</label>
                      <span>{selectedApplication.dairy_no}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <User size={18} className="info-icon-modal" />
                    <div>
                      <label>Applicant Name:</label>
                      <span>{selectedApplication.name}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <Phone size={18} className="info-icon-modal" />
                    <div>
                      <label>Contact Number:</label>
                      <button onClick={() => handleCall(selectedApplication.contact)} className="phone-btn">
                        <Phone size={14} />
                        {selectedApplication.contact}
                      </button>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <Calendar size={18} className="info-icon-modal" />
                    <div>
                      <label>Date:</label>
                      <span>{formatDate(selectedApplication.date)}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <Clock size={18} className="info-icon-modal" />
                    <div>
                      <label>Timeline:</label>
                      <span>{selectedApplication.timeline || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="detail-section-modal">
                <h3>Location Details</h3>
                <div className="info-grid-modal">
                  <div className="info-item-modal">
                    <MapPin size={18} className="info-icon-modal" />
                    <div>
                      <label>Police Station:</label>
                      <span>{selectedApplication.police_station}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <MapPin size={18} className="info-icon-modal" />
                    <div>
                      <label>Division:</label>
                      <span>{selectedApplication.division || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <FileText size={18} className="info-icon-modal" />
                    <div>
                      <label>Dairy PS:</label>
                      <span>{selectedApplication.dairy_ps || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div className="detail-section-modal">
                <h3>Case Details</h3>
                <div className="info-grid-modal">
                  <div className="info-item-modal">
                    <Tag size={18} className="info-icon-modal" />
                    <div>
                      <label>Category:</label>
                      <span>{selectedApplication.category}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <User size={18} className="info-icon-modal" />
                    <div>
                      <label>Marked To:</label>
                      <span>{selectedApplication.marked_to || 'Not Assigned'}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <User size={18} className="info-icon-modal" />
                    <div>
                      <label>Marked By:</label>
                      <span>{selectedApplication.marked_by || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="info-item-modal">
                    <Clock size={18} className="info-icon-modal" />
                    <div>
                      <label>Days:</label>
                      <span>{selectedApplication.days || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                {selectedApplication.remarks && (
                  <div className="remarks-section-modal">
                    <label>Remarks:</label>
                    <p>{selectedApplication.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer-detail">
              <button 
                onClick={() => { 
                  navigate(`/applications/${selectedApplication.id}`); 
                  closeDetailModal(); 
                }} 
                className="export-excel-btn"
              >
                <Eye size={16} />
                Full Details & Edit
              </button>
              <button onClick={closeDetailModal} className="refresh-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;