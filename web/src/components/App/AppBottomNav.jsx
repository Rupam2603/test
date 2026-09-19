import React from 'react'

export function AppBottomNav({ activeTab, onTabChange, cartCount = 0 }) {
  const handleSelect = (id) => {
    if (onTabChange) {
      onTabChange(id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isTabActive = (itemId) => {
    if (activeTab === itemId) return true
    if (itemId === 'account' && activeTab === 'profile') return true
    if (itemId === 'order' && activeTab === 'bookings') return true
    if (itemId === 'category' && activeTab === 'products') return true
    return false
  }

  const navItems = [
    {
      id: 'home',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: 'category',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1.5"/>
          <rect width="7" height="7" x="14" y="3" rx="1.5"/>
          <rect width="7" height="7" x="14" y="14" rx="1.5"/>
          <rect width="7" height="7" x="3" y="14" rx="1.5"/>
        </svg>
      )
    },
    {
      id: 'order',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 16h.01"/>
          <path d="M6.3 3.3 3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3.3-3.7A2 2 0 0 0 16.3 3H7.7a2 2 0 0 0-1.4.3z"/>
          <path d="M3 7h18"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
        </svg>
      )
    },
    {
      id: 'account',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      id: 'cart',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      )
    }
  ]

  return (
    <nav className="floating-nav-container" role="navigation" aria-label="App Bottom Navigation">
      <div className="floating-nav-pill">
        {navItems.map(item => {
          const active = isTabActive(item.id)
          return (
            <button
              key={item.id}
              type="button"
              className={`floating-nav-btn ${active ? 'active' : ''}`}
              onClick={() => handleSelect(item.id)}
              aria-label={item.id}
              aria-selected={active}
            >
              <div className="floating-nav-icon-wrapper">
                {active && <div className="active-blob" />}
                {item.icon}
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="floating-nav-cart-badge">{cartCount}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default AppBottomNav
