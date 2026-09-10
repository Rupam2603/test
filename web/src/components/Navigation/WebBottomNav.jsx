import React from 'react'

export function WebBottomNav({ activeTab, onTabChange, cartCount = 2 }) {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: 'category',
      label: 'Category',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1.5"/>
          <rect width="7" height="7" x="14" y="3" rx="1.5"/>
          <rect width="7" height="7" x="14" y="14" rx="1.5"/>
          <rect width="7" height="7" x="3" y="14" rx="1.5"/>
        </svg>
      )
    },
    {
      id: 'cart',
      label: 'Cart',
      badge: cartCount,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      )
    },
    {
      id: 'order',
      label: 'Order',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7.5 4.27 9 5.15"/>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      )
    },
    {
      id: 'account',
      label: 'Account',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ]

  return (
    <nav className="web-bottom-navbar" role="navigation" aria-label="Bottom Quick Navigation">
      <div className="web-bottom-nav-dock">
        {navItems.map(item => {
          const isActive = activeTab === item.id || 
            (item.id === 'category' && activeTab === 'products') ||
            (item.id === 'order' && activeTab === 'bookings') ||
            (item.id === 'account' && activeTab === 'profile')

          return (
            <button
              key={item.id}
              type="button"
              className={`web-bottom-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                onTabChange(item.id)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              aria-selected={isActive}
              aria-label={item.label}
            >
              <div className="web-bottom-icon-wrap">
                {item.icon}
                {item.badge > 0 && (
                  <span className="web-bottom-nav-badge">{item.badge}</span>
                )}
              </div>
              <span className="web-bottom-nav-label">{item.label}</span>
              {isActive && <span className="web-bottom-active-pill-dot" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default WebBottomNav

