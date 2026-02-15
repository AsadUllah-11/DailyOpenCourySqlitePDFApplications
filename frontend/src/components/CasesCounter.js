import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import './CasesCounter.css';

const CasesCounter = () => {
  const [totalCases, setTotalCases] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedNumber, setDisplayedNumber] = useState(0);

  useEffect(() => {
    fetchCasesCount();
  }, []);

  // Animate number from 0 to actual value
  useEffect(() => {
    if (!loading && totalCases > 0) {
      let current = 0;
      const increment = Math.ceil(totalCases / 50); // Animate in 50 steps
      const interval = setInterval(() => {
        current += increment;
        if (current >= totalCases) {
          setDisplayedNumber(totalCases);
          clearInterval(interval);
        } else {
          setDisplayedNumber(current);
        }
      }, 30); // 30ms per step

      return () => clearInterval(interval);
    }
  }, [loading, totalCases]);

  const fetchCasesCount = async () => {
    try {
      setLoading(true);
      const stats = await getDashboardStats();
      // Get total applications (all cases)
      setTotalCases(stats.overall_stats?.total_applications || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching cases count:', err);
      setError('Unable to load case count');
      setTotalCases(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cases-counter-container">
      <div className="counter-card">
        <div className="counter-icon">
          <BarChart3 size={40} />
        </div>
        
        <div className="counter-content">
          <h3 className="counter-label">Total Cases Heard</h3>
          
          {loading ? (
            <div className="counter-loading">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="counter-error">
              <AlertCircle size={24} />
              <p>{error}</p>
            </div>
          ) : (
            <div className="counter-display">
              <div className="counter-number">
                {displayedNumber.toLocaleString()}
              </div>
              <button 
                onClick={fetchCasesCount} 
                className="counter-refresh"
                title="Refresh count"
              >
                ↻
              </button>
            </div>
          )}
          
          <p className="counter-subtitle">Cases processed by DIG Office</p>
        </div>
      </div>
    </div>
  );
};

export default CasesCounter;