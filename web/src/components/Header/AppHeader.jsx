import React from 'react'

export function AppHeader({ title = 'SubhOne Health', onMenuClick, onNotificationClick }) {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <button 
          className="menu-btn"
          aria-label="Menu"
          onClick={() => onMenuClick ? onMenuClick() : alert('SubhOne Health Group Menu')}
        >
          <span></span>
        </button>
        
        <div className="app-title-container">
          <h1 className="app-title">{title}</h1>
        </div>
        
        <button 
          className="notification-btn"
          aria-label="Notifications"
          onClick={() => onNotificationClick ? onNotificationClick() : alert('No new notifications')}
        >
          <span></span>
        </button>
      </div>
    </header>
  )
}

export default AppHeader

