import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

function fmtDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
  } catch { return String(d) }
}

function StatusPill({ status }) {
  const s = String(status || '').toLowerCase()
  let bg = '#e2e8f0', color = '#475569'
  if (s.includes('pending') || s.includes('awaiting')) { bg = '#fef3c7'; color = '#d97706' }
  else if (s.includes('processing') || s.includes('packing') || s.includes('confirmed')) { bg = '#e0f2fe'; color = '#0284c7' }
  else if (s.includes('dispatch') || s.includes('transit') || s.includes('delivery')) { bg = '#f3e8ff'; color = '#9333ea' }
  else if (s.includes('delivered') || s.includes('completed') || s.includes('done')) { bg = '#dcfce7'; color = '#16a34a' }
  else if (s.includes('cancel')) { bg = '#fef2f2'; color = '#dc2626' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: '700', background: bg, color
    }}>{status || '—'}</span>
  )
}

function RoleBadge({ role }) {
  const r = String(role || 'customer').toLowerCase()
  let bg = '#e0f2fe', color = '#0284c7'
  if (r === 'admin') { bg = '#fce7f3'; color = '#be185d' }
  else if (r === 'retailer') { bg = '#fef3c7'; color = '#b45309' }
  else if (r === 'staff' || r === 'delivery_partner') { bg = '#f3e8ff'; color = '#7c3aed' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
      fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', background: bg, color
    }}>{role || 'CUSTOMER'}</span>
  )
}

function Avatar({ name, avatar, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#e0f2fe', color: '#0284c7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: '800', fontSize: size * 0.37, overflow: 'hidden', flexShrink: 0
    }}>
      {avatar
        ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (name ? name[0].toUpperCase() : '?')}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Stat card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = '#0284c7' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: `1px solid #e2e8f0`,
      display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '28px', opacity: 0.15 }}>{icon}</div>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: '800', color: accent, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{sub}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Bottom Nav
// ─────────────────────────────────────────────────────────────────────────────
function AdminBottomNav({ activeTab, setActiveTab, tabs }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#0f172a', display: 'flex',
      borderTop: '1px solid #1e293b', zIndex: 999, height: '62px'
    }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
          flex: 1, background: 'none', border: 'none', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '2px', color: activeTab === tab.id ? '#38bdf8' : '#64748b',
          fontSize: '9.5px', fontWeight: activeTab === tab.id ? '800' : '500',
          cursor: 'pointer', transition: 'color 0.15s', padding: '6px 2px'
        }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile sticky header
// ─────────────────────────────────────────────────────────────────────────────
function AdminMobileHeader({ title, badge, onLogout, lastSync }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100, background: '#0f172a',
      color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 14px',
      height: '56px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <div>
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', lineHeight: 1.2 }}>{title}</div>
        {lastSync && <div style={{ fontSize: '9px', color: '#64748b' }}>Synced {lastSync}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ background: '#1e293b', color: '#94a3b8', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>{badge}</span>
        <button onClick={onLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout, isApp = false, staffMode = false, user }) {
  // ── State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState(null)

  // Real DB data
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0, pendingOrders: 0, totalBookings: 0 })
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [inventory, setInventory] = useState([])
  const [bookings, setBookings] = useState([])

  // Filter state
  const [orderSearch, setOrderSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [invSearch, setInvSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')

  // ── Load all data from DB ─────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, ordersData, usersData, inventoryData, bookingsData] = await Promise.all([
        api.getAdminStats().catch(() => ({})),
        api.getAllOrders().catch(() => []),
        api.getAllUsers().catch(() => []),
        api.getAllProducts().catch(() => []),
        api.getAllBookings().catch(() => [])
      ])
      setStats(prev => ({ ...prev, ...statsData }))
      setOrders(ordersData || [])
      setUsers(usersData || [])
      setInventory(inventoryData || [])
      setBookings(bookingsData || [])
      setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      console.warn('AdminDashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
    // Auto-refresh every 30 seconds
    const iv = setInterval(loadAll, 30000)
    return () => clearInterval(iv)
  }, [loadAll])

  // ── Order status transitions ──────────────────────────────────────────
  const STATUS_FLOW = {
    'Out for Delivery': { next: 'Processing', label: 'Mark Processing' },
    'Processing': { next: 'Dispatched', label: 'Mark Dispatched' },
    'Dispatched': { next: 'Delivered', label: 'Mark Delivered' },
    'Awaiting Confirm': { next: 'Processing', label: 'Confirm Order' },
    'Pending': { next: 'Processing', label: 'Start Processing' }
  }

  async function advanceOrderStatus(orderId, currentStatus) {
    const flow = STATUS_FLOW[currentStatus]
    if (!flow) return
    const newStatus = flow.next
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    await api.updateOrderStatus(orderId, newStatus)
    // Refresh stats
    const newStats = await api.getAdminStats().catch(() => null)
    if (newStats) setStats(prev => ({ ...prev, ...newStats }))
  }

  // ── Kanban columns ─────────────────────────────────────────────────────
  const KANBAN_COLS = [
    { id: 'pending', title: '🔴 Pending', match: s => /pending|awaiting/i.test(s) },
    { id: 'processing', title: '🟡 Processing', match: s => /processing|packing|confirmed/i.test(s) },
    { id: 'dispatched', title: '🟣 Dispatched', match: s => /dispatch|transit|delivery/i.test(s) },
    { id: 'delivered', title: '🟢 Delivered', match: s => /delivered|completed/i.test(s) }
  ]

  // ── Filtered data ──────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    const matchSearch = !orderSearch ||
      (o.orderNumber || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customerPhone || '').includes(orderSearch)
    const matchStatus = orderStatusFilter === 'all' ||
      (o.status || '').toLowerCase().includes(orderStatusFilter.toLowerCase())
    return matchSearch && matchStatus
  })

  const filteredUsers = users.filter(u =>
    !userSearch ||
    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone || '').includes(userSearch) ||
    (u.shopName || '').toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredInventory = inventory.filter(p =>
    !invSearch ||
    (p.name || '').toLowerCase().includes(invSearch.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(invSearch.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(invSearch.toLowerCase())
  )

  const retailers = users.filter(u => u.role === 'retailer' || Boolean(u.shopName))

  // ─────────────────────────────────────────────────────────────────────
  // TAB DEFINITIONS
  // ─────────────────────────────────────────────────────────────────────
  const adminTabs = staffMode ? [
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'bookings', icon: '🧪', label: 'Bookings' },
  ] : [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'orders', icon: '📋', label: 'Orders' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'inventory', icon: '💊', label: 'Stock' },
    { id: 'bookings', icon: '🧪', label: 'Labs' },
    { id: 'retailers', icon: '🏪', label: 'Retailers' },
  ]

  const panelTitle = staffMode ? `🚚 Staff — ${user?.name || 'Panel'}` : '🛡️ SubhOne Admin'
  const panelBadge = staffMode ? 'Staff' : 'Super Admin'

  // ─────────────────────────────────────────────────────────────────────
  // CONTENT RENDERERS
  // ─────────────────────────────────────────────────────────────────────

  // ── Overview / Dashboard ──────────────────────────────────────────────
  const renderOverview = () => (
    <div style={{ padding: isApp ? '16px' : '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
        <StatCard icon="📋" label="Total Orders" value={stats.totalOrders} sub={`${stats.pendingOrders} pending`} accent="#0284c7" />
        <StatCard icon="💰" label="Total Revenue" value={fmtCurrency(stats.totalRevenue)} sub="From all orders" accent="#16a34a" />
        <StatCard icon="👥" label="Registered Users" value={stats.totalUsers} sub="Across all roles" accent="#9333ea" />
        <StatCard icon="💊" label="Listed Products" value={stats.totalProducts} sub="Active in catalog" accent="#f59e0b" />
        <StatCard icon="🧪" label="Lab Bookings" value={stats.totalBookings} sub="Diagnostic tests" accent="#06b6d4" />
        <StatCard icon="🏪" label="Retailer Partners" value={retailers.length} sub="Verified partners" accent="#f97316" />
      </div>

      {/* Recent orders preview */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Recent Orders</h3>
          <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>View All →</button>
        </div>
        {orders.slice(0, 5).map(o => (
          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{o.orderNumber || o.id?.slice(0, 12)}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{o.customerName} • {fmtDate(o.createdAt)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>{fmtCurrency(o.totalAmount)}</div>
              <StatusPill status={o.status} />
            </div>
          </div>
        ))}
        {orders.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '20px 0' }}>No orders yet</p>}
      </div>
    </div>
  )

  // ── Orders ─────────────────────────────────────────────────────────────
  const renderOrders = () => {
    if (isApp) {
      return (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              placeholder="Search order / customer..."
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              style={{ flex: 1, minWidth: '150px', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
            />
            <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
              style={{ padding: '9px 10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#fff' }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="dispatch">Dispatched</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{filteredOrders.length} orders</div>
          {filteredOrders.map(order => {
            const flowItem = STATUS_FLOW[order.status]
            return (
              <div key={order.id} style={{ background: '#fff', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{order.orderNumber || order.id?.slice(0, 16)}</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{order.customerName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{order.customerPhone}</div>
                  </div>
                  <StatusPill status={order.status} />
                </div>
                {order.itemsSummary && <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>💊 {order.itemsSummary}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>{fmtCurrency(order.totalAmount)}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{fmtDate(order.createdAt)}</div>
                  </div>
                  {flowItem && (
                    <button onClick={() => advanceOrderStatus(order.id, order.status)}
                      style={{ background: '#0f172a', color: '#38bdf8', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                      → {flowItem.label}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filteredOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
              <p>No orders found</p>
            </div>
          )}
        </div>
      )
    }

    // Desktop Kanban
    return (
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Search orders..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', width: '240px', outline: 'none' }} />
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{filteredOrders.length} total orders</span>
        </div>
        <div className="kanban-board">
          {KANBAN_COLS.map(col => {
            const colOrders = filteredOrders.filter(o => col.match(o.status || ''))
            return (
              <div key={col.id} className="kanban-column">
                <h3>{col.title} <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>({colOrders.length})</span></h3>
                {colOrders.map(order => {
                  const flowItem = STATUS_FLOW[order.status]
                  return (
                    <div key={order.id} className="kanban-card">
                      <div className="kanban-card-id">{order.orderNumber || order.id?.slice(0, 16)}</div>
                      <div className="kanban-card-title">{order.customerName}</div>
                      {order.itemsSummary && <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>{order.itemsSummary}</div>}
                      <div className="kanban-card-price">{fmtCurrency(order.totalAmount)}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>{fmtDate(order.createdAt)}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusPill status={order.status} />
                        {flowItem && (
                          <button onClick={() => advanceOrderStatus(order.id, order.status)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', title: flowItem.label }}>⏭️</button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {colOrders.length === 0 && <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', margin: '12px 0' }}>No orders</p>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Users ──────────────────────────────────────────────────────────────
  const renderUsers = () => (
    <div style={{ padding: isApp ? '14px' : '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>All Registered Users ({filteredUsers.length})</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Live synced from Neon database · Auto-refreshes every 30s</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {loading && <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>Syncing...</span>}
          <button onClick={loadAll} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>
      </div>
      <input placeholder="Search name, email, phone, shop..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', marginBottom: '14px', outline: 'none', boxSizing: 'border-box' }} />

      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredUsers.map(u => (
            <div key={u.id || u.email} style={{ background: '#fff', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: u.shopName || u.address ? '8px' : 0 }}>
                <Avatar name={u.name} avatar={u.avatar} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{u.name || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || u.phone || '—'}</div>
                  {u.phone && u.email && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.phone}</div>}
                </div>
                <RoleBadge role={u.role} />
              </div>
              {(u.shopName || u.address || u.dob || u.gender) && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', color: '#475569' }}>
                  {u.shopName && <span>🏪 {u.shopName}</span>}
                  {u.address && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>📍 {u.address}</span>}
                  {u.dob && <span>🎂 {u.dob}</span>}
                  {u.gender && <span>👤 {u.gender}</span>}
                  <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>{fmtDate(u.updatedAt)}</span>
                </div>
              )}
            </div>
          ))}
          {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No users found</div>}
        </div>
      ) : (
        <div className="inventory-table-container" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th><th>Role</th><th>Email / Phone</th><th>DOB / Age / Gender</th><th>Store</th><th>Address</th><th>Signup</th><th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id || u.email}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={u.name} avatar={u.avatar} size={36} />
                      <div>
                        <div className="table-item-name">{u.name || '—'}</div>
                        <div className="table-item-pack">ID: {String(u.id || '').slice(0, 16)}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{u.email || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{u.phone || '—'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{u.dob || '—'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{u.age ? `${u.age} yrs` : ''} {u.gender || ''}</div>
                  </td>
                  <td style={{ fontSize: '13px', color: u.shopName ? '#0f172a' : '#94a3b8' }}>{u.shopName || '—'}</td>
                  <td style={{ maxWidth: '180px', fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.address}>{u.address || '—'}</td>
                  <td style={{ fontSize: '11px', color: '#64748b' }}>{u.signupMethod === 'phone' ? '📱 Phone' : '✉️ Email'}</td>
                  <td style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>{fmtDate(u.updatedAt)}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ── Inventory ──────────────────────────────────────────────────────────
  const renderInventory = () => (
    <div style={{ padding: isApp ? '14px' : '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
          Medicine Inventory ({filteredInventory.length} products)
        </h3>
        <button onClick={loadAll} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
          🔄 Sync
        </button>
      </div>
      <input placeholder="Search product, category, brand..." value={invSearch} onChange={e => setInvSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', marginBottom: '14px', outline: 'none', boxSizing: 'border-box' }} />

      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredInventory.map(item => (
            <div key={item.id} style={{ background: '#fff', borderRadius: '12px', padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {item.image && (
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: '#f8fafc' }} onError={e => e.target.style.display='none'} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.brand} • {item.category}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: '#059669', fontSize: '13px' }}>{fmtCurrency(item.price)}</span>
                    {item.mrp > item.price && <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>{fmtCurrency(item.mrp)}</span>}
                    <span className={`stock-badge ${item.isLowStock ? 'low-stock' : 'in-stock'}`} style={{ fontSize: '10px' }}>{item.stockBadge}</span>
                    {!item.isListed && <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>Unlisted</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredInventory.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No products found</div>}
        </div>
      ) : (
        <div className="inventory-table-container" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category / Brand</th><th>MRP</th><th>B2C Price</th><th>B2B Price</th><th>Stock</th><th>Status</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', background: '#f8fafc' }} onError={e => e.target.style.display='none'} />}
                      <div>
                        <div className="table-item-name">{item.name}</div>
                        <div className="table-item-pack">{item.subtitle || item.details || item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.category}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.brand}</div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>{fmtCurrency(item.mrp)}</td>
                  <td style={{ fontSize: '14px', fontWeight: '700', color: '#059669' }}>{fmtCurrency(item.price)}</td>
                  <td style={{ fontSize: '13px', color: '#0284c7', fontWeight: '600' }}>{fmtCurrency(item.retailerPrice)}</td>
                  <td><span className={`stock-badge ${item.isLowStock ? 'low-stock' : 'in-stock'}`}>{item.stockBadge}</span></td>
                  <td>
                    <span className="status-badge active" style={{ background: item.isListed ? '#dcfce7' : '#fef2f2', color: item.isListed ? '#16a34a' : '#dc2626' }}>
                      {item.isListed ? 'Listed' : 'Unlisted'}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDate(item.updatedAt)}</td>
                </tr>
              ))}
              {filteredInventory.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No products found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ── Lab Bookings ───────────────────────────────────────────────────────
  const renderBookings = () => (
    <div style={{ padding: isApp ? '14px' : '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Lab Test Bookings ({bookings.length})</h3>
        <button onClick={loadAll} style={{ background: '#06b6d4', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>🔄 Sync</button>
      </div>
      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bookings.map(b => (
            <div key={b.id} style={{ background: '#fff', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{b.bookingNumber}</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{b.patientName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{b.patientPhone}</div>
                </div>
                <StatusPill status={b.status} />
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>🧪 {b.packageName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>📅 {b.collectionDate} • {b.collectionTimeSlot}</span>
                <span style={{ fontWeight: '700', color: '#059669' }}>{fmtCurrency(b.totalAmount)}</span>
              </div>
            </div>
          ))}
          {bookings.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No lab bookings found</div>}
        </div>
      ) : (
        <div className="inventory-table-container" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Booking #</th><th>Patient</th><th>Package</th><th>Date & Slot</th><th>Amount</th><th>Payment</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>
                    <div className="table-item-name">{b.bookingNumber}</div>
                    <div className="table-item-pack">{b.patientAge}y {b.patientGender}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{b.patientName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{b.patientPhone}</div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#0f172a', maxWidth: '200px' }}>{b.packageName}</td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{b.collectionDate}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{b.collectionTimeSlot}</div>
                  </td>
                  <td style={{ fontSize: '14px', fontWeight: '700', color: '#059669' }}>{fmtCurrency(b.totalAmount)}</td>
                  <td style={{ fontSize: '12px' }}>{b.paymentMethod} · <span style={{ color: '#0284c7', fontWeight: '600' }}>{b.paymentStatus}</span></td>
                  <td><StatusPill status={b.status} /></td>
                  <td style={{ fontSize: '11px', color: '#94a3b8' }}>{fmtDate(b.createdAt)}</td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No bookings found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ── Retailers ──────────────────────────────────────────────────────────
  const renderRetailers = () => (
    <div style={{ padding: isApp ? '14px' : '32px' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
        Verified Retailer Partners ({retailers.length})
      </h3>
      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {retailers.map(u => (
            <div key={u.id} style={{ background: '#fff', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>{u.shopName || 'Retailer Pharmacy'}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Owner: {u.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
                <span style={{ color: '#475569' }}>{u.email || u.phone || '—'}</span>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>✓ Active</span>
              </div>
              {u.address && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>📍 {u.address}</div>}
            </div>
          ))}
          {retailers.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No retailer partners registered yet</div>}
        </div>
      ) : (
        <div className="inventory-table-container" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Store Name</th><th>Owner</th><th>Email</th><th>Phone</th><th>Address</th><th>Status</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {retailers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="table-item-name">{u.shopName || 'Retailer Pharmacy'}</div>
                    <div className="table-item-pack">ID: {String(u.id || '').slice(0, 16)}</div>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{u.name}</td>
                  <td style={{ fontSize: '13px' }}>{u.email || '—'}</td>
                  <td style={{ fontSize: '13px' }}>{u.phone || '—'}</td>
                  <td style={{ fontSize: '12px', color: '#475569', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                  <td><span className="status-badge active" style={{ background: '#dcfce7', color: '#15803d' }}>✓ Active Partner</span></td>
                  <td style={{ fontSize: '11px', color: '#94a3b8' }}>{fmtDate(u.updatedAt)}</td>
                </tr>
              ))}
              {retailers.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No retailer partners registered yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────
  // Loading Screen
  // ─────────────────────────────────────────────────────────────────────
  if (loading && orders.length === 0 && users.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f172a', gap: '16px'
      }}>
        <div style={{ fontSize: '40px' }}>🛡️</div>
        <div style={{ color: '#38bdf8', fontSize: '16px', fontWeight: '700' }}>Loading Admin Panel...</div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Syncing with Neon Database</div>
        <div style={{ width: '200px', height: '4px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#38bdf8', borderRadius: '4px', animation: 'shimmer 1.5s infinite ease-in-out' }} />
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────
  // MOBILE LAYOUT
  // ─────────────────────────────────────────────────────────────────────
  if (isApp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9', paddingBottom: '62px' }}>
        <AdminMobileHeader title={panelTitle} badge={panelBadge} onLogout={onLogout} lastSync={lastSync} />

        {/* Tab title strip */}
        <div style={{ background: '#fff', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {adminTabs.find(t => t.id === activeTab)?.icon}{' '}
          {activeTab === 'overview' && 'Dashboard Overview'}
          {activeTab === 'orders' && `Orders (${filteredOrders.length})`}
          {activeTab === 'users' && `Users (${filteredUsers.length})`}
          {activeTab === 'inventory' && `Inventory (${filteredInventory.length})`}
          {activeTab === 'bookings' && `Lab Bookings (${bookings.length})`}
          {activeTab === 'retailers' && `Retailers (${retailers.length})`}
          {loading && <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#0284c7', fontWeight: '600' }}>Syncing...</span>}
        </div>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'retailers' && renderRetailers()}
        </main>

        <AdminBottomNav activeTab={activeTab} setActiveTab={setActiveTab} tabs={adminTabs} />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────
  // DESKTOP LAYOUT
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">{panelTitle}</div>
        <nav className="admin-nav">
          {adminTabs.map(tab => (
            <button key={tab.id} className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}{' '}
              {tab.id === 'overview' && 'Dashboard'}
              {tab.id === 'orders' && `Orders (${orders.length})`}
              {tab.id === 'users' && `Users (${users.length})`}
              {tab.id === 'inventory' && `Inventory (${inventory.length})`}
              {tab.id === 'bookings' && `Lab Bookings (${bookings.length})`}
              {tab.id === 'retailers' && `Retailers (${retailers.length})`}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', fontSize: '11px', color: '#475569', borderTop: '1px solid #1e293b' }}>
          {lastSync ? `🟢 Synced ${lastSync}` : '⏳ Connecting...'}
        </div>
        <button className="admin-logout-btn" onClick={onLogout}>Logout Securely</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'orders' && 'Order Fulfillment Board'}
            {activeTab === 'users' && 'Live Users & App Accounts'}
            {activeTab === 'inventory' && 'Inventory Management'}
            {activeTab === 'bookings' && 'Lab Test Bookings'}
            {activeTab === 'retailers' && 'Retailer Partners'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>Syncing with DB...</span>}
            <button onClick={loadAll} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              🔄 Refresh All
            </button>
            <div className="admin-user-badge">{panelBadge} · {user?.name || 'Admin'}</div>
          </div>
        </header>

        <div className="admin-content" style={{ padding: 0 }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'retailers' && renderRetailers()}
        </div>
      </main>
    </div>
  )
}
