import React, { useState } from 'react'

export function AppHeader({ onTabChange, onSearch, cartCount = 0, user, onLogout, location, onOpenLocation, onOpenTracker }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (onSearch) onSearch(e.target.value)
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : ''

  return (
    <header className="app-new-header">
      {/* Top Brand & Actions Row */}
      <div className="app-header-top-row">
        <div className="app-header-brand" onClick={() => onTabChange && onTabChange('home')}>
          <img src="./subhone_logo.png" alt="SubhOne Logo" className="app-brand-icon" onError={(e) => { e.target.style.display = 'none' }} />
          <span className="app-brand-name">SubhOne Health Group</span>
        </div>

        <div className="app-header-right-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                type="button"
                className="app-user-avatar-circle"
                onClick={() => onTabChange && onTabChange('account')}
                title={`Logged in as ${user.name || 'User'} - Open Account`}
                aria-label="Open Account Profile"
              >
                <img 
                  src={user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.name || 'User')}&backgroundColor=b6e3f4`} 
                  alt={user.name || 'User'} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#fff' }} 
                />
              </button>
              <button 
                type="button"
                className="app-logout-pill-btn"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                onClick={() => onLogout ? onLogout() : alert('Logged out')}
                title="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              type="button"
              className="app-logout-pill-btn"
              style={{ background: '#2563eb', color: '#ffffff', borderColor: '#1d4ed8', fontWeight: '700' }}
              onClick={() => onTabChange && onTabChange('login')}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Search Input Box & Menu Icon */}
      <div className="app-search-wrapper">
        <button 
          className="app-menu-icon-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="app-search-input-box">
          <span className="app-search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search medicines, brands, stock..." 
            aria-label="Search medicines, brands, stock"
          />
        </div>
      </div>

      {/* Deliver To Row (Locates user's current location for delivery address) */}
      <div 
        className="app-delivery-row"
        onClick={onOpenLocation || onOpenTracker}
        style={{ cursor: 'pointer' }}
        title="Delivery Address - Locate Current Location for Delivery"
      >
        <div className="app-delivery-location">
          <span className="app-loc-pin"></span>
          <span className="app-loc-text">
            Deliver to: <strong>{location?.loading ? 'Detecting GPS...' : (location?.shortName || location?.address || 'Local Area (700016)')}</strong> ▾
          </span>
        </div>
        <div className="app-delivery-speed-pill">
          <span className="app-speed-bolt"></span>
          <span>10-min Delivery</span>
        </div>
      </div>

      {/* Slide-out Menu Drawer for Mobile if toggled */}
      {menuOpen && (
        <div className="app-menu-drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="app-menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="app-drawer-header">
              <h3>SubhOne Health</h3>
              <button onClick={() => setMenuOpen(false)}></button>
            </div>
            <nav className="app-drawer-nav">
              <button onClick={() => { onTabChange('home'); setMenuOpen(false); }}> Home</button>
              <button onClick={() => { onTabChange('account'); setMenuOpen(false); }}> Account & Licenses</button>
              <button onClick={() => { onTabChange('category'); setMenuOpen(false); }}>⊞ Categories</button>
              <button onClick={() => { onTabChange('order'); setMenuOpen(false); }}> My Orders</button>
              <button onClick={() => { onTabChange('cart'); setMenuOpen(false); }}> Wholesale Cart ({cartCount})</button>
              {user && (user.role === 'admin' || user.role === 'staff' || user.role === 'delivery_partner') && (
                <button 
                  onClick={() => { onTabChange('admin'); setMenuOpen(false); }} 
                  style={{ color: '#0284c7', fontWeight: '700' }}
                >
                   {user.role === 'admin' ? 'Admin Dashboard' : 'Staff Orders Panel'}
                </button>
              )}
              {user ? (
                <button onClick={() => { if (onLogout) onLogout(); setMenuOpen(false); }} style={{ color: '#ef4444' }}>
                   Logout ({user.name})
                </button>
              ) : (
                <>
                  <button onClick={() => { onTabChange('login'); setMenuOpen(false); }} style={{ color: '#2563eb', fontWeight: '700' }}>
                     Sign In (All Roles)
                  </button>
                  <button onClick={() => { onTabChange('signup'); setMenuOpen(false); }} style={{ color: '#059669', fontWeight: '700' }}>
                     Create New Account
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default AppHeader
