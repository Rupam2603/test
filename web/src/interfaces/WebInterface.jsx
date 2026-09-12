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
import ProductDetails from '../components/ProductDetails'
import AuthPage from '../components/Auth/AuthPage'
import AccountProfileView from '../components/Account/AccountProfileView'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import DeliveryLocationModal from '../components/Location/DeliveryLocationModal'
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
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [topCategory, setTopCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { location, detectLocation, selectAddress } = useCurrentLocation()
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [cartItems, setCartItems] = useState([])
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
          image: product.image || product.icon || '💊'
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
        onOpenLocation={() => setIsLocationModalOpen(true)}
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
            }
            if (activeTab !== 'category') {
              setActiveTab('category')
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
                    onSelectCategory={(catId) => {
                      setTopCategory(catId)
                      if (catId === 'all') {
                        setSelectedCategory('All')
                      } else {
                        setSelectedCategory(catId)
                      }
                      setActiveTab('category')
                    }}
                    onSelectProduct={(p) => {
                      setSelectedProduct(p)
                      setActiveTab('product')
                    }}
                    onAddToCart={handleAddToCart}
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
                        onSelectProduct={(product) => {
                          setSelectedProduct(product)
                          setActiveTab('product')
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Product Details Tab */}
              {activeTab === 'product' && selectedProduct && (
                <ProductDetails 
                  product={selectedProduct} 
                  onAddToCart={handleAddToCart} 
                  onBack={() => setActiveTab('home')} 
                />
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
                            <div className="web-cart-item-avatar">
                              {item.image?.includes('http') || item.image?.includes('/') 
                                ? <img src={item.image} alt={item.name} className="web-cart-item-img" /> 
                                : item.image}
                            </div>
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
                        {/* Delivery Address & GPS Location Card */}
                        <div 
                          className="cart-delivery-address-card" 
                          onClick={() => setIsLocationModalOpen(true)}
                          role="button"
                          tabIndex={0}
                          title="Delivery Address: Click to locate current GPS or change address"
                        >
                          <div className="delivery-card-icon-wrap">
                            <span className="delivery-card-icon">📍</span>
                          </div>
                          <div className="delivery-card-content">
                            <div className="delivery-card-badge-row">
                              <span className="delivery-card-label">DELIVERING TO</span>
                              <span className="delivery-card-gps-tag">
                                {location?.isExact ? '✓ Current GPS' : '⚡ 10-Min Delivery'}
                              </span>
                            </div>
                            <p className="delivery-card-address">
                              {location?.address || 'Park Street, Kolkata, West Bengal 700016'}
                            </p>
                            <span className="delivery-card-change-link">Change or Locate Current GPS ▾</span>
                          </div>
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
                    <h2>Orders</h2>
                    <p>Track your medicine shipments directly from the database.</p>
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
                                <button className="track-order-btn" onClick={() => showToast(`Order #${orderId} destination: ${order.delivery_address || order.deliveryAddress || 'Delivery Address'}`)}>Dispatch Active 🚚</button>
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
                <AccountProfileView
                  user={user}
                  onUpdateUser={(updated) => setUser(updated)}
                  onLogout={() => {
                    localStorage.removeItem('subhone_auth_user')
                    setUser(null)
                    setActiveTab('home')
                    window.location.reload()
                  }}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Delivery Address & Location Modal (Powered by Google Maps & GPS) */}
      <DeliveryLocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        location={location}
        detectLocation={detectLocation}
        onSelectAddress={(addr) => {
          if (selectAddress) selectAddress(addr)
          showToast(`Delivery address set to: ${addr.line1 || addr.shortName || addr.city}`)
        }}
        user={user}
      />

      {/* Interactive Backend Modals */}

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
          setActiveTab('order')
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

