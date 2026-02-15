import React, { useState } from 'react';
import { LogOut, User, Shield, MapPin, Building, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import  CasesCounter  from './CasesCounter';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleDisplay = (role) => {
    if (role === 'ADMIN') return 'Police Station Officer';
    if (role === 'STAFF') return 'Staff Member';
    return role;
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Logo with fallback */}
        
        <div className="header-logo-wrapper">
          <img 
            src="/punjab-police-logo.png" 
            alt="Punjab Police" 
            className="header-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="header-logo-fallback" style={{ display: 'none' }}>
            <Shield size={32} />
          </div>
        </div>
        <div className="header-text">
          <h1 className="header-title">Daily Open Court</h1>
          <p className="header-subtitle">DIG OPS Lahore - MR. Faisal Kamran</p>
        </div>
      </div>
      {/* <div className="header-middle">
      <CasesCounter />
      </div> */}
      
      <div className="header-right">
        {/* Enhanced User Info Card */}
        <div className="user-info-card">
          <div 
            className="user-info-main" 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <span className="user-name">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user?.username || 'User'}
              </span>
              <span className="user-role">
                {getRoleDisplay(user?.role)}
              </span>
            </div>
            {showUserDropdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {/* Dropdown with Extended Info */}
          {showUserDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-section">
                <div className="dropdown-item">
                  <User size={16} />
                  <div className="item-content">
                    <span className="item-label">Username</span>
                    <span className="item-value">{user?.username || '-'}</span>
                  </div>
                </div>

                {user?.email && (
                  <div className="dropdown-item">
                    <Shield size={16} />
                    <div className="item-content">
                      <span className="item-label">Email</span>
                      <span className="item-value">{user.email}</span>
                    </div>
                  </div>
                )}

                {user?.phone && (
                  <div className="dropdown-item">
                    <Shield size={16} />
                    <div className="item-content">
                      <span className="item-label">Phone</span>
                      <span className="item-value">{user.phone}</span>
                    </div>
                  </div>
                )}

                {user?.police_station && (
                  <div className="dropdown-item highlight">
                    <MapPin size={16} />
                    <div className="item-content">
                      <span className="item-label">Police Station</span>
                      <span className="item-value">{user.police_station}</span>
                    </div>
                  </div>
                )}

                {user?.division && (
                  <div className="dropdown-item highlight">
                    <Building size={16} />
                    <div className="item-content">
                      <span className="item-label">Division</span>
                      <span className="item-value">{user.division}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;