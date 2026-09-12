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
import AccountProfileView from '../components/Account/AccountProfileView'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import DeliveryLocationModal from '../components/Location/DeliveryLocationModal'
import AdminDashboard from './AdminDashboard'
import '../styles/app.css'

export function AppInterface() {
  const [activeTab, setActiveTab] = useState('home')
  const [activeFooterPage, setActiveFooterPage] = useState(null)
  const { location, detectLocation, selectAddress } = useCurrentLocation()
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('subhone_app_cart')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  // Synchronize cartItems with localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('subhone_app_cart', JSON.stringify(cartItems))
    } catch (e) {}
  }, [cartItems])

  const [orders, setOrders] = useState([])

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
    syncUserProfile()
  }, [])

  // Automatically fetch user orders whenever user logs in or switches to order tab
  useEffect(() => {
    loadOrders(user)
  }, [user?.id, user?.email, user?.phone, activeTab])

  async function loadOrders(currentUser = user) {
    try {
      const userParam = currentUser 
        ? { id: currentUser.id, email: currentUser.email, phone: currentUser.phone }
        : null
      const dbOrders = await api.getOrders(userParam)
      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders.map(o => {
          const rawDate = o.createdAt || o.created_at
          const formattedDate = rawDate 
            ? new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Today'

          const totalVal = Number(o.totalAmount || o.total_amount || o.total || 0)
          const itemsCount = o.itemsCount || (o.items ? o.items.length : 1)
          const orderNum = o.orderNumber || o.order_number || o.id

          return {
            id: orderNum,
            dbId: o.id,
            date: formattedDate,
            itemsCount,
            itemsSummary: o.itemsSummary || 'Healthcare essentials',
            total: totalVal,
            status: o.status === 'CONFIRMED' ? 'Order Confirmed • Packing' : (o.status || 'Out for Delivery'),
            driverName: o.driverName || 'SubhOne Fleet Dispatch',
            eta: o.eta || '10 mins',
            items: o.items || []
          }
        }))
      }
    } catch (errOrders) {
      console.warn('Orders database load in app:', errOrders)
    }
  }

  async function syncUserProfile() {
    try {
      const queryKey = user?.email || user?.phone || user?.id
      if (queryKey) {
        const dbProfile = await api.getUserProfile(queryKey)
        if (dbProfile) {
          const updated = { ...user, ...dbProfile }
          setUser(updated)
          localStorage.setItem('subhone_auth_user', JSON.stringify(updated))
        }
      }
    } catch (e) {
      console.warn('App user profile sync note:', e)
    }
  }

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

      await loadOrders(user)
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

  // Full-screen Auth Page for Mobile App
  if (activeTab === 'login' || activeTab === 'signup') {
    return (
      <AuthPage
        initialMode={activeTab === 'signup' ? 'signup' : 'login'}
        isApp={true}
        onSuccess={(u) => {
          setUser(u)
          if (u.role === 'admin') {
            setActiveTab('admin')
          } else {
            setActiveTab('home')
          }
          showToast(`Welcome back, ${u.name}!`)
        }}
        onClose={() => setActiveTab('home')}
      />
    )
  }

  if (activeTab === 'admin') {
    return (
      <AdminDashboard 
        onLogout={() => {
          handleLogout()
          setActiveTab('home')
        }} 
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
        onOpenLocation={() => setIsLocationModalOpen(true)}
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

                    {order.itemsSummary && (
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', margin: '6px 0 2px' }}>
                        💊 {order.itemsSummary}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', fontSize: '13px' }}>
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
                        <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700' }}>
                          ✓ Confirmed
                        </span>
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
            <div className="app-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>Retailer Wholesale Cart</h2>
                <p>Review items, GST invoicing and confirm wholesale delivery</p>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCartItems([])
                    try { localStorage.removeItem('subhone_app_cart') } catch (e) {}
                    showToast('Cart cleared')
                  }}
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Clear Cart
                </button>
              )}
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

                      {/* Delivery Destination Address Row */}
                      <div 
                        onClick={() => setIsLocationModalOpen(true)}
                        style={{
                          background: '#f8fafc',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          marginTop: '14px',
                          marginBottom: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>📍</span>
                          <div>
                            <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Delivery Address</span>
                            <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>
                              {location?.shortName || location?.address || 'Select Delivery Location'}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#2563eb' }}>Change ▾</span>
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
            {user ? (
              <AccountProfileView
                user={user}
                onUpdateUser={(updated) => setUser(updated)}
                onLogout={handleLogout}
                showToast={showToast}
              />
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

      {/* Delivery Address & Location Modal (Powered by Google Maps & GPS) */}
      <DeliveryLocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        location={location}
        detectLocation={detectLocation}
        onSelectAddress={(addr) => {
          if (selectAddress) selectAddress(addr)
          showToast(`Delivery location set to: ${addr.line1 || addr.shortName || addr.city}`)
        }}
        user={user}
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
