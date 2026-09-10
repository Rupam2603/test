import React from 'react'

export function AppBottomNav({ activeTab, onTabChange, cartCount = 0 }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'category', label: 'Category', icon: '⊞' },
    { id: 'order', label: 'Order', icon: '📦' },
    { id: 'cart', label: 'Cart', icon: '🛒' },
  ]

  const isTabActive = (itemId) => {
    if (activeTab === itemId) return true
    if (itemId === 'account' && activeTab === 'profile') return true
    if (itemId === 'order' && activeTab === 'bookings') return true
    if (itemId === 'category' && activeTab === 'products') return true
    return false
  }

  return (
    <nav className="app-bottom-nav">
      {menuItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${isTabActive(item.id) ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default AppBottomNav
