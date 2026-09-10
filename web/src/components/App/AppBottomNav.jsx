import React from 'react'

export function AppBottomNav({ activeTab, onTabChange, cartCount = 0 }) {
  // Ordered exactly as requested: (home, account, category, order, cart)
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
      id: 'account',
      label: 'Account',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
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
      id: 'order',
      label: 'Order',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 16h.01"/>
          <path d="M6.3 3.3 3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3.3-3.7A2 2 0 0 0 16.3 3H7.7a2 2 0 0 0-1.4.3z"/>
          <path d="M3 7h18"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
        </svg>
      )
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      )
    }
  ]

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

  return (
    <nav className="app-bottom-navbar" role="navigation" aria-label="App Bottom Navigation">
      <div className="app-bottom-nav-container">
        {navItems.map(item => {
          const active = isTabActive(item.id)
          const isCategory = item.id === 'category'
          return (
            <button
              key={item.id}
              type="button"
              className={`app-bottom-nav-btn ${active ? 'active' : ''} ${isCategory ? 'is-category-center' : ''}`}
              onClick={() => handleSelect(item.id)}
              aria-label={item.label}
              aria-selected={active}
            >
              <div className="app-nav-icon-wrapper">
                {item.icon}
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="app-nav-cart-badge">{cartCount}</span>
                )}
              </div>
              <span className="app-nav-label-text">{item.label}</span>
              {active && <span className="app-nav-active-indicator" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default AppBottomNav
