import React, { useState } from 'react'
import { APP_DEALS_PRODUCTS } from '../data/appCatalog'

export default function RetailerPortal({ onLogout }) {
  const [activeTab, setActiveTab] = useState('orders')
  const [inventory, setInventory] = useState(APP_DEALS_PRODUCTS)

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
          <div className="admin-user-badge">Pharmacy A (Verified)</div>
        </header>
        <div className="admin-content">
          {activeTab === 'orders' && (
            <div className="inventory-table-container">
              <h2>Bulk Order Catalog</h2>
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
                      <td><strong style={{color: '#0ea5e9'}}>₹{Math.floor(item.price * 0.8)}</strong> <strike style={{fontSize: 12, color: '#94a3b8'}}>₹{item.price}</strike></td>
                      <td>25 Units</td>
                      <td>
                        <span className="status-badge active">In Stock</span>
                      </td>
                      <td>
                        <button className="action-btn" style={{background: '#0ea5e9', color: '#fff', border: 'none'}}>Add 25 Units to Cart</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
