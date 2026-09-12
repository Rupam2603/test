import React, { useState } from 'react'
import { APP_DEALS_PRODUCTS } from '../data/appCatalog'

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('orders')
  const [inventory, setInventory] = useState(APP_DEALS_PRODUCTS)

  const [orders, setOrders] = useState([
    { id: 'ORD-1042', customer: 'Pharmacy A (B2B)', price: '₹14,500', status: 'pending', label: 'Awaiting Confirm' },
    { id: 'ORD-1043', customer: 'John Doe (B2C)', price: '₹450', status: 'pending', label: 'Awaiting Confirm' },
    { id: 'ORD-1041', customer: 'Health Clinic (B2B)', price: '₹3,200', status: 'processing', label: 'Packing' },
    { id: 'ORD-1039', customer: 'Jane Smith (B2C)', price: '₹120', status: 'dispatched', label: 'Out for Delivery' },
    { id: 'ORD-1035', customer: 'City Meds (B2B)', price: '₹21,000', status: 'delivered', label: 'Completed' },
  ])

  const transitionOrder = (orderId, newStatus, newLabel) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, label: newLabel } : o))
  }

  const columns = [
    { id: 'pending', title: 'Pending (New)' },
    { id: 'processing', title: 'Processing' },
    { id: 'dispatched', title: 'Dispatched' },
    { id: 'delivered', title: 'Delivered' }
  ]

  const getNextStatus = (status) => {
    if (status === 'pending') return { status: 'processing', label: 'Packing' }
    if (status === 'processing') return { status: 'dispatched', label: 'Out for Delivery' }
    if (status === 'dispatched') return { status: 'delivered', label: 'Completed' }
    return null
  }

  const renderKanban = () => (
    <div className="kanban-board">
      {columns.map(col => (
        <div key={col.id} className="kanban-column">
          <h3>{col.title}</h3>
          {orders.filter(o => o.status === col.id).map(order => {
            const next = getNextStatus(order.status)
            return (
              <div key={order.id} className="kanban-card">
                <div className="kanban-card-id">#{order.id}</div>
                <div className="kanban-card-title">{order.customer}</div>
                <div className="kanban-card-price">{order.price}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className={`kanban-card-status status-${order.status}`}>{order.label}</div>
                  {next && (
                    <button 
                      onClick={() => transitionOrder(order.id, next.status, next.label)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                      title="Advance Status"
                    >
                      ⏭️
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">🛡️ SubhOne Admin</div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            📋 Order Kanban
          </button>
          <button className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            💊 Inventory & Stock
          </button>
          <button className={`admin-nav-item ${activeTab === 'retailers' ? 'active' : ''}`} onClick={() => setActiveTab('retailers')}>
            🏪 Retailers
          </button>
        </nav>
        <button className="admin-logout-btn" onClick={onLogout}>Logout Securely</button>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'orders' ? 'Order Fulfillment Board' : activeTab === 'inventory' ? 'Inventory Management' : 'Retailer Approvals'}</h1>
          <div className="admin-user-badge">Super Admin</div>
        </header>
        <div className="admin-content">
          {activeTab === 'orders' && renderKanban()}
          {activeTab === 'inventory' && (
            <div className="inventory-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price (B2C)</th>
                    <th>Stock Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-item-name">{item.name}</div>
                        <div className="table-item-pack">{item.pack}</div>
                      </td>
                      <td>{item.category}</td>
                      <td>₹{item.price}</td>
                      <td>
                        <span className={`stock-badge ${item.isLowStock ? 'low-stock' : 'in-stock'}`}>
                          {item.stockBadge}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge active">Listed</span>
                      </td>
                      <td>
                        <button className="action-btn edit-btn">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'retailers' && (
            <div className="empty-state-box">
              <h3>No Pending Approvals</h3>
              <p>All registered retailers have been verified.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
