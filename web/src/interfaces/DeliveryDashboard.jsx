import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const fmtCurrency = n => '₹' + Number(n || 0).toLocaleString('en-IN')
const fmtDate = d => { if (!d) return '—'; try { return new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) } catch { return String(d) } }
const fmtShortDate = d => { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) } catch { return String(d) } }

function StatusPill({ status }) {
  const s = String(status || '').toLowerCase()
  let bg = '#e2e8f0', color = '#475569'
  if (s.includes('pending') || s.includes('awaiting')) { bg = '#fef3c7'; color = '#d97706' }
  else if (s.includes('processing') || s.includes('confirmed')) { bg = '#e0f2fe'; color = '#0284c7' }
  else if (s.includes('dispatch') || s.includes('transit') || s.includes('out for')) { bg = '#f3e8ff'; color = '#9333ea' }
  else if (s.includes('delivered') || s.includes('completed')) { bg = '#dcfce7'; color = '#16a34a' }
  else if (s.includes('cancel') || s.includes('reject') || s.includes('failed')) { bg = '#fef2f2'; color = '#dc2626' }
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: bg, color }}>{status || '—'}</span>
}

function StatCard({ icon, label, value, sub, accent = '#0284c7' }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '28px', opacity: 0.12 }}>{icon}</div>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: '800', color: accent, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{sub}</div>}
    </div>
  )
}

function Toast({ message, type = 'success' }) {
  if (!message) return null
  const bg = type === 'error' ? '#dc2626' : '#0f172a'
  const color = type === 'error' ? '#fff' : '#38bdf8'
  return <div style={{ position: 'fixed', top: 72, right: 16, background: bg, color, padding: '12px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', maxWidth: '320px' }}>{type === 'error' ? ' ' : ' '}{message}</div>
}

function Modal({ isOpen, onClose, title, children, width = 540 }) {
  if (!isOpen) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: width, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', fontSize: '16px', color: '#475569' }}></button>
        </div>
        <div style={{ padding: '22px' }}>{children}</div>
      </div>
    </div>
  )
}

function exportCSV(data, filename, cols) {
  const hdr = cols.map(c => c.label).join(',')
  const rows = data.map(row => cols.map(c => `"${String(row[c.key] || '').replace(/"/g, "'").replace(/\n/g, ' ')}"`).join(','))
  const blob = new Blob([[hdr, ...rows].join('\n')], { type: 'text/csv' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename })
  a.click(); URL.revokeObjectURL(a.href)
}

function BottomNav({ activeTab, setActiveTab, tabs }) {
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172a', display: 'flex', borderTop: '1px solid #1e293b', zIndex: 999, height: '60px' }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px', color: activeTab === tab.id ? '#38bdf8' : '#64748b', fontSize: '9px', fontWeight: activeTab === tab.id ? '800' : '500', cursor: 'pointer', padding: '4px 1px' }}>
          <span style={{ fontSize: '17px', lineHeight: 1 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

function MobileHeader({ title, badge, onLogout, lastSync }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', height: '56px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8' }}>{title}</div>
        {lastSync && <div style={{ fontSize: '9px', color: '#64748b' }}>Synced {lastSync}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ background: '#1e293b', color: '#94a3b8', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>{badge}</span>
        <button onClick={onLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
      </div>
    </header>
  )
}

const TH = { textAlign: 'left', padding: '10px 14px', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }
const TD = { padding: '13px 14px', verticalAlign: 'middle', fontSize: '13px' }
const INFO_BOX = { background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }
const INFO_LBL = { fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }
const INFO_VAL = { fontSize: '14px', fontWeight: '700', color: '#0f172a' }
const INPUT_STYLE = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a' }

export default function DeliveryDashboard({ onLogout, isApp = false, user }) {
  const [activeTab, setActiveTab] = useState('deliveries')
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')
  const [stats, setStats] = useState({ totalAssigned: 0, deliveredToday: 0, pendingDeliveries: 0, totalDelivered: 0 })
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [deliveryNote, setDeliveryNote] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteOrderId, setNoteOrderId] = useState(null)

  const partnerName = user?.name || user?.displayName || ''
  const partnerPhone = user?.phone || user?.mobile || ''
  const partnerId = user?.id || ''

  const showToast = useCallback((msg, type = 'success') => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, ordersData] = await Promise.all([
        api.getDeliveryStats(partnerName, partnerPhone, partnerId).catch(() => ({})),
        api.getDeliveryOrders(partnerName, partnerPhone, partnerId).catch(() => []),
      ])
      setStats(prev => ({ ...prev, ...statsData }))
      setOrders(ordersData || [])
      setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    } catch (err) { console.warn('DeliveryDashboard loadAll:', err) }
    finally { setLoading(false) }
  }, [partnerName, partnerPhone, partnerId])

  useEffect(() => { loadAll(); const iv = setInterval(loadAll, 30000); return () => clearInterval(iv) }, [loadAll])

  const DELIVERY_FLOW = {
    'Dispatched':       { next: 'Out for Delivery', label: ' Start Delivery' },
    'In Transit':       { next: 'Out for Delivery', label: ' Start Delivery' },
    'Out for Delivery': { next: 'Delivered',        label: ' Mark Delivered'  },
  }

  async function advanceDelivery(order) {
    const flow = DELIVERY_FLOW[order.status]
    if (!flow) return
    setUpdatingId(order.id)
    const ok = await api.updateDeliveryStatus(order.id, flow.next)
    setUpdatingId(null)
    if (ok) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: flow.next, updatedAt: new Date().toISOString() } : o))
      if (selectedOrder?.id === order.id) setSelectedOrder(prev => ({ ...prev, status: flow.next }))
      showToast(`Order → ${flow.next}`)
      api.getDeliveryStats(partnerName, partnerPhone).then(s => s && setStats(p => ({ ...p, ...s }))).catch(() => {})
    } else { showToast('Failed to update status', 'error') }
  }

  async function handleAddNote(orderId) {
    if (!deliveryNote.trim()) { setShowNoteModal(false); return }
    setUpdatingId(orderId)
    const ok = await api.updateDeliveryStatus(orderId, orders.find(o => o.id === orderId)?.status, deliveryNote.trim())
    setUpdatingId(null)
    if (ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryNotes: deliveryNote.trim() } : o))
      showToast('Note saved')
    } else { showToast('Failed to save note', 'error') }
    setDeliveryNote('')
    setShowNoteModal(false)
  }

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase()
    const ms = !q || (o.orderNumber || '').toLowerCase().includes(q) || (o.customerName || '').toLowerCase().includes(q) || (o.customerPhone || '').includes(q) || (o.shippingAddress || '').toLowerCase().includes(q)
    const mst = statusFilter === 'all' || (o.status || '').toLowerCase().includes(statusFilter)
    return ms && mst
  })

  const KANBAN_COLS = [
    { id: 'dispatched', title: ' Dispatched',      match: s => /dispatch|in transit/i.test(s) },
    { id: 'out',        title: ' Out for Delivery', match: s => /out for/i.test(s) },
    { id: 'delivered',  title: ' Delivered',         match: s => /delivered|completed/i.test(s) },
  ]

  const TABS = [
    { id: 'overview',   icon: '', label: 'Overview' },
    { id: 'deliveries', icon: '', label: 'Active' },
    { id: 'history',    icon: '', label: 'History' },
  ]

  const tabLabel = () => {
    const active = orders.filter(o => !/delivered|completed/i.test(o.status)).length
    const hist   = orders.filter(o => /delivered|completed/i.test(o.status)).length
    const map = { overview: 'My Dashboard', deliveries: `Active Deliveries (${active})`, history: `Delivery History (${hist})` }
    return map[activeTab] || 'Dashboard'
  }

  /* ── Overview ─────────────────────────────────────────────────────── */
  const renderOverview = () => (
    <div style={{ padding: isApp ? '12px' : '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: '16px', padding: '20px 24px' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8', marginBottom: '4px' }}> Hello, {user?.name?.split(' ')[0] || 'Partner'}!</div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>Ready to deliver today? Here's your overview.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr 1fr' : 'repeat(4,1fr)', gap: '12px' }}>
        <StatCard icon="" label="Total Assigned"  value={stats.totalAssigned}    sub="All orders"    accent="#0284c7" />
        <StatCard icon="" label="Pending"          value={stats.pendingDeliveries} sub="Need delivery" accent="#d97706" />
        <StatCard icon="" label="Delivered Today"  value={stats.deliveredToday}   sub="Today"         accent="#16a34a" />
        <StatCard icon="" label="Total Delivered" value={stats.totalDelivered}   sub="All time"      accent="#9333ea" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {/* Active deliveries card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}> Active Deliveries</h3>
            <button onClick={() => setActiveTab('deliveries')} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>View All →</button>
          </div>
          {orders.filter(o => !/delivered|completed/i.test(o.status)).slice(0, 5).map(o => {
            const flow = DELIVERY_FLOW[o.status]
            return (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{o.customerName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{o.orderNumber} · {fmtShortDate(o.createdAt)}</div>
                  {o.shippingAddress && <div style={{ fontSize: '10px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}> {o.shippingAddress.slice(0,40)}{o.shippingAddress.length > 40 ? '...' : ''}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
                  <StatusPill status={o.status} />
                  {flow && <button onClick={e => { e.stopPropagation(); advanceDelivery(o) }} disabled={updatingId === o.id} style={{ background: '#0f172a', color: '#38bdf8', border: 'none', borderRadius: '7px', padding: '4px 10px', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>{updatingId === o.id ? '...' : flow.label}</button>}
                </div>
              </div>
            )
          })}
          {orders.filter(o => !/delivered|completed/i.test(o.status)).length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}> All deliveries complete!</p>}
        </div>
        {/* Recently delivered card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}> Recently Delivered</h3>
            <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>View All →</button>
          </div>
          {orders.filter(o => /delivered|completed/i.test(o.status)).slice(0, 5).map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{o.customerName}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{o.orderNumber} · {fmtDate(o.updatedAt || o.createdAt)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>{fmtCurrency(o.totalAmount)}</div>
                <StatusPill status={o.status} />
              </div>
            </div>
          ))}
          {orders.filter(o => /delivered|completed/i.test(o.status)).length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No deliveries yet</p>}
        </div>
      </div>
    </div>
  )

  /* ── Deliveries / History ─────────────────────────────────────────── */
  const renderDeliveries = (showHistory = false) => {
    const relevantOrders = showHistory
      ? filteredOrders.filter(o => /delivered|completed/i.test(o.status))
      : filteredOrders.filter(o => !/delivered|completed/i.test(o.status))
    return (
      <div style={{ padding: isApp ? '12px' : '22px 28px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
          <input placeholder="Search customer, order, address..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: '180px', ...INPUT_STYLE, padding: '8px 12px' }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '12px', background: '#fff' }}>
            <option value="all">All Status</option>
            <option value="dispatch">Dispatched</option>
            <option value="out for">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancel">Cancelled</option>
          </select>
          <button onClick={() => exportCSV(relevantOrders, showHistory ? 'history.csv' : 'active.csv', [
            { key: 'orderNumber', label: 'Order #' }, { key: 'customerName', label: 'Customer' },
            { key: 'customerPhone', label: 'Phone' }, { key: 'shippingAddress', label: 'Address' },
            { key: 'status', label: 'Status' }, { key: 'totalAmount', label: 'Amount' }, { key: 'createdAt', label: 'Date' }
          ])} style={{ background: '#0f172a', color: '#38bdf8', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>↓ CSV</button>
          <button onClick={loadAll} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}> Sync</button>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '10px' }}>{relevantOrders.length} {showHistory ? 'completed deliveries' : 'active deliveries'}</div>

        {/* Mobile cards */}
        {isApp ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {relevantOrders.map(order => {
              const flow = DELIVERY_FLOW[order.status]
              return (
                <div key={order.id} style={{ background: '#fff', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{order.orderNumber}</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{order.customerName}</div>
                      {order.customerPhone && <a href={`tel:${order.customerPhone}`} style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600', marginTop: '2px', display: 'block', textDecoration: 'none' }}> {order.customerPhone}</a>}
                    </div>
                    <StatusPill status={order.status} />
                  </div>
                  {order.shippingAddress && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 10px', marginBottom: '8px', fontSize: '12px', color: '#166534', fontWeight: '600' }}> {order.shippingAddress}</div>}
                  {order.itemsSummary && <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px' }}> {order.itemsSummary}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>{fmtCurrency(order.totalAmount)}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{order.paymentMethod} · {fmtDate(order.createdAt)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => setSelectedOrder(order)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}> Details</button>
                      <button onClick={() => { setNoteOrderId(order.id); setDeliveryNote(order.deliveryNotes || ''); setShowNoteModal(true) }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}> Note</button>
                      {flow && <button onClick={() => advanceDelivery(order)} disabled={updatingId === order.id} style={{ background: flow.next === 'Delivered' ? '#16a34a' : '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>{updatingId === order.id ? '...' : flow.label}</button>}
                    </div>
                  </div>
                  {order.deliveryNotes && <div style={{ marginTop: '6px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', color: '#92400e' }}> {order.deliveryNotes}</div>}
                </div>
              )
            })}
            {relevantOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{showHistory ? '' : ''}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#475569' }}>{showHistory ? 'No delivery history yet' : 'No active deliveries!'}</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>{showHistory ? 'Completed deliveries appear here' : 'Check back when new orders are assigned'}</div>
              </div>
            )}
          </div>
        ) : showHistory ? (
          /* Desktop: History table */
          <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={TH}>Order</th><th style={TH}>Customer</th><th style={TH}>Address</th>
                <th style={TH}>Amount</th><th style={TH}>Payment</th><th style={TH}>Status</th>
                <th style={TH}>Delivered At</th><th style={TH}>Actions</th>
              </tr></thead>
              <tbody>
                {relevantOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={TD}><div style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a' }}>{o.orderNumber}</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{fmtDate(o.createdAt)}</div></td>
                    <td style={TD}><div style={{ fontWeight: '700', fontSize: '13px' }}>{o.customerName}</div><div style={{ fontSize: '11px', color: '#0284c7' }}>{o.customerPhone}</div></td>
                    <td style={{ ...TD, maxWidth: '180px', fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.shippingAddress || '—'}</td>
                    <td style={{ ...TD, fontWeight: '700', color: '#059669' }}>{fmtCurrency(o.totalAmount)}</td>
                    <td style={{ ...TD, fontSize: '12px', color: '#64748b' }}>{o.paymentMethod}</td>
                    <td style={TD}><StatusPill status={o.status} /></td>
                    <td style={{ ...TD, fontSize: '12px', color: '#64748b' }}>{fmtDate(o.updatedAt || o.createdAt)}</td>
                    <td style={TD}><button onClick={() => setSelectedOrder(o)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}> Details</button></td>
                  </tr>
                ))}
                {relevantOrders.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}><div style={{ fontSize: '32px', marginBottom: '8px' }}></div>No delivery history yet</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          /* Desktop: Active deliveries Kanban */
          <div style={{ display: 'flex', gap: '18px', overflowX: 'auto', paddingBottom: '12px' }}>
            {KANBAN_COLS.map(col => {
              const colOrders = relevantOrders.filter(o => col.match(o.status || ''))
              return (
                <div key={col.id} style={{ flex: 1, minWidth: '280px', background: '#e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>{col.title} <span style={{ color: '#94a3b8' }}>({colOrders.length})</span></h3>
                  {colOrders.map(order => {
                    const flow = DELIVERY_FLOW[order.status]
                    return (
                      <div key={order.id} style={{ background: '#fff', padding: '13px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.15s' }}
                        onClick={() => setSelectedOrder(order)}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = ''}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>{order.orderNumber}</div>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>{order.customerName}</div>
                        {order.customerPhone && <a href={`tel:${order.customerPhone}`} onClick={e => e.stopPropagation()} style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600', marginBottom: '4px', display: 'block', textDecoration: 'none' }}> {order.customerPhone}</a>}
                        {order.shippingAddress && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '5px 7px', fontSize: '11px', color: '#166534', fontWeight: '600', marginBottom: '6px' }}> {order.shippingAddress.slice(0,60)}{order.shippingAddress.length > 60 ? '...' : ''}</div>}
                        {order.itemsSummary && <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}> {order.itemsSummary}</div>}
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669', marginBottom: '6px' }}>{fmtCurrency(order.totalAmount)}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>{order.paymentMethod} · {fmtDate(order.createdAt)}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <StatusPill status={order.status} />
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={e => { e.stopPropagation(); setNoteOrderId(order.id); setDeliveryNote(order.deliveryNotes || ''); setShowNoteModal(true) }} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}></button>
                            {flow && <button onClick={e => { e.stopPropagation(); advanceDelivery(order) }} disabled={updatingId === order.id} style={{ background: flow.next === 'Delivered' ? '#16a34a' : '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>{updatingId === order.id ? '...' : flow.label}</button>}
                          </div>
                        </div>
                        {order.deliveryNotes && <div style={{ marginTop: '6px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '5px', padding: '4px 7px', fontSize: '10px', color: '#92400e' }}> {order.deliveryNotes}</div>}
                      </div>
                    )
                  })}
                  {colOrders.length === 0 && <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', margin: '12px 0' }}>No orders</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  /* ── Modals ─────────────────────────────────────────────────────────── */
  const OrderDetailModal = () => {
    if (!selectedOrder) return null
    const o = selectedOrder
    const flow = DELIVERY_FLOW[o.status]
    return (
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Delivery — ${o.orderNumber || o.id?.slice(0, 16)}`} width={580}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={INFO_BOX}><div style={INFO_LBL}>Customer</div><div style={INFO_VAL}>{o.customerName}</div></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Phone</div><div style={{ ...INFO_VAL }}><a href={`tel:${o.customerPhone}`} style={{ color: '#0284c7', textDecoration: 'none' }}>{o.customerPhone || '—'}</a></div></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Amount</div><div style={{ ...INFO_VAL, color: '#059669', fontSize: '20px' }}>{fmtCurrency(o.totalAmount)}</div></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Payment</div><div style={INFO_VAL}>{o.paymentMethod} · {o.paymentStatus}</div></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Status</div><StatusPill status={o.status} /></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Ordered</div><div style={INFO_VAL}>{fmtDate(o.createdAt)}</div></div>
          </div>
          {o.shippingAddress && (
            <div style={{ ...INFO_BOX, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={INFO_LBL}> Delivery Address</div>
              <div style={{ ...INFO_VAL, color: '#166534', fontSize: '15px', marginBottom: '8px' }}>{o.shippingAddress}</div>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(o.shippingAddress)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}> Open in Google Maps</a>
            </div>
          )}
          {o.items && o.items.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>Items ({o.items.length})</div>
              {o.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                  <div><div style={{ fontWeight: '700', color: '#0f172a' }}>{item.product_name || item.name}</div><div style={{ fontSize: '11px', color: '#64748b' }}>Qty: {item.quantity || 1}</div></div>
                  <div style={{ fontWeight: '700', color: '#059669' }}>{fmtCurrency((item.price || 0) * (item.quantity || 1))}</div>
                </div>
              ))}
            </div>
          )}
          {o.deliveryNotes && (
            <div style={{ ...INFO_BOX, background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={INFO_LBL}> Delivery Notes</div>
              <div style={{ fontSize: '13px', color: '#92400e' }}>{o.deliveryNotes}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <button onClick={() => { setNoteOrderId(o.id); setDeliveryNote(o.deliveryNotes || ''); setShowNoteModal(true) }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}> Add Note</button>
            {flow && <button onClick={() => { advanceDelivery(o); setSelectedOrder(prev => ({ ...prev, status: flow.next })) }} disabled={updatingId === o.id} style={{ flex: 1, background: flow.next === 'Delivered' ? '#16a34a' : '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>{updatingId === o.id ? 'Updating...' : `→ ${flow.label}`}</button>}
          </div>
        </div>
      </Modal>
    )
  }

  const NoteModal = () => (
    <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title=" Delivery Note" width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} style={{ ...INPUT_STYLE, minHeight: '100px', resize: 'vertical' }} placeholder="e.g. Left at door, customer not home, called back..." />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowNoteModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => handleAddNote(noteOrderId)} disabled={updatingId === noteOrderId} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>{updatingId === noteOrderId ? 'Saving...' : ' Save Note'}</button>
        </div>
      </div>
    </Modal>
  )

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (loading && orders.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', gap: '16px' }}>
        <div style={{ fontSize: '44px' }}></div>
        <div style={{ color: '#38bdf8', fontSize: '16px', fontWeight: '800' }}>Loading Delivery Panel...</div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Syncing your deliveries</div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════════════════
     LAYOUTS
  ══════════════════════════════════════════════════════════════════════ */

  /* ── Mobile App Layout ────────────────────────────────────────────── */
  if (isApp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9', paddingBottom: '60px' }}>
        <MobileHeader title=" Delivery Panel" badge="Delivery Partner" onLogout={onLogout} lastSync={lastSync} />
        <div style={{ background: '#fff', padding: '8px 14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px' }}>
          {TABS.find(t => t.id === activeTab)?.icon} {tabLabel()}
          {loading && <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#0284c7', fontWeight: '600' }}>Syncing...</span>}
        </div>
        <main style={{ flex: 1 }}>
          {activeTab === 'overview'   && renderOverview()}
          {activeTab === 'deliveries' && renderDeliveries(false)}
          {activeTab === 'history'    && renderDeliveries(true)}
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
        <Toast message={toast} type={toastType} />
        <OrderDetailModal />
        <NoteModal />
      </div>
    )
  }

  /* ── Desktop Layout (mirrors Admin Panel) ───────────────────────── */
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand"> Delivery Panel</div>
        <nav className="admin-nav">
          {TABS.map(tab => (
            <button key={tab.id} className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span>{tab.icon}</span>
              <span>
                {tab.id === 'overview'   && 'Dashboard'}
                {tab.id === 'deliveries' && `Active (${orders.filter(o => !/delivered|completed/i.test(o.status)).length})`}
                {tab.id === 'history'    && `History (${orders.filter(o => /delivered|completed/i.test(o.status)).length})`}
              </span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '10px 24px', fontSize: '11px', color: '#475569', borderTop: '1px solid #1e293b' }}>
          {lastSync ? ` Synced ${lastSync}` : ' Connecting...'}
        </div>
        <button className="admin-logout-btn" onClick={onLogout}>Logout Securely</button>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>{tabLabel()}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loading && <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>Syncing...</span>}
            <button onClick={loadAll} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}> Refresh</button>
            <div className="admin-user-badge"> {user?.name || 'Delivery Partner'}</div>
          </div>
        </header>
        <div className="admin-content" style={{ padding: 0 }}>
          {activeTab === 'overview'   && renderOverview()}
          {activeTab === 'deliveries' && renderDeliveries(false)}
          {activeTab === 'history'    && renderDeliveries(true)}
        </div>
      </main>
      <Toast message={toast} type={toastType} />
      <OrderDetailModal />
      <NoteModal />
    </div>
  )
}
