import React, { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, ShoppingBag, Pill, Users, Store, Bike,
  TrendingUp, AlertTriangle, AlertCircle, CheckCircle, CheckCircle2, Clock,
  Package, ChevronRight, Search, RefreshCw, Plus, Edit3,
  Trash2, Phone, MapPin, FileText, Check, X, Shield, Truck,
  Download, ArrowRight, Sparkles, Box, UserCheck, ShieldCheck,
  Zap, Star, Layers, Calendar, ExternalLink, Activity, Save, LogOut
} from 'lucide-react'
import { api } from '../services/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = n => '₹' + Number(n || 0).toLocaleString('en-IN')
const fmtDate = d => { if (!d) return '—'; try { return new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) } catch { return String(d) } }
const fmtShortDate = d => { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) } catch { return String(d) } }

// ─── Category list (matches website) ─────────────────────────────────────────
const PRODUCT_CATEGORIES = [
  'Medicine', 'Vitamins & Supplements', 'Personal Care', 'Baby Care',
  'Healthcare Devices', 'Ayurvedic', 'Homeopathy', 'Skin Care',
  'Hair Care', 'Sexual Wellness', 'Diabetes Care', 'Cardiac Care',
  'Surgical', 'COVID Essentials', 'Eye Care', 'Ear Care',
  'Dental Care', 'Foot Care', 'Fitness', 'General'
]

const BLANK_PRODUCT = {
  name: '', subtitle: '', category: 'Medicine', brand: '', sku: '',
  mrp: '', price: '', retailerPrice: '', discountPercent: '',
  stock: '', imageUrl: '', details: '',
  isFlashSale: false, isFeatured: false, isListed: true
}

const BLANK_USER = {
  name: '',
  email: '',
  phone: '',
  role: 'customer',
  shopName: '',
  address: ''
}

// ─── Minimalist SVG Illustrations ─────────────────────────────────────────────
function EmptyIllustration({ type = 'orders', title, subtitle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', textAlign: 'center' }}>
      <div style={{
        width: '84px',
        height: '84px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        border: '1.5px solid #ddd6fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7c3aed',
        marginBottom: '16px',
        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.12)'
      }}>
        {type === 'orders' && <ShoppingBag size={40} strokeWidth={1.75} />}
        {type === 'products' && <Pill size={40} strokeWidth={1.75} />}
        {type === 'users' && <Users size={40} strokeWidth={1.75} />}
        {type === 'delivery' && <Bike size={40} strokeWidth={1.75} />}
        {type === 'retailers' && <Store size={40} strokeWidth={1.75} />}
        {type === 'check' && <CheckCircle2 size={40} strokeWidth={1.75} />}
      </div>
      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b4b', marginBottom: '4px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '300px' }}>{subtitle}</div>}
    </div>
  )
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const s = String(status || '').toLowerCase()
  let bg = '#ede9fe', color = '#6d28d9', border = '#ddd6fe', Icon = Clock
  if (s.includes('pending') || s.includes('awaiting')) { bg = '#fef3c7'; color = '#b45309'; border = '#fde68a'; Icon = Clock }
  else if (s.includes('processing') || s.includes('packing') || s.includes('confirmed')) { bg = '#e0f2fe'; color = '#0284c7'; border = '#bae6fd'; Icon = RefreshCw }
  else if (s.includes('dispatch') || s.includes('transit') || s.includes('delivery')) { bg = '#f5f3ff'; color = '#7c3aed'; border = '#ddd6fe'; Icon = Truck }
  else if (s.includes('delivered') || s.includes('completed') || s.includes('done')) { bg = '#dcfce7'; color = '#15803d'; border = '#bbf7d0'; Icon = CheckCircle2 }
  else if (s.includes('cancel') || s.includes('reject')) { bg = '#fef2f2'; color = '#b91c1c'; border = '#fecaca'; Icon = X }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      background: bg,
      color,
      border: `1px solid ${border}`,
      letterSpacing: '0.2px'
    }}>
      <Icon size={12} strokeWidth={2.5} />
      {status || '—'}
    </span>
  )
}

function RoleBadge({ role }) {
  const r = String(role || 'customer').toLowerCase()
  let bg = '#e0f2fe', color = '#0369a1', border = '#bae6fd'
  if (r === 'admin') { bg = '#fce7f3'; color = '#be185d'; border = '#fbcfe8' }
  else if (r === 'retailer') { bg = '#fef3c7'; color = '#b45309'; border = '#fde68a' }
  else if (r === 'staff' || r === 'delivery_partner') { bg = '#f5f3ff'; color = '#7c3aed'; border = '#ddd6fe' }

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 9px',
      borderRadius: '20px',
      fontSize: '10px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
      background: bg,
      color,
      border: `1px solid ${border}`
    }}>
      {role || 'CUSTOMER'}
    </span>
  )
}

function Avatar({ name, avatar, size = 38 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
      color: '#6d28d9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '800',
      fontSize: size * 0.38,
      overflow: 'hidden',
      flexShrink: 0,
      border: '1px solid #ddd6fe'
    }}>
      {avatar ? (
        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
      ) : (
        name ? name[0].toUpperCase() : '?'
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, accent = '#7c3aed', bgLight = '#f5f3ff' }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '18px',
      padding: '20px 22px',
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)',
      border: '1px solid #ede9fe',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      {/* Top row with icon badge and label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: bgLight,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${accent}22`
        }}>
          {React.isValidElement(Icon) ? Icon : (Icon ? <Icon size={20} strokeWidth={2.2} /> : null)}
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e1b4b', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '600', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, icon: Icon, children, width = 540 }) {
  if (!isOpen) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(30, 27, 75, 0.5)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ background: '#ffffff', borderRadius: '22px', width: '100%', maxWidth: width, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(124, 58, 237, 0.2)', border: '1px solid #ede9fe' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3effe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#ffffff', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {Icon && (
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
            )}
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#1e1b4b', letterSpacing: '-0.2px' }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background: '#f5f3ff', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.15s' }}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success' }) {
  if (!message) return null
  const isErr = type === 'error'
  const bg = isErr ? '#fef2f2' : '#f5f3ff'
  const color = isErr ? '#b91c1c' : '#6d28d9'
  const border = isErr ? '#fecaca' : '#ddd6fe'
  const Icon = isErr ? AlertCircle : CheckCircle2

  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: bg,
      color,
      border: `1.5px solid ${border}`,
      padding: '12px 20px',
      borderRadius: '16px',
      fontSize: '13px',
      fontWeight: '700',
      zIndex: 9999,
      boxShadow: '0 8px 30px rgba(124, 58, 237, 0.15)',
      maxWidth: '340px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideIn 0.2s ease'
    }}>
      <Icon size={18} strokeWidth={2.5} />
      {message}
    </div>
  )
}

// ─── Bar Chart (no external dep) ──────────────────────────────────────────────
function RevenueBarChart({ data, isApp }) {
  if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>No revenue data yet</div>
  const maxRev = Math.max(...data.map(d => d.revenue), 1)
  const chartH = isApp ? 110 : 150
  const barW = Math.max(8, Math.min(30, Math.floor((isApp ? 270 : 540) / data.length) - 4))
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(data.length * (barW + 4) + 40, isApp ? 270 : 540)} height={chartH + 40}>
        {data.map((d, i) => {
          const bh = Math.max(4, (d.revenue / maxRev) * chartH)
          const x = 20 + i * (barW + 4), y = chartH - bh
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh} rx={3} fill="#38bdf8" opacity={0.82} />
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize={9} fill="#94a3b8">{fmtShortDate(d.day)}</text>
              {d.revenue > 0 && <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#0284c7">{Math.round(d.revenue / 1000)}k</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(data, filename, cols) {
  const hdr = cols.map(c => c.label).join(',')
  const rows = data.map(row => cols.map(c => `"${String(row[c.key] || '').replace(/"/g, "'").replace(/\n/g, ' ')}"`).join(','))
  const blob = new Blob([[hdr, ...rows].join('\n')], { type: 'text/csv' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename })
  a.click(); URL.revokeObjectURL(a.href)
}

// ─── Form field helper ────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '5px' }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>{hint}</div>}
    </div>
  )
}

const INPUT_STYLE = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a', transition: 'border-color 0.15s' }
const TOGGLE_STYLE = (active, colors) => ({ background: active ? colors.bg : '#f1f5f9', color: active ? colors.text : '#94a3b8', border: `1.5px solid ${active ? colors.border : '#e2e8f0'}`, borderRadius: '10px', padding: '7px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' })

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function AdminBottomNav({ activeTab, setActiveTab, tabs }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      borderTop: '1px solid #ede9fe',
      zIndex: 999,
      height: '62px',
      boxShadow: '0 -4px 20px rgba(124, 58, 237, 0.06)'
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
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
              color: isActive ? '#7c3aed' : '#94a3b8',
              fontSize: '10px',
              fontWeight: isActive ? '800' : '600',
              cursor: 'pointer',
              padding: '6px 2px',
              position: 'relative'
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                width: '32px',
                height: '3px',
                borderRadius: '0 0 4px 4px',
                background: '#7c3aed'
              }} />
            )}
            {React.isValidElement(Icon) ? Icon : (Icon ? <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} /> : null)}
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

function AdminMobileHeader({ title, badge, onLogout, lastSync }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#ffffff',
      color: '#1e1b4b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      height: '60px',
      flexShrink: 0,
      borderBottom: '1px solid #ede9fe',
      boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
        }}>
          <Shield size={18} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b4b', letterSpacing: '-0.2px' }}>{title}</div>
          {lastSync && <div style={{ fontSize: '10px', color: '#7c3aed', fontWeight: '600' }}>Synced {lastSync}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          background: '#f5f3ff',
          color: '#7c3aed',
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '20px',
          border: '1px solid #ddd6fe'
        }}>
          {badge}
        </span>
        <button onClick={onLogout} style={{
          background: '#fff5f5',
          color: '#dc2626',
          border: '1px solid #fed7d7',
          borderRadius: '10px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout, isApp = false, staffMode = false, user }) {
  const [activeTab, setActiveTab] = useState(staffMode ? 'orders' : 'overview')
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')

  // ── Data ───────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0, pendingOrders: 0 })
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [analytics, setAnalytics] = useState({ dailyRevenue: [], statusBreakdown: [], topProducts: [] })
  const [analyticsDays, setAnalyticsDays] = useState(30)

  // ── Filters ────────────────────────────────────────────────────────────
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [prodSearch, setProdSearch] = useState('')
  const [prodCatFilter, setProdCatFilter] = useState('all')
  const [prodShowFilter, setProdShowFilter] = useState('all') // all | listed | unlisted | low

  // ── Modals ─────────────────────────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [editProduct, setEditProduct] = useState(null)       // product being edited (null = closed)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState(BLANK_PRODUCT)
  const [addingProduct, setAddingProduct] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingStock, setEditingStock] = useState({})        // id -> draft value
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState(BLANK_USER)
  const [addingUser, setAddingUser] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const getOrderDisplayName = useCallback((order) => {
    const u = users.find(u => String(u.id) === String(order.userId || order.user_id) || (u.phone && u.phone === order.customerPhone))
    return u?.shopName ? `${order.customerName} (${u.shopName})` : order.customerName
  }, [users])

  // ── Load ───────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, ordersData, usersData, prodsData] = await Promise.all([
        api.getAdminStats().catch(() => ({})),
        api.getAllOrders().catch(() => []),
        api.getAllUsers().catch(() => []),
        api.getAllProducts().catch(() => []),
      ])
      setStats(prev => ({ ...prev, ...statsData }))
      setOrders(ordersData || [])
      setUsers(usersData || [])
      setProducts(prodsData || [])
      setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    } catch (err) { console.warn('AdminDashboard loadAll:', err) }
    finally { setLoading(false) }
  }, [])

  // ── Delivery Partner management ────────────────────────────────────────
  const [deliverySearch, setDeliverySearch] = useState('')
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all')
  const [assigningOrderId, setAssigningOrderId] = useState(null)
  const [selectedPartnerName, setSelectedPartnerName] = useState('')
  const [partnerNote, setPartnerNote] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteOrderId, setNoteOrderId] = useState(null)
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState(null)

  const assignDeliveryPartner = async (orderId, partner) => {
    setUpdatingDeliveryId(orderId)
    const partnerName = partner ? partner.name : ''
    const partnerPhone = partner ? partner.phone : ''
    const partnerId = partner ? (partner.id || '') : ''
    const ok = await api.assignOrderDeliveryPartner(orderId, partnerName, partnerPhone, partnerId)
    setUpdatingDeliveryId(null)
    if (ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        deliveryPartnerName: partnerName,
        deliveryPartnerPhone: partnerPhone,
        status: o.status === 'Pending' || o.status === 'Processing' ? 'Dispatched' : o.status
      } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          deliveryPartnerName: partnerName,
          deliveryPartnerPhone: partnerPhone,
          status: prev.status === 'Pending' || prev.status === 'Processing' ? 'Dispatched' : prev.status
        }))
      }
      showToast(partner ? `Assigned to ${partner.name}` : 'Delivery partner unassigned')
    } else {
      showToast('Failed to assign delivery partner', 'error')
    }
  }

  const advanceDeliveryOrder = async (order, targetStatus) => {
    setUpdatingDeliveryId(order.id)
    const ok = await api.updateDeliveryStatus(order.id, targetStatus)
    setUpdatingDeliveryId(null)
    if (ok) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: targetStatus, updatedAt: new Date().toISOString() } : o))
      if (selectedOrder?.id === order.id) setSelectedOrder(prev => ({ ...prev, status: targetStatus }))
      showToast(`Order #${order.orderNumber || order.id?.slice(0, 10)} → ${targetStatus}`)
    } else {
      showToast('Failed to update status', 'error')
    }
  }

  const saveDeliveryNote = async (orderId) => {
    if (!partnerNote.trim()) { setShowNoteModal(false); return }
    setUpdatingDeliveryId(orderId)
    const order = orders.find(o => o.id === orderId)
    const ok = await api.updateDeliveryStatus(orderId, order?.status, partnerNote.trim())
    setUpdatingDeliveryId(null)
    if (ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryNotes: partnerNote.trim() } : o))
      showToast('Delivery note saved')
    } else {
      showToast('Failed to save note', 'error')
    }
    setPartnerNote('')
    setShowNoteModal(false)
  }

  useEffect(() => { loadAll(); const iv = setInterval(loadAll, 30000); return () => clearInterval(iv) }, [loadAll])

  // ── Order actions ──────────────────────────────────────────────────────
  const STATUS_FLOW = {
    'Pending':           { next: 'Processing',  label: 'Start Processing' },
    'Awaiting Confirm':  { next: 'Processing',  label: 'Confirm Order' },
    'Processing':        { next: 'Dispatched',  label: 'Mark Dispatched' },
    'Dispatched':        { next: 'Delivered',   label: 'Mark Delivered' },
    'In Transit':        { next: 'Delivered',   label: 'Mark Delivered' },
  }

  async function advanceOrderStatus(orderId, currentStatus) {
    const flow = STATUS_FLOW[currentStatus]; if (!flow) return
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: flow.next } : o))
    await api.updateOrderStatus(orderId, flow.next)
    showToast(`Order → ${flow.next}`)
    api.getAdminStats().then(s => s && setStats(p => ({ ...p, ...s }))).catch(() => {})
  }

  // ── Product actions ────────────────────────────────────────────────────
  async function toggleProductListed(p) {
    const v = !p.isListed
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isListed: v } : x))
    await api.updateProduct(p.id, { isListed: v })
    showToast(`${p.name} ${v ? 'listed' : 'unlisted'}`)
  }
  async function toggleFlashSale(p) {
    const v = !p.isFlashSale
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFlashSale: v } : x))
    await api.updateProduct(p.id, { isFlashSale: v })
    showToast(`Flash sale ${v ? 'ON' : 'OFF'}: ${p.name}`)
  }
  async function toggleFeatured(p) {
    const v = !p.isFeatured
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFeatured: v } : x))
    await api.updateProduct(p.id, { isFeatured: v })
    showToast(`Featured ${v ? 'ON' : 'OFF'}: ${p.name}`)
  }
  async function saveStock(p) {
    const ns = parseInt(editingStock[p.id] ?? p.stock, 10); if (isNaN(ns)) return
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock: ns, stockBadge: ns <= 0 ? 'Out of Stock' : ns <= 15 ? `Only ${ns} left` : `${ns} in stock`, isLowStock: ns <= 15 } : x))
    setEditingStock(prev => { const n = { ...prev }; delete n[p.id]; return n })
    await api.updateProduct(p.id, { stock: ns })
    showToast(`Stock updated: ${p.name} → ${ns}`)
  }

  async function handleAddProduct(e) {
    e.preventDefault()
    if (!newProduct.name.trim()) return showToast('Product name is required', 'error')
    if (!newProduct.mrp) return showToast('MRP is required', 'error')
    setAddingProduct(true)
    const result = await api.addProduct({
      ...newProduct,
      mrp: Number(newProduct.mrp) || 0,
      price: Number(newProduct.price) || Number(newProduct.mrp) || 0,
      retailerPrice: Number(newProduct.retailerPrice) || 0,
      stock: Number(newProduct.stock) || 0,
      discountPercent: Number(newProduct.discountPercent) || 0
    })
    setAddingProduct(false)
    if (result) {
      showToast(`Product "${newProduct.name}" added successfully!`)
      setShowAddProduct(false)
      setNewProduct(BLANK_PRODUCT)
      loadAll()
    } else {
      showToast('Failed to add product. Check fields and try again.', 'error')
    }
  }

  async function handleSaveEditProduct(e) {
    e.preventDefault()
    if (!editProduct.name.trim()) return showToast('Product name is required', 'error')
    const fields = {
      name: editProduct.name,
      subtitle: editProduct.subtitle,
      category: editProduct.category,
      brand: editProduct.brand,
      image: editProduct.image,
      details: editProduct.details,
      isListed: editProduct.isListed,
      isFlashSale: editProduct.isFlashSale,
      isFeatured: editProduct.isFeatured,
      stock: Number(editProduct.stock) || 0,
      price: Number(editProduct.price) || 0,
      retailerPrice: Number(editProduct.retailerPrice) || 0,
      mrp: Number(editProduct.mrp) || 0,
    }
    await api.updateProduct(editProduct.id, fields)
    setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...fields, isLowStock: fields.stock <= 15, stockBadge: fields.stock <= 0 ? 'Out of Stock' : fields.stock <= 15 ? `Only ${fields.stock} left` : `${fields.stock} in stock` } : p))
    showToast(`"${editProduct.name}" updated!`)
    setEditProduct(null)
  }

  async function handleDeleteProduct(p) {
    if (!window.confirm(`Delete "${p.name}" permanently? This cannot be undone.`)) return
    setDeletingId(p.id)
    const ok = await api.deleteProduct(p.id)
    setDeletingId(null)
    if (ok) {
      setProducts(prev => prev.filter(x => x.id !== p.id))
      showToast(`"${p.name}" deleted`)
    } else {
      showToast('Delete failed', 'error')
    }
  }

  // ── User actions ───────────────────────────────────────────────────────
  async function changeUserRole(u, newRole) {
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x))
    await api.updateUserRole(u.id, u.email, newRole)
    showToast(`Role: ${u.name} → ${newRole}`)
  }

  async function handleApproveRetailer(u) {
    const ok = await api.approveRetailer(u.id, u.email)
    if (ok) {
      setUsers(prev => prev.map(x => (x.id === u.id || (x.email && x.email === u.email)) ? { ...x, role: 'retailer', approvalStatus: 'approved' } : x))
      showToast(`Retailer "${u.shopName || u.name}" approved successfully!`)
    } else {
      showToast('Approval update failed. Please try again.', 'error')
    }
  }
  async function handleRejectRetailer(u) {
    if (!window.confirm(`Are you sure you want to reject retailer application for "${u.shopName || u.name}"?`)) return
    const ok = await api.rejectRetailer(u.id, u.email)
    if (ok) {
      setUsers(prev => prev.map(x => (x.id === u.id || (x.email && x.email === u.email)) ? { ...x, role: 'customer', approvalStatus: 'rejected' } : x))
      showToast(`Retailer "${u.shopName || u.name}" rejected.`)
    } else {
      showToast('Rejection failed. Please try again.', 'error')
    }
  }
  async function viewUserOrders(u) {
    setSelectedUser(u); setUserOrders([])
    const data = await api.getUserOrders(u.id, u.email).catch(() => [])
    setUserOrders(data || [])
  }

  async function handleAddUser(e) {
    e.preventDefault()
    if (!newUser.name.trim()) return showToast('User name is required', 'error')
    if (!newUser.email.trim() && !newUser.phone.trim()) return showToast('Please enter either email or phone', 'error')
    setAddingUser(true)
    const result = await api.addUser({
      ...newUser,
      name: newUser.name.trim(),
      email: newUser.email.trim().toLowerCase(),
      phone: newUser.phone.trim(),
      role: newUser.role || 'customer',
      shopName: newUser.shopName.trim(),
      address: newUser.address.trim()
    })
    setAddingUser(false)
    if (result) {
      showToast(`User "${result.name}" added successfully!`)
      setShowAddUser(false)
      setNewUser(BLANK_USER)
      loadAll()
    } else {
      showToast('Failed to add user. Check information and try again.', 'error')
    }
  }

  async function handleDeleteUser(u) {
    const displayName = u.name || u.email || u.phone || 'this user'
    if (!window.confirm(`Are you sure you want to delete user "${displayName}"? This will permanently remove their profile.`)) return
    setDeletingUserId(u.id || u.email || u.phone)
    const ok = await api.deleteUser(u.id, u.email, u.phone)
    setDeletingUserId(null)
    if (ok) {
      setUsers(prev => prev.filter(x => {
        if (u.id && x.id === u.id) return false
        if (u.email && x.email && x.email.toLowerCase() === u.email.toLowerCase()) return false
        if (u.phone && x.phone && x.phone === u.phone) return false
        return true
      }))
      showToast(`User "${displayName}" removed`)
      api.getAdminStats().then(s => s && setStats(p => ({ ...p, ...s }))).catch(() => {})
    } else {
      showToast('Delete user failed. Try again.', 'error')
    }
  }

  // ── Filtered lists ─────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase()
    const ms = !q || (o.orderNumber || '').toLowerCase().includes(q) || (o.customerName || '').toLowerCase().includes(q) || (o.customerPhone || '').includes(q)
    const mst = orderStatusFilter === 'all' || (o.status || '').toLowerCase().includes(orderStatusFilter)
    return ms && mst
  })
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase()
    const ms = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').includes(q) || (u.shopName || '').toLowerCase().includes(q)
    const mr = userRoleFilter === 'all' || (u.role || '').toLowerCase() === userRoleFilter
    return ms && mr
  })
  const filteredProducts = products.filter(p => {
    const q = prodSearch.toLowerCase()
    const ms = !q || (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
    const mc = prodCatFilter === 'all' || (p.category || '').toLowerCase() === prodCatFilter.toLowerCase()
    const mf = prodShowFilter === 'all' || (prodShowFilter === 'listed' && p.isListed) || (prodShowFilter === 'unlisted' && !p.isListed) || (prodShowFilter === 'low' && p.isLowStock)
    return ms && mc && mf
  })
  const retailers = users.filter(u => u.role === 'retailer' || Boolean(u.shopName))
  const deliveryPartners = users.filter(u => u.role === 'delivery_partner')

  const filteredDeliveryOrders = orders.filter(o => {
    const q = deliverySearch.toLowerCase()
    const ms = !q ||
      (o.orderNumber || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.customerPhone || '').includes(q) ||
      (o.deliveryPartnerName || '').toLowerCase().includes(q) ||
      (o.deliveryPartnerPhone || '').includes(q) ||
      (typeof o.shippingAddress === 'string' ? o.shippingAddress.toLowerCase().includes(q) : false)
    const mst = deliveryStatusFilter === 'all' || (o.status || '').toLowerCase().includes(deliveryStatusFilter)
    return ms && mst
  })

  const KANBAN_COLS = [
    { id: 'pending',    title: 'Pending',    icon: Clock,       match: s => /pending|awaiting/i.test(s), color: '#b45309', bg: '#fef3c7' },
    { id: 'processing', title: 'Processing', icon: RefreshCw,   match: s => /processing|packing|confirmed/i.test(s), color: '#0284c7', bg: '#e0f2fe' },
    { id: 'dispatched', title: 'Dispatched', icon: Truck,       match: s => /dispatch|transit/i.test(s), color: '#7c3aed', bg: '#f5f3ff' },
    { id: 'delivered',  title: 'Delivered',  icon: CheckCircle2, match: s => /delivered|completed/i.test(s), color: '#15803d', bg: '#dcfce7' }
  ]

  // ── Tabs ───────────────────────────────────────────────────────────────
  const FULL_TABS = [
    { id: 'overview',   icon: LayoutDashboard, label: 'Overview' },
    { id: 'orders',     icon: ShoppingBag,     label: 'Orders' },
    { id: 'products',   icon: Pill,            label: 'Products' },
    { id: 'users',      icon: Users,           label: 'Users' },
    { id: 'retailers',  icon: Store,           label: 'Partners' },
    { id: 'delivery',   icon: Bike,            label: 'Delivery' },
  ]
  const STAFF_TABS = [
    { id: 'orders',   icon: ShoppingBag, label: 'Orders' },
    { id: 'products', icon: Pill,        label: 'Products' },
    { id: 'delivery', icon: Bike,        label: 'Delivery' },
  ]
  const adminTabs = staffMode ? STAFF_TABS : FULL_TABS
  const mobileTabs = staffMode ? STAFF_TABS : [
    { id: 'overview',   icon: LayoutDashboard, label: 'Overview' },
    { id: 'orders',     icon: ShoppingBag,     label: 'Orders' },
    { id: 'products',   icon: Pill,            label: 'Products' },
    { id: 'users',      icon: Users,           label: 'Users' },
    { id: 'retailers',  icon: Store,           label: 'Stores' },
    { id: 'delivery',   icon: Bike,            label: 'Delivery' },
  ]

  const panelTitle = staffMode ? 'Staff Panel' : 'SubhOne Admin'
  const panelBadge = staffMode ? 'Staff' : 'Super Admin'

  const tabLabel = () => {
    const map = {
      overview: 'Dashboard Overview',
      orders: `Orders (${filteredOrders.length})`,
      products: `Products (${filteredProducts.length})`,
      users: `Users (${filteredUsers.length})`,
      retailers: `Retailers (${retailers.length})`,
      delivery: `Delivery Partners (${deliveryPartners.length})`
    }
    return map[activeTab] || 'Admin'
  }

  // ─ Style constants ──────────────────────────────────────────────────────
  const TH = { textAlign: 'left', padding: '12px 16px', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f5f3ff', borderBottom: '1px solid #ede9fe' }
  const TD = { padding: '14px 16px', verticalAlign: 'middle', fontSize: '13px' }
  const INFO_BOX = { background: '#f5f3ff', borderRadius: '12px', padding: '12px 14px', border: '1px solid #ede9fe' }
  const INFO_LBL = { fontSize: '10px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }
  const INFO_VAL = { fontSize: '14px', fontWeight: '800', color: '#1e1b4b' }

  // ══════════════════════════════════════════════════════════════════════
  // SECTION RENDERERS
  // ══════════════════════════════════════════════════════════════════════

  // ── Overview ────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div style={{ padding: isApp ? '16px' : '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr 1fr' : 'repeat(3,1fr)', gap: '14px' }}>
        <StatCard icon={ShoppingBag}   label="Total Orders"    value={stats.totalOrders}              sub={`${stats.pendingOrders || 0} pending`} accent="#0284c7" bgLight="#e0f2fe" />
        <StatCard icon={TrendingUp}    label="Total Revenue"   value={fmtCurrency(stats.totalRevenue)} sub="All time revenue"                     accent="#059669" bgLight="#dcfce7" />
        <StatCard icon={Users}         label="Users"           value={stats.totalUsers}               sub="All platform roles"                    accent="#7c3aed" bgLight="#f5f3ff" />
        <StatCard icon={Pill}          label="Products"        value={stats.totalProducts}            sub="Active catalog items"                  accent="#d97706" bgLight="#fef3c7" />
        <StatCard icon={Store}         label="Retailers"       value={retailers.length}               sub="Partner stores"                        accent="#ea580c" bgLight="#ffedd5" />
        <StatCard icon={AlertTriangle} label="Low Stock"       value={products.filter(p => p.isLowStock && p.isListed).length} sub="Need restocking" accent="#dc2626" bgLight="#fef2f2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {/* Recent orders */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)', border: '1px solid #ede9fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={15} strokeWidth={2.4} />
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e1b4b' }}>Recent Orders</h3>
            </div>
            <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          {orders.slice(0, 5).map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8f7fc', cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e1b4b' }}>{o.orderNumber || o.id?.slice(0, 12)}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{o.customerName} · {fmtDate(o.createdAt)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#059669' }}>{fmtCurrency(o.totalAmount)}</div>
                <StatusPill status={o.status} />
              </div>
            </div>
          ))}
          {orders.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No orders yet</p>}
        </div>

        {/* Low stock */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)', border: '1px solid #ede9fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={15} strokeWidth={2.4} />
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e1b4b' }}>Low Stock Alert</h3>
            </div>
            <button onClick={() => setActiveTab('products')} style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Manage <ChevronRight size={14} />
            </button>
          </div>
          {products.filter(p => p.isLowStock && p.isListed).slice(0, 6).map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8f7fc' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e1b4b', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', background: '#fef2f2', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fecaca', flexShrink: 0, marginLeft: '8px' }}>{p.stockBadge}</span>
            </div>
          ))}
          {products.filter(p => p.isLowStock && p.isListed).length === 0 && (
            <div style={{ padding: '24px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#059669' }}>
              <CheckCircle2 size={24} strokeWidth={2.2} />
              <span style={{ fontSize: '13px', fontWeight: '700' }}>All products well-stocked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── Orders ──────────────────────────────────────────────────────────
  const renderOrders = () => (
    <div style={{ padding: isApp ? '16px' : '24px 32px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={16} strokeWidth={2.2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            placeholder="Search order #, customer, phone..."
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
            style={{ ...INPUT_STYLE, paddingLeft: '36px', height: '42px' }}
          />
        </div>
        <select
          value={orderStatusFilter}
          onChange={e => setOrderStatusFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: '12px', border: '1.5px solid #ede9fe', fontSize: '13px', background: '#fff', color: '#1e1b4b', fontWeight: '600', height: '42px', outline: 'none' }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="dispatch">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancel">Cancelled</option>
        </select>
        <button
          onClick={() => exportCSV(filteredOrders, 'orders.csv', [
            { key: 'orderNumber', label: 'Order #' }, { key: 'customerName', label: 'Customer' },
            { key: 'customerPhone', label: 'Phone' }, { key: 'totalAmount', label: 'Amount' },
            { key: 'status', label: 'Status' }, { key: 'paymentMethod', label: 'Payment' }, { key: 'createdAt', label: 'Date' }
          ])}
          style={{ background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '9px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '42px' }}>
          <Download size={15} strokeWidth={2.2} />
          Export CSV
        </button>
      </div>

      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShoppingBag size={15} strokeWidth={2.4} color="#7c3aed" />
        <span>{filteredOrders.length} total orders found</span>
      </div>

      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map(order => {
            const flow = STATUS_FLOW[order.status]
            return (
              <div key={order.id} style={{ background: '#ffffff', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)', border: '1px solid #ede9fe', cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '800', letterSpacing: '0.4px' }}>{order.orderNumber || order.id?.slice(0, 16)}</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b4b', marginTop: '2px' }}>{getOrderDisplayName(order)}</div>
                    {order.customerPhone && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{order.customerPhone}</div>}
                  </div>
                  <StatusPill status={order.status} />
                </div>
                {order.itemsSummary && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', background: '#f5f3ff', padding: '6px 10px', borderRadius: '8px' }}>
                    <Pill size={13} strokeWidth={2.2} color="#7c3aed" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.itemsSummary}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #f8f7fc' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#059669' }}>{fmtCurrency(order.totalAmount)}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{fmtDate(order.createdAt)}</div>
                  </div>
                  {flow && (
                    <button
                      onClick={e => { e.stopPropagation(); advanceOrderStatus(order.id, order.status) }}
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}>
                      <span>{flow.label}</span>
                      <ArrowRight size={13} strokeWidth={2.4} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filteredOrders.length === 0 && (
            <EmptyIllustration type="orders" title="No orders found" subtitle="Try modifying your search query or status filter." />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
          {KANBAN_COLS.map(col => {
            const colOrders = filteredOrders.filter(o => col.match(o.status || ''))
            const ColIcon = col.icon
            return (
              <div key={col.id} style={{ flex: 1, minWidth: '280px', background: '#f8f7fc', border: '1px solid #ede9fe', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: col.bg, color: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ColIcon size={14} strokeWidth={2.4} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{col.title}</h3>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: '#ffffff', color: '#7c3aed', padding: '2px 8px', borderRadius: '20px', border: '1px solid #ddd6fe' }}>{colOrders.length}</span>
                </div>
                {colOrders.map(order => {
                  const flow = STATUS_FLOW[order.status]
                  return (
                    <div
                      key={order.id}
                      style={{ background: '#ffffff', padding: '15px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.04)', border: '1px solid #ede9fe', cursor: 'pointer', transition: 'all 0.15s ease' }}
                      onClick={() => setSelectedOrder(order)}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#c4b5fd' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#ede9fe' }}>
                      <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '800', marginBottom: '2px' }}>{order.orderNumber || order.id?.slice(0, 14)}</div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e1b4b', marginBottom: '4px' }}>{getOrderDisplayName(order)}</div>
                      {order.itemsSummary && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Pill size={12} color="#7c3aed" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.itemsSummary}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669', marginBottom: '6px' }}>{fmtCurrency(order.totalAmount)}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '10px' }}>{fmtDate(order.createdAt)}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f8f7fc', paddingTop: '8px' }}>
                        <StatusPill status={order.status} />
                        {flow && (
                          <button
                            onClick={e => { e.stopPropagation(); advanceOrderStatus(order.id, order.status) }}
                            style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{flow.label}</span>
                            <ArrowRight size={11} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {colOrders.length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>No orders in this stage</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // ── Products ─────────────────────────────────────────────────────────
  const renderProducts = () => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))].sort()
    return (
      <div style={{ padding: isApp ? '16px' : '24px 32px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={16} strokeWidth={2.2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              placeholder="Search name, brand, SKU, category..."
              value={prodSearch}
              onChange={e => setProdSearch(e.target.value)}
              style={{ ...INPUT_STYLE, paddingLeft: '36px', height: '42px' }}
            />
          </div>
          <select
            value={prodCatFilter}
            onChange={e => setProdCatFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '12px', border: '1.5px solid #ede9fe', fontSize: '13px', background: '#fff', color: '#1e1b4b', fontWeight: '600', height: '42px', outline: 'none' }}>
            <option value="all">All Categories</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={prodShowFilter}
            onChange={e => setProdShowFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '12px', border: '1.5px solid #ede9fe', fontSize: '13px', background: '#fff', color: '#1e1b4b', fontWeight: '600', height: '42px', outline: 'none' }}>
            <option value="all">All Products</option>
            <option value="listed">Listed Only</option>
            <option value="unlisted">Unlisted</option>
            <option value="low">Low Stock</option>
          </select>
          <button
            onClick={loadAll}
            title="Refresh list"
            style={{ background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '9px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '42px' }}>
            <RefreshCw size={15} strokeWidth={2.2} />
          </button>
          <button
            onClick={() => { setShowAddProduct(true); setNewProduct(BLANK_PRODUCT) }}
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '9px 18px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', height: '42px', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)' }}>
            <Plus size={16} strokeWidth={2.6} />
            <span>Add Product</span>
          </button>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Pill size={15} strokeWidth={2.4} color="#7c3aed" />
          <span>{filteredProducts.length} products · {products.filter(p => p.isListed).length} listed · {products.filter(p => !p.isListed).length} unlisted · {products.filter(p => p.isLowStock).length} low stock</span>
        </div>

        {/* Card grid (app) or Table (desktop) */}
        {isApp ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredProducts.map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)', border: `1.5px solid ${!item.isListed ? '#fecaca' : item.isLowStock ? '#fde68a' : '#ede9fe'}` }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '54px', height: '54px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0, border: '1px solid #ede9fe' }} onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: '#f5f3ff', border: '1px solid #ede9fe', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                      <Pill size={24} strokeWidth={2} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e1b4b', marginBottom: '2px' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.brand && `${item.brand} · `}{item.category}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontWeight: '800', color: '#059669', fontSize: '15px' }}>{fmtCurrency(item.price)}</span>
                      {item.mrp > item.price && <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>{fmtCurrency(item.mrp)}</span>}
                    </div>
                  </div>
                </div>

                {/* Stock row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', background: '#f8f7fc', padding: '8px 12px', borderRadius: '12px', border: '1px solid #ede9fe' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Stock:</span>
                  <input
                    type="number"
                    min="0"
                    value={editingStock[item.id] ?? item.stock}
                    onChange={e => setEditingStock(prev => ({ ...prev, [item.id]: e.target.value }))}
                    style={{ width: '64px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '13px', fontWeight: '800', textAlign: 'center', background: '#fff' }}
                  />
                  {editingStock[item.id] !== undefined && (
                    <button onClick={() => saveStock(item)} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} strokeWidth={2.5} /> Save
                    </button>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '800', color: item.isLowStock ? '#dc2626' : '#16a34a' }}>{item.stockBadge}</span>
                </div>

                {/* Toggle buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => toggleProductListed(item)} style={TOGGLE_STYLE(item.isListed, { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' })}>
                    {item.isListed ? 'Listed' : 'Unlisted'}
                  </button>
                  <button onClick={() => toggleFlashSale(item)} style={TOGGLE_STYLE(item.isFlashSale, { bg: '#fef3c7', text: '#d97706', border: '#fde68a' })}>
                    <Zap size={11} strokeWidth={2.4} style={{ display: 'inline', marginRight: '4px' }} />
                    Flash
                  </button>
                  <button onClick={() => toggleFeatured(item)} style={TOGGLE_STYLE(item.isFeatured, { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' })}>
                    <Star size={11} strokeWidth={2.4} style={{ display: 'inline', marginRight: '4px' }} />
                    Featured
                  </button>
                  <button onClick={() => setEditProduct({ ...item })} style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: '10px', padding: '7px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit3 size={13} strokeWidth={2.2} />
                    Edit
                  </button>
                  <button onClick={() => handleDeleteProduct(item)} disabled={deletingId === item.id} style={{ background: '#fff5f5', border: '1.5px solid #fed7d7', borderRadius: '10px', padding: '7px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={13} strokeWidth={2.2} />
                    {deletingId === item.id ? '...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <EmptyIllustration type="products" title="No products found" subtitle="Try changing your search keywords or active filters." />
            )}
          </div>
        ) : (
          /* Desktop table */
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #ede9fe', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Product</th>
                  <th style={TH}>Category</th>
                  <th style={TH}>MRP</th>
                  <th style={TH}>B2C Price</th>
                  <th style={TH}>B2B Price</th>
                  <th style={TH}>Stock</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Tags</th>
                  <th style={TH}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f8f7fc', background: !item.isListed ? '#fffafa' : item.isLowStock ? '#fffdf7' : 'transparent', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                    onMouseLeave={e => e.currentTarget.style.background = !item.isListed ? '#fffafa' : item.isLowStock ? '#fffdf7' : 'transparent'}>
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', background: '#f8f7fc', border: '1px solid #ede9fe', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', border: '1px solid #ede9fe', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                            <Pill size={18} strokeWidth={2.2} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '13px', color: '#1e1b4b', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.brand}{item.sku ? ` · SKU: ${item.sku}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...TD, fontSize: '12px', color: '#475569', fontWeight: '600' }}>{item.category}</td>
                    <td style={{ ...TD, color: '#94a3b8', fontSize: '13px' }}>{fmtCurrency(item.mrp)}</td>
                    <td style={{ ...TD, fontWeight: '800', color: '#059669', fontSize: '14px' }}>{fmtCurrency(item.price)}</td>
                    <td style={{ ...TD, fontWeight: '700', color: '#0284c7', fontSize: '13px' }}>{fmtCurrency(item.retailerPrice)}</td>
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="0"
                          value={editingStock[item.id] ?? item.stock}
                          onChange={e => setEditingStock(prev => ({ ...prev, [item.id]: e.target.value }))}
                          style={{ width: '56px', padding: '4px 6px', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '12px', fontWeight: '800', textAlign: 'center', background: '#fff' }}
                        />
                        {editingStock[item.id] !== undefined && (
                          <button onClick={() => saveStock(item)} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                            <Check size={12} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: '800', marginTop: '3px', color: item.isLowStock ? '#dc2626' : '#16a34a' }}>{item.stockBadge}</div>
                    </td>
                    <td style={TD}>
                      <button onClick={() => toggleProductListed(item)} style={{ background: item.isListed ? '#dcfce7' : '#fef2f2', color: item.isListed ? '#15803d' : '#b91c1c', border: `1px solid ${item.isListed ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', padding: '5px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {item.isListed ? 'Listed' : 'Unlisted'}
                      </button>
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => toggleFlashSale(item)} style={{ background: item.isFlashSale ? '#fef3c7' : '#f8f7fc', color: item.isFlashSale ? '#b45309' : '#94a3b8', border: `1px solid ${item.isFlashSale ? '#fde68a' : '#ede9fe'}`, borderRadius: '8px', padding: '4px 8px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Zap size={11} strokeWidth={2.2} /> Flash
                        </button>
                        <button onClick={() => toggleFeatured(item)} style={{ background: item.isFeatured ? '#e0f2fe' : '#f8f7fc', color: item.isFeatured ? '#0369a1' : '#94a3b8', border: `1px solid ${item.isFeatured ? '#bae6fd' : '#ede9fe'}`, borderRadius: '8px', padding: '4px 8px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={11} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setEditProduct({ ...item })} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Edit3 size={12} strokeWidth={2.2} />
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(item)} disabled={deletingId === item.id} style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Trash2 size={12} strokeWidth={2.2} />
                          {deletingId === item.id ? '...' : ''}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '48px' }}>
                      <EmptyIllustration
                        type="products"
                        title="No products found"
                        subtitle="Start by adding your first product to the catalog."
                      />
                      <button onClick={() => { setShowAddProduct(true); setNewProduct(BLANK_PRODUCT) }} style={{ color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '8px 16px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={15} strokeWidth={2.5} />
                        Add First Product
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ── Users ────────────────────────────────────────────────────────────
  const renderUsers = () => (
    <div style={{ padding: isApp ? '16px' : '24px 32px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={16} strokeWidth={2.2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            placeholder="Search name, email, phone, shop..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            style={{ ...INPUT_STYLE, paddingLeft: '36px', height: '42px' }}
          />
        </div>
        <select
          value={userRoleFilter}
          onChange={e => setUserRoleFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: '12px', border: '1.5px solid #ede9fe', fontSize: '13px', background: '#fff', color: '#1e1b4b', fontWeight: '600', height: '42px', outline: 'none' }}>
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="retailer">Retailer</option>
          <option value="staff">Staff</option>
          <option value="delivery_partner">Delivery Partner</option>
          <option value="admin">Administrator</option>
        </select>
        <button
          onClick={() => exportCSV(filteredUsers, 'users.csv', [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'role', label: 'Role' }, { key: 'shopName', label: 'Shop' }, { key: 'createdAt', label: 'Joined' }])}
          style={{ background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '9px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '42px' }}>
          <Download size={15} strokeWidth={2.2} />
          Export CSV
        </button>
        <button
          onClick={loadAll}
          title="Sync users"
          style={{ background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '9px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '42px' }}>
          <RefreshCw size={15} strokeWidth={2.2} />
        </button>
        <button
          onClick={() => { setShowAddUser(true); setNewUser(BLANK_USER) }}
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '9px 18px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', height: '42px', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)' }}>
          <Plus size={16} strokeWidth={2.6} />
          <span>Add User</span>
        </button>
      </div>

      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Users size={15} strokeWidth={2.4} color="#7c3aed" />
        <span>{filteredUsers.length} total registered accounts</span>
      </div>

      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredUsers.map(u => (
            <div key={u.id || u.email} style={{ background: '#ffffff', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)', border: '1px solid #ede9fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Avatar name={u.name} avatar={u.avatar} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e1b4b' }}>{u.name || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || u.phone}</div>
                  {u.phone && u.email && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.phone}</div>}
                </div>
                <RoleBadge role={u.role} />
              </div>
              {u.shopName && (
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', background: '#f5f3ff', padding: '6px 10px', borderRadius: '8px' }}>
                  <Store size={13} color="#7c3aed" />
                  <span style={{ fontWeight: '700' }}>{u.shopName}</span>
                </div>
              )}
              {u.address && (
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} color="#94a3b8" />
                  <span>{u.address}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #f8f7fc', paddingTop: '10px' }}>
                <select
                  value={u.role || 'customer'}
                  onChange={e => changeUserRole(u, e.target.value)}
                  style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd6fe', background: '#f5f3ff', color: '#7c3aed', fontWeight: '700', cursor: 'pointer', outline: 'none' }}>
                  <option value="customer">Customer</option>
                  <option value="retailer">Retailer</option>
                  <option value="staff">Staff</option>
                  <option value="delivery_partner">Delivery</option>
                  <option value="admin">Admin</option>
                </select>
                {u.role === 'retailer' && u.approvalStatus === 'pending' && (
                  <>
                  <button
                    onClick={() => handleApproveRetailer(u)}
                    style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Approve this retailer application">
                    <CheckCircle size={12} strokeWidth={2.4} /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectRetailer(u)}
                    style={{ background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Reject this retailer application">
                    <X size={12} strokeWidth={2.4} /> Reject
                  </button>
                  </>
                )}
                <button
                  onClick={() => viewUserOrders(u)}
                  style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ede9fe', background: '#fff', cursor: 'pointer', fontWeight: '700', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShoppingBag size={12} color="#7c3aed" />
                  Orders
                </button>
                <button
                  onClick={() => handleDeleteUser(u)}
                  disabled={deletingUserId === (u.id || u.email)}
                  style={{ marginLeft: 'auto', fontSize: '11px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fed7d7', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={12} />
                  {deletingUserId === (u.id || u.email) ? '...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <EmptyIllustration type="users" title="No users found" subtitle="No registered accounts match your current filters." />
          )}
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #ede9fe', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>User</th>
                <th style={TH}>Role</th>
                <th style={TH}>Approval</th>
                <th style={TH}>Email</th>
                <th style={TH}>Phone</th>
                <th style={TH}>Shop Name</th>
                <th style={TH}>Source</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id || u.email} style={{ borderBottom: '1px solid #f8f7fc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar name={u.name} avatar={u.avatar} size={38} />
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#1e1b4b' }}>{u.name || '—'}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>ID: {String(u.id || '').slice(0, 12)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={TD}>
                    <select
                      value={u.role || 'customer'}
                      onChange={e => changeUserRole(u, e.target.value)}
                      style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '8px', border: '1px solid #ddd6fe', background: '#f5f3ff', color: '#7c3aed', cursor: 'pointer', fontWeight: '700', outline: 'none' }}>
                      <option value="customer">Customer</option>
                      <option value="retailer">Retailer</option>
                      <option value="staff">Staff</option>
                      <option value="delivery_partner">Delivery</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={TD}>
                    {u.role === 'retailer' ? (
                      u.approvalStatus === 'pending' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '999px', padding: '3px 9px', fontSize: '11px', fontWeight: '800' }}>
                          <Clock size={11} /> Pending
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '999px', padding: '3px 9px', fontSize: '11px', fontWeight: '800' }}>
                          <CheckCircle size={11} /> Approved
                        </span>
                      )
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Active</span>
                    )}
                  </td>
                  <td style={{ ...TD, fontSize: '13px', color: '#475569' }}>{u.email || '—'}</td>
                  <td style={{ ...TD, fontSize: '13px', color: '#475569', fontWeight: '600' }}>{u.phone || '—'}</td>
                  <td style={{ ...TD, fontSize: '12px', color: '#7c3aed', fontWeight: '700', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.shopName || '—'}</td>
                  <td style={{ ...TD, fontSize: '11px', color: '#94a3b8' }}>{u._source || 'profiles'}</td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {u.role === 'retailer' && u.approvalStatus === 'pending' && (
                        <>
                        <button onClick={() => handleApproveRetailer(u)} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '800', color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={13} strokeWidth={2.2} /> Approve
                        </button>
                        <button onClick={() => handleRejectRetailer(u)} style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '800', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <X size={13} strokeWidth={2.2} /> Reject
                        </button>
                        </>
                      )}
                      <button onClick={() => viewUserOrders(u)} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShoppingBag size={12} strokeWidth={2.2} /> Orders
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={deletingUserId === (u.id || u.email)}
                        style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Remove user">
                        <Trash2 size={12} strokeWidth={2.2} />
                        {deletingUserId === (u.id || u.email) ? '...' : 'Remove'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px' }}>
                    <EmptyIllustration type="users" title="No users found" subtitle="Try changing your search keywords or active role filter." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ── Retailers ────────────────────────────────────────────────────────
  const renderRetailers = () => (
    <div style={{ padding: isApp ? '16px' : '24px 32px' }}>
      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Store size={16} strokeWidth={2.4} color="#7c3aed" />
        <span>{retailers.length} registered retailer partners · {retailers.filter(r => r.approvalStatus === 'pending').length} pending approval</span>
      </div>

      {isApp ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {retailers.map(u => (
            <div key={u.id} style={{ background: '#ffffff', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)', border: `1px solid ${u.approvalStatus === 'pending' ? '#fde68a' : '#ede9fe'}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: u.approvalStatus === 'pending' ? '#fef3c7' : '#ffedd5', color: u.approvalStatus === 'pending' ? '#d97706' : '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Store size={18} strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e1b4b' }}>{u.shopName || 'Retailer Store'}</div>
                    {u.approvalStatus === 'pending' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '999px', padding: '2px 8px', fontSize: '10.5px', fontWeight: '800' }}>
                        <Clock size={10} /> Pending
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '999px', padding: '2px 8px', fontSize: '10.5px', fontWeight: '800' }}>
                        <CheckCircle size={10} /> Approved
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Owner: {u.name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center', borderTop: '1px solid #f8f7fc', paddingTop: '10px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{u.email || u.phone || '—'}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {u.approvalStatus === 'pending' && (
                    <>
                    <button onClick={() => handleApproveRetailer(u)} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} strokeWidth={2.4} /> Approve
                    </button>
                    <button onClick={() => handleRejectRetailer(u)} style={{ background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <X size={12} strokeWidth={2.4} /> Reject
                    </button>
                    </>
                  )}
                  <button onClick={() => viewUserOrders(u)} style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShoppingBag size={12} /> Orders
                  </button>
                  <button onClick={() => handleDeleteUser(u)} disabled={deletingUserId === (u.id || u.email || u.phone)}
                    style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Remove retailer">
                    <Trash2 size={11} strokeWidth={2.2} />
                    {deletingUserId === (u.id || u.email || u.phone) ? '...' : 'Remove'}
                  </button>
                </div>
              </div>
              {u.address && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={11} /> {u.address}
                </div>
              )}
            </div>
          ))}
          {retailers.length === 0 && (
            <EmptyIllustration type="retailers" title="No retailer partners yet" subtitle="Retailer accounts created will appear in this list." />
          )}
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #ede9fe', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Store / Medical Hall</th>
                <th style={TH}>Proprietor</th>
                <th style={TH}>Approval Status</th>
                <th style={TH}>Email</th>
                <th style={TH}>Phone</th>
                <th style={TH}>Address</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {retailers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f8f7fc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: u.approvalStatus === 'pending' ? '#fef3c7' : '#ffedd5', color: u.approvalStatus === 'pending' ? '#d97706' : '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store size={16} strokeWidth={2.2} />
                      </div>
                      <div style={{ fontWeight: '800', color: '#1e1b4b', fontSize: '14px' }}>{u.shopName || 'Retailer Store'}</div>
                    </div>
                  </td>
                  <td style={{ ...TD, fontWeight: '700', color: '#475569' }}>{u.name}</td>
                  <td style={TD}>
                    {u.approvalStatus === 'pending' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '999px', padding: '3px 9px', fontSize: '11px', fontWeight: '800' }}>
                        <Clock size={11} /> Pending Approval
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '999px', padding: '3px 9px', fontSize: '11px', fontWeight: '800' }}>
                        <CheckCircle size={11} /> Approved
                      </span>
                    )}
                  </td>
                  <td style={TD}>{u.email || '—'}</td>
                  <td style={{ ...TD, fontWeight: '600' }}>{u.phone || '—'}</td>
                  <td style={{ ...TD, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', color: '#64748b' }}>{u.address || '—'}</td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {u.approvalStatus === 'pending' && (
                        <>
                        <button onClick={() => handleApproveRetailer(u)} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '800', color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12} strokeWidth={2.4} /> Approve
                        </button>
                        <button onClick={() => handleRejectRetailer(u)} style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '800', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <X size={12} strokeWidth={2.4} /> Reject
                        </button>
                        </>
                      )}
                      <button onClick={() => viewUserOrders(u)} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShoppingBag size={12} /> Orders
                      </button>
                      <button onClick={() => handleDeleteUser(u)} disabled={deletingUserId === (u.id || u.email || u.phone)}
                        style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Remove retailer">
                        <Trash2 size={12} />
                        {deletingUserId === (u.id || u.email || u.phone) ? '...' : 'Remove'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {retailers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px' }}>
                    <EmptyIllustration type="retailers" title="No retailer partners registered" subtitle="Retailers will be listed here once registered or converted." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ── Delivery Partner Section ──────────────────────────────────────────
  const [deliveryViewMode, setDeliveryViewMode] = useState('deliveries') // 'deliveries' | 'partners'

  const renderDelivery = () => {
    const activeDeliveries = filteredDeliveryOrders.filter(o => !/delivered|completed/i.test(o.status || ''))
    const deliveredOrders = filteredDeliveryOrders.filter(o => /delivered|completed/i.test(o.status || ''))
    const unassignedOrders = filteredDeliveryOrders.filter(o => !o.deliveryPartnerName && !/delivered|completed|cancelled/i.test(o.status || ''))
    const today = new Date().toDateString()
    const deliveredToday = deliveredOrders.filter(o => o.updatedAt && new Date(o.updatedAt).toDateString() === today)

    return (
      <div style={{ padding: isApp ? '16px' : '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Delivery Partner Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr 1fr' : 'repeat(4,1fr)', gap: '14px' }}>
          <StatCard icon={Bike}         label="Delivery Partners" value={deliveryPartners.length} sub="Registered Riders" accent="#7c3aed" bgLight="#f5f3ff" />
          <StatCard icon={Truck}        label="Active Runs"       value={activeDeliveries.length} sub="In transit / dispatched" accent="#0284c7" bgLight="#e0f2fe" />
          <StatCard icon={AlertCircle}  label="Unassigned"        value={unassignedOrders.length} sub="Need rider assignment" accent="#dc2626" bgLight="#fef2f2" />
          <StatCard icon={CheckCircle2} label="Delivered Today"   value={deliveredToday.length}   sub={`${deliveredOrders.length} all-time`} accent="#059669" bgLight="#dcfce7" />
        </div>

        {/* Sub-view switcher & Toolbar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setDeliveryViewMode('deliveries')}
              style={{
                background: deliveryViewMode === 'deliveries' ? 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' : '#ffffff',
                color: deliveryViewMode === 'deliveries' ? '#ffffff' : '#64748b',
                border: `1px solid ${deliveryViewMode === 'deliveries' ? 'transparent' : '#ede9fe'}`,
                borderRadius: '12px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: deliveryViewMode === 'deliveries' ? '0 4px 14px rgba(124, 58, 237, 0.25)' : 'none'
              }}>
              <Truck size={16} strokeWidth={2.4} />
              <span>Deliveries ({filteredDeliveryOrders.length})</span>
            </button>
            <button
              onClick={() => setDeliveryViewMode('partners')}
              style={{
                background: deliveryViewMode === 'partners' ? 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' : '#ffffff',
                color: deliveryViewMode === 'partners' ? '#ffffff' : '#64748b',
                border: `1px solid ${deliveryViewMode === 'partners' ? 'transparent' : '#ede9fe'}`,
                borderRadius: '12px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: deliveryViewMode === 'partners' ? '0 4px 14px rgba(124, 58, 237, 0.25)' : 'none'
              }}>
              <Users size={16} strokeWidth={2.4} />
              <span>Partners List ({deliveryPartners.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '180px' }}>
              <Search size={15} strokeWidth={2.2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                placeholder="Search order, rider, customer..."
                value={deliverySearch}
                onChange={e => setDeliverySearch(e.target.value)}
                style={{ ...INPUT_STYLE, paddingLeft: '34px', height: '40px' }}
              />
            </div>
            <select
              value={deliveryStatusFilter}
              onChange={e => setDeliveryStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '12px', border: '1.5px solid #ede9fe', fontSize: '12px', background: '#fff', color: '#1e1b4b', fontWeight: '600', height: '40px', outline: 'none' }}>
              <option value="all">All Statuses</option>
              <option value="dispatched">Dispatched</option>
              <option value="in transit">In Transit</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
            <button
              onClick={() => exportCSV(filteredDeliveryOrders, 'delivery_manifest.csv', [
                { key: 'orderNumber', label: 'Order #' }, { key: 'customerName', label: 'Customer' },
                { key: 'customerPhone', label: 'Phone' }, { key: 'deliveryPartnerName', label: 'Rider Name' },
                { key: 'deliveryPartnerPhone', label: 'Rider Phone' }, { key: 'status', label: 'Status' },
                { key: 'totalAmount', label: 'Amount' }, { key: 'createdAt', label: 'Date' }
              ])}
              style={{ background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '40px' }}>
              <Download size={14} /> CSV
            </button>
            <button
              onClick={loadAll}
              title="Sync deliveries"
              style={{ background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '8px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '40px' }}>
              <RefreshCw size={14} strokeWidth={2.2} />
            </button>
            <button
              onClick={() => { setShowAddUser(true); setNewUser({ ...BLANK_USER, role: 'delivery_partner' }) }}
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '8px 16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '40px', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)' }}>
              <Plus size={15} strokeWidth={2.6} />
              <span>Add Rider</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Delivery Orders */}
        {deliveryViewMode === 'deliveries' && (
          isApp ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredDeliveryOrders.map(order => (
                <div key={order.id} style={{ background: '#ffffff', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)', border: '1px solid #ede9fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '800' }}>{order.orderNumber || order.id?.slice(0, 16)}</div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b4b', marginTop: '2px' }}>{getOrderDisplayName(order)}</div>
                      {order.customerPhone && (
                        <a href={`tel:${order.customerPhone}`} style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Phone size={12} /> {order.customerPhone}
                        </a>
                      )}
                    </div>
                    <StatusPill status={order.status} />
                  </div>

                  {order.shippingAddress && (
                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '8px 12px', marginBottom: '10px', fontSize: '12px', color: '#6d28d9', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#7c3aed" flexShrink={0} />
                      <span>{typeof order.shippingAddress === 'string' ? order.shippingAddress : 'Address recorded'}</span>
                    </div>
                  )}

                  {/* Rider assignment row */}
                  <div style={{ background: '#f8f7fc', borderRadius: '12px', padding: '10px 12px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid #ede9fe' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Assigned Rider</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: order.deliveryPartnerName ? '#1e1b4b' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        {order.deliveryPartnerName ? (
                          <>
                            <Bike size={14} color="#7c3aed" />
                            <span>{order.deliveryPartnerName}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} color="#dc2626" />
                            <span>Unassigned</span>
                          </>
                        )}
                      </div>
                      {order.deliveryPartnerPhone && <div style={{ fontSize: '11px', color: '#64748b' }}>{order.deliveryPartnerPhone}</div>}
                    </div>
                    <select
                      value={order.deliveryPartnerName || ''}
                      onChange={e => {
                        const p = deliveryPartners.find(x => x.name === e.target.value)
                        assignDeliveryPartner(order.id, p)
                      }}
                      style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd6fe', background: '#fff', fontWeight: '700', color: '#1e1b4b', maxWidth: '140px', outline: 'none' }}>
                      <option value="">Assign Rider...</option>
                      {deliveryPartners.map(p => (
                        <option key={p.id || p.email} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f8f7fc', paddingTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#059669' }}>{fmtCurrency(order.totalAmount)}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{fmtDate(order.createdAt)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setSelectedOrder(order)} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShoppingBag size={12} /> Details
                      </button>
                      <button onClick={() => { setNoteOrderId(order.id); setPartnerNote(order.deliveryNotes || ''); setShowNoteModal(true) }} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={12} /> Note
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDeliveryOrders.length === 0 && (
                <EmptyIllustration type="delivery" title="No delivery orders found" subtitle="Active shipments and deliveries will be listed here." />
              )}
            </div>
          ) : (
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #ede9fe', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>Order #</th>
                    <th style={TH}>Customer & Contact</th>
                    <th style={TH}>Delivery Address</th>
                    <th style={TH}>Amount</th>
                    <th style={TH}>Status</th>
                    <th style={TH}>Assigned Partner</th>
                    <th style={TH}>Assign Action</th>
                    <th style={TH}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveryOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f8f7fc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={TD}>
                        <div style={{ fontWeight: '800', color: '#7c3aed', fontSize: '13px' }}>{order.orderNumber || order.id?.slice(0, 14)}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{fmtDate(order.createdAt)}</div>
                      </td>
                      <td style={TD}>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#1e1b4b' }}>{getOrderDisplayName(order)}</div>
                        {order.customerPhone && (
                          <a href={`tel:${order.customerPhone}`} style={{ fontSize: '11px', color: '#0284c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: '600' }}>
                            <Phone size={11} /> {order.customerPhone}
                          </a>
                        )}
                      </td>
                      <td style={{ ...TD, maxWidth: '200px', fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {typeof order.shippingAddress === 'string' ? order.shippingAddress : (order.deliveryAddress || '—')}
                      </td>
                      <td style={{ ...TD, fontWeight: '800', color: '#059669', fontSize: '14px' }}>{fmtCurrency(order.totalAmount)}</td>
                      <td style={TD}><StatusPill status={order.status} /></td>
                      <td style={TD}>
                        {order.deliveryPartnerName ? (
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Bike size={14} color="#7c3aed" />
                              <span>{order.deliveryPartnerName}</span>
                            </div>
                            {order.deliveryPartnerPhone && <div style={{ fontSize: '11px', color: '#64748b' }}>{order.deliveryPartnerPhone}</div>}
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: '12px', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={TD}>
                        <select
                          value={order.deliveryPartnerName || ''}
                          onChange={e => {
                            const p = deliveryPartners.find(x => x.name === e.target.value)
                            assignDeliveryPartner(order.id, p)
                          }}
                          disabled={updatingDeliveryId === order.id}
                          style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd6fe', background: '#fff', cursor: 'pointer', fontWeight: '700', color: '#1e1b4b', outline: 'none' }}>
                          <option value="">Assign Rider...</option>
                          {deliveryPartners.map(p => (
                            <option key={p.id || p.email} value={p.name}>{p.name} {p.phone ? `(${p.phone})` : ''}</option>
                          ))}
                        </select>
                      </td>
                      <td style={TD}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => setSelectedOrder(order)} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShoppingBag size={12} /> Details
                          </button>
                          <button onClick={() => { setNoteOrderId(order.id); setPartnerNote(order.deliveryNotes || ''); setShowNoteModal(true) }} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', color: '#7c3aed', cursor: 'pointer' }} title="Delivery Note">
                            <FileText size={12} />
                          </button>
                          {order.status !== 'Delivered' && (
                            <button
                              onClick={() => advanceDeliveryOrder(order, 'Delivered')}
                              disabled={updatingDeliveryId === order.id}
                              style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} strokeWidth={2.4} />
                              Deliver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDeliveryOrders.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '48px' }}>
                        <EmptyIllustration type="delivery" title="No delivery orders found" subtitle="Delivery manifests and runs will appear here once dispatched." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* View Mode 2: Registered Delivery Partners */}
        {deliveryViewMode === 'partners' && (
          isApp ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deliveryPartners.map(p => {
                const partnerDeliveries = orders.filter(o => 
                  (p.id && o.deliveryPartnerId && String(o.deliveryPartnerId) === String(p.id)) ||
                  (p.name && o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase() === p.name.toLowerCase()) ||
                  (p.phone && o.deliveryPartnerPhone && o.deliveryPartnerPhone === p.phone)
                )
                const pending = partnerDeliveries.filter(o => !/delivered|completed/i.test(o.status)).length
                return (
                  <div key={p.id || p.email} style={{ background: '#ffffff', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)', border: '1px solid #ede9fe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <Avatar name={p.name} avatar={p.avatar} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e1b4b' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{p.email}</div>
                        {p.phone && (
                          <a href={`tel:${p.phone}`} style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} /> {p.phone}
                          </a>
                        )}
                      </div>
                      <RoleBadge role="delivery_partner" />
                    </div>
                    {p.address && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#94a3b8" /> {p.address}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f8f7fc' }}>
                      <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '800' }}>
                        {pending} active runs · {partnerDeliveries.length} total
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => viewUserOrders(p)} style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShoppingBag size={12} /> View Runs
                        </button>
                        <button onClick={() => handleDeleteUser(p)} disabled={deletingUserId === (p.id || p.email || p.phone)}
                          style={{ background: '#fff5f5', color: '#dc2626', border: '1px solid #fed7d7', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Remove delivery partner">
                          <Trash2 size={11} strokeWidth={2.2} />
                          {deletingUserId === (p.id || p.email || p.phone) ? '...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {deliveryPartners.length === 0 && (
                <EmptyIllustration type="delivery" title="No delivery partners registered" subtitle="Add riders to dispatch deliveries smoothly." />
              )}
            </div>
          ) : (
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #ede9fe', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>Partner Name</th>
                    <th style={TH}>Phone</th>
                    <th style={TH}>Email</th>
                    <th style={TH}>Zone / Address</th>
                    <th style={TH}>Active Deliveries</th>
                    <th style={TH}>Completed Deliveries</th>
                    <th style={TH}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryPartners.map(p => {
                    const partnerDeliveries = orders.filter(o => 
                      (p.id && o.deliveryPartnerId && String(o.deliveryPartnerId) === String(p.id)) ||
                      (p.name && o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase() === p.name.toLowerCase()) ||
                      (p.phone && o.deliveryPartnerPhone && o.deliveryPartnerPhone === p.phone)
                    )
                    const activeCount = partnerDeliveries.filter(o => !/delivered|completed/i.test(o.status)).length
                    const completedCount = partnerDeliveries.filter(o => /delivered|completed/i.test(o.status)).length
                    return (
                      <tr key={p.id || p.email} style={{ borderBottom: '1px solid #f8f7fc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={TD}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Avatar name={p.name} avatar={p.avatar} size={38} />
                            <div>
                              <div style={{ fontWeight: '800', fontSize: '13px', color: '#1e1b4b' }}>{p.name}</div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>ID: {String(p.id || '').slice(0, 12)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...TD, fontWeight: '700' }}>
                          {p.phone ? (
                            <a href={`tel:${p.phone}`} style={{ color: '#0284c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} /> {p.phone}
                            </a>
                          ) : '—'}
                        </td>
                        <td style={TD}>{p.email || '—'}</td>
                        <td style={{ ...TD, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', color: '#64748b' }}>
                          {p.address || 'Standard Area'}
                        </td>
                        <td style={{ ...TD, fontWeight: '800', color: activeCount > 0 ? '#d97706' : '#64748b' }}>
                          {activeCount} active
                        </td>
                        <td style={{ ...TD, fontWeight: '800', color: '#059669' }}>
                          {completedCount} delivered
                        </td>
                        <td style={TD}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => viewUserOrders(p)} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShoppingBag size={12} /> View Runs
                            </button>
                            <button onClick={() => handleDeleteUser(p)} disabled={deletingUserId === (p.id || p.email)}
                              style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Trash2 size={12} />
                              {deletingUserId === (p.id || p.email) ? '...' : 'Remove'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {deliveryPartners.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '48px' }}>
                        <EmptyIllustration type="delivery" title="No delivery partners found" subtitle="Riders you add will be listed here." />
                        <button onClick={() => { setShowAddUser(true); setNewUser({ ...BLANK_USER, role: 'delivery_partner' }) }} style={{ color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '8px 16px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Plus size={15} strokeWidth={2.5} />
                          Add Delivery Partner
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // MODALS
  // ══════════════════════════════════════════════════════════════════════

  // ── Add Product Modal ────────────────────────────────────────────────
  const AddProductModal = () => (
    <Modal isOpen={showAddProduct} onClose={() => { setShowAddProduct(false); setNewProduct(BLANK_PRODUCT) }} title="Add New Product" width={640}>
      <form onSubmit={handleAddProduct}>
        <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
          <Field label="Product Name" required>
            <input required value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. Dolo 650 Tablet" />
          </Field>
          <Field label="Subtitle / Pack Info">
            <input value={newProduct.subtitle} onChange={e => setNewProduct(p => ({ ...p, subtitle: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. Strip of 15 tablets" />
          </Field>
          <Field label="Category" required>
            <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} style={{ ...INPUT_STYLE }}>
              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Brand">
            <input value={newProduct.brand} onChange={e => setNewProduct(p => ({ ...p, brand: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. Micro Labs" />
          </Field>
          <Field label="SKU / Item Code">
            <input value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. DOLO650-15" />
          </Field>
          <Field label="MRP (₹)" required>
            <input required type="number" min="0" step="0.01" value={newProduct.mrp} onChange={e => setNewProduct(p => ({ ...p, mrp: e.target.value }))} style={INPUT_STYLE} placeholder="0.00" />
          </Field>
          <Field label="Customer Price (₹)" hint="Leave blank to use MRP">
            <input type="number" min="0" step="0.01" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={INPUT_STYLE} placeholder="0.00" />
          </Field>
          <Field label="Retailer / B2B Price (₹)">
            <input type="number" min="0" step="0.01" value={newProduct.retailerPrice} onChange={e => setNewProduct(p => ({ ...p, retailerPrice: e.target.value }))} style={INPUT_STYLE} placeholder="0.00" />
          </Field>
          <Field label="Discount %" hint="Auto-calculated if empty">
            <input type="number" min="0" max="100" value={newProduct.discountPercent} onChange={e => setNewProduct(p => ({ ...p, discountPercent: e.target.value }))} style={INPUT_STYLE} placeholder="0" />
          </Field>
          <Field label="Stock Quantity">
            <input type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} style={INPUT_STYLE} placeholder="0" />
          </Field>
        </div>

        <Field label="Image URL">
          <input value={newProduct.imageUrl} onChange={e => setNewProduct(p => ({ ...p, imageUrl: e.target.value }))} style={INPUT_STYLE} placeholder="https://..." />
          {newProduct.imageUrl && <img src={newProduct.imageUrl} alt="preview" style={{ marginTop: '8px', width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} onError={e => e.target.style.display = 'none'} />}
        </Field>

        <Field label="Product Details / Description">
          <textarea value={newProduct.details} onChange={e => setNewProduct(p => ({ ...p, details: e.target.value }))} style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }} placeholder="Composition, uses, side effects, dosage..." />
        </Field>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button type="button" onClick={() => setNewProduct(p => ({ ...p, isListed: !p.isListed }))} style={TOGGLE_STYLE(newProduct.isListed, { bg: '#dcfce7', text: '#059669', border: '#bbf7d0' })}>
            <Check size={14} /> {newProduct.isListed ? 'Listed (Visible)' : 'Unlisted (Hidden)'}
          </button>
          <button type="button" onClick={() => setNewProduct(p => ({ ...p, isFlashSale: !p.isFlashSale }))} style={TOGGLE_STYLE(newProduct.isFlashSale, { bg: '#fef3c7', text: '#d97706', border: '#fde68a' })}>
            <Zap size={14} /> Flash Sale
          </button>
          <button type="button" onClick={() => setNewProduct(p => ({ ...p, isFeatured: !p.isFeatured }))} style={TOGGLE_STYLE(newProduct.isFeatured, { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' })}>
            <Star size={14} /> Featured
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #ede9fe' }}>
          <button type="button" onClick={() => { setShowAddProduct(false); setNewProduct(BLANK_PRODUCT) }} style={{ background: '#f8f7fc', color: '#64748b', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={addingProduct} style={{ background: addingProduct ? '#94a3b8' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '800', cursor: addingProduct ? 'not-allowed' : 'pointer', minWidth: '140px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={16} strokeWidth={2.5} />
            {addingProduct ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  )

  // ── Edit Product Modal ───────────────────────────────────────────────
  const EditProductModal = () => {
    if (!editProduct) return null
    return (
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title={`Edit: ${editProduct.name}`} width={640}>
        <form onSubmit={handleSaveEditProduct}>
          <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
            <Field label="Product Name" required>
              <input required value={editProduct.name} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))} style={INPUT_STYLE} />
            </Field>
            <Field label="Subtitle / Pack Info">
              <input value={editProduct.subtitle} onChange={e => setEditProduct(p => ({ ...p, subtitle: e.target.value }))} style={INPUT_STYLE} />
            </Field>
            <Field label="Category">
              <select value={editProduct.category} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))} style={{ ...INPUT_STYLE }}>
                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Brand">
              <input value={editProduct.brand} onChange={e => setEditProduct(p => ({ ...p, brand: e.target.value }))} style={INPUT_STYLE} />
            </Field>
            <Field label="MRP (₹)">
              <input type="number" min="0" step="0.01" value={editProduct.mrp} onChange={e => setEditProduct(p => ({ ...p, mrp: e.target.value }))} style={INPUT_STYLE} />
            </Field>
            <Field label="Customer Price (₹)">
              <input type="number" min="0" step="0.01" value={editProduct.price} onChange={e => setEditProduct(p => ({ ...p, price: e.target.value }))} style={INPUT_STYLE} />
            </Field>
            <Field label="Retailer Price (₹)">
              <input type="number" min="0" step="0.01" value={editProduct.retailerPrice} onChange={e => setEditProduct(p => ({ ...p, retailerPrice: e.target.value }))} style={INPUT_STYLE} />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" value={editProduct.stock} onChange={e => setEditProduct(p => ({ ...p, stock: e.target.value }))} style={INPUT_STYLE} />
            </Field>
          </div>

          <Field label="Image URL">
            <input value={editProduct.image || ''} onChange={e => setEditProduct(p => ({ ...p, image: e.target.value }))} style={INPUT_STYLE} placeholder="https://..." />
            {editProduct.image && <img src={editProduct.image} alt="preview" style={{ marginTop: '8px', width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} onError={e => e.target.style.display = 'none'} />}
          </Field>

          <Field label="Details / Description">
            <textarea value={editProduct.details || ''} onChange={e => setEditProduct(p => ({ ...p, details: e.target.value }))} style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }} />
          </Field>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button type="button" onClick={() => setEditProduct(p => ({ ...p, isListed: !p.isListed }))} style={TOGGLE_STYLE(editProduct.isListed, { bg: '#dcfce7', text: '#059669', border: '#bbf7d0' })}>
              <Check size={14} /> {editProduct.isListed ? 'Listed' : 'Unlisted'}
            </button>
            <button type="button" onClick={() => setEditProduct(p => ({ ...p, isFlashSale: !p.isFlashSale }))} style={TOGGLE_STYLE(editProduct.isFlashSale, { bg: '#fef3c7', text: '#d97706', border: '#fde68a' })}>
              <Zap size={14} /> Flash Sale
            </button>
            <button type="button" onClick={() => setEditProduct(p => ({ ...p, isFeatured: !p.isFeatured }))} style={TOGGLE_STYLE(editProduct.isFeatured, { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' })}>
              <Star size={14} /> Featured
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #ede9fe' }}>
            <button type="button" onClick={() => setEditProduct(null)} style={{ background: '#f8f7fc', color: '#64748b', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  // ── Order Detail Modal ───────────────────────────────────────────────
  const OrderDetailModal = () => {
    if (!selectedOrder) return null
    const o = selectedOrder
    const flow = STATUS_FLOW[o.status]
    return (
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${o.orderNumber || o.id?.slice(0, 12)}`} width={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={INFO_BOX}><div style={INFO_LBL}>Customer</div><div style={INFO_VAL}>{getOrderDisplayName(o)}</div></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Phone</div><div style={INFO_VAL}>{o.customerPhone || '—'}</div></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Amount</div><div style={{ ...INFO_VAL, color: '#059669', fontSize: '20px' }}>{fmtCurrency(o.totalAmount)}</div></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Payment</div><div style={INFO_VAL}>{o.paymentMethod} · {o.paymentStatus}</div></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Status</div><StatusPill status={o.status} /></div>
            <div style={INFO_BOX}><div style={INFO_LBL}>Date</div><div style={INFO_VAL}>{fmtDate(o.createdAt)}</div></div>
          </div>
          {o.shippingAddress && (
            <div style={INFO_BOX}><div style={INFO_LBL}>Delivery Address</div>
              <div style={INFO_VAL}>{typeof o.shippingAddress === 'string' ? o.shippingAddress : `${o.shippingAddress.line1 || o.shippingAddress.address || ''} ${o.shippingAddress.city || ''} ${o.shippingAddress.state || ''} ${o.shippingAddress.pincode || ''}`.trim()}</div>
            </div>
          )}
          {/* Delivery Partner assignment in Order Details */}
          <div style={{ ...INFO_BOX, background: '#f5f3ff', border: '1px solid #ede9fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ ...INFO_LBL, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bike size={13} color="#7c3aed" /> Delivery Partner
              </div>
              <div style={INFO_VAL}>
                {o.deliveryPartnerName ? `${o.deliveryPartnerName} ${o.deliveryPartnerPhone ? `(${o.deliveryPartnerPhone})` : ''}` : <span style={{ color: '#dc2626' }}>Not Assigned</span>}
              </div>
            </div>
            <select
              value={o.deliveryPartnerName || ''}
              onChange={e => {
                const p = deliveryPartners.find(x => x.name === e.target.value)
                assignDeliveryPartner(o.id, p)
              }}
              style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd6fe', background: '#fff', fontWeight: '600' }}>
              <option value="">-- Assign Rider --</option>
              {deliveryPartners.map(p => (
                <option key={p.id || p.email} value={p.name}>{p.name} {p.phone ? `(${p.phone})` : ''}</option>
              ))}
            </select>
          </div>
          {o.deliveryNotes && (
            <div style={{ ...INFO_BOX, background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ ...INFO_LBL, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={13} color="#d97706" /> Delivery Notes
              </div>
              <div style={{ fontSize: '13px', color: '#92400e' }}>{o.deliveryNotes}</div>
            </div>
          )}
          {o.items && o.items.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Items ({o.items.length})</div>
              {o.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8f7fc', fontSize: '13px' }}>
                  <div><div style={{ fontWeight: '700', color: '#1e1b4b' }}>{item.product_name || item.name}</div><div style={{ fontSize: '11px', color: '#64748b' }}>Qty: {item.quantity || 1}</div></div>
                  <div style={{ fontWeight: '700', color: '#059669' }}>{fmtCurrency((item.price || 0) * (item.quantity || 1))}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px' }}>
            <button onClick={() => { setNoteOrderId(o.id); setPartnerNote(o.deliveryNotes || ''); setShowNoteModal(true) }}
              style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Add / Edit Note
            </button>
            {flow && (
              <button onClick={() => { advanceOrderStatus(o.id, o.status); setSelectedOrder(prev => ({ ...prev, status: flow.next })) }}
                style={{ flex: 1, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ArrowRight size={15} /> {flow.label}
              </button>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  // ── Delivery Note Modal ──────────────────────────────────────────────
  const NoteModal = () => (
    <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Delivery Note" width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={partnerNote}
          onChange={e => setPartnerNote(e.target.value)}
          style={{ ...INPUT_STYLE, minHeight: '100px', resize: 'vertical' }}
          placeholder="e.g. Assigned to morning route, gate passcode #1234, left at front desk..."
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowNoteModal(false)} style={{ background: '#f8f7fc', color: '#64748b', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => saveDeliveryNote(noteOrderId)} disabled={updatingDeliveryId === noteOrderId} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={15} />
            {updatingDeliveryId === noteOrderId ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </Modal>
  )

  // ── User Orders Modal ────────────────────────────────────────────────
  const UserOrdersModal = () => (
    <Modal isOpen={!!selectedUser} onClose={() => { setSelectedUser(null); setUserOrders([]) }} title={`Orders — ${selectedUser?.name || 'User'}`} width={520}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
        <Avatar name={selectedUser?.name} avatar={selectedUser?.avatar} size={42} />
        <div>
          <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e1b4b' }}>{selectedUser?.name}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedUser?.email} · {selectedUser?.phone}</div>
          <RoleBadge role={selectedUser?.role} />
        </div>
      </div>
      {userOrders.length > 0 ? userOrders.map(o => (
        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8f7fc' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e1b4b' }}>{o.orderNumber || o.id?.slice(0, 16)}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{fmtDate(o.createdAt)} · {o.paymentMethod}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', color: '#059669' }}>{fmtCurrency(o.totalAmount)}</div>
            <StatusPill status={o.status} />
          </div>
        </div>
      )) : (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <EmptyIllustration type="orders" title="No orders found" subtitle="This user has not placed any orders yet." />
        </div>
      )}
    </Modal>
  )

  // ── Add User Modal ──────────────────────────────────────────────────
  const AddUserModal = () => (
    <Modal isOpen={showAddUser} onClose={() => { setShowAddUser(false); setNewUser(BLANK_USER) }} title="Add New User" width={560}>
      <form onSubmit={handleAddUser}>
        <div style={{ display: 'grid', gridTemplateColumns: isApp ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
          <Field label="Full Name" required>
            <input required value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. Ramesh Kumar" />
          </Field>
          <Field label="Role" required>
            <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))} style={{ ...INPUT_STYLE }}>
              <option value="customer">Customer</option>
              <option value="retailer">Retailer Partner</option>
              <option value="staff">Staff Member</option>
              <option value="delivery_partner">Delivery Partner</option>
              <option value="admin">Administrator</option>
            </select>
          </Field>
          <Field label="Email Address" hint={!newUser.phone ? "Required if phone is blank" : ""}>
            <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. user@example.com" />
          </Field>
          <Field label="Phone Number" hint={!newUser.email ? "Required if email is blank" : ""}>
            <input type="tel" value={newUser.phone} onChange={e => setNewUser(u => ({ ...u, phone: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. +91 9876543210" />
          </Field>
        </div>

        {newUser.role === 'retailer' && (
          <Field label="Shop / Store Name" required={newUser.role === 'retailer'}>
            <input value={newUser.shopName} onChange={e => setNewUser(u => ({ ...u, shopName: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. Maa Tara Medical Hall" />
          </Field>
        )}

        <Field label="Address / Location">
          <textarea value={newUser.address} onChange={e => setNewUser(u => ({ ...u, address: e.target.value }))} style={{ ...INPUT_STYLE, minHeight: '60px', resize: 'vertical' }} placeholder="Street address, city, pin code..." />
        </Field>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #ede9fe' }}>
          <button type="button" onClick={() => { setShowAddUser(false); setNewUser(BLANK_USER) }} style={{ background: '#f8f7fc', color: '#64748b', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={addingUser} style={{ background: addingUser ? '#94a3b8' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '800', cursor: addingUser ? 'not-allowed' : 'pointer', minWidth: '130px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={16} strokeWidth={2.5} />
            {addingUser ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )

  // ── Loading Screen ───────────────────────────────────────────────────
  if (loading && products.length === 0 && orders.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f7fc', gap: '20px' }}>
        <div className="loading-shield-container">
          <div className="loading-shield-glow" />
          <div className="loading-shield-badge">
            <Shield size={38} strokeWidth={2.2} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#1e1b4b', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '4px' }}>SubhOne Admin</div>
          <div style={{ color: '#7c3aed', fontSize: '13px', fontWeight: '600' }}>Syncing database catalog & orders...</div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // LAYOUTS
  // ══════════════════════════════════════════════════════════════════════

  // ── Mobile ───────────────────────────────────────────────────────────
  if (isApp) {
    const CurrentTabIcon = mobileTabs.find(t => t.id === activeTab)?.icon
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8f7fc', paddingBottom: '60px' }}>
        <AdminMobileHeader title={panelTitle} badge={panelBadge} onLogout={onLogout} lastSync={lastSync} />
        <div style={{ background: '#fff', padding: '8px 14px', borderBottom: '1px solid #ede9fe', fontSize: '13px', fontWeight: '700', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px' }}>
          {CurrentTabIcon && <CurrentTabIcon size={16} strokeWidth={2.4} color="#7c3aed" />}
          <span>{tabLabel()}</span>
          {loading && <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#7c3aed', fontWeight: '600' }}>Syncing...</span>}
        </div>
        <main style={{ flex: 1 }}>
          {activeTab === 'overview'  && renderOverview()}
          {activeTab === 'orders'    && renderOrders()}
          {activeTab === 'products'  && renderProducts()}
          {activeTab === 'users'     && renderUsers()}
          {activeTab === 'retailers' && renderRetailers()}
          {activeTab === 'delivery'  && renderDelivery()}
        </main>
        <AdminBottomNav activeTab={activeTab} setActiveTab={setActiveTab} tabs={mobileTabs} />
        <Toast message={toast} type={toastType} />
        <AddProductModal />
        <EditProductModal />
        <OrderDetailModal />
        <UserOrdersModal />
        <AddUserModal />
        <NoteModal />
      </div>
    )
  }

  // ── Desktop ──────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">{panelTitle}</div>
        <nav className="admin-nav">
          {adminTabs.map(tab => {
            const TabIcon = tab.icon
            return (
              <button key={tab.id} className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                <span>{TabIcon ? <TabIcon size={18} strokeWidth={2.2} /> : null}</span>
                <span>
                  {tab.id === 'overview'  && 'Dashboard'}
                  {tab.id === 'orders'    && `Orders (${orders.length})`}
                  {tab.id === 'products'  && `Products (${products.length})`}
                  {tab.id === 'users'     && `Users (${users.length})`}
                  {tab.id === 'retailers' && `Retailers (${retailers.length})`}
                  {tab.id === 'delivery'  && `Delivery (${deliveryPartners.length})`}
                </span>
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '14px 20px', fontSize: '11px', color: '#7c3aed', borderTop: '1px solid #ede9fe', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
          <Activity size={12} color="#10b981" />
          <span>{lastSync ? `Synced ${lastSync}` : 'Connecting...'}</span>
        </div>
        <button className="admin-logout-btn" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <LogOut size={14} /> Logout Securely
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{tabLabel()}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loading && <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '600' }}>Syncing...</span>}
            {activeTab === 'products' && (
              <button onClick={() => { setShowAddProduct(true); setNewProduct(BLANK_PRODUCT) }}
                style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}>
                <Plus size={15} strokeWidth={2.5} /> Add Product
              </button>
            )}
            {activeTab === 'users' && (
              <button onClick={() => { setShowAddUser(true); setNewUser(BLANK_USER) }}
                style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}>
                <Plus size={15} strokeWidth={2.5} /> Add User
              </button>
            )}
            <button onClick={loadAll} style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <div className="admin-user-badge">{panelBadge} · {user?.name || 'Admin'}</div>
          </div>
        </header>

        <div className="admin-content" style={{ padding: 0 }}>
          {activeTab === 'overview'  && renderOverview()}
          {activeTab === 'orders'    && renderOrders()}
          {activeTab === 'products'  && renderProducts()}
          {activeTab === 'users'     && renderUsers()}
          {activeTab === 'retailers' && renderRetailers()}
          {activeTab === 'delivery'  && renderDelivery()}
        </div>
      </main>

      <Toast message={toast} type={toastType} />
      <AddProductModal />
      <EditProductModal />
      <OrderDetailModal />
      <UserOrdersModal />
      <AddUserModal />
      <NoteModal />
    </div>
  )
}
