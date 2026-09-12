import React, { useEffect } from 'react'

export function WebMenuDrawer({ isOpen, onClose, activeTab, onTabChange }) {
  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      desc: 'Healthcare hub & featured pharmacy deals',
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: 'products',
      label: 'Products',
      desc: 'Wholesale medicine batches & retail stock',
      badge: 'Wholesale',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      )
    },

    {
      id: 'profile',
      label: 'Profile',
      desc: 'Account credentials & business verification',
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      id: 'admin',
      label: 'Admin Portal',
      desc: 'Live sync database users, orders & inventory',
      badge: 'Database',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    }
  ]

  if (!isOpen) return null

  return (
    <div className="web-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Navigation Menu">
      <div 
        className="web-drawer-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="web-drawer-header">
          <div className="web-drawer-brand">
            <img 
              src="/subhone_logo.png" 
              alt="SubhOne Logo" 
              className="web-drawer-logo-img"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div className="web-drawer-brand-text">
              <h3>SubhOne Health</h3>
              <span>Pharmacy & Diagnostics</span>
            </div>
          </div>
          <button 
            type="button" 
            className="web-drawer-close-btn" 
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Wholesale Tag Bar */}
        <div className="web-drawer-wholesale-banner">
          <span className="drawer-badge-dot"></span>
          <span>Official Wholesale & Healthcare Network</span>
        </div>

        {/* Navigation Items List */}
        <nav className="web-drawer-nav">
          <p className="web-drawer-section-title">Navigation Menu</p>
          {menuItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`web-drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
                aria-selected={isActive}
              >
                <div className="web-drawer-item-left">
                  <div className={`web-drawer-icon-bubble ${isActive ? 'icon-bubble-active' : ''}`}>
                    {item.icon}
                  </div>
                  <div className="web-drawer-item-text">
                    <div className="web-drawer-item-title-row">
                      <span className="web-drawer-item-name">{item.label}</span>
                      {item.badge && (
                        <span className={`web-drawer-item-badge ${isActive ? 'badge-active' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="web-drawer-item-desc">{item.desc}</span>
                  </div>
                </div>
                <div className="web-drawer-item-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Drawer Bottom Info Box */}
        <div className="web-drawer-footer">
          <div className="web-drawer-contact-card">
            <p className="contact-label">Wholesale Support Helpline</p>
            <p className="contact-value">📞 +91 9836307553</p>
            <span className="license-tag">FSSAI: 22823086000064</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebMenuDrawer

