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
import AuthPage from '../components/Auth/AuthPage';
import '../styles/auth.css';
import '../styles/admin.css';

export default function RootNavigator() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { platform, loading, isApp } = usePlatform();

  // Check for existing session
  useEffect(() => {
    try {
      const authUserStr = localStorage.getItem('subhone_auth_user');
      const savedRole = localStorage.getItem('app_role');
      if (authUserStr) {
        const parsed = JSON.parse(authUserStr);
        const role = parsed.role || savedRole || 'customer';
        setCurrentUser({ ...parsed, role });
        if (!savedRole) {
          localStorage.setItem('app_role', role);
        }
      } else if (savedRole) {
        setCurrentUser({ role: savedRole });
      }
    } catch (err) {
      console.warn('Session restoration error:', err);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('app_role');
    localStorage.removeItem('subhone_auth_user');
    setCurrentUser(null);
  };

  if (loading || isAuthenticating) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>{isAuthenticating ? 'Securing your connection...' : 'Initializing Secure Session...'}</p>
      </div>
    );
  }

  // Universal Single Login Portal for All Roles (Customer, Retailer, Admin, Staff)
  if (!currentUser) {
    return (
      <AuthPage
        initialMode="login"
        isApp={isApp}
        onSuccess={(userPayload) => {
          setCurrentUser(userPayload);
        }}
      />
    );
  }

  // Route based on role, passing isApp to each panel
  if (currentUser.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} isApp={isApp} user={currentUser} />;
  }

  if (currentUser.role === 'staff' || currentUser.role === 'delivery_partner') {
    return <AdminDashboard onLogout={handleLogout} isApp={isApp} staffMode={true} user={currentUser} />;
  }

  if (currentUser.role === 'retailer') {
    return <RetailerPortal onLogout={handleLogout} isApp={isApp} user={currentUser} />;
  }
  
  // Default to customer
  return isApp ? <AppInterface onLogout={handleLogout} /> : <WebInterface onLogout={handleLogout} />;
}
