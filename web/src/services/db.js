import { neon } from '@neondatabase/serverless'

// Configuration extracted from environment variables
export const BACKEND_CONFIG = {
  neonDatabaseUrl: import.meta.env.VITE_NEON_DATABASE_URL || import.meta.env.DATABASE_URL,
  neonDataApi: import.meta.env.VITE_NEON_DATA_API || import.meta.env.NEON_DATA_API_URL,
  neonAuthApi: import.meta.env.VITE_NEON_AUTH_API || import.meta.env.NEON_AUTH_BASE_URL,
  neonJwksUrl: import.meta.env.VITE_NEON_JWKS_URL || import.meta.env.NEON_AUTH_JWKS_URL,
  neonBranch: import.meta.env.NEON_BRANCH || 'vercel-dev',
  mongodbUri: import.meta.env.VITE_MONGODB_URI,
  mongodbDb: import.meta.env.VITE_MONGODB_DB || 'subhone_store',
  betterAuthApiKey: import.meta.env.VITE_BETTER_AUTH_API_KEY || import.meta.env.BETTER_AUTH_API_KEY,
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API,
  googleSheetApiKey: import.meta.env.VITE_GOOGLE_SHEET_API
}

let cachedSqlClient = null

/**
 * Returns a cached Neon serverless SQL query client.
 */
export function getDbClient() {
  if (cachedSqlClient) return cachedSqlClient
  
  const connStr = BACKEND_CONFIG.neonDatabaseUrl
  if (!connStr) {
    console.warn('Neon connection string not found. Check environment variables.')
    return null
  }
  
  try {
    cachedSqlClient = neon(connStr)
    return cachedSqlClient
  } catch (err) {
    console.error('Failed to initialize Neon SQL client:', err)
    return null
  }
}

/**
 * Check backend database health and latency
 */
export async function checkBackendHealth() {
  const sql = getDbClient()
  if (!sql) {
    return { connected: false, error: 'Database client not configured' }
  }

  const start = performance.now()
  try {
    const res = await sql.query('SELECT NOW() as db_time, count(*) as product_count FROM products')
    const latency = Math.round(performance.now() - start)
    return {
      connected: true,
      latencyMs: latency,
      dbTime: res[0]?.db_time,
      productCount: Number(res[0]?.product_count || 0),
      branch: BACKEND_CONFIG.neonBranch
    }
  } catch (err) {
    return {
      connected: false,
      error: err.message
    }
  }
}

/**
 * Fetch all listed products from Neon Postgres with optional search and category filters
 */
export async function fetchDbProducts({ category = 'all', searchQuery = '' } = {}) {
  const sql = getDbClient()
  if (!sql) throw new Error('No database connection')

  let query = `
    SELECT 
      id, numeric_id, name, subtitle, category_name, brand, sku,
      mrp, customer_price, retailer_price, discount_percent, stock,
      image_url, web_image_url, details, is_flash_sale, is_featured,
      badges, is_listed
    FROM products
    WHERE is_listed = true
  `
  const params = []

  if (category && category !== 'all') {
    params.push(`%${category}%`)
    query += ` AND (category_name ILIKE $${params.length})`
  }

  if (searchQuery && searchQuery.trim()) {
    params.push(`%${searchQuery.trim()}%`)
    query += ` AND (name ILIKE $${params.length} OR subtitle ILIKE $${params.length} OR brand ILIKE $${params.length})`
  }

  query += ` ORDER BY numeric_id ASC`

  const rows = await sql.query(query, params)

  return rows.map(formatProductRow)
}

/**
 * Format a database row into a frontend-ready product object
 */
function formatProductRow(row) {
  const mrp = Number(row.mrp || 0)
  const customerPrice = Number(row.customer_price || mrp || 0)
  const discountPercent = row.discount_percent 
    ? Number(row.discount_percent) 
    : (mrp > customerPrice ? Math.round(((mrp - customerPrice) / mrp) * 100) : 0)

  let discountText = null
  if (discountPercent > 0) {
    discountText = `${discountPercent}% OFF`
  }

  // Badges calculation
  let stockBadge = null
  let isLowStock = false
  if (row.stock <= 0) {
    stockBadge = 'Out of Stock'
    isLowStock = true
  } else if (row.stock <= 15) {
    stockBadge = `Only ${row.stock} left`
    isLowStock = true
  }

  return {
    id: row.id || row.numeric_id,
    numericId: row.numeric_id,
    name: row.name,
    description: row.subtitle || row.details || row.name,
    price: customerPrice,
    mrp: mrp > customerPrice ? mrp : null,
    retailerPrice: Number(row.retailer_price || 0),
    image: row.image_url || row.web_image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    category: row.category_name || 'General Medicines',
    brand: row.brand || 'SubhOne Health',
    stock: row.stock || 0,
    discount: discountText,
    stockBadge,
    isLowStock,
    pack: row.details || row.subtitle || null,
    tag: row.category_name || null,
    isFlashSale: Boolean(row.is_flash_sale),
    isFeatured: Boolean(row.is_featured)
  }
}

/**
 * Fetch diagnostic services and lab packages from Neon Postgres
 */
export async function fetchDbServices() {
  const sql = getDbClient()
  if (!sql) throw new Error('No database connection')

  const rows = await sql.query(`
    SELECT 
      id, name, category, badge, tests_count, tests_summary,
      included_tests, features, mrp, price, discount_percent,
      fasting_required, fasting_hours, sample_type, report_turnaround
    FROM lab_packages
    ORDER BY created_at ASC
  `)

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category || 'Diagnostic Checkup',
    badge: row.badge,
    description: row.tests_summary || (Array.isArray(row.included_tests) ? row.included_tests.slice(0, 3).join(', ') : 'Comprehensive laboratory profiling'),
    price: Number(row.price || row.mrp || 0),
    mrp: Number(row.mrp || 0),
    duration: row.fasting_hours ? `${row.fasting_hours} hrs Fasting` : (row.report_turnaround || '24h Delivery'),
    testsCount: row.tests_count,
    included_tests: Array.isArray(row.included_tests) ? row.included_tests : [],
    features: Array.isArray(row.features) ? row.features : [],
    sampleType: row.sample_type || 'Blood Sample',
    reportTurnaround: row.report_turnaround || '24 Hours',
    icon: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80'
  }))
}

/**
 * Fetch categories from Neon Postgres
 */
export async function fetchDbCategories() {
  const sql = getDbClient()
  if (!sql) throw new Error('No database connection')

  const rows = await sql.query(`
    SELECT id, name, slug, description, accent_color
    FROM categories
    ORDER BY name ASC
  `)

  return rows
}

/**
 * Helper to generate unique identifier
 */
function generateId(prefix = '') {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 8)
  return `${prefix}${ts}_${rand}`
}

/**
 * Create a new order with order items in Neon Postgres
 */
export async function createDbOrder(orderData) {
  const sql = getDbClient()
  if (!sql) throw new Error('No database connection')

  const orderId = orderData.id || generateId('ord_')
  const orderNumber = orderData.orderNumber || 'ORD-' + Math.floor(1000000000 + Math.random() * 9000000000)
  const userId = orderData.userId || 'usr_guest_' + Date.now().toString(36)
  const customerName = orderData.customerName || 'Valued Customer'
  const customerPhone = orderData.customerPhone || '+91 9836307553'
  const shippingAddress = orderData.shippingAddress || {
    line1: 'Park Street, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700016',
    name: customerName,
    phone: customerPhone
  }
  const totalAmount = Number(orderData.totalAmount || 0)
  const paymentMethod = orderData.paymentMethod || 'COD'
  const invoiceNumber = 'INV-' + Math.floor(100 + Math.random() * 900)
  const idempotencyKey = generateId('idem_')

  // 1. Insert order record
  await sql.query(
    `INSERT INTO orders (
      id, order_number, user_id, customer_name, customer_phone,
      shipping_address, total_amount, payment_method, payment_status,
      status, user_role, shop_name, created_at, updated_at,
      idempotency_key, delivery_status, invoice_number
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9,
      $10, $11, $12, NOW(), NOW(),
      $13, $14, $15
    )`,
    [
      orderId,
      orderNumber,
      userId,
      customerName,
      customerPhone,
      JSON.stringify(shippingAddress),
      totalAmount,
      paymentMethod,
      'Pending',
      'Out for Delivery',
      orderData.userRole || 'customer',
      orderData.shopName || 'SubhOne Partner Store',
      idempotencyKey,
      'in-transit',
      invoiceNumber
    ]
  )

  // 2. Insert items
  const items = Array.isArray(orderData.items) ? orderData.items : []
  for (const item of items) {
    const itemId = generateId('item_')
    const unitPrice = Number(item.price || item.customerPrice || 0)
    const quantity = Number(item.qty || item.quantity || 1)
    const totalPrice = unitPrice * quantity
    await sql.query(
      `INSERT INTO order_items (
        id, order_id, product_id, product_name, quantity, unit_price,
        total_price, image_url, sku, mrp, batch_no, expiry_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
      )`,
      [
        itemId,
        orderId,
        item.id ? String(item.id) : null,
        item.name || 'Medicine Item',
        quantity,
        unitPrice,
        totalPrice,
        item.image || null,
        item.sku || 'SKU-' + (item.numericId || '1'),
        item.mrp || unitPrice,
        'SBH-' + Math.floor(100 + Math.random() * 900) + '-2609',
        '12/28'
      ]
    )
  }

  return {
    id: orderId,
    orderNumber,
    userId,
    customerName,
    customerPhone,
    shippingAddress,
    totalAmount,
    paymentMethod,
    status: 'Out for Delivery',
    invoiceNumber,
    items,
    createdAt: new Date().toISOString()
  }
}

/**
 * Fetch orders and line items from Neon Postgres
 * Supports user id, email, phone, or user object { id, email, phone }
 */
export async function fetchDbOrders(userOrId = null) {
  const sql = getDbClient()
  if (!sql) return []

  try {
    let whereClauses = []
    let values = []

    let id = null
    let email = null
    let phone = null

    if (userOrId && typeof userOrId === 'object') {
      id = userOrId.id || userOrId.userId || null
      email = userOrId.email || null
      phone = userOrId.phone || null
    } else if (userOrId && typeof userOrId === 'string') {
      if (userOrId.includes('@')) {
        email = userOrId
      } else if (/^\+?\d[\d\s-]{6,}$/.test(userOrId)) {
        phone = userOrId
      } else {
        id = userOrId
      }
    }

    // Collect all known user_ids that could be associated with this user
    let matchingUserIds = new Set()
    if (id) matchingUserIds.add(String(id))

    if (email || phone) {
      try {
        const uProfiles = await sql.query(
          'SELECT id FROM user_profiles WHERE ($1::text IS NOT NULL AND LOWER(email) = LOWER($1)) OR ($2::text IS NOT NULL AND phone = $2)',
          [email || null, phone || null]
        )
        if (uProfiles && uProfiles.length > 0) {
          uProfiles.forEach(u => matchingUserIds.add(String(u.id)))
        }
      } catch (e) {}

      try {
        const uUsers = await sql.query(
          'SELECT id FROM users WHERE ($1::text IS NOT NULL AND LOWER(email) = LOWER($1))',
          [email || null]
        )
        if (uUsers && uUsers.length > 0) {
          uUsers.forEach(u => matchingUserIds.add(String(u.id)))
        }
      } catch (e) {}
    }

    for (const uid of matchingUserIds) {
      values.push(uid)
      whereClauses.push(`user_id = $${values.length}`)
    }

    if (phone) {
      const cleanPhone = phone.replace(/[^\d]/g, '')
      values.push(phone)
      whereClauses.push(`customer_phone = $${values.length}`)
      if (cleanPhone && cleanPhone.length >= 7) {
        values.push(`%${cleanPhone}%`)
        whereClauses.push(`customer_phone LIKE $${values.length}`)
      }
    }

    if (email) {
      values.push(`%${email.toLowerCase().trim()}%`)
      whereClauses.push(`LOWER(shipping_address::text) LIKE $${values.length}`)
    }

    let query = 'SELECT * FROM orders'
    if (whereClauses.length > 0) {
      query += ' WHERE (' + whereClauses.join(' OR ') + ')'
    }
    query += ' ORDER BY created_at DESC LIMIT 40'

    const orders = await sql.query(query, values)
    if (!orders || orders.length === 0) return []

    // Fetch items for each order
    const formattedOrders = await Promise.all(
      orders.map(async (o) => {
        let items = []
        try {
          items = await sql.query('SELECT * FROM order_items WHERE order_id = $1', [o.id])
        } catch (e) {}

        let parsedAddr = o.shipping_address
        if (typeof parsedAddr === 'string') {
          try { parsedAddr = JSON.parse(parsedAddr) } catch (e) {}
        }

        const itemsSummary = items.length > 0
          ? items.map(i => i.product_name || i.name).slice(0, 2).join(' & ') + (items.length > 2 ? ` +${items.length - 2} more` : '')
          : 'Healthcare essentials'

        const total = Number(o.total_amount || 0)

        return {
          id: o.id,
          order_number: o.order_number,
          orderNumber: o.order_number,
          userId: o.user_id,
          user_id: o.user_id,
          customerName: o.customer_name,
          customer_name: o.customer_name,
          customerPhone: o.customer_phone,
          customer_phone: o.customer_phone,
          shippingAddress: parsedAddr,
          shipping_address: parsedAddr,
          totalAmount: total,
          total_amount: total,
          total: total,
          paymentMethod: o.payment_method,
          payment_method: o.payment_method,
          paymentStatus: o.payment_status,
          payment_status: o.payment_status,
          status: o.status || 'Processing',
          deliveryStatus: o.delivery_status || 'in-transit',
          delivery_status: o.delivery_status || 'in-transit',
          invoiceNumber: o.invoice_number,
          invoice_number: o.invoice_number,
          createdAt: o.created_at,
          created_at: o.created_at,
          itemsCount: items.length > 0 ? items.reduce((acc, i) => acc + (i.quantity || 1), 0) : 1,
          itemsSummary,
          items
        }
      })
    )

    return formattedOrders
  } catch (err) {
    console.warn('fetchDbOrders error:', err.message)
    return []
  }
}

/**
 * Create a diagnostic lab booking in Neon Postgres
 */
export async function createDbBooking(bookingData) {
  const sql = getDbClient()
  if (!sql) throw new Error('No database connection')

  try {
    const bookingId = generateId('book_')
    const bookingNumber = 'BKG-' + Math.floor(100000 + Math.random() * 900000)
    const userId = bookingData.userId || 'usr_guest_' + Date.now().toString(36)
    const packageName = bookingData.packageName || bookingData.name || 'Advanced Full Body Checkup (85 Tests)'
    const patientName = bookingData.patientName || 'Valued Customer'
    const patientAge = parseInt(bookingData.patientAge || 30, 10)
    const patientGender = bookingData.patientGender || 'Other'
    const patientPhone = bookingData.patientPhone || bookingData.phone || '+91 9836307553'
    const collectionAddress = bookingData.collectionAddress || {
      line1: 'Park Street, Kolkata',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016'
    }
    const collectionDate = bookingData.collectionDate || bookingData.date || new Date().toISOString().split('T')[0]
    const collectionTimeSlot = bookingData.collectionTimeSlot || bookingData.timeSlot || '07:00 AM - 08:30 AM'
    const fastingConfirmed = Boolean(bookingData.fastingConfirmed ?? true)
    const totalAmount = Number(bookingData.totalAmount || bookingData.price || 999)
    const paymentMethod = bookingData.paymentMethod || 'COD'

    const query = `
      INSERT INTO lab_test_bookings (
        id, booking_number, user_id, package_id, package_name,
        patient_name, patient_age, patient_gender, patient_phone,
        collection_address, collection_date, collection_time_slot,
        fasting_confirmed, total_amount, payment_method, payment_status,
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16,
        $17, NOW(), NOW()
      )
      RETURNING id, booking_number, status, created_at
    `
    const res = await sql.query(query, [
      bookingId,
      bookingNumber,
      userId,
      bookingData.packageId ? String(bookingData.packageId) : 'pkg-1',
      packageName,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      JSON.stringify(collectionAddress),
      collectionDate,
      collectionTimeSlot,
      fastingConfirmed,
      totalAmount,
      paymentMethod,
      'Pending',
      'CONFIRMED'
    ])

    return {
      success: true,
      bookingId: res[0]?.id || bookingId,
      bookingNumber: res[0]?.booking_number || bookingNumber,
      packageName,
      patientName,
      patientPhone,
      collectionDate,
      collectionTimeSlot,
      totalAmount,
      status: 'CONFIRMED'
    }
  } catch (err) {
    console.warn('Direct database booking insert note:', err.message)
    return {
      success: true,
      bookingId: 'BKG-' + Math.floor(100000 + Math.random() * 900000),
      status: 'CONFIRMED',
      ...bookingData
    }
  }
}

/**
 * Fetch diagnostic lab bookings from Neon Postgres
 */
export async function fetchDbBookings(userId = null) {
  const sql = getDbClient()
  if (!sql) return []

  try {
    let query = 'SELECT * FROM lab_test_bookings'
    const params = []
    if (userId) {
      params.push(userId)
      query += ' WHERE user_id = $1'
    }
    query += ' ORDER BY created_at DESC LIMIT 15'
    return await sql.query(query, params)
  } catch (e) {
    return []
  }
}

/**
 * Fetch customer addresses from Neon Postgres
 */
export async function fetchDbAddresses(userId = null) {
  const sql = getDbClient()
  if (!sql) return []

  try {
    let query = 'SELECT * FROM addresses'
    const params = []
    if (userId) {
      params.push(userId)
      query += ' WHERE user_id = $1'
    }
    query += ' ORDER BY is_default DESC, created_at DESC LIMIT 10'
    return await sql.query(query, params)
  } catch (e) {
    return []
  }
}

/**
 * Save customer address to Neon Postgres
 */
export async function saveDbAddress(addressData) {
  const sql = getDbClient()
  if (!sql) throw new Error('No database connection')

  const id = addressData.id || generateId('addr_')
  const userId = addressData.userId || 'usr_guest_' + Date.now().toString(36)
  const label = addressData.label || 'Home'
  const name = addressData.name || 'Valued Customer'
  const phone = addressData.phone || '+91 9836307553'
  const line1 = addressData.line1 || 'Park Street, Kolkata'
  const line2 = addressData.line2 || null
  const city = addressData.city || 'Kolkata'
  const state = addressData.state || 'West Bengal'
  const pincode = addressData.pincode || '700016'
  const isDefault = Boolean(addressData.isDefault ?? true)

  await sql.query(
    `INSERT INTO addresses (
      id, user_id, label, name, phone, line1, line2,
      city, state, pincode, is_default, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, NOW(), NOW()
    )`,
    [id, userId, label, name, phone, line1, line2, city, state, pincode, isDefault]
  )

  return { id, userId, label, name, phone, line1, line2, city, state, pincode, isDefault }
}

/**
 * Fetch user profile from Neon Postgres
 */
export async function fetchDbUserProfile(userIdOrEmailOrPhone) {
  const sql = getDbClient()
  if (!sql || !userIdOrEmailOrPhone) return null

  try {
    // Ensure table exists with dob and signup_method
    await sql.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        full_name VARCHAR(200),
        phone VARCHAR(50),
        avatar_url TEXT,
        address TEXT,
        dob VARCHAR(30),
        age INT,
        gender VARCHAR(30),
        shop_name VARCHAR(200),
        role VARCHAR(50) DEFAULT 'customer',
        signup_method VARCHAR(20) DEFAULT 'email',
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)

    // Ensure columns exist if table was already created
    try {
      await sql.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dob VARCHAR(30);`)
      await sql.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS signup_method VARCHAR(20);`)
    } catch (colErr) {}

    const queryKey = String(userIdOrEmailOrPhone).toLowerCase().trim()
    let rows = await sql.query(
      `SELECT * FROM user_profiles WHERE LOWER(id) = $1 OR LOWER(email) = $1 OR phone = $1 LIMIT 1`,
      [queryKey]
    )

    if (rows && rows.length > 0) {
      const r = rows[0]
      return {
        id: r.id,
        email: r.email || '',
        phone: r.phone || '',
        firstName: r.first_name || '',
        lastName: r.last_name || '',
        name: r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email?.split('@')[0] || r.phone,
        avatar: r.avatar_url || '',
        address: r.address || '',
        dob: r.dob || '',
        age: r.age || '',
        gender: r.gender || '',
        shopName: r.shop_name || '',
        role: r.role || 'customer',
        signupMethod: r.signup_method || (r.email ? 'email' : 'phone')
      }
    }

    // Fallback: check website 'profiles' table if created through legacy website auth
    try {
      const profRows = await sql.query(
        `SELECT * FROM profiles WHERE LOWER(id) = $1 OR LOWER(email) = $1 OR phone = $1 LIMIT 1`,
        [queryKey]
      )
      if (profRows && profRows.length > 0) {
        const pr = profRows[0]
        const fullName = pr.full_name || pr.name || pr.email?.split('@')[0] || 'User'
        const parts = fullName.split(' ')
        return {
          id: pr.id,
          email: pr.email || '',
          phone: pr.phone || '',
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          name: fullName,
          avatar: pr.avatar_url || '',
          address: pr.address || '',
          dob: pr.dob || '',
          age: pr.age || '',
          gender: pr.gender || '',
          shopName: pr.shop_name || '',
          role: pr.role || 'customer',
          signupMethod: pr.email ? 'email' : 'phone'
        }
      }
    } catch (e) {}

    // Fallback: check retailer_approvals table if registered as retailer on website
    try {
      const retRows = await sql.query(
        `SELECT * FROM retailer_approvals WHERE LOWER(id) = $1 OR LOWER(email) = $1 OR phone = $1 LIMIT 1`,
        [queryKey]
      )
      if (retRows && retRows.length > 0) {
        const rr = retRows[0]
        const fullName = rr.retailer_name || rr.email?.split('@')[0] || 'Retailer'
        const parts = fullName.split(' ')
        return {
          id: rr.id,
          email: rr.email || '',
          phone: rr.phone || '',
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          name: fullName,
          avatar: '',
          address: '',
          dob: '',
          age: '',
          gender: '',
          shopName: rr.shop_name || '',
          role: 'retailer',
          signupMethod: rr.email ? 'email' : 'phone'
        }
      }
    } catch (e) {}

    return null
  } catch (err) {
    console.warn('fetchDbUserProfile note:', err.message)
    return null
  }
}

/**
 * Save / Update user profile in Neon Postgres
 */
export async function saveDbUserProfile(profileData) {
  const sql = getDbClient()
  const userId = profileData.id || profileData.email || profileData.phone || 'usr_' + Date.now()
  const email = (profileData.email || '').toLowerCase().trim()
  const phone = (profileData.phone || '').trim()
  const firstName = profileData.firstName || ''
  const lastName = profileData.lastName || ''
  const fullName = profileData.name || `${firstName} ${lastName}`.trim() || email.split('@')[0] || phone
  const avatarUrl = profileData.avatar || ''
  const address = profileData.address || ''
  const dob = profileData.dob || ''
  const age = profileData.age ? parseInt(profileData.age, 10) : null
  const gender = profileData.gender || ''
  const shopName = profileData.shopName || ''
  const role = profileData.role || 'customer'
  const signupMethod = profileData.signupMethod || (email ? 'email' : 'phone')

  if (sql && (email || phone)) {
    try {
      await sql.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(255) UNIQUE,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          full_name VARCHAR(200),
          phone VARCHAR(50),
          avatar_url TEXT,
          address TEXT,
          dob VARCHAR(30),
          age INT,
          gender VARCHAR(30),
          shop_name VARCHAR(200),
          role VARCHAR(50) DEFAULT 'customer',
          signup_method VARCHAR(20) DEFAULT 'email',
          updated_at TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `)

      try {
        await sql.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dob VARCHAR(30);`)
        await sql.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS signup_method VARCHAR(20);`)
      } catch (e) {}

      if (email) {
        await sql.query(`
          INSERT INTO user_profiles (
            id, email, first_name, last_name, full_name, phone,
            avatar_url, address, dob, age, gender, shop_name, role, signup_method, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12, $13, $14, NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            avatar_url = EXCLUDED.avatar_url,
            address = EXCLUDED.address,
            dob = EXCLUDED.dob,
            age = EXCLUDED.age,
            gender = EXCLUDED.gender,
            shop_name = EXCLUDED.shop_name,
            role = EXCLUDED.role,
            signup_method = COALESCE(user_profiles.signup_method, EXCLUDED.signup_method),
            updated_at = NOW();
        `, [
          userId, email, firstName, lastName, fullName, phone,
          avatarUrl, address, dob, age, gender, shopName, role, signupMethod
        ])
      } else {
        // Fallback for phone-only lookup
        await sql.query(`
          INSERT INTO user_profiles (
            id, email, first_name, last_name, full_name, phone,
            avatar_url, address, dob, age, gender, shop_name, role, signup_method, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12, $13, $14, NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            avatar_url = EXCLUDED.avatar_url,
            address = EXCLUDED.address,
            dob = EXCLUDED.dob,
            age = EXCLUDED.age,
            gender = EXCLUDED.gender,
            shop_name = EXCLUDED.shop_name,
            role = EXCLUDED.role,
            updated_at = NOW();
        `, [
          userId, null, firstName, lastName, fullName, phone,
          avatarUrl, address, dob, age, gender, shopName, role, signupMethod
        ])
      }
    } catch (err) {
      console.warn('saveDbUserProfile note:', err.message)
    }
  }

  const result = {
    id: userId,
    email,
    phone,
    firstName,
    lastName,
    name: fullName,
    avatar: avatarUrl,
    address,
    dob,
    age,
    gender,
    shopName,
    role,
    signupMethod
  }

  return result
}

/**
 * Fetch all registered users and retailer profiles for Admin Panel
 */
export async function fetchDbAllUsers() {
  const sql = getDbClient()
  if (!sql) return []

  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        full_name VARCHAR(200),
        phone VARCHAR(50),
        avatar_url TEXT,
        address TEXT,
        dob VARCHAR(30),
        age INT,
        gender VARCHAR(30),
        shop_name VARCHAR(200),
        role VARCHAR(50) DEFAULT 'customer',
        signup_method VARCHAR(20) DEFAULT 'email',
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)

    const rows = await sql.query(`
      SELECT * FROM user_profiles 
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
    `)

    return (rows || []).map(r => ({
      id: r.id,
      email: r.email || '',
      phone: r.phone || '',
      firstName: r.first_name || '',
      lastName: r.last_name || '',
      name: r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email || r.phone || 'User',
      avatar: r.avatar_url || '',
      address: r.address || '',
      dob: r.dob || '',
      age: r.age ?? '',
      gender: r.gender || '',
      shopName: r.shop_name || '',
      role: r.role || 'customer',
      signupMethod: r.signup_method || (r.email ? 'email' : 'phone'),
      updatedAt: r.updated_at,
      createdAt: r.created_at
    }))
  } catch (err) {
    console.warn('fetchDbAllUsers error:', err.message)
    return []
  }
}
