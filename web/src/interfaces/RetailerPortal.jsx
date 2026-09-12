import React, { useState } from 'react'
import { APP_DEALS_PRODUCTS } from '../data/appCatalog'

// ─── Mobile Header ────────────────────────────────────────────────────────────
function RetailerMobileHeader({ user, onLogout }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#0ea5e9',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      height: '56px',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <div>
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', lineHeight: 1.2 }}>
          🏪 Retailer Portal
        </div>
        {user?.shopName && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
            {user.shopName}
          </div>
        )}
      </div>
      <button
        onClick={onLogout}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </header>
  )
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function RetailerBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'alerts', icon: '📉', label: 'Alerts' },
    { id: 'invoices', icon: '🧾', label: 'Invoices' },
  ]
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: '#0c4a6e',
      display: 'flex',
      borderTop: '1px solid #075985',
      zIndex: 999,
      height: '62px'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: activeTab === tab.id ? '#38bdf8' : '#64748b',
            fontSize: '10px',
            fontWeight: activeTab === tab.id ? '700' : '500',
            cursor: 'pointer',
            transition: 'color 0.15s',
            padding: '6px 0'
          }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RetailerPortal({ onLogout, isApp = false, user }) {
  const [activeTab, setActiveTab] = useState('orders')
  const [inventory] = useState(APP_DEALS_PRODUCTS)

  const renderOrders = () => (
    <div className="inventory-table-container" style={isApp ? { padding: '16px', borderRadius: 0, boxShadow: 'none', background: 'transparent' } : {}}>
      <h2 style={{ margin: '0 0 16px', fontSize: isApp ? '15px' : '20px' }}>Bulk Order Catalog</h2>
      {isApp ? (
        // Mobile: card list
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {inventory.map(item => (
            <div key={item.id} style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>SKU: {item.id.split('-')[0].toUpperCase()}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: '800', color: '#0ea5e9', fontSize: '15px' }}>₹{Math.floor(item.price * 0.8)}</span>{' '}
                  <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{item.price}</span>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>MOQ: 25 Units</div>
                </div>
                <button style={{
                  background: '#0ea5e9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}>
                  Add 25 Units
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product & SKU</th>
              <th>Wholesale Price</th>
              <th>MOQ (Min Order Qty)</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="table-item-name">{item.name}</div>
                  <div className="table-item-pack">SKU: {item.id.split('-')[0].toUpperCase()}</div>
                </td>
                <td><strong style={{ color: '#0ea5e9' }}>₹{Math.floor(item.price * 0.8)}</strong> <strike style={{ fontSize: 12, color: '#94a3b8' }}>₹{item.price}</strike></td>
                <td>25 Units</td>
                <td><span className="status-badge active">In Stock</span></td>
                <td>
                  <button className="action-btn" style={{ background: '#0ea5e9', color: '#fff', border: 'none' }}>
                    Add 25 Units to Cart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE LAYOUT
  // ─────────────────────────────────────────────────────────────────────────
  if (isApp) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f0f9ff',
        paddingBottom: '62px'
      }}>
        <RetailerMobileHeader user={user} onLogout={onLogout} />

        {/* Page title strip */}
        <div style={{
          background: '#fff',
          padding: '12px 16px',
          borderBottom: '1px solid #e0f2fe',
          fontSize: '13px',
          fontWeight: '700',
          color: '#0c4a6e'
        }}>
          {activeTab === 'orders' && '📦 Wholesale Ordering'}
          {activeTab === 'alerts' && '📉 Low Stock Alerts'}
          {activeTab === 'invoices' && '🧾 Invoices & Billing'}
        </div>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'alerts' && (
            <div style={{ padding: '24px' }}>
              <div className="empty-state-box">
                <h3>No Stock Alerts</h3>
                <p>Your integrated point-of-sale system reports healthy stock levels.</p>
              </div>
            </div>
          )}
          {activeTab === 'invoices' && (
            <div style={{ padding: '24px' }}>
              <div className="empty-state-box">
                <h3>No Pending Invoices</h3>
                <p>All previous bulk orders have been cleared.</p>
              </div>
            </div>
          )}
        </main>

        <RetailerBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DESKTOP LAYOUT
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">🏪 Retailer Portal</div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            📦 Bulk Orders
          </button>
          <button className={`admin-nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
            📉 Low Stock Alerts
          </button>
          <button className={`admin-nav-item ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
            🧾 Invoices
          </button>
        </nav>
        <button className="admin-logout-btn" onClick={onLogout}>Logout Securely</button>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'orders' ? 'Wholesale Ordering' : activeTab === 'alerts' ? 'Stock Alerts' : 'Invoices & Billing'}</h1>
          <div className="admin-user-badge">{user?.shopName || 'Pharmacy'} (Verified)</div>
        </header>
        <div className="admin-content">
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'alerts' && (
            <div className="empty-state-box">
              <h3>No Stock Alerts</h3>
              <p>Your integrated point-of-sale system reports healthy stock levels.</p>
            </div>
          )}
          {activeTab === 'invoices' && (
            <div className="empty-state-box">
              <h3>No Pending Invoices</h3>
              <p>All previous bulk orders have been cleared.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
