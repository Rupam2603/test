import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { APP_DEALS_PRODUCTS } from '../data/appCatalog'
import AppHeader from '../components/App/AppHeader'
import AppCategorySection from '../components/App/AppCategorySection'
import AppWholesaleBanner from '../components/App/AppWholesaleBanner'
import AppProductCard from '../components/App/AppProductCard'
import AppServiceCard from '../components/App/AppServiceCard'
import AppBottomNav from '../components/App/AppBottomNav'
import AppFooterModal from '../components/App/AppFooterModal'
import AuthPage from '../components/Auth/AuthPage'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import LiveOrderTrackerModal from '../components/Tracking/LiveOrderTrackerModal'
import '../styles/app.css'

export function AppInterface() {
  const [activeTab, setActiveTab] = useState('home')
  const [activeFooterPage, setActiveFooterPage] = useState(null)
  const { location } = useCurrentLocation()
  const [isTrackerOpen, setIsTrackerOpen] = useState(false)
  const [cartItems, setCartItems] = useState([
    {
      id: 'c48e3a34-f6f0-412b-8493-ce3e07133bfb',
      numericId: 1,
      name: 'Volini Pain Relief Gel 15g',
      pack: 'Fast Pain Relief Gel',
      price: 11,
      mrp: 15,
      qty: 2,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'
    },
    {
      id: '26f7c1c5-7ac6-40ef-b5ab-fb51bc4af999',
      numericId: 2,
      name: 'Amrutanjan Strong Pain Balm 44g',
      pack: 'Headache & Back Pain',
      price: 36,
      mrp: 44,
      qty: 1,
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80'
    }
  ])

  const [orders, setOrders] = useState([
    {
      id: 'SUBH-8921',
      date: 'Today, 02:45 PM',
      itemsCount: 3,
      total: 412,
      status: 'Out for 30-min Delivery',
      driverName: 'Suman Roy (SubhOne Fleet)',
      eta: '12 mins'
    },
    {
      id: 'SUBH-7640',
      date: '08 Sep 2026',
      itemsCount: 1,
      total: 999,
      status: 'Delivered',
      driverName: 'Express Courier',
      eta: 'Completed'
    }
  ])

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0)
  const [products, setProducts] = useState(APP_DEALS_PRODUCTS)
  const [services, setServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [toastMessage, setToastMessage] = useState(null)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('subhone_auth_user') || 'null')
    } catch (e) {
      return null
    }
  })

  const [dbStatus, setDbStatus] = useState({ connected: false, branch: 'vercel-dev' })

  useEffect(() => {
    loadCatalog()
    checkConnection()
  }, [])

  async function loadCatalog() {
    try {
      const [prodData, servData] = await Promise.all([
        api.getProducts(),
        api.getServices()
      ])
      if (prodData && prodData.length > 0) {
        setProducts(prodData.filter(p => p.is_listed !== false && p.isListed !== false))
      }
      if (servData && servData.length > 0) {
        setServices(servData)
      }

      // Fetch real database orders
      try {
        const dbOrders = await api.getOrders(user?.id)
        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders.map(o => ({
            id: o.id,
            date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today',
            itemsCount: o.items ? o.items.length : 1,
            total: o.total_amount || 0,
            status: o.status === 'CONFIRMED' ? 'Order Confirmed • Packing' : (o.status || 'Out for Delivery'),
            driverName: 'SubhOne Fleet Dispatch',
            eta: '10 mins'
          })))
        }
      } catch (errOrders) {
        console.warn('Orders database load in app:', errOrders)
      }
    } catch (err) {
      console.warn('Error loading catalog data from backend:', err)
    }
  }

  async function checkConnection() {
    const health = await api.checkHealth()
    setDbStatus(health)
  }

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => String(i.id) === String(product.id) || (product.numericId && i.numericId === product.numericId))
      if (existing) {
        return prev.map(i => (String(i.id) === String(product.id) || (product.numericId && i.numericId === product.numericId))
          ? { ...i, qty: i.qty + 1 }
          : i
        )
      }
      return [...prev, {
        id: product.id,
        numericId: product.numericId,
        name: product.name,
        pack: product.pack || product.subtitle || product.details || 'Pack',
        price: product.price,
        mrp: product.mrp || product.price,
        qty: 1,
        image: product.image
      }]
    })
    showToast(`Added ${product.name} to cart`)
  }

  const handleUpdateQty = (id, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (String(item.id) === String(id) || (item.numericId && String(item.numericId) === String(id))) {
          const newQty = item.qty + delta
          return newQty > 0 ? { ...item, qty: newQty } : null
        }
        return item
      }).filter(Boolean)
    })
  }

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return
    const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0)
    const gst = Math.round(subtotal * 0.12)
    const finalTotal = subtotal + gst

    try {
      const orderPayload = {
        userId: user?.id || null,
        totalAmount: finalTotal,
        itemsCount: cartCount,
        deliveryAddress: location?.address || 'Retailer Hub, Kolkata, West Bengal 700001',
        recipientName: user?.name || 'Retailer Pharmacy',
        recipientPhone: user?.phone || '9876543210',
        items: cartItems.map(i => ({
          productId: (typeof i.id === 'string' && i.id.length > 20) ? i.id : null,
          name: i.name,
          price: i.price,
          quantity: i.qty
        }))
      }

      const res = await api.createOrder(orderPayload)
      const placedId = res?.order?.id || ('SUBH-' + Math.floor(1000 + Math.random() * 9000))
      
      const newOrder = {
        id: placedId,
        date: 'Just now',
        itemsCount: cartCount,
        total: finalTotal,
        status: 'Order Confirmed • Packing',
        driverName: 'SubhOne Fleet Dispatch',
        eta: '10 mins'
      }
      setOrders(prev => [newOrder, ...prev])
      setCartItems([])
      showToast(`Wholesale Order #${placedId} placed & saved in database!`)
      setActiveTab('order')
    } catch (err) {
      console.error('App order failed:', err)
      showToast('Order failed: ' + (err.message || 'Server error'))
    }
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2200)
  }

  const handleLogout = () => {
    localStorage.removeItem('subhone_auth_user')
    setUser(null)
    showToast('Logged out from SubhOne')
  }

  const filteredProducts = products.filter(p => {
    // Strictly exclude unlisted products
    if (p.is_listed === false || p.isListed === false) return false

    const matchSearch = !searchQuery || 
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchCategory = selectedCategory === 'all' || 
                          (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()))

    return matchSearch && matchCategory
  })

  // Full-screen Auth Page for Mobile App (No Admin/Staff portal permitted in App)
  if (activeTab === 'login' || activeTab === 'signup') {
    return (
      <AuthPage
        initialMode={activeTab === 'signup' ? 'signup' : 'login'}
        isApp={true}
        onSuccess={(u) => {
          setUser(u)
          setActiveTab('home')
          showToast(`Welcome back, ${u.name}!`)
        }}
        onClose={() => setActiveTab('home')}
      />
    )
  }

  return (
    <div className="app-interface">
      {/* App Header with Logo, Search, Deliver To, Cart, Logout */}
      <AppHeader 
        user={user}
        onLogout={handleLogout}
        onTabChange={setActiveTab} 
        onSearch={setSearchQuery} 
        cartCount={cartCount} 
        location={location}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      <main className="app-main-content">
        {activeTab === 'home' && (
          <div className="app-home-view-container">
            {/* Quick Filter Strip & Visual Category Cards (Image 1 & Image 2) */}
            <AppCategorySection onSelectCategory={(catId) => {
              setSelectedCategory(catId)
              setActiveTab('products')
            }} />

            {/* B2B Wholesale Pharmacy Hero Banner (Image 1) */}
            <AppWholesaleBanner 
              onExplore={() => setActiveTab('products')} 
              onCatalog={() => setActiveFooterPage('license')} 
            />

            {/* Deals of the Day (Image 2) */}
            <section className="app-deals-section">
              <div className="app-deals-header-row">
                <h2 className="app-deals-title">Deals of the Day</h2>
                <button 
                  className="app-deals-view-all-link"
                  onClick={() => setActiveTab('products')}
                >
                  View All →
                </button>
              </div>

              <div className="app-deals-two-col-grid">
                {filteredProducts.map(product => (
                  <AppProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart} 
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {(activeTab === 'category' || activeTab === 'products') && (
          <section className="app-tab-section">
            <div className="app-tab-header">
              <h2>Medicine Categories</h2>
              <p>Explore authentic medicine batches sorted by therapeutic category.</p>
            </div>
            
            {/* Visual Category Picker / Filter */}
            <AppCategorySection onSelectCategory={(catId) => {
              setSelectedCategory(catId)
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                {selectedCategory === 'all' ? 'All Medicines' : `Category: ${selectedCategory.toUpperCase()}`} ({filteredProducts.length})
              </span>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{ background: 'none', border: 'none', color: '#166534', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Clear Filter ✕
                </button>
              )}
            </div>

            <div className="app-deals-two-col-grid">
              {filteredProducts.map(product => (
                <AppProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'order' || activeTab === 'bookings') && (
          <section className="app-tab-section">
            <div className="app-tab-header">
              <h2>My Wholesale Orders</h2>
              <p>Track dispatch, courier delivery & invoice histories</p>
            </div>

            {orders.length === 0 ? (
              <div className="app-empty-bookings-card">
                <span className="app-empty-calendar-icon">📦</span>
                <h3>No Recent Orders</h3>
                <p>Your wholesale medicine shipments and dispatch tracking will appear here.</p>
                <button 
                  className="app-hero-orange-btn" 
                  onClick={() => setActiveTab('category')}
                >
                  Order Medicines Now
                </button>
              </div>
            ) : (
              <div className="app-orders-list">
                {orders.map(order => (
                  <div key={order.id} className="app-order-card">
                    <div className="app-order-card-header">
                      <div>
                        <div className="app-order-num">{order.id}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{order.date}</div>
                      </div>
                      <span className={`app-order-status-pill ${order.status.includes('Delivery') || order.status.includes('Packing') ? 'transit' : ''}`}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0', fontSize: '13px' }}>
                      <span style={{ color: '#475569' }}>
                        📦 {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </span>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                        ₹{order.total.toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🚚 {order.driverName}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', color: '#166534' }}>ETA: {order.eta}</span>
                        <button 
                          type="button" 
                          onClick={() => setIsTrackerOpen(true)}
                          style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Track 📍
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'cart' && (
          <section className="app-tab-section">
            <div className="app-tab-header">
              <h2>Retailer Wholesale Cart</h2>
              <p>Review items, GST invoicing and confirm wholesale delivery</p>
            </div>

            {cartItems.length === 0 ? (
              <div className="app-empty-bookings-card">
                <span className="app-empty-calendar-icon">🛒</span>
                <h3>Your Cart is Empty</h3>
                <p>Add authentic medicine batches with distributor discounts to your wholesale order.</p>
                <button 
                  className="app-hero-orange-btn" 
                  onClick={() => setActiveTab('category')}
                >
                  Explore Categories
                </button>
              </div>
            ) : (
              <div className="app-cart-view-container">
                <div className="app-cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cartItems.map(item => (
                    <div key={item.id || item.numericId} className="app-cart-card">
                      <div className="app-cart-img-box">
                        <img src={item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'} alt={item.name} />
                      </div>
                      <div className="app-cart-info">
                        <h4 className="app-cart-title">{item.name}</h4>
                        <p className="app-cart-pack">{item.pack}</p>
                        <div className="app-cart-pricing">
                          <span className="app-cart-price">₹{item.price}</span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="app-cart-mrp">₹{item.mrp}</span>
                          )}
                        </div>
                      </div>
                      <div className="app-cart-qty-ctrls">
                        <button 
                          className="app-cart-qty-btn" 
                          onClick={() => handleUpdateQty(item.id || item.numericId, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="app-cart-qty-val">{item.qty}</span>
                        <button 
                          className="app-cart-qty-btn" 
                          onClick={() => handleUpdateQty(item.id || item.numericId, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Breakdown */}
                {(() => {
                  const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0)
                  const mrpTotal = cartItems.reduce((acc, i) => acc + ((i.mrp || i.price) * i.qty), 0)
                  const retailerMarginSavings = Math.max(0, mrpTotal - subtotal)
                  const gst = Math.round(subtotal * 0.12)
                  const finalTotal = subtotal + gst

                  return (
                    <div className="app-cart-bill-card">
                      <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Wholesale Price Summary</h4>
                      <div className="app-bill-row">
                        <span>Items Subtotal ({cartCount} units)</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="app-bill-row" style={{ color: '#166534', fontWeight: '600' }}>
                        <span>Retailer Margin Discount</span>
                        <span>−₹{retailerMarginSavings.toLocaleString()}</span>
                      </div>
                      <div className="app-bill-row">
                        <span>Wholesale GST (12% input tax credit)</span>
                        <span>+₹{gst.toLocaleString()}</span>
                      </div>
                      <div className="app-bill-row">
                        <span>Express 30-min Fleet Delivery</span>
                        <span style={{ color: '#166534', fontWeight: '700' }}>FREE</span>
                      </div>
                      <div className="app-bill-row total">
                        <span>Total Payable</span>
                        <span style={{ color: '#166534' }}>₹{finalTotal.toLocaleString()}</span>
                      </div>

                      <div className="app-checkout-sticky-bar">
                        <button
                          className="app-hero-orange-btn"
                          style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '800' }}
                          onClick={handlePlaceOrder}
                        >
                          Place Wholesale Order (₹{finalTotal.toLocaleString()}) →
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </section>
        )}

        {(activeTab === 'account' || activeTab === 'profile') && (
          <section className="app-tab-section">
            <div className="app-tab-header">
              <h2>Wholesale Account & Verification</h2>
            </div>
            {user ? (
              <>
                <div className="app-account-summary-card">
                  <div className="app-user-avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="app-account-meta">
                    <h3>{user.name} ({user.shopName || 'Verified Retailer'})</h3>
                    <p>{user.email} {user.phone ? `• ${user.phone}` : ''}</p>
                    <div className="app-account-badges-row">
                      <span className="app-verified-badge">✓ {user.status === 'PENDING_APPROVAL' ? 'Approval Pending' : 'Wholesale Verified'}</span>
                      <span className="app-verified-badge">🏛️ Direct Distributor Access</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', margin: '8px 0 14px' }}>
                  <button
                    className="app-catalog-white-btn"
                    style={{ flex: 1, height: '38px', fontSize: '12.5px', color: '#ef4444', borderColor: '#fca5a5' }}
                    onClick={handleLogout}
                  >
                    🚪 Logout ({user.name})
                  </button>
                </div>
              </>
            ) : (
              <div className="app-account-summary-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
                  <div className="app-user-avatar-lg" style={{ background: '#eff6ff', color: '#2563eb' }}>👤</div>
                  <div className="app-account-meta">
                    <h3 style={{ margin: 0 }}>Guest Retailer</h3>
                    <p style={{ margin: '2px 0 0' }}>Sign in to view wholesale margins & order medicine batches</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', width: '100%' }}>
                  <button 
                    className="app-hero-orange-btn" 
                    style={{ flex: 1, height: '42px', fontSize: '13px', background: '#2563eb' }}
                    onClick={() => setActiveTab('login')}
                  >
                    Sign In to App
                  </button>
                  <button 
                    className="app-catalog-white-btn" 
                    style={{ flex: 1, height: '42px', fontSize: '13px' }}
                    onClick={() => setActiveTab('signup')}
                  >
                    Register Retailer
                  </button>
                </div>
              </div>
            )}

            <div className="app-account-quick-links">
              <div className="app-account-link-item" onClick={() => setActiveFooterPage('license')}>
                <span>🏛️ Wholesale Pharmacy License & FSSAI</span>
                <span>›</span>
              </div>
              <div className="app-account-link-item" onClick={() => setActiveFooterPage('about')}>
                <span>ℹ️ About Subhone Health Group</span>
                <span>›</span>
              </div>
              <div className="app-account-link-item" onClick={() => setActiveFooterPage('terms')}>
                <span>📜 Wholesale Terms & Conditions</span>
                <span>›</span>
              </div>
              <div className="app-account-link-item" onClick={() => setActiveFooterPage('returns')}>
                <span>🔄 Return & Replacement Policy</span>
                <span>›</span>
              </div>
              <div className="app-account-link-item" onClick={() => setActiveFooterPage('privacy')}>
                <span>🔒 Privacy & Data Protection</span>
                <span>›</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Clickable Fixed Bottom Navigation Bar */}
      <AppBottomNav activeTab={activeTab} onTabChange={setActiveTab} cartCount={cartCount} />

      {/* Modal Page Viewer for Footer/Legal Links */}
      {activeFooterPage && (
        <AppFooterModal 
          pageKey={activeFooterPage} 
          onClose={() => setActiveFooterPage(null)} 
        />
      )}

      {/* 10-Minute Rapid Live Delivery Tracker Modal */}
      <LiveOrderTrackerModal 
        isOpen={isTrackerOpen} 
        onClose={() => setIsTrackerOpen(false)} 
        userLocation={location} 
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="app-toast-alert">
          <span>✓ {toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default AppInterface
