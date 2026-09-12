import React, { useState, useEffect } from 'react'
import { APP_DEALS_PRODUCTS } from '../data/appCatalog'
import { api } from '../services/api'

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('orders')
  const [inventory, setInventory] = useState(APP_DEALS_PRODUCTS)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const [orders, setOrders] = useState([
    { id: 'ORD-1042', customer: 'Pharmacy A (B2B)', price: '₹14,500', status: 'pending', label: 'Awaiting Confirm' },
    { id: 'ORD-1043', customer: 'John Doe (B2C)', price: '₹450', status: 'pending', label: 'Awaiting Confirm' },
    { id: 'ORD-1041', customer: 'Health Clinic (B2B)', price: '₹3,200', status: 'processing', label: 'Packing' },
    { id: 'ORD-1039', customer: 'Jane Smith (B2C)', price: '₹120', status: 'dispatched', label: 'Out for Delivery' },
    { id: 'ORD-1035', customer: 'City Meds (B2B)', price: '₹21,000', status: 'delivered', label: 'Completed' },
  ])

  useEffect(() => {
    loadUsers()
    const interval = setInterval(loadUsers, 10000) // Poll for app updates every 10 seconds
    return () => clearInterval(interval)
  }, [])

  async function loadUsers() {
    try {
      setLoadingUsers(true)
      const userList = await api.getAllUsers()
      if (userList) {
        setUsers(userList)
        setLastRefreshed(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.warn('Error loading users in admin:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

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
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            👥 Users & App Accounts ({users.length})
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
          <h1>
            {activeTab === 'orders' && 'Order Fulfillment Board'}
            {activeTab === 'users' && 'Live User Profiles & Mobile App Accounts'}
            {activeTab === 'inventory' && 'Inventory Management'}
            {activeTab === 'retailers' && 'Retailer Approvals'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {activeTab === 'users' && (
              <button 
                onClick={loadUsers} 
                className="action-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: '600' }}
              >
                🔄 Refresh Database {lastRefreshed ? `(${lastRefreshed})` : ''}
              </button>
            )}
            <div className="admin-user-badge">Super Admin</div>
          </div>
        </header>
        <div className="admin-content">
          {activeTab === 'orders' && renderKanban()}

          {activeTab === 'users' && (
            <div className="inventory-table-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700' }}>
                    Synced Database Users ({users.length})
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    All profile updates saved from mobile app or website reflect here in real-time.
                  </p>
                </div>
                {loadingUsers && <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>Syncing with Neon DB...</span>}
              </div>

              {users.length === 0 ? (
                <div className="empty-state-box">
                  <h3>No User Accounts Found</h3>
                  <p>When a user registers or saves their profile in the mobile app, it will appear here automatically.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role & Portal</th>
                      <th>Contact (Email / Phone)</th>
                      <th>Age / Gender / DOB</th>
                      <th>Store / Pharmacy</th>
                      <th>Address</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id || u.email || u.phone}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '14px',
                              overflow: 'hidden'
                            }}>
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                u.name ? u.name[0].toUpperCase() : 'U'
                              )}
                            </div>
                            <div>
                              <div className="table-item-name">{u.name}</div>
                              <div className="table-item-pack" style={{ fontSize: '11px' }}>
                                Method: {u.signupMethod === 'phone' ? '📱 Mobile' : '✉️ Email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge active" style={{
                            background: u.role === 'retailer' ? '#fef3c7' : '#e0f2fe',
                            color: u.role === 'retailer' ? '#b45309' : '#0284c7'
                          }}>
                            {u.role ? u.role.toUpperCase() : 'CUSTOMER'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{u.email || '—'}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{u.phone || '—'}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', color: '#0f172a' }}>
                            {u.age ? `${u.age} yrs` : (u.dob ? `DOB: ${u.dob}` : '—')}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {u.gender || 'Not specified'} {u.dob ? `(${u.dob})` : ''}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: u.shopName ? '#0f172a' : '#94a3b8' }}>
                            {u.shopName || '—'}
                          </div>
                        </td>
                        <td style={{ maxWidth: '200px' }}>
                          <div style={{ fontSize: '12px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.address}>
                            {u.address || '—'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {u.updatedAt ? new Date(u.updatedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

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
            <div className="inventory-table-container">
              <h3 style={{ margin: '0 0 12px' }}>Verified Retailer Partners</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Retailer Contact</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'retailer' || Boolean(u.shopName)).map(u => (
                    <tr key={u.id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{u.shopName || 'Retailer Pharmacy'}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Owner: {u.name}</div>
                      </td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className="status-badge active" style={{ background: '#dcfce7', color: '#15803d' }}>
                          ✓ Active Partner
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => u.role === 'retailer' || Boolean(u.shopName)).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No retailer partners registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
