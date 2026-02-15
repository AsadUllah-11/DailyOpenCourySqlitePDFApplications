import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ThumbsUp, 
  ThumbsDown,
  AlertCircle 
} from 'lucide-react';
import CasesCounter from '../components/CasesCounter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = [
  "#06327b",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Applications', 
      value: stats?.overall_stats?.total_applications || 0, 
      icon: FileText, 
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    { 
      title: 'Pending', 
      value: stats?.overall_stats?.pending || 0, 
      icon: Clock, 
      color: '#f59e0b',
      bgColor:  '#fef3c7'
    },
    { 
      title:  'Heard', 
      value: stats?. overall_stats?.heard || 0, 
      icon: CheckCircle, 
      color:  '#10b981',
      bgColor: '#d1fae5'
    },
    { 
      title:  'Referred', 
      value: stats?.overall_stats?. referred || 0, 
      icon: AlertCircle, 
      color:  '#8b5cf6',
      bgColor: '#ede9fe'
    },
    { 
      title:  'Positive Feedback', 
      value: stats?.overall_stats?.positive_feedback || 0, 
      icon: ThumbsUp, 
      color: '#10b981',
      bgColor:  '#d1fae5'
    },
    { 
      title:  'Negative Feedback', 
      value: stats?.overall_stats?.negative_feedback || 0, 
      icon: ThumbsDown, 
      color:  '#ef4444',
      bgColor: '#fee2e2'
    },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome, {user?.first_name || user?.username}!</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
  
      <div className="charts-grid">
        {/* Category Distribution */}
        <div className="chart-card">
  <h3>Top Categories</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={stats?.category_stats?.slice(0, 8) || []}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="category"
        angle={-45}
        textAnchor="end"
        height={100}
      />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count">
        {(stats?.category_stats?.slice(0, 8) || []).map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

        {/* Police Station Stats (DIG only) */}
        {user?.role === 'DIG' && stats?.police_station_stats?.length > 0 && (
          <div className="chart-card">
            <h3>Police Station Statistics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.police_station_stats?. slice(0, 8) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="police_station" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                <Bar dataKey="heard" fill="#10b981" name="Heard" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Division Distribution */}
        {stats?.division_stats?.length > 0 && (
          <div className="chart-card">
            <h3>Division Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.division_stats || []}
                  dataKey="count"
                  nameKey="division"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats?. division_stats?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;