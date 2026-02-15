import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronUp, 
  ChevronDown, 
  Phone, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  X,
  FileText,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getApplications, 
  getPoliceStations, 
  getCategories,
  updateApplicationStatus,
  updateApplicationFeedback 
} from '../services/api';
import './DataTable.css';

const DataTable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Data state
  const [applications, setApplications] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter options
  const [policeStations, setPoliceStations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [shos, setShos] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPS, setSelectedPS] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState('');
  const [selectedSHO, setSelectedSHO] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

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

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [applications, searchTerm, selectedPS, selectedDivision, selectedCategory, selectedStatus, selectedFeedback, selectedSHO, sortConfig]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsData, psData, catData] = await Promise.all([
        getApplications({}),
        getPoliceStations(),
        getCategories()
      ]);
      
      const apps = appsData.results || appsData;
      setApplications(apps);
      
      // ✅ FIX: Deduplicate police stations
      const uniquePS = getUniqueValues(psData);
      setPoliceStations(uniquePS);
      
      // ✅ FIX: Deduplicate categories
      const uniqueCat = getUniqueValues(catData);
      setCategories(uniqueCat);
      
      // ✅ FIX: Extract unique divisions from applications
      const divisionValues = apps.map(app => app.division).filter(Boolean);
      const uniqueDivisions = getUniqueValues(divisionValues);
      setDivisions(uniqueDivisions);
      
      // ✅ FIX: Extract unique SHOs from applications
      const shoValues = apps.map(app => app.marked_to).filter(Boolean);
      const uniqueSHOs = getUniqueValues(shoValues);
      setShos(uniqueSHOs);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.dairy_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.contact?.includes(searchTerm) ||
        app.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ✅ FIX: Case-insensitive filter comparison
    if (selectedPS) {
      filtered = filtered.filter(app => 
        app.police_station?.trim().toLowerCase() === selectedPS.trim().toLowerCase()
      );
    }

    if (selectedDivision) {
      filtered = filtered.filter(app => 
        app.division?.trim().toLowerCase() === selectedDivision.trim().toLowerCase()
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(app => 
        app.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    if (selectedFeedback) {
      filtered = filtered.filter(app => app.feedback === selectedFeedback);
    }

    if (selectedSHO) {
      filtered = filtered.filter(app => 
        app.marked_to?.trim().toLowerCase() === selectedSHO.trim().toLowerCase()
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleFeedbackUpdate = async (id, feedback) => {
    try {
      await updateApplicationFeedback(id, feedback, '');
      fetchData();
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback');
    }
  };

  const handleCall = (contact) => {
    window.location.href = `tel:${contact}`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPS('');
    setSelectedDivision('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedFeedback('');
    setSelectedSHO('');
  };

  const exportToCSV = () => {
    const headers = ['Sr. No', 'Dairy No', 'Name', 'Contact', 'Police Station', 'Division', 'Category', 'Marked To', 'Status', 'Feedback', 'Date'];
    const csvData = filteredData.map(app => [
      app.sr_no,
      app.dairy_no,
      app.name,
      app.contact,
      app.police_station,
      app.division,
      app.category,
      app.marked_to,
      app.status,
      app.feedback,
      app.date || 'N/A'
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronUp size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': 'badge-pending',
      'HEARD': 'badge-heard',
      'REFERRED': 'badge-referred',
      'CLOSED': 'badge-closed'
    };
    return badges[status] || 'badge-pending';
  };

  const getFeedbackBadge = (feedback) => {
    const badges = {
      'POSITIVE': 'badge-positive',
      'NEGATIVE': 'badge-negative',
      'PENDING': 'badge-neutral'
    };
    return badges[feedback] || 'badge-neutral';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="datatable-container">
      {/* Header */}
      <div className="datatable-header">
        <div className="header-left">
          <h2>Applications Data Table</h2>
          <p className="data-count">
            Showing {currentItems.length} of {filteredData.length} records
            {filteredData.length !== applications.length && ` (filtered from ${applications.length} total)`}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={fetchData} className="btn-icon" title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button onClick={exportToCSV} className="btn-export" title="Export to CSV">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="datatable-controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, dairy no, contact, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              <X size={16} />
            </button>
          )}
        </div>

        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className={`btn-filter ${showFilters ? 'active' : ''}`}
        >
          <Filter size={18} />
          Filters {(selectedPS || selectedDivision || selectedCategory || selectedStatus || selectedFeedback || selectedSHO) && '•'}
        </button>

        {(searchTerm || selectedPS || selectedDivision || selectedCategory || selectedStatus || selectedFeedback || selectedSHO) && (
          <button onClick={clearFilters} className="btn-clear">
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label>Police Station</label>
              <select value={selectedPS} onChange={(e) => setSelectedPS(e.target.value)}>
                <option value="">All Stations</option>
                {policeStations.map((ps, idx) => (
                  <option key={idx} value={ps}>{ps}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Division</label>
              <select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)}>
                <option value="">All Divisions</option>
                {divisions.map((div, idx) => (
                  <option key={idx} value={div}>{div}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>SHO / Marked To</label>
              <select value={selectedSHO} onChange={(e) => setSelectedSHO(e.target.value)}>
                <option value="">All SHOs</option>
                {shos.map((sho, idx) => (
                  <option key={idx} value={sho}>{sho}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="HEARD">Heard</option>
                <option value="REFERRED">Referred</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Feedback</label>
              <select value={selectedFeedback} onChange={(e) => setSelectedFeedback(e.target.value)}>
                <option value="">All Feedback</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEGATIVE">Negative</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('sr_no')} className="sortable">
                Sr. No <SortIcon columnKey="sr_no" />
              </th>
              <th onClick={() => handleSort('dairy_no')} className="sortable">
                Dairy No <SortIcon columnKey="dairy_no" />
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name <SortIcon columnKey="name" />
              </th>
              <th>Contact</th>
              <th onClick={() => handleSort('police_station')} className="sortable">
                Police Station <SortIcon columnKey="police_station" />
              </th>
              <th onClick={() => handleSort('division')} className="sortable">
                Division <SortIcon columnKey="division" />
              </th>
              <th onClick={() => handleSort('category')} className="sortable">
                Category <SortIcon columnKey="category" />
              </th>
              <th onClick={() => handleSort('marked_to')} className="sortable">
                Marked To (SHO) <SortIcon columnKey="marked_to" />
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status <SortIcon columnKey="status" />
              </th>
              <th onClick={() => handleSort('feedback')} className="sortable">
                Feedback <SortIcon columnKey="feedback" />
              </th>
              <th onClick={() => handleSort('date')} className="sortable">
                Date <SortIcon columnKey="date" />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="12" className="no-data">
                  <FileText size={48} />
                  <p>No records found</p>
                </td>
              </tr>
            ) : (
              currentItems.map((app) => (
                <tr key={app.id}>
                  <td>{app.sr_no}</td>
                  <td className="dairy-no">{app.dairy_no}</td>
                  <td className="name-cell">{app.name}</td>
                  <td>
                    {app.contact && (
                      <a href={`tel:${app.contact}`} className="contact-link">
                        <Phone size={14} /> {app.contact}
                      </a>
                    )}
                  </td>
                  <td>{app.police_station}</td>
                  <td>{app.division}</td>
                  <td className="category-cell">{app.category}</td>
                  <td>{app.marked_to || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getFeedbackBadge(app.feedback)}`}>
                      {app.feedback}
                    </span>
                  </td>
                  <td>
                    {app.date ? (
                      <span className="date-cell">
                        <Calendar size={14} />
                        {new Date(app.date).toLocaleDateString('en-PK')}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user?.role === 'ADMIN' && (
                        <>
                          {app.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(app.id, 'HEARD')}
                                className="btn-action btn-success"
                                title="Mark as Heard"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(app.id, 'REFERRED')}
                                className="btn-action btn-warning"
                                title="Refer"
                              >
                                →
                              </button>
                            </>
                          )}
                          {app.feedback === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleFeedbackUpdate(app.id, 'POSITIVE')}
                                className="btn-action btn-positive"
                                title="Positive Feedback"
                              >
                                <ThumbsUp size={14} />
                              </button>
                              <button
                                onClick={() => handleFeedbackUpdate(app.id, 'NEGATIVE')}
                                className="btn-action btn-negative"
                                title="Negative Feedback"
                              >
                                <ThumbsDown size={14} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="btn-action btn-view"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <label>
              Show
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              per page
            </label>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="page-btn"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Last
            </button>
          </div>

          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;