import React, { useState } from 'react'

export function WebHeader({ user, onTabChange, onSearch, onToggleMenu, isMenuOpen, location, onOpenLocation, onOpenTracker }) {
  const [searchValue, setSearchValue] = useState('')
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchValue)
    }
  }

  return (
    <header className="web-header">
      <div className="header-container">
        {/* Left cluster with Menu Icon Trigger + Brand Logo */}
        <div className="header-brand-cluster">
          <button 
            type="button"
            className={`web-menu-trigger-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={onToggleMenu}
            aria-label="Toggle navigation menu"
            title="Open Menu"
          >
            <div className="menu-hamburger-lines">
              <span className="line line-1"></span>
              <span className="line line-2"></span>
              <span className="line line-3"></span>
            </div>
            <span className="menu-trigger-label">Menu</span>
          </button>

          <div 
            className="web-brand-logo-group" 
            onClick={() => onTabChange && onTabChange('home')} 
            role="button"
            tabIndex={0}
            title="SubhOne Health Group - Home"
          >
            <img 
              src="/subhone_logo.png" 
              alt="SubhOne Health Group Logo" 
              className="web-header-brand-icon"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="logo-text-block">
              <h1 className="brand-heading">SubhOne Health Group</h1>
              <span className="logo-subtitle">Medicine Wholesaler & Healthcare Distribution</span>
            </div>
          </div>
        </div>


        {/* Global Search Bar */}
        <form className="web-header-search-form" onSubmit={handleSearchSubmit}>
          <svg className="web-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input 
            type="text" 
            className="web-header-search-input"
            placeholder="Search wholesale medicines, diagnostics, batches..." 
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
              if (onSearch) onSearch(e.target.value)
            }}
          />
          {searchValue && (
            <button 
              type="button" 
              className="web-search-clear-btn"
              onClick={() => {
                setSearchValue('')
                if (onSearch) onSearch('')
              }}
            >
              ×
            </button>
          )}
        </form>

        {/* Header Actions & Auth */}
        <div className="header-actions">
          {/* User Delivery Address Button - Compact Icon */}
          <button 
            type="button"
            className="header-location-icon-btn" 
            onClick={onOpenLocation || onOpenTracker} 
            title={location?.address ? `Deliver to: ${location.address}` : "Click to select delivery location"}
            aria-label="Delivery Location"
          >
            <img 
              src="./location_delivery_icon.png" 
              alt="Delivery Location" 
              className="header-location-route-img"
            />
          </button>

          {user ? (
            <div className="user-menu">
              <button 
                type="button"
                className="user-avatar-pill"
                onClick={() => onTabChange && onTabChange('account')}
                title="Click to view Account & Profile"
                aria-label="View Account Profile"
              >
                <span className="user-avatar-char">{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                <span className="user-name-text">{user.name}</span>
              </button>
              <button 
                className="logout-btn" 
                onClick={() => {
                  localStorage.removeItem('subhone_auth_user');
                  if (onTabChange) onTabChange('home');
                  window.location.reload();
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <button className="login-btn" onClick={() => onTabChange && onTabChange('login')}>
                Sign In
              </button>
              <button className="signup-btn" onClick={() => onTabChange && onTabChange('signup')}>
                Register Retailer
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default WebHeader
