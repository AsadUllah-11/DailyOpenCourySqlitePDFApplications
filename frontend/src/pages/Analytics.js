import React, { useEffect, useState, useMemo } from 'react';
import { exportApplications } from '../services/api';  // ⚡ CHANGED: Use exportApplications instead
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart, 
  Pie,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  Clock,
  ThumbsUp,
  MapPin,
  BarChart3,
  Activity,
  RefreshCw,
  Download,
  Calendar,
  X,
  Users,
  Award,
  AlertTriangle
} from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // ⚡ NEW: Initialize dates with current date and 1 month ago
const getDefaultDates = () => {
  const today = new Date("2025-02-14");
  const oneMonthAgo = new Date("2025-01-14");

  return {
    from: oneMonthAgo.toISOString().split('T')[0], // YYYY-MM-DD
    to: today.toISOString().split('T')[0]
  };
};


  const defaultDates = getDefaultDates();
  
  // Date Filter States - ⚡ SET DEFAULT VALUES
  const [fromDate, setFromDate] = useState(defaultDates.from);
  const [toDate, setToDate] = useState(defaultDates.to);

  // ⚡ NEW: Fetch data when component mounts OR when dates change
  useEffect(() => {
    fetchAllData();
  }, [fromDate, toDate]); // ⚡ CRITICAL: Re-fetch when dates change

  // ⚡ FIXED: Fetch ALL applications with date filters
  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      // Build filter params
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      
      console.log('📊 Fetching analytics with filters:', params);
      
      // ⚡ Use exportApplications to get ALL data (no pagination)
      const response = await exportApplications(params);
      
      // Extract applications array
      const appsData = response.results || response || [];
      
      console.log(`✅ Loaded ${appsData.length} applications for analytics`);
      
      setApplications(appsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ⚡ REMOVED: filteredApplications useMemo (filtering now done by backend)
  // We use applications directly since backend already filtered by dates
  const filteredApplications = applications;

  const clearFilters = () => {
    const defaults = getDefaultDates();
    setFromDate(defaults.from);
    setToDate(defaults.to);
  };

  const metrics = useMemo(() => {
    if (!filteredApplications || filteredApplications.length === 0) {
      return {
        statusDist: { PENDING: 0, HEARD: 0, REFERRED: 0, CLOSED: 0 },
        feedbackDist: { POSITIVE: 0, NEGATIVE: 0, PENDING: 0 },
        monthlyTrend: [],
        topPS: [],
        topCategories: [],
        divisionPerformance: [],
        resolutionTime: [],
        statusByPS: [],
        contactRate: [],
        topSHOs: [],
        categoryFeedbackCorrelation: [],
        dailySubmissions: [],
        pendingAge: [],
        monthlyFeedbackTrend: []
      };
    }

    // 1. STATUS DISTRIBUTION
    const statusDist = {
      PENDING: filteredApplications.filter(a => a.status === 'PENDING').length,
      HEARD: filteredApplications.filter(a => a.status === 'HEARD').length,
      REFERRED: filteredApplications.filter(a => a.status === 'REFERRED').length,
      CLOSED: filteredApplications.filter(a => a.status === 'CLOSED').length
    };

    // 2. FEEDBACK DISTRIBUTION
    const feedbackDist = {
      POSITIVE: filteredApplications.filter(a => a.feedback === 'POSITIVE').length,
      NEGATIVE: filteredApplications.filter(a => a.feedback === 'NEGATIVE').length,
      PENDING: filteredApplications.filter(a => a.feedback === 'PENDING').length
    };

    // 3. MONTHLY TREND
    const monthlyData = {};
    const monthYearMap = {};
    
    filteredApplications.forEach(app => {
      if (app.date) {
        try {
          const date = new Date(app.date);
          if (!isNaN(date.getTime())) {
            const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
            monthYearMap[monthKey] = sortKey;
          }
        } catch (e) {
          console.error('Invalid date:', app.date);
        }
      }
    });

    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, applications]) => ({
        month,
        applications,
        sortKey: monthYearMap[month]
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12)
      .map(({ month, applications }) => ({ month, applications }));

    // 4. TOP 10 POLICE STATIONS
    const psCount = {};
    filteredApplications.forEach(app => {
      if (app.police_station) {
        if (!psCount[app.police_station]) {
          psCount[app.police_station] = { pending: 0, resolved: 0 };
        }
        if (app.status === 'PENDING') {
          psCount[app.police_station].pending++;
        } else {
          psCount[app.police_station].resolved++;
        }
      }
    });

    const topPS = Object.entries(psCount)
      .map(([name, data]) => ({
        name,
        pending: data.pending,
        resolved: data.resolved,
        total: data.pending + data.resolved
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // 5. TOP 10 CATEGORIES
    const catCount = {};
    filteredApplications.forEach(app => {
      if (app.category) {
        const normalized = app.category.trim();
        const titleCase = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        catCount[titleCase] = (catCount[titleCase] || 0) + 1;
      }
    });
    const topCategories = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 6. DIVISION PERFORMANCE
    const divisionData = {};
    filteredApplications.forEach(app => {
      if (app.division) {
        if (!divisionData[app.division]) {
          divisionData[app.division] = { name: app.division, total: 0, pending: 0, resolved: 0 };
        }
        divisionData[app.division].total++;
        if (app.status === 'PENDING') {
          divisionData[app.division].pending++;
        } else {
          divisionData[app.division].resolved++;
        }
      }
    });
    const divisionPerformance = Object.values(divisionData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // 7. RESOLUTION TIME BY STATUS
    const calculateAvgDays = (status) => {
      const filtered = filteredApplications.filter(a => a.status === status && a.days);
      if (filtered.length === 0) return 0;
      const sum = filtered.reduce((acc, a) => acc + (a.days || 0), 0);
      return Math.round(sum / filtered.length);
    };

    const resolutionTime = [
      { status: 'Pending', days: calculateAvgDays('PENDING') },
      { status: 'Heard', days: calculateAvgDays('HEARD') },
      { status: 'Referred', days: calculateAvgDays('REFERRED') },
      { status: 'Closed', days: calculateAvgDays('CLOSED') }
    ];

    // 8. STATUS BY POLICE STATION
    const psStatusData = {};
    filteredApplications.forEach(app => {
      if (app.police_station) {
        if (!psStatusData[app.police_station]) {
          psStatusData[app.police_station] = { 
            name: app.police_station, 
            PENDING: 0, 
            HEARD: 0, 
            REFERRED: 0, 
            CLOSED: 0 
          };
        }
        psStatusData[app.police_station][app.status]++;
      }
    });
    const statusByPS = Object.values(psStatusData)
      .sort((a, b) => (b.PENDING + b.HEARD + b.REFERRED + b.CLOSED) - (a.PENDING + a.HEARD + a.REFERRED + a.CLOSED))
      .slice(0, 8);

    // ============= NEW ANALYTICS =============

    // 9. CONTACT RATE ANALYSIS
    const withContact = filteredApplications.filter(a => a.contact && a.contact.trim() !== '').length;
    const withoutContact = filteredApplications.length - withContact;
    const contactRate = [
      { name: 'With Contact', value: withContact, percentage: ((withContact / filteredApplications.length) * 100).toFixed(1) },
      { name: 'Without Contact', value: withoutContact, percentage: ((withoutContact / filteredApplications.length) * 100).toFixed(1) }
    ];

    // 10. TOP 10 SHOs (MARKED TO)
    const shoCount = {};
    filteredApplications.forEach(app => {
      if (app.marked_to && app.marked_to.trim() !== '') {
        const sho = app.marked_to.trim();
        if (!shoCount[sho]) {
          shoCount[sho] = { total: 0, resolved: 0, pending: 0 };
        }
        shoCount[sho].total++;
        if (app.status === 'CLOSED' || app.status === 'HEARD') {
          shoCount[sho].resolved++;
        } else {
          shoCount[sho].pending++;
        }
      }
    });
    const topSHOs = Object.entries(shoCount)
      .map(([name, data]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        total: data.total,
        resolved: data.resolved,
        pending: data.pending,
        efficiency: data.total > 0 ? ((data.resolved / data.total) * 100).toFixed(0) : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // 11. CATEGORY VS FEEDBACK CORRELATION
    const catFeedbackData = {};
    filteredApplications.forEach(app => {
      if (app.category) {
        const normalized = app.category.trim();
        const titleCase = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        if (!catFeedbackData[titleCase]) {
          catFeedbackData[titleCase] = { positive: 0, negative: 0, pending: 0 };
        }
        if (app.feedback === 'POSITIVE') catFeedbackData[titleCase].positive++;
        if (app.feedback === 'NEGATIVE') catFeedbackData[titleCase].negative++;
        if (app.feedback === 'PENDING') catFeedbackData[titleCase].pending++;
      }
    });
    const categoryFeedbackCorrelation = Object.entries(catFeedbackData)
      .map(([name, data]) => ({
        name,
        positive: data.positive,
        negative: data.negative,
        total: data.positive + data.negative + data.pending,
        satisfaction: data.positive + data.negative > 0 ? 
          ((data.positive / (data.positive + data.negative)) * 100).toFixed(0) : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // 12. DAILY SUBMISSIONS (Day of Week Analysis)
    const dayOfWeekData = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    filteredApplications.forEach(app => {
      if (app.date) {
        const date = new Date(app.date);
        if (!isNaN(date.getTime())) {
          const dayName = dayNames[date.getDay()];
          dayOfWeekData[dayName]++;
        }
      }
    });
    const dailySubmissions = dayNames.map(day => ({
      day,
      count: dayOfWeekData[day]
    }));

    // 13. PENDING APPLICATIONS AGE DISTRIBUTION
    const today = new Date();
    const pendingApps = filteredApplications.filter(a => a.status === 'PENDING' && a.date);
    const ageGroups = { '0-7 days': 0, '8-15 days': 0, '16-30 days': 0, '31-60 days': 0, '60+ days': 0 };
    
    pendingApps.forEach(app => {
      const appDate = new Date(app.date);
      const daysDiff = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) ageGroups['0-7 days']++;
      else if (daysDiff <= 15) ageGroups['8-15 days']++;
      else if (daysDiff <= 30) ageGroups['16-30 days']++;
      else if (daysDiff <= 60) ageGroups['31-60 days']++;
      else ageGroups['60+ days']++;
    });
    
    const pendingAge = Object.entries(ageGroups).map(([range, count]) => ({ range, count }));

    // 14. MONTHLY FEEDBACK TREND
    const monthlyFeedbackData = {};
    filteredApplications.forEach(app => {
      if (app.date && app.feedback !== 'PENDING') {
        const date = new Date(app.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyFeedbackData[monthKey]) {
          monthlyFeedbackData[monthKey] = { positive: 0, negative: 0, sortKey };
        }
        if (app.feedback === 'POSITIVE') monthlyFeedbackData[monthKey].positive++;
        if (app.feedback === 'NEGATIVE') monthlyFeedbackData[monthKey].negative++;
      }
    });
    
    const monthlyFeedbackTrend = Object.entries(monthlyFeedbackData)
      .map(([month, data]) => ({
        month,
        positive: data.positive,
        negative: data.negative,
        satisfaction: data.positive + data.negative > 0 ?
          ((data.positive / (data.positive + data.negative)) * 100).toFixed(0) : 0,
        sortKey: data.sortKey
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6);

    return {
      statusDist,
      feedbackDist,
      monthlyTrend,
      topPS,
      topCategories,
      divisionPerformance,
      resolutionTime,
      statusByPS,
      contactRate,
      topSHOs,
      categoryFeedbackCorrelation,
      dailySubmissions,
      pendingAge,
      monthlyFeedbackTrend
    };
  }, [filteredApplications]);

  const COLORS = {
    status: {
      PENDING: '#F59E0B',
      HEARD: '#10B981',
      REFERRED: '#6366F1',
      CLOSED: '#6B7280'
    },
    feedback: {
      POSITIVE: '#10B981',
      NEGATIVE: '#EF4444',
      PENDING: '#6B7280'
    },
    bars: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#F97316'],
    contact: ['#10B981', '#EF4444']
  };

  const exportData = () => {
    const timestamp = new Date().toLocaleString();
    const csvContent = `Analytics Report - Generated: ${timestamp}\n\n` +
      `Date Range: ${fromDate || 'All'} to ${toDate || 'All'}\n` +
      `Total Applications: ${filteredApplications.length}\n` +
      `Pending: ${metrics.statusDist.PENDING}\n` +
      `Heard: ${metrics.statusDist.HEARD}\n` +
      `Referred: ${metrics.statusDist.REFERRED}\n` +
      `Closed: ${metrics.statusDist.CLOSED}\n\n` +
      `FEEDBACK\n` +
      `Positive: ${metrics.feedbackDist.POSITIVE}\n` +
      `Negative: ${metrics.feedbackDist.NEGATIVE}\n` +
      `Pending: ${metrics.feedbackDist.PENDING}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner-large"></div>
        <p>Loading Analytics...</p>
      </div>
    );
  }

  const totalApps = filteredApplications.length;
  const resolutionRate = totalApps > 0 ? ((metrics.statusDist.CLOSED / totalApps) * 100).toFixed(1) : '0';
  const totalFeedback = metrics.feedbackDist.POSITIVE + metrics.feedbackDist.NEGATIVE;
  const positiveFeedbackRate = totalFeedback > 0 ? ((metrics.feedbackDist.POSITIVE / totalFeedback) * 100).toFixed(1) : '0';

  return (
    <div className="analytics-page">
      {/* Compact Header */}
      <div className="analytics-header-compact">
        <div className="header-left">
          <Activity size={28} />
          <div>
            <h1>Analytics Dashboard</h1>
            <p>Real-time Data Insights {lastUpdate && `• ${lastUpdate.toLocaleTimeString()}`}</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={fetchAllData} disabled={refreshing} className="btn-icon" title="Refresh Data">
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
          </button>
          <button onClick={exportData} className="btn-icon" title="Export CSV">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Date Filter - Compact */}
      <div className="filter-compact">
        <Calendar size={18} />
        <input 
          type="date" 
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="date-input"
          placeholder="From"
        />
        <span>to</span>
        <input 
          type="date" 
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="date-input"
          placeholder="To"
        />
        <button onClick={clearFilters} className="btn-clear-small" title="Reset to Last Month">
          <X size={14} />
        </button>
        <span className="filter-count">
          {filteredApplications.length} records • {fromDate} to {toDate}
        </span>
      </div>

      {/* Mini KPI Cards - Compact */}
      <div className="kpi-mini-grid">
        <div className="kpi-mini blue">
          <FileText size={20} />
          <div>
            <h3>{totalApps.toLocaleString()}</h3>
            <p>Total Apps</p>
          </div>
        </div>
        <div className="kpi-mini orange">
          <Clock size={20} />
          <div>
            <h3>{metrics.statusDist.PENDING.toLocaleString()}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="kpi-mini green">
          <CheckCircle size={20} />
          <div>
            <h3>{resolutionRate}%</h3>
            <p>Resolved</p>
          </div>
        </div>
        <div className="kpi-mini purple">
          <ThumbsUp size={20} />
          <div>
            <h3>{positiveFeedbackRate}%</h3>
            <p>Positive</p>
          </div>
        </div>
      </div>

      {/* Charts Grid - REST OF THE CODE REMAINS THE SAME */}
      <div className="charts-grid-modern">
        
        {/* 1. Status Distribution - Bar */}
        <div className="chart-modern">
          <div className="chart-title">
            <h3>
              <BarChart3 size={18} />
              Status Distribution
            </h3>
            <span className="badge-live">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={[
                { name: 'Pending', value: metrics.statusDist.PENDING },
                { name: 'Heard', value: metrics.statusDist.HEARD },
                { name: 'Referred', value: metrics.statusDist.REFERRED },
                { name: 'Closed', value: metrics.statusDist.CLOSED }
              ].filter(item => item.value > 0)}
            >
              <defs>
                <linearGradient id="gradientPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="gradientHeard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="gradientReferred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="gradientClosed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B7280" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#6B7280" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280" 
                style={{ fontSize: '13px', fontWeight: 600 }}
              />
              <YAxis 
                stroke="#6B7280" 
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#FFF', 
                  border: '2px solid #3B82F6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                label={{ position: 'top', fill: '#1E293B', fontWeight: 700, fontSize: 14 }}
              >
                {['url(#gradientPending)', 'url(#gradientHeard)', 'url(#gradientReferred)', 'url(#gradientClosed)'].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Feedback Distribution */}
        <div className="chart-modern">
          <div className="chart-title">
            <h3>Feedback Analysis</h3>
            <span className="badge-live">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Positive', value: metrics.feedbackDist.POSITIVE },
                  { name: 'Negative', value: metrics.feedbackDist.NEGATIVE },
                  { name: 'Pending', value: metrics.feedbackDist.PENDING }
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={90}
                innerRadius={50}
                dataKey="value"
              >
                {Object.values(COLORS.feedback).map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Monthly Trend */}
        <div className="chart-modern wide">
          <div className="chart-title">
            <h3><TrendingUp size={18} />Monthly Application Trend</h3>
            <span className="badge-info">12 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={metrics.monthlyTrend}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #3B82F6', borderRadius: '8px', fontSize: '13px' }} />
              <Area type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} fill="url(#colorApps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Top Police Stations */}
        <div className="chart-modern wide">
          <div className="chart-title">
            <h3><MapPin size={18} />Top 10 Police Stations</h3>
            <span className="badge-success">Performance</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={metrics.topPS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #10B981', borderRadius: '8px', fontSize: '13px' }} />
              <Legend />
              <Bar dataKey="resolved" stackId="a" fill="#10B981" name="Resolved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5. Top Categories */}
        <div className="chart-modern wide">
          <div className="chart-title">
            <h3><BarChart3 size={18} />Top 10 Categories</h3>
            <span className="badge-purple">Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={metrics.topCategories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis dataKey="name" type="category" width={150} stroke="#6B7280" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #8B5CF6', borderRadius: '8px', fontSize: '13px' }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {metrics.topCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.bars[index % 8]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Division Performance */}
        <div className="chart-modern wide">
          <div className="chart-title">
            <h3>Division Performance</h3>
            <span className="badge-info">Comparative</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.divisionPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #06B6D4', borderRadius: '8px', fontSize: '13px' }} />
              <Legend />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7. Avg Resolution Time */}
        <div className="chart-modern">
          <div className="chart-title">
            <h3>Avg Resolution Days</h3>
            <span className="badge-warning">Timeline</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.resolutionTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="status" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #F59E0B', borderRadius: '8px', fontSize: '13px' }} />
              <Bar dataKey="days" fill="#F59E0B" name="Days" radius={[8, 8, 0, 0]}>
                {metrics.resolutionTime.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(COLORS.status)[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 8. Status by PS */}
        <div className="chart-modern wide">
          <div className="chart-title">
            <h3>Status Breakdown by Police Station</h3>
            <span className="badge-success">Detailed</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={metrics.statusByPS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #6366F1', borderRadius: '8px', fontSize: '13px' }} />
              <Legend />
              <Bar dataKey="PENDING" stackId="a" fill={COLORS.status.PENDING} name="Pending" />
              <Bar dataKey="HEARD" stackId="a" fill={COLORS.status.HEARD} name="Heard" />
              <Bar dataKey="REFERRED" stackId="a" fill={COLORS.status.REFERRED} name="Referred" />
              <Bar dataKey="CLOSED" stackId="a" fill={COLORS.status.CLOSED} name="Closed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ========== NEW CHARTS ========== */}

        {/* 9. Contact Rate Analysis */}
        <div className="chart-modern">
          <div className="chart-title">
            <h3><Users size={18} />Contact Information Rate</h3>
            <span className="badge-info">Data Quality</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={metrics.contactRate}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={90}
                dataKey="value"
              >
                {COLORS.contact.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 10. Top SHOs Performance */}
        <div className="chart-modern wide">
          <div className="chart-title">
            <h3><Award size={18} />Top 10 SHOs by Workload</h3>
            <span className="badge-success">Officers</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={metrics.topSHOs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" angle={-45} textAnchor="end" height={100} style={{ fontSize: '10px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #10B981', borderRadius: '8px', fontSize: '13px' }} />
              <Legend />
              <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 11. Category vs Feedback Satisfaction */}
        <div className="chart-modern wide">
          <div className="chart-title">
            <h3><ThumbsUp size={18} />Category Satisfaction Rate</h3>
            <span className="badge-purple">Feedback Quality</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.categoryFeedbackCorrelation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '11px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #8B5CF6', borderRadius: '8px', fontSize: '13px' }} />
              <Legend />
              <Bar dataKey="positive" fill="#10B981" name="Positive" radius={[4, 4, 0, 0]} />
              <Bar dataKey="negative" fill="#EF4444" name="Negative" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 12. Daily Submissions (Day of Week) */}
        <div className="chart-modern">
          <div className="chart-title">
            <h3><Calendar size={18} />Applications by Day of Week</h3>
            <span className="badge-info">Patterns</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.dailySubmissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #3B82F6', borderRadius: '8px', fontSize: '13px' }} />
              <Bar dataKey="count" fill="#3B82F6" name="Applications" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 13. Pending Applications Age */}
        <div className="chart-modern">
          <div className="chart-title">
            <h3><AlertTriangle size={18} />Pending Cases Age Distribution</h3>
            <span className="badge-warning">Urgency</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.pendingAge}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" stroke="#6B7280" style={{ fontSize: '11px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #F59E0B', borderRadius: '8px', fontSize: '13px' }} />
              <Bar dataKey="count" fill="#F59E0B" name="Pending Cases" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 14. Monthly Feedback Trend */}
        <div className="chart-modern wide">
          <div className="chart-title">
            <h3><TrendingUp size={18} />Monthly Feedback Trend</h3>
            <span className="badge-success">Satisfaction Over Time</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={metrics.monthlyFeedbackTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #10B981', borderRadius: '8px', fontSize: '13px' }} />
              <Legend />
              <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={3} name="Positive" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={3} name="Negative" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Analytics;