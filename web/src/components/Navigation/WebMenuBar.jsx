import React from 'react'

export function WebMenuBar({ activeTab, onTabChange }) {
  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      badge: null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: 'products',
      label: 'Products',
      badge: 'Wholesale',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      )
    },
    {
      id: 'services',
      label: 'Services',
      badge: 'Diagnostics',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      )
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      badge: null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" x2="16" y1="2" y2="6"/>
          <line x1="8" x2="8" y1="2" y2="6"/>
          <line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      badge: null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ]

  return (
    <nav className="web-menu-bar" role="navigation" aria-label="Main Navigation">
      <div className="web-menu-bar-container">
        <div className="web-menu-bar-items">
          {menuItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`web-menu-bar-btn ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange && onTabChange(item.id)}
                aria-selected={isActive}
                aria-label={item.label}
              >
                <span className="web-menu-icon">{item.icon}</span>
                <span className="web-menu-label">{item.label}</span>
                {item.badge && (
                  <span className={`web-menu-badge ${isActive ? 'badge-active' : ''}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <span className="web-menu-active-indicator" />}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default WebMenuBar

