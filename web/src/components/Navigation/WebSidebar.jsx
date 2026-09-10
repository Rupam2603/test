import React from 'react'

export function WebSidebar({ activeTab, onTabChange }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'services', label: 'Services', icon: '💆' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <aside className="web-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default WebSidebar

