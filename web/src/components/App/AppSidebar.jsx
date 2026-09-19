import React from 'react'

export function AppSidebar({ activeTab, onTabChange }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '' },
    { id: 'products', label: 'Products', icon: '' },
    { id: 'services', label: 'Services', icon: '' },
    { id: 'bookings', label: 'My Bookings', icon: '' },
    { id: 'profile', label: 'Profile', icon: '' },
  ]

  return (
    <aside className="app-sidebar">
      <nav className="app-sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`app-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="app-sidebar-icon">{item.icon}</span>
            <span className="app-sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default AppSidebar

