import React, { useState } from 'react'

export function AppHeader({ onTabChange, onSearch, cartCount = 0, user, onLogout, location, onOpenTracker }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (onSearch) onSearch(e.target.value)
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '👤'

  return (
    <header className="app-new-header">
      {/* Top Brand & Actions Row */}
      <div className="app-header-top-row">
        <button 
          className="app-menu-icon-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          <span>☰</span>
        </button>

        <div className="app-header-brand" onClick={() => onTabChange && onTabChange('home')}>
          <img src="/subhone_logo.png" alt="SubhOne Logo" className="app-brand-icon" onError={(e) => { e.target.style.display = 'none' }} />
          <span className="app-brand-name">SubhOne Health Group</span>
        </div>

        <div className="app-header-right-actions">
          {user ? (
            <button 
              className="app-logout-pill-btn"
              onClick={() => onLogout ? onLogout() : alert('Logged out')}
            >
              Logout
            </button>
          ) : (
            <button 
              className="app-logout-pill-btn"
              style={{ background: '#2563eb', color: '#ffffff', borderColor: '#1d4ed8', fontWeight: '700' }}
              onClick={() => onTabChange && onTabChange('login')}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="app-search-wrapper">
        <div className="app-search-input-box">
          <span className="app-search-icon">🔍</span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search medicines, brands, stock..." 
            aria-label="Search medicines, brands, stock"
          />
        </div>
      </div>

      {/* Deliver To & Fast Delivery Row (Clickable to open 10-Min Live Delivery Tracker) */}
      <div 
        className="app-delivery-row"
        onClick={onOpenTracker}
        style={{ cursor: 'pointer' }}
        title="Live GPS Location & 10-Min Fast Track Tracker"
      >
        <div className="app-delivery-location">
          <span className="app-loc-pin">📍</span>
          <span className="app-loc-text">
            Deliver to: <strong>{location?.loading ? 'Detecting GPS...' : (location?.shortName || location?.address || 'Local Area (712250)')}</strong> ▾
          </span>
        </div>
        <div className="app-delivery-speed-pill">
          <span className="app-speed-bolt">⚡</span>
          <span>10-min Delivery</span>
        </div>
      </div>

      {/* Slide-out Menu Drawer for Mobile if toggled */}
      {menuOpen && (
        <div className="app-menu-drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="app-menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="app-drawer-header">
              <h3>SubhOne Health</h3>
              <button onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <nav className="app-drawer-nav">
              <button onClick={() => { onTabChange('home'); setMenuOpen(false); }}>🏠 Home</button>
              <button onClick={() => { onTabChange('account'); setMenuOpen(false); }}>👤 Account & Licenses</button>
              <button onClick={() => { onTabChange('category'); setMenuOpen(false); }}>⊞ Categories</button>
              <button onClick={() => { onTabChange('order'); setMenuOpen(false); }}>📦 My Orders</button>
              <button onClick={() => { onTabChange('cart'); setMenuOpen(false); }}>🛒 Wholesale Cart ({cartCount})</button>
              {user ? (
                <button onClick={() => { if (onLogout) onLogout(); setMenuOpen(false); }} style={{ color: '#ef4444' }}>
                  🚪 Logout ({user.name})
                </button>
              ) : (
                <>
                  <button onClick={() => { onTabChange('login'); setMenuOpen(false); }} style={{ color: '#2563eb', fontWeight: '700' }}>
                    🔑 Sign In to App
                  </button>
                  <button onClick={() => { onTabChange('signup'); setMenuOpen(false); }} style={{ color: '#059669', fontWeight: '700' }}>
                    📝 Register as Retailer
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
