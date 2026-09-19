import {
  BACKEND_CONFIG,
  checkBackendHealth,
  fetchDbProducts,
  fetchDbServices,
  fetchDbCategories,
  createDbBooking,
  createDbOrder,
  fetchDbOrders,
  fetchDbBookings,
  fetchDbAddresses,
  saveDbAddress
} from './db'

// Fallback catalog strictly using verified listed items from database
const MOCK_PRODUCTS = [
  {
    id: 'c48e3a34-f6f0-412b-8493-ce3e07133bfb',
    numericId: 1,
    name: 'Volini Pain Relief Gel 15g',
    description: 'Scientifically proven formula for quick pain relief in joint pain, backache & sprain.',
    price: 15,
    mrp: 20,
    discount: '25% OFF',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788243981535.webp',
    category: 'Pain Relief & Muscle Care',
    brand: 'Volini',
    stock: 117,
    is_listed: true
  },
  {
    id: '26f7c1c5-7ac6-40ef-b5ab-fb51bc4af999',
    numericId: 2,
    name: 'Amrutanjan Strong Pain Balm 44g',
    description: 'Ayurvedic formulation with wintergreen oil & pudina for headache and backache.',
    price: 44,
    mrp: 55,
    discount: '20% OFF',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788266571644.webp',
    category: 'Pain Relief & Muscle Care',
    brand: 'Amrutanjan',
    stock: 82,
    is_listed: true
  },
  {
    id: '80b9e3b8-e91a-4163-b883-22721f505e47',
    numericId: 3,
    name: 'Dettol Antiseptic Liquid 250ml',
    description: 'Trusted antiseptic disinfectant for first aid, cuts, bites, and personal hygiene.',
    price: 155,
    mrp: 170,
    discount: '9% OFF',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788418118653.webp',
    category: 'Monsoon Health & Antiseptics',
    brand: 'Dettol',
    stock: 97,
    is_listed: true
  },
  {
    id: '65dd5404-a34d-4915-b8e2-bd672cf3054e',
    numericId: 4,
    name: 'Glucon-D Instant Energy Orange 400g',
    description: 'Instant energy glucose drink with Vitamin C & calcium for instant body recharge.',
    price: 173,
    mrp: 195,
    discount: '11% OFF',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788275874028.webp',
    category: 'Daily Wellness & Immunity',
    brand: 'Glucon-D',
    stock: 95,
    is_listed: true
  },
  {
    id: '0269bb79-78e6-4992-93d1-6439cc0ce729',
    numericId: 5,
    name: 'Eno Lemon Fast Action Sachet 5g',
    description: 'Fast acting antacid powder provides relief from acidity and heartburn in 6 seconds.',
    price: 10,
    mrp: 12,
    discount: '17% OFF',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788267142137.webp',
    category: 'Diet & Digestive Health',
    brand: 'Eno',
    stock: 14,
    is_listed: true
  },
  {
    id: '7092d4e9-3123-4a17-a837-732439f8ddf5',
    numericId: 6,
    name: 'Dabur Honey 100% Pure 250g',
    description: '100% pure NMR tested honey to build stamina, improve immunity, and support digestion.',
    price: 125,
    mrp: 145,
    discount: '14% OFF',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788418284966.webp',
    category: 'Daily Wellness & Immunity',
    brand: 'Dabur',
    stock: 137,
    is_listed: true
  },
  {
    id: '71a4f009-ffea-47da-995b-21d9600e1e69',
    numericId: 9,
    name: 'surgical mask',
    description: '3-ply medical surgical mask with meltblown filter for bacterial filtration efficiency.',
    price: 200,
    mrp: 250,
    discount: '20% OFF',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788431416528.webp',
    category: 'Medical Supplies & Devices',
    brand: 'Generic',
    stock: 49,
    is_listed: true
  },
  {
    id: 'c191a329-8756-42d4-a8ef-d130386d38e2',
    numericId: 7,
    name: 'Bengal Cotton 400 gm',
    description: '100% pure absorbent surgical cotton roll for clinical and hospital wound dressing.',
    price: 241,
    mrp: 280,
    discount: '14% OFF',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788201776121.webp',
    category: 'Medical Supplies & Devices',
    brand: 'Bengal Surgical',
    stock: 58,
    is_listed: true
  }
]

const MOCK_SERVICES = [
  {
    id: 'pkg-1',
    name: 'Advanced Full Body Checkup',
    description: 'Includes 85 tests (CBC, Lipid, Thyroid, LFT, KFT, Blood Sugar, Urine RE)',
    duration: 'Fast Home Sample Pickup',
    price: 999,
    mrp: 1999,
    icon: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
    category: 'Full Body Checkup',
    badge: 'Comprehensive',
    testsCount: 85
  },
  {
    id: 'pkg-2',
    name: 'Essential Diabetic Care',
    description: 'Includes 32 tests (HbA1c Glycated Hemoglobin, Fasting Blood Sugar, Lipid Profile)',
    duration: 'Fasting Sample Required',
    price: 499,
    mrp: 999,
    icon: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
    category: 'Diabetes Screening',
    badge: 'Metabolic Care',
    testsCount: 32
  }
]

export const api = {
  // Config & Status
  config: BACKEND_CONFIG,
  checkHealth: checkBackendHealth,

  // Products
  async getProducts(filterOptions = {}) {
    try {
      const dbProducts = await fetchDbProducts(filterOptions)
      if (dbProducts && dbProducts.length > 0) {
        // Merge mock data missing fields to ensure rich UI (e.g. discount, mrp, pack)
        return dbProducts.map(dbP => {
          const mockMatch = MOCK_PRODUCTS.find(m => String(m.id) === String(dbP.id) || String(m.numericId) === String(dbP.numericId) || m.name === dbP.name)
          if (mockMatch) {
            return {
              ...mockMatch,
              ...dbP,
              // Only override these if DB doesn't have them
              mrp: dbP.mrp || mockMatch.mrp,
              discount: dbP.discount || mockMatch.discount,
              pack: dbP.pack || mockMatch.pack,
              tag: dbP.tag || mockMatch.tag
            }
          }
          return dbP
        })
      }
      return MOCK_PRODUCTS
    } catch (error) {
      console.warn('Neon database fetch products failed, falling back to mock catalog:', error.message)
      return MOCK_PRODUCTS
    }
  },

  async getProduct(id) {
    try {
      const products = await this.getProducts()
      return products.find(p => String(p.id) === String(id) || String(p.numericId) === String(id)) || null
    } catch (error) {
      return MOCK_PRODUCTS.find(p => String(p.id) === String(id)) || null
    }
  },

  // Services / Diagnostic Lab Packages
  async getServices() {
    try {
      const dbServices = await fetchDbServices()
      if (dbServices && dbServices.length > 0) {
        // Return db lab packages, plus physician consultation for comprehensive healthcare
        const generalConsult = MOCK_SERVICES.find(s => s.id === 2)
        return [...dbServices, generalConsult].filter(Boolean)
      }
      return MOCK_SERVICES
    } catch (error) {
      console.warn('Neon database fetch services failed, falling back to mock services:', error.message)
      return MOCK_SERVICES
    }
  },

  // Categories
  async getCategories() {
    try {
      return await fetchDbCategories()
    } catch (error) {
      console.warn('Neon database fetch categories failed:', error.message)
      return []
    }
  },

  // Orders (Neon Postgres orders & order_items)
  async createOrder(orderData) {
    try {
      return await createDbOrder(orderData)
    } catch (error) {
      console.warn('Direct order insert fallback:', error.message)
      const fallbackId = 'ORD-' + Math.floor(1000000000 + Math.random() * 9000000000)
      return {
        id: 'ord_' + Date.now(),
        orderNumber: fallbackId,
        status: 'Out for Delivery',
        ...orderData
      }
    }
  },

  async getOrders(userOrId = null) {
    try {
      return await fetchDbOrders(userOrId)
    } catch (error) {
      console.warn('fetchDbOrders failed:', error.message)
      return []
    }
  },

  // Addresses (Neon Postgres addresses)
  async getAddresses(userId = null) {
    try {
      return await fetchDbAddresses(userId)
    } catch (error) {
      return []
    }
  },

  async saveAddress(addressData) {
    try {
      return await saveDbAddress(addressData)
    } catch (error) {
      return { id: 'addr_' + Date.now(), ...addressData }
    }
  },

  // Bookings (Neon Postgres lab_test_bookings)
  async createBooking(bookingData) {
    try {
      return await createDbBooking(bookingData)
    } catch (error) {
      console.log('Fallback booking created:', bookingData)
      return { success: true, bookingId: 'BKG-' + Date.now(), ...bookingData }
    }
  },

  async getBookings(userId = null) {
    try {
      return await fetchDbBookings(userId)
    } catch (error) {
      return []
    }
  },

  // Users (Neon Postgres user_profiles)
  async getUserProfile(userIdOrEmail) {
    try {
      const { fetchDbUserProfile } = await import('./db')
      const profile = await fetchDbUserProfile(userIdOrEmail)
      if (profile) return profile
    } catch (e) {
      console.warn('getUserProfile db note:', e.message)
    }
    return null
  },

  async updateUserProfile(profileData) {
    try {
      const { saveDbUserProfile } = await import('./db')
      return await saveDbUserProfile(profileData)
    } catch (e) {
      console.warn('updateUserProfile db note:', e.message)
      return { success: true, ...profileData }
    }
  },

  async getAllUsers() {
    try {
      const { fetchDbAllUsers } = await import('./db')
      return await fetchDbAllUsers()
    } catch (e) {
      console.warn('getAllUsers db note:', e.message)
      return []
    }
  },

  // ── Admin-only: All Orders ─────────────────────────────────────────────
  async getAllOrders() {
    try {
      const { fetchDbAllOrders } = await import('./db')
      return await fetchDbAllOrders()
    } catch (e) {
      console.warn('getAllOrders note:', e.message)
      return []
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      const { updateDbOrderStatus } = await import('./db')
      return await updateDbOrderStatus(orderId, newStatus)
    } catch (e) {
      console.warn('updateOrderStatus note:', e.message)
      return false
    }
  },

  // ── Admin-only: Lab Bookings ───────────────────────────────────────────
  async getAllBookings() {
    try {
      const { fetchDbAllBookings } = await import('./db')
      return await fetchDbAllBookings()
    } catch (e) {
      console.warn('getAllBookings note:', e.message)
      return []
    }
  },

  // ── Admin-only: Dashboard KPI Stats ───────────────────────────────────
  async getAdminStats() {
    try {
      const { fetchDbAdminStats } = await import('./db')
      return await fetchDbAdminStats()
    } catch (e) {
      console.warn('getAdminStats note:', e.message)
      return { totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0, pendingOrders: 0, totalBookings: 0 }
    }
  },

  // ── Admin-only: All Products (including unlisted) ──────────────────────
  async getAllProducts() {
    try {
      const { fetchDbAllProducts } = await import('./db')
      return await fetchDbAllProducts()
    } catch (e) {
      console.warn('getAllProducts note:', e.message)
      return []
    }
  },

  // ── Admin-only: Update product fields (listed, stock, flash sale, featured, prices)
  async updateProduct(productId, fields) {
    try {
      const { updateDbProduct } = await import('./db')
      return await updateDbProduct(productId, fields)
    } catch (e) {
      console.warn('updateProduct note:', e.message)
      return false
    }
  },

  // ── Admin-only: Change user role ───────────────────────────────────────
  async updateUserRole(userId, email, newRole) {
    try {
      const { updateDbUserRole } = await import('./db')
      return await updateDbUserRole(userId, email, newRole)
    } catch (e) {
      console.warn('updateUserRole note:', e.message)
      return false
    }
  },

  // ── Admin-only: Approve Retailer ───────────────────────────────────────
  async approveRetailer(userId, email) {
    try {
      const { approveDbRetailer } = await import('./db')
      return await approveDbRetailer(userId, email)
    } catch (e) {
      console.warn('approveRetailer note:', e.message)
      return false
    }
  },

  // ── Admin-only: Reject Retailer ────────────────────────────────────────
  async rejectRetailer(userId, email) {
    try {
      const { rejectDbRetailer } = await import('./db')
      return await rejectDbRetailer(userId, email)
    } catch (e) {
      console.warn('rejectRetailer note:', e.message)
      return false
    }
  },

  // ── Admin-only: Add user ──────────────────────────────────────────────
  async addUser(userData) {
    try {
      const { insertDbUser } = await import('./db')
      return await insertDbUser(userData)
    } catch (e) {
      console.warn('addUser note:', e.message)
      return null
    }
  },

  // ── Admin-only: Remove / Delete user ──────────────────────────────────
  async deleteUser(userId, email, phone) {
    try {
      const { deleteDbUser } = await import('./db')
      return await deleteDbUser(userId, email, phone)
    } catch (e) {
      console.warn('deleteUser note:', e.message)
      return false
    }
  },

  // ── Admin-only: Fetch a specific user's order history ─────────────────
  async getUserOrders(userId, email) {
    try {
      const { fetchDbUserOrders } = await import('./db')
      return await fetchDbUserOrders(userId, email)
    } catch (e) {
      console.warn('getUserOrders note:', e.message)
      return []
    }
  },

  // ── Admin-only: Advance lab booking status ────────────────────────────
  async updateBookingStatus(bookingId, newStatus) {
    try {
      const { updateDbBookingStatus } = await import('./db')
      return await updateDbBookingStatus(bookingId, newStatus)
    } catch (e) {
      console.warn('updateBookingStatus note:', e.message)
      return false
    }
  },

  // ── Admin-only: Analytics data (revenue chart, top products, status pie) ─
  async getAnalytics(days = 30) {
    try {
      const { fetchDbAnalytics } = await import('./db')
      return await fetchDbAnalytics(days)
    } catch (e) {
      console.warn('getAnalytics note:', e.message)
      return { dailyRevenue: [], statusBreakdown: [], topProducts: [] }
    }
  },

  // ── Admin-only: Assign delivery partner to order ──────────────────────
  async assignDeliveryPartner(orderId, partnerName, partnerPhone) {
    try {
      const { updateDbOrderDeliveryPartner } = await import('./db')
      return await updateDbOrderDeliveryPartner(orderId, partnerName, partnerPhone)
    } catch (e) {
      console.warn('assignDeliveryPartner note:', e.message)
      return false
    }
  },

  // ── Admin-only: Prescriptions ─────────────────────────────────────────
  async getPrescriptions() {
    try {
      const { fetchDbPrescriptions } = await import('./db')
      return await fetchDbPrescriptions()
    } catch (e) {
      console.warn('getPrescriptions note:', e.message)
      return []
    }
  },

  // ── Admin-only: Add new product ───────────────────────────────────────
  async addProduct(fields) {
    try {
      const { insertDbProduct } = await import('./db')
      return await insertDbProduct(fields)
    } catch (e) {
      console.warn('addProduct note:', e.message)
      return null
    }
  },

  // ── Admin-only: Delete product ────────────────────────────────────────
  async deleteProduct(productId) {
    try {
      const { deleteDbProduct } = await import('./db')
      return await deleteDbProduct(productId)
    } catch (e) {
      console.warn('deleteProduct note:', e.message)
      return false
    }
  },

  // ── Delivery Partner: Fetch assigned orders ───────────────────────────
  async getDeliveryOrders(partnerName, partnerPhone, partnerId) {
    try {
      const { fetchDbDeliveryOrders } = await import('./db')
      return await fetchDbDeliveryOrders(partnerName, partnerPhone, partnerId)
    } catch (e) {
      console.warn('getDeliveryOrders note:', e.message)
      return []
    }
  },

  // ── Delivery Partner: Fetch stats ─────────────────────────────────────
  async getDeliveryStats(partnerName, partnerPhone, partnerId) {
    try {
      const { fetchDbDeliveryStats } = await import('./db')
      return await fetchDbDeliveryStats(partnerName, partnerPhone, partnerId)
    } catch (e) {
      console.warn('getDeliveryStats note:', e.message)
      return { totalAssigned: 0, deliveredToday: 0, pendingDeliveries: 0, totalDelivered: 0 }
    }
  },

  // ── Delivery Partner: Update delivery status ──────────────────────────
  async updateDeliveryStatus(orderId, newStatus, notes) {
    try {
      const { updateDbDeliveryStatus } = await import('./db')
      return await updateDbDeliveryStatus(orderId, newStatus, notes)
    } catch (e) {
      console.warn('updateDeliveryStatus note:', e.message)
      return false
    }
  },

  // ── Delivery Partner: Assign partner to order ─────────────────────────
  async assignOrderDeliveryPartner(orderId, partnerName, partnerPhone, partnerId) {
    try {
      const { updateDbOrderDeliveryPartner } = await import('./db')
      return await updateDbOrderDeliveryPartner(orderId, partnerName, partnerPhone, partnerId)
    } catch (e) {
      console.warn('assignOrderDeliveryPartner note:', e.message)
      return false
    }
  }
}

export default api

