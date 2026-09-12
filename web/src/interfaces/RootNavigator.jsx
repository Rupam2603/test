import React, { useState, useEffect } from 'react';
import { usePlatform } from '../hooks/usePlatform';
import WebInterface from './WebInterface';
import AppInterface from './AppInterface';
import RetailerPortal from './RetailerPortal';
import AdminDashboard from './AdminDashboard';
import { 
  ShieldCheck, 
  Pill, 
  Truck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight 
} from 'lucide-react';
import '../styles/auth.css';
import '../styles/admin.css';

export default function RootNavigator() {
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const { platform, loading, isApp } = usePlatform();

  // Check for existing session
  useEffect(() => {
    const savedRole = localStorage.getItem('app_role');
    if (savedRole) {
      setCurrentUser({ role: savedRole });
    }
  }, []);

  const handleAuthentication = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsAuthenticating(true);
    
    // Simulate network delay for a professional feel
    setTimeout(() => {
      let assignedRole = 'customer';
      if (email.toLowerCase().includes('admin')) assignedRole = 'admin';
      else if (email.toLowerCase().includes('retailer') || email.toLowerCase().includes('partner')) assignedRole = 'retailer';
      
      localStorage.setItem('app_role', assignedRole);
      setCurrentUser({ role: assignedRole });
      setIsAuthenticating(false);
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('app_role');
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  if (loading || isAuthenticating) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>{isAuthenticating ? 'Securing your connection...' : 'Initializing Secure Session...'}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        <div className="auth-split-card">
          
          {/* Left Panel - Branding & Information */}
          <div className="auth-left-panel">
            {/* Background elements */}
            <div className="bg-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-cross cross-1"></div>
              <div className="shape shape-cross cross-2"></div>
            </div>

            <div className="auth-left-content">
              {/* Logo */}
              <div className="auth-brand-logo">
                <div className="logo-icon-svg">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 10C12.5 6.5 15.5 3.5 19.5 3.5C23.5 3.5 26.5 6.5 26.5 10C26.5 12.5 25 14.5 23 15.5" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M26.5 30C26.5 33.5 23.5 36.5 19.5 36.5C15.5 36.5 12.5 33.5 12.5 30C12.5 27.5 14 25.5 16 24.5" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M16 24.5C18 25.5 21 25.5 23 24.5" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M23 15.5C21 14.5 18 14.5 16 15.5" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="12" cy="28" r="8" fill="#ef4444"/>
                    <path d="M12 24V32M8 28H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="logo-text">
                  <span className="logo-subh">SubhOne</span>
                  <span className="logo-health">Health Group</span>
                  <span className="logo-tagline">PHARMACY & DIAGNOSTIC</span>
                </div>
              </div>

              <div className="auth-welcome-badge">
                <ShieldCheck size={16} />
                Welcome Back
              </div>
              
              <h1 className="auth-hero-title">
                Your Health<br/>
                <span>Our Priority</span>
              </h1>
              
              <p className="auth-hero-subtitle">
                Log in to access your account and<br/>continue your health journey.
              </p>

              <div className="auth-features">
                <div className="auth-feature-item">
                  <div className="feature-icon"><Pill size={20} /></div>
                  <div className="feature-text">
                    <strong>Wide Range</strong>
                    <span>of Health Products</span>
                  </div>
                </div>
                <div className="auth-feature-item">
                  <div className="feature-icon"><ShieldCheck size={20} /></div>
                  <div className="feature-text">
                    <strong>Trusted</strong>
                    <span>Quality & Care</span>
                  </div>
                </div>
                <div className="auth-feature-item">
                  <div className="feature-icon"><Truck size={20} /></div>
                  <div className="feature-text">
                    <strong>Fast & Reliable</strong>
                    <span>Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Boy Illustration Placeholder */}
            <div className="auth-illustration">
              <div className="illustration-box">
                <div className="delivery-person-placeholder">
                  <div className="box-mock">
                    <span className="logo-subh" style={{fontSize:'10px'}}>SubhOne</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="auth-right-panel">
            <div className="auth-right-content">
              
              {/* Logo in the right panel */}
              <div className="auth-brand-logo center-logo">
                <div className="logo-icon-svg">
                  <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 10C12.5 6.5 15.5 3.5 19.5 3.5C23.5 3.5 26.5 6.5 26.5 10C26.5 12.5 25 14.5 23 15.5" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M26.5 30C26.5 33.5 23.5 36.5 19.5 36.5C15.5 36.5 12.5 33.5 12.5 30C12.5 27.5 14 25.5 16 24.5" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="12" cy="28" r="8" fill="#ef4444"/>
                    <path d="M12 24V32M8 28H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="logo-text">
                  <span className="logo-subh" style={{fontSize:'24px'}}>SubhOne</span>
                  <span className="logo-health" style={{fontSize:'24px'}}>Health Group</span>
                  <span className="logo-tagline" style={{fontSize:'11px'}}>PHARMACY & DIAGNOSTIC</span>
                </div>
              </div>

              <div className="login-header">
                <h2>Login to Your Account</h2>
                <p>Welcome back! Please enter your details.</p>
              </div>

              <form onSubmit={handleAuthentication} className="login-form">
                <div className="input-group">
                  <label>Email Address *</label>
                  <div className="input-with-icon">
                    <Mail size={18} />
                    <input 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password *</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {showPassword ? (
                      <EyeOff size={18} className="eye-icon" onClick={() => setShowPassword(false)} />
                    ) : (
                      <Eye size={18} className="eye-icon" onClick={() => setShowPassword(true)} />
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>

                <button type="submit" className="login-submit-btn">
                  Login <ArrowRight size={18} style={{marginLeft: '8px', verticalAlign: 'middle'}}/>
                </button>

                <div className="divider">
                  <span>or</span>
                </div>

                <button type="button" className="google-btn">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                  Continue with Google
                </button>

                <div className="signup-prompt">
                  Don't have an account? <a href="#">Create Account</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pass logout handler to children if needed
  if (currentUser.role === 'admin') return <AdminDashboard onLogout={handleLogout} />;
  if (currentUser.role === 'retailer') return <RetailerPortal onLogout={handleLogout} />;
  
  // Default to customer
  return isApp ? <AppInterface onLogout={handleLogout} /> : <WebInterface onLogout={handleLogout} />;
}
