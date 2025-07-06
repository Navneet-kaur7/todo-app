// src/components/Dashboard.js
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, ChevronDown } from 'lucide-react';
import TodoApp from '../TodoApp';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">
            
          </span>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown" ref={dropdownRef}>
              <button
                className="btn btn-link nav-link text-white text-decoration-none d-flex align-items-center"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                style={{ border: 'none', background: 'none' }}
              >
                <User size={20} className="me-2" />
                {user?.name}
                <ChevronDown 
                  size={16} 
                  className={`ms-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  style={{ 
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>
              
              {/* Custom Dropdown Menu */}
              {dropdownOpen && (
                <ul 
                  className="dropdown-menu dropdown-menu-end show"
                  style={{ 
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 1000,
                    minWidth: '200px',
                    animation: 'fadeIn 0.15s ease-in-out'
                  }}
                >
                  <li>
                    <span className="dropdown-item-text">
                      <small className="text-muted">Signed in as</small><br />
                      <strong>{user?.email}</strong>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <span className="dropdown-item-text">
                      <Calendar size={14} className="me-1" />
                      <small>Joined {formatDate(user?.createdAt || new Date())}</small>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                      style={{ 
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} className="me-2" />
                      Sign Out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="mb-1">
                      Welcome back, <span className="text-primary">{user?.name}!</span> 👋
                    </h2>
                    <p className="text-muted mb-0">
                      Ready to tackle your tasks today? Let's get things done!
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="badge bg-light text-dark fs-6 px-3 py-2">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Todo App */}
      <div className="container-fluid px-0">
        <TodoApp />
      </div>

      {/* Add some custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dropdown-item:hover {
          background-color: #f8f9fa;
        }
        
        .dropdown-item.text-danger:hover {
          background-color: #f8d7da;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;