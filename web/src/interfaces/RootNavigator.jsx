import React, { useState, useEffect } from 'react';
import { usePlatform } from '../hooks/usePlatform';
import WebInterface from './WebInterface';
import AppInterface from './AppInterface';
import AdminDashboard from './AdminDashboard';
import DeliveryDashboard from './DeliveryDashboard';
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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const authUserStr = localStorage.getItem('subhone_auth_user');
      const savedRole = localStorage.getItem('app_role');
      if (authUserStr) {
        const parsed = JSON.parse(authUserStr);
        return { ...parsed, role: parsed.role || savedRole || 'customer' };
      } else if (savedRole) {
        return { role: savedRole };
      }
      return null;
    } catch (err) {
      return null;
    }
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { platform, loading, isApp } = usePlatform();

  // Check for existing session and verify active existence in DB
  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      if (!currentUser) return;
      try {
        const isSuperAdmin = (currentUser.email || '').toLowerCase().trim() === 'subhonehealthgroup@gmail.com';
        const queryKey = currentUser.email || currentUser.phone || currentUser.id;
        
        if (queryKey && !isSuperAdmin) {
          try {
            const { api } = await import('../services/api');
            const liveProfile = await api.getUserProfile(queryKey);
            if (!liveProfile && isMounted) {
              console.warn('User account deleted by admin or no longer exists. Logging out.');
              handleLogout();
            }
          } catch (vErr) {
            console.warn('Session live profile verification note:', vErr);
          }
        }
      } catch (err) {
        console.warn('Session verification error:', err);
      }
    }

    verifySession();
    return () => { isMounted = false; };
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

  if (currentUser.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} isApp={isApp} user={currentUser} />;
  }

  if (currentUser.role === 'delivery_partner') {
    return <DeliveryDashboard onLogout={handleLogout} isApp={isApp} user={currentUser} />;
  }

  if (currentUser.role === 'staff') {
    return <AdminDashboard onLogout={handleLogout} isApp={isApp} staffMode={true} user={currentUser} />;
  }

  // Retailers now default to the main customer store (which handles wholesale logic internally)
  return isApp ? <AppInterface onLogout={handleLogout} /> : <WebInterface onLogout={handleLogout} />;
}
