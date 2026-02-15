import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Phone,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getApplications, 
  getPoliceStations, 
  getCategories,
  updateApplicationStatus,
  updateApplicationFeedback 
} from '../services/api';
import './DataTablePage.css';
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

const DataTablePage = () => {
  const { user } = useAuth();
  
  // Data
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [policeStations, setPoliceStations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [shos, setShos] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    police_station: '',
    division: '',
    category: '',
    status: '',
    feedback: '',
    marked_to:  ''
  });
  
  // Sorting
  const [sortField, setSortField] = useState('sr_no');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
  setLoading(true);
  try {
    const [apps, ps, cat] = await Promise.all([
      getApplications({}),
      getPoliceStations(),
      getCategories()
    ]);
    
    const applications = apps.results || apps;
    setAllData(applications);
    
    // ✅ FIX: Deduplicate police stations
    const uniquePS = getUniqueValues(ps);
    setPoliceStations(uniquePS);
    
    // ✅ FIX: Deduplicate categories
    const uniqueCat = getUniqueValues(cat);
    setCategories(uniqueCat);
    
    // ✅ FIX: Extract unique divisions
    const divisionValues = applications.map(a => a.division).filter(Boolean);
    const uniqueDivisions = getUniqueValues(divisionValues);
    setDivisions(uniqueDivisions);
    
    // ✅ FIX: Extract unique SHOs
    const shoValues = applications.map(a => a.marked_to).filter(Boolean);
    const uniqueSHOs = getUniqueValues(shoValues);
    setShos(uniqueSHOs);
    
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...allData];

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.name?. toLowerCase().includes(search) ||
        item.dairy_no?.toLowerCase().includes(search) ||
        item.contact?.includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.police_station?.toLowerCase().includes(search)
      );
    }

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        result = result.filter(item => item[key] === filters[key]);
      }
    });

    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';
      
      // Convert to string for comparison
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allData, searchTerm, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      police_station:  '',
      division: '',
      category: '',
      status: '',
      feedback: '',
      marked_to: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['Sr. No', 'Dairy No', 'Name', 'Contact', 'PS', 'Division', 'Category', 'Marked To', 'Status', 'Feedback', 'Date', 'Days'];
    const rows = filteredAndSortedData.map(item => [
      item.sr_no,
      item.dairy_no,
      item.name,
      item.contact,
      item. police_station,
      item. division,
      item.category,
      item.marked_to || '',
      item.status,
      item.feedback,
      item.date || '',
      item.days || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL. createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      await handleRefresh();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleFeedbackUpdate = async (id, feedback) => {
    try {
      await updateApplicationFeedback(id, feedback, '');
      await handleRefresh();
    } catch (error) {
      alert('Failed to update feedback');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const getStatusClass = (status) => {
    const classes = {
      'PENDING': 'status-pending',
      'HEARD': 'status-heard',
      'REFERRED': 'status-referred',
      'CLOSED': 'status-closed'
    };
    return classes[status] || 'status-pending';
  };

  const getFeedbackClass = (feedback) => {
    const classes = {
      'POSITIVE': 'feedback-positive',
      'NEGATIVE': 'feedback-negative',
      'PENDING': 'feedback-neutral'
    };
    return classes[feedback] || 'feedback-neutral';
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading {allData.length > 0 ? allData.length : ''} records...</p>
      </div>
    );
  }

  const activeFilters = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 :  0);

  return (
    <div className="datatable-page">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-left">
          <h1>Applications Data Table</h1>
          <div className="record-info">
            <span className="total-records">{allData.length} Total Records</span>
            {filteredAndSortedData.length !== allData.length && (
              <span className="filtered-records">• {filteredAndSortedData.length} Filtered</span>
            )}
            <span className="showing-records">
              • Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData. length)} of {filteredAndSortedData.length}
            </span>
          </div>
        </div>
        <div className="top-actions">
          <button onClick={handleRefresh} className="btn-refresh" disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? 'spinning' :  ''} />
          </button>
          <button onClick={exportToCSV} className="btn-export">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search name, dairy no, contact, category, PS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-btn">×</button>
          )}
        </div>

        <select value={filters.police_station} onChange={(e) => handleFilterChange('police_station', e.target. value)}>
          <option value="">All Police Stations ({policeStations.length})</option>
          {policeStations.map((ps, i) => (
            <option key={i} value={ps}>{ps}</option>
          ))}
        </select>

        <select value={filters.division} onChange={(e) => handleFilterChange('division', e.target.value)}>
          <option value="">All Divisions ({divisions.length})</option>
          {divisions.map((div, i) => (
            <option key={i} value={div}>{div}</option>
          ))}
        </select>

        <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target. value)}>
          <option value="">All Categories ({categories.length})</option>
          {categories. map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={filters.marked_to} onChange={(e) => handleFilterChange('marked_to', e.target.value)}>
          <option value="">All SHOs ({shos.length})</option>
          {shos.map((sho, i) => (
            <option key={i} value={sho}>{sho}</option>
          ))}
        </select>

        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="HEARD">Heard</option>
          <option value="REFERRED">Referred</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select value={filters.feedback} onChange={(e) => handleFilterChange('feedback', e.target. value)}>
          <option value="">All Feedback</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEGATIVE">Negative</option>
          <option value="PENDING">Pending</option>
        </select>

        {activeFilters > 0 && (
          <button onClick={clearFilters} className="clear-all-btn">
            Clear All ({activeFilters})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('sr_no')} className="sortable">Sr.No <SortIcon field="sr_no" /></th>
              <th onClick={() => handleSort('dairy_no')} className="sortable">Dairy No <SortIcon field="dairy_no" /></th>
              <th onClick={() => handleSort('name')} className="sortable">Name <SortIcon field="name" /></th>
              <th>Contact</th>
              <th onClick={() => handleSort('police_station')} className="sortable">Police Station <SortIcon field="police_station" /></th>
              <th onClick={() => handleSort('division')} className="sortable">Division <SortIcon field="division" /></th>
              <th onClick={() => handleSort('category')} className="sortable">Category <SortIcon field="category" /></th>
              <th onClick={() => handleSort('marked_to')} className="sortable">Marked To <SortIcon field="marked_to" /></th>
              <th onClick={() => handleSort('status')} className="sortable">Status <SortIcon field="status" /></th>
              <th onClick={() => handleSort('feedback')} className="sortable">Feedback <SortIcon field="feedback" /></th>
              <th onClick={() => handleSort('date')} className="sortable">Date <SortIcon field="date" /></th>
              <th onClick={() => handleSort('days')} className="sortable">Days <SortIcon field="days" /></th>
              {user?.role === 'ADMIN' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="13" className="no-data">
                  <Filter size={48} />
                  <p>No records found</p>
                  <button onClick={clearFilters} className="clear-filters-btn">Clear Filters</button>
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr key={item.id}>
                  <td>{item.sr_no}</td>
                  <td className="dairy-cell">{item.dairy_no}</td>
                  <td className="name-cell">{item. name}</td>
                  <td>
                    {item.contact && (
                      <a href={`tel:${item.contact}`} className="phone-link">
                        <Phone size={14} /> {item.contact}
                      </a>
                    )}
                  </td>
                  <td>{item.police_station}</td>
                  <td>{item.division}</td>
                  <td className="category-cell">{item.category}</td>
                  <td>{item.marked_to || '-'}</td>
                  <td>
                    <span className={`badge ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getFeedbackClass(item.feedback)}`}>
                      {item.feedback}
                    </span>
                  </td>
                  <td>{item.date ?  new Date(item.date).toLocaleDateString('en-GB') : '-'}</td>
                  <td>{item.days || '-'}</td>
                  {user?.role === 'ADMIN' && (
                    <td>
                      <div className="action-btns">
                        {item.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'HEARD')}
                              className="action-btn success"
                              title="Mark Heard"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'REFERRED')}
                              className="action-btn warning"
                              title="Refer"
                            >
                              →
                            </button>
                          </>
                        )}
                        {item.feedback === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleFeedbackUpdate(item.id, 'POSITIVE')}
                              className="action-btn positive"
                              title="Positive"
                            >
                              <ThumbsUp size={12} />
                            </button>
                            <button
                              onClick={() => handleFeedbackUpdate(item.id, 'NEGATIVE')}
                              className="action-btn negative"
                              title="Negative"
                            >
                              <ThumbsDown size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAndSortedData. length > 0 && (
        <div className="pagination-bar">
          <div className="items-per-page">
            <label>
              Show
              <select value={itemsPerPage} onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
              per page
            </label>
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="page-numbers">
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
                    className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              <ChevronsRight size={16} />
            </button>
          </div>

          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTablePage;