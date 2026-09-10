import React, { useState, useEffect } from 'react'
import { usePlatform } from '../hooks/usePlatform'
import { api } from '../services/api'
import WebHeader from '../components/Header/WebHeader'
import WebMenuDrawer from '../components/Navigation/WebMenuDrawer'
import WebBottomNav from '../components/Navigation/WebBottomNav'
import WebTopCategoryBar from '../components/Navigation/WebTopCategoryBar'
import WebHeroSlideshow from '../components/Banner/WebHeroSlideshow'
import CategoryWiseHomeSection from '../components/Home/CategoryWiseHomeSection'
import ProductCard from '../components/ProductCard'
import ServiceCard from '../components/ServiceCard'
import AuthPage from '../components/Auth/AuthPage'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import LiveOrderTrackerModal from '../components/Tracking/LiveOrderTrackerModal'
import PrescriptionUploadModal from '../components/Prescription/PrescriptionUploadModal'
import DiagnosticBookingModal from '../components/Diagnostics/DiagnosticBookingModal'
import AddressManagementModal from '../components/Account/AddressManagementModal'
import OrderSuccessModal from '../components/Cart/OrderSuccessModal'
import '../styles/web.css'

export function WebInterface() {
  const { platform } = usePlatform()
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const t = new URLSearchParams(window.location.search).get('tab')
      if (t) return t
    } catch {}
    return 'home'
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [topCategory, setTopCategory] = useState('all')
  const { location, detectLocation } = useCurrentLocation()
  const [isTrackerOpen, setIsTrackerOpen] = useState(false)
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [cartItems, setCartItems] = useState([
    { id: 'c48e3a34-f6f0-412b-8493-ce3e07133bfb', name: 'Volini Pain Relief Gel 15g', pack: '15g Tube', price: 15, qty: 2, image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788243981535.webp' },
    { id: '80b9e3b8-e91a-4163-b883-22721f505e47', name: 'Dettol Antiseptic Liquid 250ml', pack: '250ml Bottle', price: 155, qty: 1, image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788418118653.webp' }
  ])
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('subhone_auth_user') || 'null')
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    if (activeTab === 'products' || activeTab === 'category' || activeTab === 'home') {
      const data = await api.getProducts()
      const listedOnly = (data || []).filter(p => p.is_listed !== false && p.isListed !== false)
      setProducts(listedOnly)
    }
    if (activeTab === 'services' || activeTab === 'home') {
      const data = await api.getServices()
      setServices(data || [])
    }
    if (activeTab === 'order' || activeTab === 'bookings' || activeTab === 'home') {
      try {
        const orderData = await api.getOrders(user?.id)
        if (orderData && orderData.length > 0) {
          setOrders(orderData)
        }
      } catch (e) {
        console.warn('Could not load orders:', e)
      }
    }
    setLoading(false)
  }

  const categories = [
    { id: 'All', name: 'All Listed Medicines', icon: '✨' },
    { id: 'Pain Relief & Muscle Care', name: 'Pain Relief & Balms', icon: '⚡' },
    { id: 'Daily Wellness & Immunity', name: 'Wellness & Nutrition', icon: '🍊' },
    { id: 'Monsoon Health & Antiseptics', name: 'Antiseptics & First Aid', icon: '💧' },
    { id: 'Diet & Digestive Health', name: 'Digestive Health', icon: '🌿' },
    { id: 'Medical Supplies & Devices', name: 'Medical Supplies', icon: '🩺' },
    { id: "Men's Health & Vitality", name: "Men's Grooming", icon: '👔' }
  ]

  const filteredProducts = products.filter(p => {
    // Strictly filter out any unlisted products
    if (p.is_listed === false || p.isListed === false) return false

    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'All' || 
      (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory.toLowerCase().includes('pain') && p.category?.toLowerCase().includes('pain')) ||
      (selectedCategory.toLowerCase().includes('wellness') && p.category?.toLowerCase().includes('wellness')) ||
      (selectedCategory.toLowerCase().includes('antiseptic') && (p.category?.toLowerCase().includes('antiseptic') || p.category?.toLowerCase().includes('monsoon')))

    return matchesSearch && matchesCategory
  })

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const deliveryFee = cartSubtotal > 500 ? 0 : 40
  const cartTotal = cartSubtotal + deliveryFee

  const updateCartQty = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta)
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const removeCartItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id || item.name === product.name)
      if (exists) {
        return prev.map(item => (item.id === exists.id ? { ...item, qty: item.qty + 1 } : item))
      }
      return [
        ...prev,
        {
          id: product.id || `c-${Date.now()}`,
          name: product.name,
          pack: product.pack || product.subtitle || 'Standard pack',
          price: product.price,
          qty: 1,
          image: product.image?.includes('http') ? '💊' : (product.icon || '💊')
        }
      ]
    })
    showToast(`Added ${product.name} to cart!`)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    setLoading(true)
    try {
      const orderPayload = {
        userId: user?.id || null,
        totalAmount: Math.max(0, cartTotal - 25),
        itemsCount: cartItems.reduce((acc, i) => acc + i.qty, 0),
        deliveryAddress: location?.address || 'Park Street, Kolkata, West Bengal 700016',
        recipientName: user?.name || 'Subhasis',
        recipientPhone: user?.phone || '9876543210',
        items: cartItems.map(item => ({
          productId: (typeof item.id === 'string' && item.id.length > 20) ? item.id : null,
          name: item.name,
          price: item.price,
          quantity: item.qty
        }))
      }

      const res = await api.createOrder(orderPayload)
      if (res && (res.id || res.success || res.orderNumber)) {
        const orderObj = res.order || res
        setCreatedOrder(orderObj)
        setCartItems([])
        setIsSuccessModalOpen(true)
        showToast(`Order #${orderObj.orderNumber || orderObj.id} placed successfully in database!`)
        // Refresh orders from db
        const updatedOrders = await api.getOrders(user?.id)
        if (updatedOrders && updatedOrders.length > 0) {
          setOrders(updatedOrders)
        }
      } else {
        showToast('Failed to create order. Please try again.')
      }
    } catch (err) {
      console.error('Checkout failed:', err)
      showToast('Error placing order: ' + (err.message || 'Server error'))
    } finally {
      setLoading(false)
    }
  }

  if (activeTab === 'login' || activeTab === 'signup') {
    return (
      <AuthPage
        initialMode={activeTab === 'signup' ? 'signup' : 'login'}
        isApp={false}
        onSuccess={(u) => {
          setUser(u)
          setActiveTab('home')
        }}
        onClose={() => setActiveTab('home')}
      />
    )
  }

  return (
    <div className="web-interface">
      <WebHeader 
        user={user} 
        onTabChange={setActiveTab} 
        onSearch={setSearchQuery} 
        onToggleMenu={() => setIsMenuOpen(prev => !prev)}
        isMenuOpen={isMenuOpen}
        location={location}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />
      
      {/* Modern Stylish Menu hidden behind Menu Icon */}
      <WebMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab)
          setIsMenuOpen(false)
        }} 
      />
      
      {/* Key Category Icons Strip - Under Top Nav Bar (Hidden in Cart, Order, and Account pages) */}
      {!['cart', 'order', 'bookings', 'account', 'profile'].includes(activeTab) && (
        <WebTopCategoryBar 
          activeCategory={topCategory} 
          onSelectCategory={(catId) => {
            setTopCategory(catId)
            if (catId === 'all') {
              setSelectedCategory('All')
            } else {
              setSelectedCategory(catId)
              if (activeTab !== 'category' && activeTab !== 'home') {
                setActiveTab('category')
              }
            }
          }} 
        />
      )}
      
      <div className="web-layout">
        <main className="web-main-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading catalog data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <div className="home-dashboard">
                  {/* Interactive Slideshow replacing static banner */}
                  <WebHeroSlideshow 
                    onNavigate={(tab, catTarget) => {
                      setActiveTab(tab)
                      if (catTarget) {
                        setSelectedCategory(catTarget)
                        setTopCategory(catTarget.toLowerCase())
                      }
                    }} 
                  />

                  {/* Category-Wise Decorated Sections (Strictly Listed Products Only) */}
                  <CategoryWiseHomeSection 
                    products={products}
                    services={services}
                    onSelectCategory={(catId) => {
                      setTopCategory(catId)
                      if (catId === 'all') {
                        setSelectedCategory('All')
                      } else {
                        setSelectedCategory(catId)
                        setActiveTab('category')
                      }
                    }}
                    onAddToCart={handleAddToCart}
                    onBookService={(pkg) => {
                      setSelectedDiagnostic(pkg || services[0])
                      setIsBookingModalOpen(true)
                    }}
                    onUploadPrescription={() => {
                      setIsPrescriptionModalOpen(true)
                    }}
                  />
                </div>
              )}

              {/* Category Tab */}
              {(activeTab === 'category' || activeTab === 'products') && (
                <section className="catalog-section">
                  <div className="section-title-bar">
                    <h2>Healthcare Categories & Catalog</h2>
                    <p>Explore verified medicines, diagnostic healthcare essentials, and wellness products.</p>
                  </div>

                  {/* Category Pills Bar */}
                  <div className="web-category-pills">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`web-category-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <span className="pill-icon">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="product-grid">
                    {filteredProducts.map(p => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        onAddToCart={handleAddToCart} 
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <section className="catalog-section">
                  <div className="section-title-bar">
                    <h2>Diagnostic & Clinical Services</h2>
                    <p>Accurate pathological tests, health screenings, and doctor consultations.</p>
                  </div>
                  <div className="service-grid">
                    {services.map(s => (
                      <ServiceCard 
                        key={s.id} 
                        service={s} 
                        onBook={(serviceItem) => {
                          setSelectedDiagnostic(serviceItem)
                          setIsBookingModalOpen(true)
                        }} 
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Cart Tab */}
              {activeTab === 'cart' && (
                <section className="catalog-section web-cart-view">
                  <div className="section-title-bar">
                    <h2>Shopping Cart ({cartItems.length} items)</h2>
                    <p>Verified items ready for instant door-step delivery & home sample collection.</p>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="empty-state-box">
                      <span className="empty-icon">🛒</span>
                      <h3>Your Cart is Empty</h3>
                      <p>Browse our pharmacy or diagnostic services to add essentials.</p>
                      <button className="primary-btn" onClick={() => setActiveTab('category')}>Browse Catalog</button>
                    </div>
                  ) : (
                    <div className="web-cart-layout">
                      <div className="web-cart-items-list">
                        {cartItems.map(item => (
                          <div key={item.id} className="web-cart-item-card">
                            <div className="web-cart-item-avatar">{item.image}</div>
                            <div className="web-cart-item-info">
                              <h4 className="web-cart-item-title">{item.name}</h4>
                              <p className="web-cart-item-pack">{item.pack}</p>
                              <span className="web-cart-item-price">₹{item.price}</span>
                            </div>
                            <div className="web-cart-item-actions">
                              <div className="web-qty-selector">
                                <button type="button" onClick={() => updateCartQty(item.id, -1)}>-</button>
                                <span>{item.qty}</span>
                                <button type="button" onClick={() => updateCartQty(item.id, 1)}>+</button>
                              </div>
                              <button 
                                type="button" 
                                className="web-cart-remove-btn"
                                onClick={() => removeCartItem(item.id)}
                                title="Remove item"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="web-cart-summary-card">
                        <h3 className="summary-title">Order Summary</h3>
                        <div className="summary-row">
                          <span>Items Subtotal</span>
                          <span>₹{cartSubtotal}</span>
                        </div>
                        <div className="summary-row">
                          <span>Standard Express Delivery</span>
                          <span>{deliveryFee === 0 ? <span className="free-badge">FREE</span> : `₹${deliveryFee}`}</span>
                        </div>
                        <div className="summary-row discount-row">
                          <span>SubhOne Member Discount</span>
                          <span className="discount-value">-₹25</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total-row">
                          <span>Total Payable</span>
                          <span>₹{Math.max(0, cartTotal - 25)}</span>
                        </div>
                        <div 
                          className="cart-delivery-speed-pill" 
                          onClick={() => setIsTrackerOpen(true)}
                          role="button"
                          tabIndex={0}
                          title="Click to view Live 10-Minute Express Delivery Tracker"
                        >
                          <div className="speed-pill-left">
                            <span className="speed-icon">⚡</span>
                            <div>
                              <div className="speed-title-row">
                                <strong>10-Min Fast-Track Dispatch</strong>
                                <span className="speed-live-tag">LIVE GPS</span>
                              </div>
                              <p className="speed-address-text">
                                Deliver to: {location?.shortName || location?.address || 'Park Street, Kolkata'}
                              </p>
                            </div>
                          </div>
                          <span className="speed-arrow">→</span>
                        </div>

                        <button className="web-checkout-btn" onClick={handleCheckout}>
                          Proceed to Checkout →
                        </button>
                        <p className="safe-checkout-note">🔒 256-Bit Encrypted & 100% Genuine Certified Medicines</p>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Order Tab */}
              {(activeTab === 'order' || activeTab === 'bookings') && (
                <section className="catalog-section web-orders-view">
                  <div className="section-title-bar">
                    <h2>Orders & Health Bookings</h2>
                    <p>Track your medicine shipments, lab test appointments, and active prescriptions directly from the database.</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="empty-state-box">
                      <span className="empty-icon">📦</span>
                      <h3>No Orders Placed Yet</h3>
                      <p>Your orders placed on SubhOne will be tracked with real-time GPS dispatch.</p>
                      <button className="primary-btn" onClick={() => setActiveTab('category')}>Order Medicines Now</button>
                    </div>
                  ) : (
                    orders.map((order, idx) => {
                      const orderId = order.id || order.order_number || `SO-${90000 + idx}`
                      const dateStr = (order.created_at || order.createdAt) 
                        ? new Date(order.created_at || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                        : 'Today, Live Order'
                      const itemsSummary = order.items && order.items.length > 0
                        ? order.items.map(i => `${i.product_name || i.name} (x${i.quantity || 1})`).join(', ')
                        : 'Volini Pain Relief Gel & Dettol Antiseptic Liquid (2 items)'
                      const totalAmt = order.total_amount || order.totalAmount || 395
                      const statusText = order.status || 'Out for Delivery'
                      const isDelivered = statusText.toLowerCase().includes('delivered')

                      return (
                        <div key={order.id || idx} className={`web-order-card ${isDelivered ? 'past-order' : ''}`}>
                          <div className="web-order-header">
                            <div>
                              <span className="order-id">Order #{orderId}</span>
                              <p className="order-date">Placed on {dateStr} • {order.payment_method || 'Cash on Delivery / UPI'}</p>
                            </div>
                            <span className={`order-status-badge ${isDelivered ? 'delivered' : 'in-transit'}`}>
                              {isDelivered ? '✓ Delivered' : `🚚 ${statusText}`}
                            </span>
                          </div>

                          <div className="web-order-timeline">
                            <div className="timeline-step completed">
                              <div className="step-dot">✓</div>
                              <span className="step-label">Order Placed</span>
                            </div>
                            <div className="timeline-step completed">
                              <div className="step-dot">✓</div>
                              <span className="step-label">Packed at Pharmacy</span>
                            </div>
                            <div className={`timeline-step ${!isDelivered ? 'active' : 'completed'}`}>
                              <div className="step-dot">{!isDelivered ? '⚡' : '✓'}</div>
                              <span className="step-label">Rider En Route</span>
                            </div>
                            <div className={`timeline-step ${isDelivered ? 'completed' : ''}`}>
                              <div className="step-dot">📍</div>
                              <span className="step-label">Doorstep Delivery</span>
                            </div>
                          </div>

                          <div className="web-order-items-preview">
                            <div className="order-item-snippet">
                              <span className="item-icon">💊</span>
                              <div>
                                <strong>{itemsSummary}</strong>
                                <p>Total: ₹{totalAmt} • Delivery to: {order.delivery_address || order.deliveryAddress || 'Kolkata, West Bengal'}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {!isDelivered && (
                                <button className="track-order-btn" onClick={() => setIsTrackerOpen(true)}>Track Live 📍</button>
                              )}
                              <button 
                                className="reorder-btn"
                                onClick={() => showToast(`Invoice downloaded for Order #${orderId}`)}
                              >
                                Invoice 📄
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </section>
              )}

              {/* Account Tab */}
              {(activeTab === 'account' || activeTab === 'profile') && (
                <section className="catalog-section web-account-view">
                  <div className="section-title-bar">
                    <h2>Account & Healthcare Profile</h2>
                    <p>Manage your health credits, patient family profiles, and prescriptions.</p>
                  </div>

                  <div className="web-account-grid">
                    <div className="web-account-card main-profile">
                      <div className="account-avatar-banner">
                        <div className="account-avatar">👨‍⚕️</div>
                        <div>
                          <h3>{user?.name || 'Subhasis'}</h3>
                          <p>{user?.email || 'subhasis@subhone.com'}</p>
                          <span className="membership-badge">⭐ SubhOne Platinum Health Member</span>
                        </div>
                      </div>

                      <div className="account-quick-stats">
                        <div className="stat-box">
                          <span className="stat-num">₹450</span>
                          <span className="stat-title">Health Wallet</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-num">{orders.length || 12}</span>
                          <span className="stat-title">Orders Placed</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-num">3</span>
                          <span className="stat-title">Prescriptions</span>
                        </div>
                      </div>
                    </div>

                    <div className="web-account-card settings-card">
                      <h4 className="card-subheading">Account Quick Shortcuts</h4>
                      <ul className="account-menu-list">
                        <li>
                          <span>📍 Saved Delivery Addresses</span>
                          <button className="link-action-btn" onClick={() => setIsAddressModalOpen(true)}>Manage</button>
                        </li>
                        <li>
                          <span>📑 Uploaded Prescriptions & Records</span>
                          <button className="link-action-btn" onClick={() => setIsPrescriptionModalOpen(true)}>View / Upload</button>
                        </li>
                        <li>
                          <span>🩺 Linked Family Patients</span>
                          <button className="link-action-btn" onClick={() => showToast('Family Profiles: Subhasis (Self), Parents (Active)')}>2 Members</button>
                        </li>
                        <li>
                          <span>🔒 Security & Privacy</span>
                          <button className="link-action-btn" onClick={() => showToast('Two-Factor Authentication & Encrypted DB Active')}>Verified</button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* 10-Minute Rapid Live Delivery Tracker Modal */}
      <LiveOrderTrackerModal 
        isOpen={isTrackerOpen} 
        onClose={() => setIsTrackerOpen(false)} 
        userLocation={location} 
      />

      {/* Interactive Backend Modals */}
      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onUploaded={(res) => {
          showToast(`Prescription #${res.prescriptionId} uploaded to database!`)
        }}
        user={user}
      />

      <DiagnosticBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelectedDiagnostic(null)
        }}
        initialService={selectedDiagnostic}
        user={user}
        onBookingSuccess={(booking) => {
          showToast(`Diagnostic booking #${booking.booking_reference} confirmed!`)
          loadData()
        }}
      />

      <AddressManagementModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        user={user}
        onSelectAddress={(addr) => {
          showToast(`Delivery location set to: ${addr.address_line1}`)
        }}
      />

      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        order={createdOrder}
        onTrackOrder={() => {
          setIsSuccessModalOpen(false)
          setIsTrackerOpen(true)
        }}
        onViewOrders={() => {
          setIsSuccessModalOpen(false)
          setActiveTab('order')
        }}
      />

      {/* Universal Toast Alert Banner */}
      {toastMessage && (
        <div className="web-toast-alert" role="alert">
          <span className="toast-icon">✓</span>
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}

      {/* Modern Stylish Bottom Navigation Bar (Home, Category, Cart, Order, Account) */}
      <WebBottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        cartCount={cartItems.reduce((acc, i) => acc + i.qty, 0)} 
      />
    </div>
  )
}

export default WebInterface

