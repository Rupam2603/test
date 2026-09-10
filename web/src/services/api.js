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
        return dbProducts
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

  async getOrders(userId = null) {
    try {
      return await fetchDbOrders(userId)
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

  // Users
  async getUserProfile(userId) {
    return {
      id: userId || 'subh_usr_1',
      name: 'Subhasis',
      email: 'user@subhone.com',
      backend: 'Neon PostgreSQL (aws-ap-southeast-1)',
      branch: BACKEND_CONFIG.neonBranch
    }
  },

  async updateUserProfile(userId, data) {
    return { success: true, ...data }
  }
}

export default api

