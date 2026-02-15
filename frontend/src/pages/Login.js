import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, LogIn } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      console.log('✅ Login successful');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {/* ✅ UPDATED LOGO WITH INLINE STYLES */}
          <img 
            src="/punjab-police-logo.png" 
            alt="Punjab Police" 
            className="login-logo"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              marginBottom: '1rem',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              console.error('❌ Logo not found at /punjab-police-logo.png');
            }}
          />
          <h1>Daily Open Court</h1>
          <p>Punjab Police Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>
              <User size={18} />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="" style={{ width: '20px', height: '20px' }}></div>
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;