import React, { useState, useEffect } from 'react'
import { APP_DEALS_PRODUCTS } from '../data/appCatalog'
import { api } from '../services/api'

// ─── Mobile Bottom Nav for Admin / Staff ─────────────────────────────────────
function AdminBottomNav({ activeTab, setActiveTab, tabs }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#0f172a',
      display: 'flex',
      borderTop: '1px solid #1e293b',
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

// ─── Mobile Header for Admin / Staff ─────────────────────────────────────────
function AdminMobileHeader({ title, badge, onLogout }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#0f172a',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      height: '56px',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <span style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8' }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          background: '#1e293b',
          color: '#94a3b8',
          fontSize: '11px',
          fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '20px'
        }}>{badge}</span>
        <button
          onClick={onLogout}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout, isApp = false, staffMode = false, user }) {
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
    if (!staffMode) loadUsers()
    const interval = setInterval(() => { if (!staffMode) loadUsers() }, 10000)
    return () => clearInterval(interval)
  }, [staffMode])

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
    { id: 'pending', title: 'Pending' },
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

  // ── Tab definitions ──────────────────────────────────────────────────────
  const adminTabs = [
    { id: 'orders', icon: '📋', label: 'Orders' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'inventory', icon: '💊', label: 'Inventory' },
    { id: 'retailers', icon: '🏪', label: 'Retailers' },
  ]

  const staffTabs = [
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'dispatched', icon: '🚚', label: 'Dispatch' },
    { id: 'delivered', icon: '✅', label: 'Delivered' },
  ]

  const activeTabs = staffMode ? staffTabs : adminTabs

  // ── Kanban / Order view ──────────────────────────────────────────────────
  const renderKanban = () => {
    if (isApp) {
      // Mobile: vertical card list grouped by status
      const statusToShow = staffMode
        ? (activeTab === 'dispatched' ? 'dispatched' : activeTab === 'delivered' ? 'delivered' : 'pending')
        : 'all'

      const visibleOrders = statusToShow === 'all'
        ? orders
        : orders.filter(o => o.status === statusToShow || (statusToShow === 'pending' && (o.status === 'pending' || o.status === 'processing')))

      return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visibleOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <p>No orders in this stage</p>
            </div>
          )}
          {visibleOrders.map(order => {
            const next = getNextStatus(order.status)
            const statusColors = {
              pending: { bg: '#fef3c7', color: '#d97706' },
              processing: { bg: '#e0f2fe', color: '#0284c7' },
              dispatched: { bg: '#f3e8ff', color: '#9333ea' },
              delivered: { bg: '#dcfce7', color: '#16a34a' }
            }
            const sc = statusColors[order.status] || statusColors.pending
            return (
              <div key={order.id} style={{
                background: '#fff',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>#{order.id}</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{order.customer}</div>
                  </div>
                  <span style={{
                    background: sc.bg,
                    color: sc.color,
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '20px'
                  }}>{order.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#059669' }}>{order.price}</span>
                  {next && (
                    <button
                      onClick={() => transitionOrder(order.id, next.status, next.label)}
                      style={{
                        background: '#0f172a',
                        color: '#38bdf8',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      → Advance
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    // Desktop: original kanban board
    return (
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
  }

  // ── Users tab content ────────────────────────────────────────────────────
  const renderUsers = () => (
    <div className="inventory-table-container" style={isApp ? { padding: '16px', borderRadius: 0, boxShadow: 'none', background: 'transparent' } : {}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700' }}>
            Users ({users.length})
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            All profile updates sync from app and website in real-time.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="action-btn"
          style={{ background: '#0284c7', color: '#fff', border: 'none', fontWeight: '600', fontSize: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          🔄 {lastRefreshed ? lastRefreshed : 'Refresh'}
        </button>
      </div>
      {loadingUsers && <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>Syncing with DB...</span>}

      {users.length === 0 ? (
        <div className="empty-state-box">
          <h3>No Users Found</h3>
          <p>Registered users from the app or website appear here automatically.</p>
        </div>
      ) : isApp ? (
        // Mobile: card list
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map(u => (
            <div key={u.id || u.email} style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: '#e0f2fe', color: '#0284c7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '16px', overflow: 'hidden', flexShrink: 0
                }}>
                  {u.avatar ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.name ? u.name[0].toUpperCase() : 'U')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{u.name || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || u.phone || '—'}</div>
                </div>
                <span style={{
                  background: u.role === 'retailer' ? '#fef3c7' : u.role === 'admin' ? '#fce7f3' : '#e0f2fe',
                  color: u.role === 'retailer' ? '#b45309' : u.role === 'admin' ? '#be185d' : '#0284c7',
                  fontSize: '10px', fontWeight: '700',
                  padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase', flexShrink: 0
                }}>
                  {u.role || 'CUSTOMER'}
                </span>
              </div>
              {(u.shopName || u.address) && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#475569' }}>
                  {u.shopName && <div>🏪 {u.shopName}</div>}
                  {u.address && <div>📍 {u.address}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Desktop: table
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
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: '#e0f2fe', color: '#0284c7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '14px', overflow: 'hidden'
                    }}>
                      {u.avatar ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.name ? u.name[0].toUpperCase() : 'U')}
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
  )

  // ── Inventory tab ────────────────────────────────────────────────────────
  const renderInventory = () => (
    <div className="inventory-table-container" style={isApp ? { padding: '16px', borderRadius: 0, boxShadow: 'none', background: 'transparent' } : {}}>
      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {inventory.map(item => (
            <div key={item.id} style={{
              background: '#fff', borderRadius: '12px', padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.pack || item.category}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', marginTop: '4px' }}>₹{item.price}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span className={`stock-badge ${item.isLowStock ? 'low-stock' : 'in-stock'}`}>
                  {item.stockBadge || 'In Stock'}
                </span>
                <button className="action-btn edit-btn" style={{ fontSize: '11px', padding: '4px 10px' }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Name</th><th>Category</th><th>Price (B2C)</th><th>Stock Level</th><th>Status</th><th>Actions</th>
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
                <td><span className="status-badge active">Listed</span></td>
                <td><button className="action-btn edit-btn">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  // ── Retailers tab ────────────────────────────────────────────────────────
  const renderRetailers = () => (
    <div className="inventory-table-container" style={isApp ? { padding: '16px', borderRadius: 0, boxShadow: 'none', background: 'transparent' } : {}}>
      <h3 style={{ margin: '0 0 12px' }}>Verified Retailer Partners</h3>
      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.filter(u => u.role === 'retailer' || Boolean(u.shopName)).map(u => (
            <div key={u.id} style={{
              background: '#fff', borderRadius: '12px', padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{u.shopName || 'Retailer Pharmacy'}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Owner: {u.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#475569' }}>
                <span>{u.email || u.phone || '—'}</span>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>
                  ✓ Active
                </span>
              </div>
            </div>
          ))}
          {users.filter(u => u.role === 'retailer' || Boolean(u.shopName)).length === 0 && (
            <div className="empty-state-box">
              <h3>No Retailer Partners Yet</h3>
              <p>Registered retailer accounts appear here automatically.</p>
            </div>
          )}
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Store Name</th><th>Retailer Contact</th><th>Email</th><th>Phone</th><th>Status</th></tr>
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
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No retailer partners registered yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )

  // ── Staff: delivery queue view ───────────────────────────────────────────
  const renderDeliveryQueue = (statusFilter) => {
    const filtered = orders.filter(o => o.status === statusFilter)
    return (
      <div style={{ padding: isApp ? '16px' : '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state-box">
            <h3>No Orders Here</h3>
            <p>Orders in this stage will appear here.</p>
          </div>
        ) : filtered.map(order => {
          const next = getNextStatus(order.status)
          return (
            <div key={order.id} style={{
              background: '#fff', borderRadius: '14px', padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>#{order.id}</div>
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>{order.customer}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#059669', fontSize: '15px' }}>{order.price}</span>
                {next && (
                  <button
                    onClick={() => transitionOrder(order.id, next.status, next.label)}
                    style={{
                      background: '#16a34a', color: '#fff', border: 'none',
                      borderRadius: '8px', padding: '8px 16px',
                      fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                    }}
                  >
                    ✓ Mark as {next.label}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const panelTitle = staffMode
    ? `🚚 Staff Panel${user?.name ? ` — ${user.name}` : ''}`
    : '🛡️ SubhOne Admin'
  const panelBadge = staffMode ? 'Staff / Delivery' : 'Super Admin'

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE LAYOUT
  // ─────────────────────────────────────────────────────────────────────────
  if (isApp) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f1f5f9',
        paddingBottom: '62px' // space for bottom nav
      }}>
        <AdminMobileHeader title={panelTitle} badge={panelBadge} onLogout={onLogout} />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {/* Page title strip */}
          <div style={{
            background: '#fff',
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '13px',
            fontWeight: '700',
            color: '#334155'
          }}>
            {activeTabs.find(t => t.id === activeTab)?.icon}{' '}
            {activeTab === 'orders' && (staffMode ? 'Pending & Active Orders' : 'Order Fulfillment')}
            {activeTab === 'users' && 'Live User Accounts'}
            {activeTab === 'inventory' && 'Medicine Inventory'}
            {activeTab === 'retailers' && 'Retailer Partners'}
            {activeTab === 'dispatched' && 'Out for Delivery'}
            {activeTab === 'delivered' && 'Delivered Orders'}
          </div>

          {activeTab === 'orders' && renderKanban()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'retailers' && renderRetailers()}
          {activeTab === 'dispatched' && renderDeliveryQueue('dispatched')}
          {activeTab === 'delivered' && renderDeliveryQueue('delivered')}
        </main>

        <AdminBottomNav activeTab={activeTab} setActiveTab={setActiveTab} tabs={activeTabs} />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DESKTOP LAYOUT (original sidebar layout)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">{panelTitle}</div>
        <nav className="admin-nav">
          {activeTabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.id === 'orders' ? (staffMode ? 'Active Orders' : `Order Kanban`) : tab.id === 'users' ? `Users & App Accounts (${users.length})` : tab.id === 'inventory' ? 'Inventory & Stock' : tab.id === 'retailers' ? 'Retailers' : tab.id === 'dispatched' ? 'Dispatch Queue' : 'Delivered'}
            </button>
          ))}
        </nav>
        <button className="admin-logout-btn" onClick={onLogout}>Logout Securely</button>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'orders' && (staffMode ? 'Active Delivery Orders' : 'Order Fulfillment Board')}
            {activeTab === 'users' && 'Live User Profiles & Mobile App Accounts'}
            {activeTab === 'inventory' && 'Inventory Management'}
            {activeTab === 'retailers' && 'Retailer Approvals'}
            {activeTab === 'dispatched' && 'Dispatch Queue — Out for Delivery'}
            {activeTab === 'delivered' && 'Delivered Orders'}
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
            <div className="admin-user-badge">{panelBadge}</div>
          </div>
        </header>
        <div className="admin-content">
          {activeTab === 'orders' && renderKanban()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'retailers' && renderRetailers()}
          {activeTab === 'dispatched' && renderDeliveryQueue('dispatched')}
          {activeTab === 'delivered' && renderDeliveryQueue('delivered')}
        </div>
      </main>
    </div>
  )
}
