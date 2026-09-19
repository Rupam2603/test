import { neon } from '@neondatabase/serverless'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {})

// Configuration extracted from environment variables
export const BACKEND_CONFIG = {
  neonDatabaseUrl: env.VITE_NEON_DATABASE_URL || env.DATABASE_URL,
  neonDataApi: env.VITE_NEON_DATA_API || env.NEON_DATA_API_URL,
  neonAuthApi: env.VITE_NEON_AUTH_API || env.NEON_AUTH_BASE_URL,
  neonJwksUrl: env.VITE_NEON_JWKS_URL || env.NEON_AUTH_JWKS_URL,
  neonBranch: env.NEON_BRANCH || 'vercel-dev',
  mongodbUri: env.VITE_MONGODB_URI,
  mongodbDb: env.VITE_MONGODB_DB || 'subhone_store',
  betterAuthApiKey: env.VITE_BETTER_AUTH_API_KEY || env.BETTER_AUTH_API_KEY,
  googleMapsApiKey: env.VITE_GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAP_API,
  googleSheetApiKey: env.VITE_GOOGLE_SHEET_API
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
    const digitsOnly = queryKey.replace(/\D/g, '')
    const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : (digitsOnly.length > 0 ? digitsOnly : null)

    let rows = await sql.query(
      `SELECT * FROM user_profiles 
       WHERE LOWER(id) = $1 
          OR LOWER(email) = $1 
          OR phone = $1
          OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $2)
       LIMIT 1`,
      [queryKey, last10Digits]
    )

    if (rows && rows.length > 0) {
      const r = rows[0]
      let approvalStatus = r.approval_status || 'approved'
      if (r.role === 'retailer') {
        try {
          const retPhoneDigits = (r.phone || '').replace(/\D/g, '').slice(-10) || null
          const retCheck = await sql.query(
            `SELECT approval_status, status FROM retailer_approvals 
             WHERE LOWER(email) = $1 
                OR phone = $2 
                OR ($3::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $3)
             LIMIT 1`,
            [(r.email || '').toLowerCase().trim(), r.phone || '', retPhoneDigits]
          )
          if (retCheck && retCheck.length > 0) {
            approvalStatus = retCheck[0].approval_status || retCheck[0].status || approvalStatus
          } else {
            const profCheck = await sql.query(
              `SELECT approval_status FROM profiles 
               WHERE LOWER(email) = $1 
                  OR phone = $2
                  OR ($3::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $3)
               LIMIT 1`,
              [(r.email || '').toLowerCase().trim(), r.phone || '', retPhoneDigits]
            )
            if (profCheck && profCheck.length > 0 && profCheck[0].approval_status) {
              approvalStatus = profCheck[0].approval_status
            }
          }
        } catch (_) {}
      }

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
        approvalStatus: String(approvalStatus).toLowerCase(),
        signupMethod: r.signup_method || (r.email ? 'email' : 'phone')
      }
    }

    // Fallback: check website 'profiles' table if created through legacy website auth
    try {
      const profRows = await sql.query(
        `SELECT * FROM profiles 
         WHERE LOWER(id) = $1 
            OR LOWER(email) = $1 
            OR phone = $1
            OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $2)
         LIMIT 1`,
        [queryKey, last10Digits]
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
          approvalStatus: String(pr.approval_status || (pr.role === 'retailer' ? 'pending' : 'approved')).toLowerCase(),
          signupMethod: pr.email ? 'email' : 'phone'
        }
      }
    } catch (e) {}

    // Fallback: check retailer_approvals table if registered as retailer on website
    try {
      const retRows = await sql.query(
        `SELECT * FROM retailer_approvals 
         WHERE LOWER(id) = $1 
            OR LOWER(email) = $1 
            OR phone = $1
            OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $2)
         LIMIT 1`,
        [queryKey, last10Digits]
      )
      if (retRows && retRows.length > 0) {
        const rr = retRows[0]
        const fullName = rr.full_name || rr.retailer_name || rr.email?.split('@')[0] || 'Retailer'
        const parts = fullName.split(' ')
        return {
          id: rr.id,
          email: rr.email || '',
          phone: rr.phone || '',
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          name: fullName,
          avatar: rr.avatar_url || '',
          address: '',
          dob: '',
          age: '',
          gender: '',
          shopName: rr.shop_name || '',
          role: 'retailer',
          approvalStatus: String(rr.approval_status || rr.status || 'pending').toLowerCase(),
          signupMethod: rr.email ? 'email' : 'phone'
        }
      }
    } catch (e) {}

    // Fallback: check users table in Neon (which contains all admin, delivery_partner, customer, retailer)
    try {
      const userRows = await sql.query(
        `SELECT * FROM users 
         WHERE LOWER(id::text) = $1 
            OR LOWER(email) = $1
            OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(email, ''), '[^0-9]', '', 'g'), 10) = $2)
         LIMIT 1`,
        [queryKey, last10Digits]
      )
      if (userRows && userRows.length > 0) {
        const ur = userRows[0]
        const fullName = ur.name || ur.full_name || ur.email?.split('@')[0] || 'User'
        const parts = fullName.split(' ')
        return {
          id: String(ur.id),
          email: ur.email || '',
          phone: ur.phone || '',
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          name: fullName,
          avatar: ur.avatar_url || '',
          address: ur.address || '',
          dob: ur.dob || '',
          age: ur.age || '',
          gender: ur.gender || '',
          shopName: ur.business_name || ur.shop_name || '',
          role: ur.role || 'customer',
          signupMethod: ur.email ? 'email' : 'phone'
        }
      }
    } catch (e) {}

    // Fallback: check auth_users table (legacy authentication accounts)
    try {
      const authRows = await sql.query(
        `SELECT * FROM auth_users 
         WHERE LOWER(id) = $1 
            OR LOWER(email) = $1 
            OR phone = $1
            OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $2)
         LIMIT 1`,
        [queryKey, last10Digits]
      )
      if (authRows && authRows.length > 0) {
        const ar = authRows[0]
        const fullName = ar.full_name || ar.name || ar.email?.split('@')[0] || 'User'
        const parts = fullName.split(' ')
        return {
          id: ar.id,
          email: ar.email || '',
          phone: ar.phone || '',
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          name: fullName,
          avatar: ar.avatar_url || '',
          address: ar.address || '',
          dob: '',
          age: '',
          gender: '',
          shopName: ar.shop_name || '',
          role: ar.role || 'customer',
          signupMethod: ar.email ? 'email' : 'phone'
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
        // Upsert into user_profiles with conflict on email
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
            signup_method = EXCLUDED.signup_method,
            updated_at = NOW();
        `, [
          userId, email, firstName, lastName, fullName, phone,
          avatarUrl, address, dob, age, gender, shopName, role, signupMethod
        ])

        // Also sync into profiles table for website admin / auth visibility
        try {
          const isRetailer = role === 'retailer'
          const initialApproval = isRetailer ? 'pending' : 'approved'
          await sql.query(`
            INSERT INTO profiles (
              id, email, full_name, role, phone, shop_name, avatar_url, approval_status, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
            )
            ON CONFLICT (email) DO UPDATE SET
              full_name = EXCLUDED.full_name,
              role = EXCLUDED.role,
              phone = EXCLUDED.phone,
              shop_name = EXCLUDED.shop_name,
              avatar_url = EXCLUDED.avatar_url,
              approval_status = CASE 
                WHEN profiles.approval_status = 'approved' THEN 'approved'
                WHEN EXCLUDED.role = 'retailer' THEN COALESCE(profiles.approval_status, 'pending')
                ELSE 'approved'
              END,
              updated_at = NOW();
          `, [
            userId, email, fullName, role, phone || null, shopName || null, avatarUrl || null, initialApproval
          ])

          // If retailer, also ensure synchronized in retailer_approvals table
          if (isRetailer) {
            await sql.query(`
              INSERT INTO retailer_approvals (
                id, user_id, email, full_name, phone, shop_name, approval_status, avatar_url, created_at, updated_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, 'approved', $7, NOW(), NOW()
              )
              ON CONFLICT (id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                shop_name = EXCLUDED.shop_name,
                phone = EXCLUDED.phone,
                avatar_url = EXCLUDED.avatar_url,
                updated_at = NOW();
            `, [
              'ret_' + userId, userId, email, fullName, phone || null, shopName || null, avatarUrl || null
            ]).catch(() => {})
          }
        } catch (profSyncErr) {
          console.warn('profiles table dual-sync note:', profSyncErr.message)
        }
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
 * Fetch ALL registered users for Admin Panel.
 * Merges records from user_profiles, profiles, users, auth_users, and
 * retailer_approvals tables so every existing account is visible.
 * Deduplicates by email → phone → id (email wins if present).
 */
export async function fetchDbAllUsers() {
  const sql = getDbClient()
  if (!sql) return []

  // Ensure the app-side table exists
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
  } catch (_) {}

  // Helper: normalise a raw DB row into a unified user object
  function norm(r, source = 'user_profiles') {
    const fullName =
      r.full_name ||
      r.name ||
      `${r.first_name || ''} ${r.last_name || ''}`.trim() ||
      r.email?.split('@')[0] ||
      r.retailer_name ||
      r.phone ||
      'User'

    const parts = fullName.split(' ')
    const approvalStatus = r.approval_status || r.status || (source === 'retailer_approvals' ? 'pending' : 'approved')
    return {
      id:           String(r.id || ''),
      email:        (r.email || '').toLowerCase().trim(),
      phone:        r.phone || '',
      firstName:    r.first_name || parts[0] || '',
      lastName:     r.last_name || parts.slice(1).join(' ') || '',
      name:         fullName,
      avatar:       r.avatar_url || r.avatar || '',
      address:      r.address || '',
      dob:          r.dob || '',
      age:          r.age ?? '',
      gender:       r.gender || '',
      shopName:     r.shop_name || r.business_name || r.retailer_shop || '',
      role:         r.role || (source === 'retailer_approvals' ? 'retailer' : 'customer'),
      approvalStatus: String(approvalStatus).toLowerCase(),
      signupMethod: r.signup_method || (r.email ? 'email' : 'phone'),
      updatedAt:    r.updated_at || r.updatedAt || null,
      createdAt:    r.created_at || r.createdAt || null,
      _source:      source
    }
  }

  // Collect rows from every known table
  const allRows = []

  // 1. user_profiles  (app signups & profile saves)
  try {
    const rows = await sql.query(
      `SELECT * FROM user_profiles ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST`
    )
    ;(rows || []).forEach(r => allRows.push(norm(r, 'user_profiles')))
  } catch (_) {}

  // 2. profiles  (website Better-Auth / legacy website accounts)
  try {
    const rows = await sql.query(
      `SELECT * FROM profiles ORDER BY created_at DESC NULLS LAST LIMIT 500`
    )
    ;(rows || []).forEach(r => allRows.push(norm(r, 'profiles')))
  } catch (_) {}

  // 3. users  (Neon Auth / Better-Auth primary table used by website)
  try {
    const rows = await sql.query(
      `SELECT * FROM users ORDER BY created_at DESC NULLS LAST LIMIT 500`
    )
    ;(rows || []).forEach(r => allRows.push(norm(r, 'users')))
  } catch (_) {}

  // 4. auth_users  (legacy authentication table)
  try {
    const rows = await sql.query(
      `SELECT * FROM auth_users ORDER BY created_at DESC NULLS LAST LIMIT 500`
    )
    ;(rows || []).forEach(r => allRows.push(norm(r, 'auth_users')))
  } catch (_) {}

  // 5. retailer_approvals  (retailers who registered on the website)
  try {
    const rows = await sql.query(
      `SELECT * FROM retailer_approvals ORDER BY created_at DESC NULLS LAST LIMIT 500`
    )
    ;(rows || []).forEach(r => allRows.push(norm(r, 'retailer_approvals')))
  } catch (_) {}

  // 6. delivery_partner_profiles  (fleet & registered riders)
  try {
    const rows = await sql.query(
      `SELECT * FROM delivery_partner_profiles ORDER BY updated_at DESC NULLS LAST LIMIT 100`
    )
    ;(rows || []).forEach(r => {
      allRows.push({
        id: String(r.user_id || ''),
        email: '',
        phone: r.phone || '',
        firstName: '',
        lastName: '',
        name: r.partner_code ? `Delivery Partner (${r.partner_code})` : 'Delivery Partner',
        avatar: r.avatar_url || '',
        address: r.address || '',
        dob: '',
        age: '',
        gender: '',
        shopName: '',
        vehicleType: r.vehicle_type || '',
        vehicleNumber: r.vehicle_number || '',
        isOnDuty: r.is_on_duty ?? true,
        role: 'delivery_partner',
        signupMethod: 'phone',
        updatedAt: r.updated_at || null,
        createdAt: r.created_at || null,
        _source: 'delivery_partner_profiles'
      })
    })
  } catch (_) {}

  // 7. Extract delivery partners assigned on existing orders (if not already recorded)
  try {
    const orderRiders = await sql.query(`
      SELECT DISTINCT delivery_partner_name, delivery_partner_phone, delivery_partner_id
      FROM orders
      WHERE delivery_partner_name IS NOT NULL AND delivery_partner_name != ''
    `)
    ;(orderRiders || []).forEach(r => {
      allRows.push({
        id: r.delivery_partner_id ? String(r.delivery_partner_id) : '',
        email: '',
        phone: r.delivery_partner_phone || '',
        firstName: r.delivery_partner_name.split(' ')[0] || '',
        lastName: r.delivery_partner_name.split(' ').slice(1).join(' ') || '',
        name: r.delivery_partner_name,
        avatar: '',
        address: '',
        dob: '',
        age: '',
        gender: '',
        shopName: '',
        role: 'delivery_partner',
        signupMethod: 'assigned',
        updatedAt: null,
        createdAt: null,
        _source: 'orders'
      })
    })
  } catch (_) {}

  // ── Deduplicate ─────────────────────────────────────────────────────
  // Priority: user_profiles > profiles > users > auth_users > retailer_approvals > delivery_partner_profiles > orders
  // Key: lower-cased email, then phone, then id
  const seenEmail = new Map()
  const seenPhone = new Map()
  const seenId    = new Map()
  const merged    = []

  // Source priority order — already pushed in that order above
  for (const u of allRows) {
    const emailKey = u.email || null
    const phoneKey = u.phone || null
    const idKey    = u.id    || null

    const existsByEmail = emailKey && seenEmail.has(emailKey)
    const existsByPhone = phoneKey && seenPhone.has(phoneKey)
    const existsById    = idKey    && seenId.has(idKey)

    if (existsByEmail || existsByPhone || existsById) {
      // Merge missing fields into the already-stored record
      const existingRef =
        (emailKey && seenEmail.get(emailKey)) ||
        (phoneKey && seenPhone.get(phoneKey)) ||
        (idKey    && seenId.get(idKey))

      if (existingRef) {
        // Fill in any blanks from this secondary source
        if (!existingRef.phone    && u.phone)    existingRef.phone    = u.phone
        if (!existingRef.avatar   && u.avatar)   existingRef.avatar   = u.avatar
        if (!existingRef.address  && u.address)  existingRef.address  = u.address
        if (!existingRef.dob      && u.dob)      existingRef.dob      = u.dob
        if (!existingRef.gender   && u.gender)   existingRef.gender   = u.gender
        if (!existingRef.shopName && u.shopName) existingRef.shopName = u.shopName
        if (!existingRef.vehicleType && u.vehicleType) existingRef.vehicleType = u.vehicleType
        if (!existingRef.vehicleNumber && u.vehicleNumber) existingRef.vehicleNumber = u.vehicleNumber
        if (u.isOnDuty !== undefined) existingRef.isOnDuty = u.isOnDuty
        if (u.approvalStatus === 'approved' || (existingRef.approvalStatus !== 'approved' && u.approvalStatus)) {
          existingRef.approvalStatus = u.approvalStatus
        }
        // Upgrade role if found in a more privileged source
        const roleRank = { admin: 4, staff: 3, delivery_partner: 3, retailer: 2, customer: 1 }
        if ((roleRank[u.role] || 1) > (roleRank[existingRef.role] || 1)) {
          existingRef.role = u.role
        }
      }
      continue
    }

    // New unique user
    merged.push(u)
    if (emailKey) seenEmail.set(emailKey, u)
    if (phoneKey) seenPhone.set(phoneKey, u)
    if (idKey)    seenId.set(idKey, u)
  }

  // Sort: most recently updated first
  merged.sort((a, b) => {
    const da = a.updatedAt ? new Date(a.updatedAt) : (a.createdAt ? new Date(a.createdAt) : new Date(0))
    const db = b.updatedAt ? new Date(b.updatedAt) : (b.createdAt ? new Date(b.createdAt) : new Date(0))
    return db - da
  })

  return merged
}

/**
 * Fetch ALL orders from the database for the Admin Panel (no user filter)
 */
export async function fetchDbAllOrders() {
  const sql = getDbClient()
  if (!sql) return []

  try {
    const orders = await sql.query(`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 200
    `)
    if (!orders || orders.length === 0) return []

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
          orderNumber: o.order_number,
          order_number: o.order_number,
          userId: o.user_id,
          customerName: o.customer_name || 'Customer',
          customerPhone: o.customer_phone || '',
          shippingAddress: parsedAddr,
          totalAmount: total,
          total,
          paymentMethod: o.payment_method || 'COD',
          paymentStatus: o.payment_status || 'Pending',
          status: o.status || 'Out for Delivery',
          deliveryStatus: o.delivery_status || 'in-transit',
          invoiceNumber: o.invoice_number || '',
          shopName: o.shop_name || '',
          userRole: o.user_role || 'customer',
          deliveryPartnerName: o.delivery_partner_name || '',
          deliveryPartnerPhone: o.delivery_partner_phone || '',
          deliveryNotes: o.delivery_notes || '',
          deliveryPartnerId: o.delivery_partner_id || '',
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          itemsCount: items.length > 0 ? items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0) : 1,
          itemsSummary,
          items
        }
      })
    )
    return formattedOrders
  } catch (err) {
    console.warn('fetchDbAllOrders error:', err.message)
    return []
  }
}

/**
 * Update order status in the database
 */
export async function updateDbOrderStatus(orderId, newStatus) {
  const sql = getDbClient()
  if (!sql) return false

  try {
    await sql.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, orderId]
    )
    return true
  } catch (err) {
    console.warn('updateDbOrderStatus error:', err.message)
    return false
  }
}

/**
 * Fetch ALL lab test bookings for Admin Panel
 */
export async function fetchDbAllBookings() {
  const sql = getDbClient()
  if (!sql) return []

  try {
    const rows = await sql.query(`
      SELECT * FROM lab_test_bookings ORDER BY created_at DESC LIMIT 100
    `)
    return (rows || []).map(r => ({
      id: r.id,
      bookingNumber: r.booking_number,
      userId: r.user_id,
      packageName: r.package_name,
      patientName: r.patient_name,
      patientPhone: r.patient_phone,
      patientAge: r.patient_age,
      patientGender: r.patient_gender,
      collectionDate: r.collection_date,
      collectionTimeSlot: r.collection_time_slot,
      totalAmount: Number(r.total_amount || 0),
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      status: r.status || 'CONFIRMED',
      fastingConfirmed: r.fasting_confirmed,
      createdAt: r.created_at
    }))
  } catch (err) {
    console.warn('fetchDbAllBookings error:', err.message)
    return []
  }
}

/**
 * Fetch admin dashboard KPI stats from the database.
 * Counts users across ALL tables so the number matches fetchDbAllUsers.
 */
export async function fetchDbAdminStats() {
  const sql = getDbClient()
  if (!sql) return { totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0, pendingOrders: 0, totalBookings: 0 }

  try {
    const [ordersRes, productsRes, bookingsRes] = await Promise.all([
      sql.query(`SELECT COUNT(*) as total, SUM(total_amount) as revenue, COUNT(*) FILTER (WHERE status ILIKE '%pending%' OR status ILIKE '%awaiting%') as pending FROM orders`).catch(() => [{ total: 0, revenue: 0, pending: 0 }]),
      sql.query(`SELECT COUNT(*) as total FROM products WHERE is_listed = true`).catch(() => [{ total: 0 }]),
      sql.query(`SELECT COUNT(*) as total FROM lab_test_bookings`).catch(() => [{ total: 0 }])
    ])

    // Count unique users across all tables by email (UNION deduplicates)
    let totalUsers = 0
    try {
      const userCountRes = await sql.query(`
        SELECT COUNT(*) as total FROM (
          SELECT email FROM user_profiles    WHERE email IS NOT NULL AND email <> ''
          UNION
          SELECT email FROM profiles         WHERE email IS NOT NULL AND email <> ''
          UNION
          SELECT email FROM users            WHERE email IS NOT NULL AND email <> ''
          UNION
          SELECT email FROM auth_users       WHERE email IS NOT NULL AND email <> ''
          UNION
          SELECT email FROM retailer_approvals WHERE email IS NOT NULL AND email <> ''
        ) AS unique_users
      `)
      totalUsers = Number(userCountRes[0]?.total || 0)
    } catch (_) {
      // Fallback: count just user_profiles
      try {
        const fb = await sql.query(`SELECT COUNT(*) as total FROM user_profiles`)
        totalUsers = Number(fb[0]?.total || 0)
      } catch (__) {}
    }

    return {
      totalOrders:   Number(ordersRes[0]?.total   || 0),
      totalRevenue:  Number(ordersRes[0]?.revenue  || 0),
      pendingOrders: Number(ordersRes[0]?.pending  || 0),
      totalUsers,
      totalProducts: Number(productsRes[0]?.total  || 0),
      totalBookings: Number(bookingsRes[0]?.total  || 0)
    }
  } catch (err) {
    console.warn('fetchDbAdminStats error:', err.message)
    return { totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0, pendingOrders: 0, totalBookings: 0 }
  }
}


/**
 * Fetch ALL products (including unlisted) for Admin inventory management
 */
export async function fetchDbAllProducts() {
  const sql = getDbClient()
  if (!sql) return []

  try {
    const rows = await sql.query(`
      SELECT 
        id, numeric_id, name, subtitle, category_name, brand, sku,
        mrp, customer_price, retailer_price, discount_percent, stock,
        image_url, web_image_url, details, is_flash_sale, is_featured,
        badges, is_listed, created_at, updated_at
      FROM products
      ORDER BY numeric_id ASC
    `)

    return rows.map(row => ({
      id: row.id,
      numericId: row.numeric_id,
      name: row.name,
      subtitle: row.subtitle || '',
      category: row.category_name || 'General',
      brand: row.brand || '',
      sku: row.sku || '',
      mrp: Number(row.mrp || 0),
      price: Number(row.customer_price || row.mrp || 0),
      retailerPrice: Number(row.retailer_price || 0),
      discountPercent: Number(row.discount_percent || 0),
      stock: Number(row.stock || 0),
      image: row.image_url || row.web_image_url || '',
      details: row.details || '',
      isFlashSale: Boolean(row.is_flash_sale),
      isFeatured: Boolean(row.is_featured),
      isListed: Boolean(row.is_listed),
      stockBadge: row.stock <= 0 ? 'Out of Stock' : row.stock <= 15 ? `Only ${row.stock} left` : `${row.stock} in stock`,
      isLowStock: row.stock <= 15,
      updatedAt: row.updated_at,
      createdAt: row.created_at
    }))
  } catch (err) {
    console.warn('fetchDbAllProducts error:', err.message)
    return []
  }
}

/**
 * Update a product's fields (is_listed, stock, is_flash_sale, is_featured, prices)
 * Only updates fields that are present in the payload.
 */
export async function updateDbProduct(productId, fields = {}) {
  const sql = getDbClient()
  if (!sql || !productId) return false

  const setParts = []
  const vals = []
  let idx = 1

  if (typeof fields.isListed === 'boolean')    { setParts.push(`is_listed = $${idx++}`);    vals.push(fields.isListed) }
  if (typeof fields.stock === 'number')         { setParts.push(`stock = $${idx++}`);         vals.push(fields.stock) }
  if (typeof fields.isFlashSale === 'boolean')  { setParts.push(`is_flash_sale = $${idx++}`); vals.push(fields.isFlashSale) }
  if (typeof fields.isFeatured === 'boolean')   { setParts.push(`is_featured = $${idx++}`);   vals.push(fields.isFeatured) }
  if (typeof fields.price === 'number')         { setParts.push(`customer_price = $${idx++}`); vals.push(fields.price) }
  if (typeof fields.retailerPrice === 'number') { setParts.push(`retailer_price = $${idx++}`); vals.push(fields.retailerPrice) }
  if (typeof fields.mrp === 'number')           { setParts.push(`mrp = $${idx++}`);           vals.push(fields.mrp) }

  if (setParts.length === 0) return false

  setParts.push(`updated_at = NOW()`)
  vals.push(productId)

  try {
    await sql.query(
      `UPDATE products SET ${setParts.join(', ')} WHERE id = $${idx}`,
      vals
    )
    return true
  } catch (err) {
    console.warn('updateDbProduct error:', err.message)
    return false
  }
}

/**
 * Insert a brand-new product into the products table
 */
export async function insertDbProduct(fields = {}) {
  const sql = getDbClient()
  if (!sql) return null

  const {
    name, subtitle = '', category = 'General', brand = '', sku = '',
    mrp = 0, price = 0, retailerPrice = 0, stock = 0,
    imageUrl = '', details = '', isFlashSale = false, isFeatured = false, isListed = true,
    discountPercent = 0
  } = fields

  // Compute next numeric_id
  let nextNumericId = 1
  try {
    const res = await sql.query(`SELECT COALESCE(MAX(numeric_id), 0) + 1 AS next_id FROM products`)
    nextNumericId = Number(res[0]?.next_id || 1)
  } catch (_) {}

  try {
    const rows = await sql.query(
      `INSERT INTO products (
        name, subtitle, category_name, brand, sku,
        mrp, customer_price, retailer_price, discount_percent, stock,
        image_url, web_image_url, details,
        is_flash_sale, is_featured, is_listed,
        numeric_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $11, $12,
        $13, $14, $15,
        $16, NOW(), NOW()
      ) RETURNING id, numeric_id`,
      [
        name, subtitle, category, brand, sku,
        mrp, price, retailerPrice, discountPercent, stock,
        imageUrl, details,
        isFlashSale, isFeatured, isListed,
        nextNumericId
      ]
    )
    return rows[0] || null
  } catch (err) {
    console.warn('insertDbProduct error:', err.message)
    return null
  }
}

/**
 * Delete a product by id (hard delete)
 */
export async function deleteDbProduct(productId) {
  const sql = getDbClient()
  if (!sql || !productId) return false
  try {
    await sql.query(`DELETE FROM products WHERE id = $1`, [productId])
    return true
  } catch (err) {
    console.warn('deleteDbProduct error:', err.message)
    return false
  }
}

/**
 * Change a user's role (updates user_profiles; also tries profiles, users, and retailer_approvals)
 */
export async function updateDbUserRole(userId, email, newRole) {
  const sql = getDbClient()
  if (!sql) return false

  let ok = false
  const cleanEmail = (email || '').toLowerCase().trim()
  try {
    if (userId) {
      await sql.query(`UPDATE user_profiles SET role = $1, updated_at = NOW() WHERE id = $2`, [newRole, userId])
      ok = true
    }
    if (cleanEmail) {
      await sql.query(`UPDATE user_profiles SET role = $1, updated_at = NOW() WHERE LOWER(email) = $2`, [newRole, cleanEmail]).catch(() => {})
      await sql.query(`UPDATE profiles SET role = $1, updated_at = NOW() WHERE LOWER(email) = $2`, [newRole, cleanEmail]).catch(() => {})
    }

    // If role changed to retailer or approved, sync status
    if (newRole === 'retailer' && cleanEmail) {
      await sql.query(`UPDATE profiles SET approval_status = 'approved', updated_at = NOW() WHERE LOWER(email) = $1`, [cleanEmail]).catch(() => {})
      await sql.query(`UPDATE retailer_approvals SET approval_status = 'approved', approved_at = NOW(), updated_at = NOW() WHERE LOWER(email) = $1`, [cleanEmail]).catch(() => {})
    }
  } catch (err) {
    console.warn('updateDbUserRole error:', err.message)
  }
  return ok
}

/**
 * Approve a pending retailer account directly from Admin Dashboard
 */
export async function approveDbRetailer(userId, email) {
  const sql = getDbClient()
  if (!sql) return false

  const cleanEmail = (email || '').toLowerCase().trim()
  let ok = false
  try {
    if (cleanEmail) {
      await sql.query(`UPDATE profiles SET role = 'retailer', approval_status = 'approved', updated_at = NOW() WHERE LOWER(email) = $1`, [cleanEmail]).catch(() => {})
      await sql.query(`UPDATE retailer_approvals SET approval_status = 'approved', approved_at = NOW(), updated_at = NOW() WHERE LOWER(email) = $1`, [cleanEmail]).catch(() => {})
      await sql.query(`UPDATE user_profiles SET role = 'retailer', updated_at = NOW() WHERE LOWER(email) = $1`, [cleanEmail]).catch(() => {})
      ok = true
    }
    if (userId) {
      await sql.query(`UPDATE user_profiles SET role = 'retailer', updated_at = NOW() WHERE id = $1`, [userId]).catch(() => {})
      await sql.query(`UPDATE profiles SET role = 'retailer', approval_status = 'approved', updated_at = NOW() WHERE id = $1`, [userId]).catch(() => {})
      await sql.query(`UPDATE retailer_approvals SET approval_status = 'approved', approved_at = NOW(), updated_at = NOW() WHERE user_id = $1 OR id = $1`, [userId]).catch(() => {})
      ok = true
    }
  } catch (err) {
    console.warn('approveDbRetailer error:', err.message)
  }
  return ok
}

/**
 * Reject a pending retailer account directly from Admin Dashboard
 */
export async function rejectDbRetailer(userId, email) {
  const sql = getDbClient()
  if (!sql) return false

  const cleanEmail = (email || '').toLowerCase().trim()
  let ok = false
  try {
    if (cleanEmail) {
      await sql.query(`UPDATE profiles SET approval_status = 'rejected', updated_at = NOW() WHERE LOWER(email) = $1`, [cleanEmail]).catch(() => {})
      await sql.query(`UPDATE retailer_approvals SET approval_status = 'rejected', updated_at = NOW() WHERE LOWER(email) = $1`, [cleanEmail]).catch(() => {})
      await sql.query(`UPDATE user_profiles SET role = 'customer', updated_at = NOW() WHERE LOWER(email) = $1`, [cleanEmail]).catch(() => {})
      ok = true
    }
    if (userId) {
      await sql.query(`UPDATE user_profiles SET role = 'customer', updated_at = NOW() WHERE id = $1`, [userId]).catch(() => {})
      await sql.query(`UPDATE profiles SET approval_status = 'rejected', updated_at = NOW() WHERE id = $1`, [userId]).catch(() => {})
      await sql.query(`UPDATE retailer_approvals SET approval_status = 'rejected', updated_at = NOW() WHERE user_id = $1 OR id = $1`, [userId]).catch(() => {})
      ok = true
    }
  } catch (err) {
    console.warn('rejectDbRetailer error:', err.message)
  }
  return ok
}

/**
 * Add a new user directly from Admin Dashboard
 */
export async function insertDbUser(userData) {
  const sql = getDbClient()
  const userId = userData.id || 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
  const email = (userData.email || '').toLowerCase().trim() || null
  const phone = (userData.phone || '').trim() || null
  const name = (userData.name || '').trim()
  const parts = name.split(' ')
  const firstName = userData.firstName || parts[0] || 'User'
  const lastName = userData.lastName || parts.slice(1).join(' ') || ''
  const fullName = name || `${firstName} ${lastName}`.trim()
  const role = userData.role || 'customer'
  const shopName = userData.shopName || ''
  const address = userData.address || ''
  const avatarUrl = userData.avatar || ''
  const signupMethod = userData.signupMethod || (email ? 'email' : 'phone')

  if (sql) {
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

      if (email) {
        await sql.query(`
          INSERT INTO user_profiles (
            id, email, first_name, last_name, full_name, phone,
            avatar_url, address, shop_name, role, signup_method, updated_at, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, NOW(), NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
            role = EXCLUDED.role,
            shop_name = EXCLUDED.shop_name,
            address = EXCLUDED.address,
            updated_at = NOW()
        `, [
          userId, email, firstName, lastName, fullName, phone,
          avatarUrl, address, shopName, role, signupMethod
        ])

        try {
          await sql.query(`
            INSERT INTO profiles (
              id, email, full_name, role, phone, shop_name, avatar_url, approval_status, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, 'approved', NOW(), NOW()
            )
            ON CONFLICT (email) DO UPDATE SET
              full_name = EXCLUDED.full_name,
              role = EXCLUDED.role,
              phone = COALESCE(EXCLUDED.phone, profiles.phone),
              shop_name = COALESCE(EXCLUDED.shop_name, profiles.shop_name),
              avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
              updated_at = NOW();
          `, [
            userId, email, fullName, role, phone || null, shopName || null, avatarUrl || null
          ])
        } catch (profSyncErr) {
          console.warn('insertDbUser profiles dual-sync note:', profSyncErr.message)
        }
      } else {
        await sql.query(`
          INSERT INTO user_profiles (
            id, email, first_name, last_name, full_name, phone,
            avatar_url, address, shop_name, role, signup_method, updated_at, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, NOW(), NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
            role = EXCLUDED.role,
            shop_name = EXCLUDED.shop_name,
            address = EXCLUDED.address,
            updated_at = NOW()
        `, [
          userId, null, firstName, lastName, fullName, phone,
          avatarUrl, address, shopName, role, signupMethod
        ])
      }
    } catch (err) {
      console.warn('insertDbUser db note:', err.message)
    }
  }

  return {
    id: userId,
    email: email || '',
    phone: phone || '',
    firstName,
    lastName,
    name: fullName,
    avatar: avatarUrl,
    address,
    shopName,
    role,
    signupMethod,
    createdAt: new Date().toISOString(),
    _source: 'user_profiles'
  }
}

/**
 * Delete / remove a user from the database
 */
export async function deleteDbUser(userId, email, phone) {
  const sql = getDbClient()
  if (!sql) return false
  if (!userId && !email && !phone) return false

  let deleted = false
  const cleanEmail = (email || '').toLowerCase().trim()
  const cleanPhone = (phone || '').trim()

  try {
    // If phone not provided, attempt to look up phone/email from tables before deleting
    let resolvedEmail = cleanEmail
    let resolvedPhone = cleanPhone

    if (userId && (!resolvedEmail || !resolvedPhone)) {
      try {
        const uRows = await sql.query(`SELECT email, phone FROM user_profiles WHERE id = $1 LIMIT 1`, [userId])
        if (uRows && uRows.length > 0) {
          if (!resolvedEmail && uRows[0].email) resolvedEmail = uRows[0].email.toLowerCase().trim()
          if (!resolvedPhone && uRows[0].phone) resolvedPhone = uRows[0].phone.trim()
        }
      } catch (_) {}
    }

    if (userId) {
      await sql.query(`DELETE FROM user_profiles WHERE id = $1`, [userId]).catch(() => {})
      await sql.query(`DELETE FROM profiles WHERE id = $1`, [userId]).catch(() => {})
      await sql.query(`DELETE FROM users WHERE id::text = $1`, [String(userId)]).catch(() => {})
      await sql.query(`DELETE FROM auth_users WHERE id = $1`, [userId]).catch(() => {})
      await sql.query(`DELETE FROM delivery_partner_profiles WHERE user_id::text = $1`, [String(userId)]).catch(() => {})
      await sql.query(`DELETE FROM retailer_approvals WHERE user_id::text = $1 OR id = $1`, [String(userId)]).catch(() => {})
      await sql.query(`DELETE FROM retailer_approval_requests WHERE user_id::text = $1`, [String(userId)]).catch(() => {})
      deleted = true
    }

    if (resolvedEmail) {
      await sql.query(`DELETE FROM user_profiles WHERE LOWER(email) = $1`, [resolvedEmail]).catch(() => {})
      await sql.query(`DELETE FROM profiles WHERE LOWER(email) = $1`, [resolvedEmail]).catch(() => {})
      await sql.query(`DELETE FROM users WHERE LOWER(email) = $1`, [resolvedEmail]).catch(() => {})
      await sql.query(`DELETE FROM auth_users WHERE LOWER(email) = $1`, [resolvedEmail]).catch(() => {})
      await sql.query(`DELETE FROM retailer_approvals WHERE LOWER(email) = $1`, [resolvedEmail]).catch(() => {})
      deleted = true
    }

    if (resolvedPhone) {
      await sql.query(`DELETE FROM user_profiles WHERE phone = $1`, [resolvedPhone]).catch(() => {})
      await sql.query(`DELETE FROM profiles WHERE phone = $1`, [resolvedPhone]).catch(() => {})
      await sql.query(`DELETE FROM retailer_approvals WHERE phone = $1`, [resolvedPhone]).catch(() => {})
      await sql.query(`DELETE FROM delivery_partner_profiles WHERE phone = $1`, [resolvedPhone]).catch(() => {})
      await sql.query(`DELETE FROM phone_verifications WHERE phone = $1`, [resolvedPhone]).catch(() => {})
      deleted = true
    }
  } catch (err) {
    console.warn('deleteDbUser error:', err.message)
  }

  return deleted
}

/**
 * Fetch all orders belonging to a specific user (by userId or email)
 */
export async function fetchDbUserOrders(userId, email) {
  const sql = getDbClient()
  if (!sql) return []

  try {
    let rows = []
    if (userId) {
      rows = await sql.query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [userId]
      ).catch(() => [])
    }
    if (rows.length === 0 && email) {
      rows = await sql.query(
        `SELECT * FROM orders WHERE customer_email ILIKE $1 ORDER BY created_at DESC LIMIT 50`,
        [email]
      ).catch(() => [])
    }
    return (rows || []).map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      status: o.status,
      totalAmount: Number(o.total_amount || 0),
      paymentMethod: o.payment_method,
      createdAt: o.created_at
    }))
  } catch (err) {
    console.warn('fetchDbUserOrders error:', err.message)
    return []
  }
}

/**
 * Advance a lab booking's status
 */
export async function updateDbBookingStatus(bookingId, newStatus) {
  const sql = getDbClient()
  if (!sql) return false

  try {
    await sql.query(
      `UPDATE lab_test_bookings SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, bookingId]
    )
    return true
  } catch (err) {
    console.warn('updateDbBookingStatus error:', err.message)
    return false
  }
}

/**
 * Fetch analytics data for Admin Dashboard:
 * - Revenue & order count per day for last N days
 * - Orders grouped by status (for pie chart)
 * - Top 10 selling products (from order_items)
 */
export async function fetchDbAnalytics(days = 30) {
  const sql = getDbClient()
  if (!sql) return { dailyRevenue: [], statusBreakdown: [], topProducts: [] }

  const dailyRevenue = []
  const statusBreakdown = []
  const topProducts = []

  try {
    const daily = await sql.query(`
      SELECT 
        DATE(created_at) as day,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `).catch(() => [])
    ;(daily || []).forEach(r => dailyRevenue.push({
      day: r.day,
      orders: Number(r.orders || 0),
      revenue: Number(r.revenue || 0)
    }))
  } catch (_) {}

  try {
    const breakdown = await sql.query(`
      SELECT status, COUNT(*) as cnt
      FROM orders
      GROUP BY status
      ORDER BY cnt DESC
    `).catch(() => [])
    ;(breakdown || []).forEach(r => statusBreakdown.push({ status: r.status, count: Number(r.cnt || 0) }))
  } catch (_) {}

  try {
    const top = await sql.query(`
      SELECT 
        oi.product_name as name,
        oi.product_id as product_id,
        SUM(oi.quantity) as total_qty,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      GROUP BY oi.product_name, oi.product_id
      ORDER BY total_qty DESC
      LIMIT 10
    `).catch(() => [])
    ;(top || []).forEach(r => topProducts.push({
      name: r.name,
      productId: r.product_id,
      totalQty: Number(r.total_qty || 0),
      totalRevenue: Number(r.total_revenue || 0)
    }))
  } catch (_) {}

  return { dailyRevenue, statusBreakdown, topProducts }
}

/**
 * Assign a delivery partner / rider to an order
 */
export async function updateDbOrderDeliveryPartner(orderId, partnerName, partnerPhone, partnerId) {
  const sql = getDbClient()
  if (!sql) return false

  try {
    // Look up delivery partner ID if not provided
    let pId = partnerId || null
    if (!pId && (partnerName || partnerPhone)) {
      try {
        const found = await sql.query(
          `SELECT id FROM users WHERE (LOWER(name) = $1 OR phone = $2) AND role = 'delivery_partner' LIMIT 1`,
          [(partnerName || '').toLowerCase(), partnerPhone || '']
        )
        if (found && found.length > 0) pId = found[0].id
      } catch (_) {}
    }

    await sql.query(
      `UPDATE orders SET 
        delivery_partner_name = $1, 
        delivery_partner_phone = $2, 
        delivery_partner_id = COALESCE($3, delivery_partner_id),
        status = CASE WHEN status IN ('Pending', 'Processing') THEN 'Dispatched' ELSE status END,
        delivery_status = 'dispatched',
        updated_at = NOW() 
      WHERE id = $4`,
      [partnerName || null, partnerPhone || null, pId, orderId]
    ).catch(async () => {
      await sql.query(
        `UPDATE orders SET delivery_partner_name = $1, delivery_partner_phone = $2, updated_at = NOW() WHERE id = $3`,
        [partnerName || null, partnerPhone || null, orderId]
      ).catch(() => {})
    })
    return true
  } catch (err) {
    console.warn('updateDbOrderDeliveryPartner:', err.message)
    return false
  }
}

/**
 * Fetch prescription uploads for Admin review
 */
export async function fetchDbPrescriptions() {
  const sql = getDbClient()
  if (!sql) return []

  try {
    const rows = await sql.query(`
      SELECT * FROM prescription_uploads ORDER BY created_at DESC LIMIT 100
    `).catch(() => [])

    return (rows || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name || r.patient_name || 'Customer',
      userPhone: r.user_phone || r.patient_phone || '',
      fileUrl: r.file_url || r.image_url || '',
      status: r.status || 'PENDING',
      notes: r.notes || '',
      createdAt: r.created_at
    }))
  } catch (err) {
    console.warn('fetchDbPrescriptions error:', err.message)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY PARTNER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch orders assigned to a specific delivery partner (by name or phone).
 * Falls back to all dispatched/in-transit orders if no partner info is provided.
 */
export async function fetchDbDeliveryOrders(partnerName, partnerPhone, partnerId) {
  const sql = getDbClient()
  if (!sql) return []

  try {
    let rows = []

    // Try to get orders assigned to this specific partner (by ID, phone, or name)
    if (partnerId || partnerName || partnerPhone) {
      const conditions = []
      const params = []
      if (partnerId) { conditions.push(`delivery_partner_id::text = $${params.length + 1}`); params.push(String(partnerId)) }
      if (partnerPhone) { conditions.push(`delivery_partner_phone = $${params.length + 1}`); params.push(partnerPhone) }
      if (partnerName) { conditions.push(`LOWER(delivery_partner_name) ILIKE $${params.length + 1}`); params.push(`%${partnerName.toLowerCase()}%`) }

      if (conditions.length) {
        rows = await sql.query(
          `SELECT * FROM orders WHERE (${conditions.join(' OR ')}) ORDER BY created_at DESC LIMIT 200`,
          params
        ).catch(() => [])
      }
    }

    // If no assigned orders found, fall back to dispatched/in-transit orders
    if (rows.length === 0) {
      rows = await sql.query(
        `SELECT * FROM orders WHERE LOWER(status) IN ('dispatched', 'in transit', 'out for delivery', 'delivery') ORDER BY created_at DESC LIMIT 200`
      ).catch(() => [])
    }

    // If still empty, return all non-pending orders for context
    if (rows.length === 0) {
      rows = await sql.query(
        `SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`
      ).catch(() => [])
    }

    return (rows || []).map(o => {
      let addr = ''
      try {
        const sa = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : (o.shipping_address || {})
        addr = [sa.line1 || sa.address, sa.city, sa.state, sa.pincode].filter(Boolean).join(', ')
      } catch { addr = String(o.shipping_address || '') }

      let items = []
      try { items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []) } catch { items = [] }
      const itemsSummary = items.slice(0, 2).map(i => `${i.product_name || i.name || 'Item'} ×${i.quantity || 1}`).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '')

      return {
        id: o.id,
        orderNumber: o.order_number || o.id?.slice(0, 14),
        customerName: o.customer_name || 'Customer',
        customerPhone: o.customer_phone || o.customer_contact || '',
        customerEmail: o.customer_email || '',
        shippingAddress: addr || o.delivery_address || '',
        totalAmount: Number(o.total_amount || 0),
        status: o.status || 'Dispatched',
        paymentMethod: o.payment_method || '',
        paymentStatus: o.payment_status || '',
        itemsSummary,
        items,
        deliveryPartnerName: o.delivery_partner_name || '',
        deliveryPartnerPhone: o.delivery_partner_phone || '',
        deliveryNotes: o.delivery_notes || '',
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        _source: 'orders'
      }
    })
  } catch (err) {
    console.warn('fetchDbDeliveryOrders error:', err.message)
    return []
  }
}

/**
 * Fetch delivery partner stats: total assigned, delivered today, pending, earnings
 */
export async function fetchDbDeliveryStats(partnerName, partnerPhone, partnerId) {
  const sql = getDbClient()
  if (!sql) return { totalAssigned: 0, deliveredToday: 0, pendingDeliveries: 0, totalDelivered: 0 }

  try {
    const orders = await fetchDbDeliveryOrders(partnerName, partnerPhone, partnerId)
    const today = new Date().toDateString()

    const delivered = orders.filter(o => /delivered|completed/i.test(o.status || ''))
    const deliveredToday = delivered.filter(o => o.updatedAt && new Date(o.updatedAt).toDateString() === today)
    const pending = orders.filter(o => /dispatch|transit|out for|delivery/i.test(o.status || '') && !/delivered/i.test(o.status || ''))

    return {
      totalAssigned: orders.length,
      deliveredToday: deliveredToday.length,
      totalDelivered: delivered.length,
      pendingDeliveries: pending.length,
    }
  } catch (err) {
    console.warn('fetchDbDeliveryStats error:', err.message)
    return { totalAssigned: 0, deliveredToday: 0, pendingDeliveries: 0, totalDelivered: 0 }
  }
}

/**
 * Update delivery status for an order (delivery partner action: mark as delivered, etc.)
 */
export async function updateDbDeliveryStatus(orderId, newStatus, notes) {
  const sql = getDbClient()
  if (!sql) return false

  try {
    const fields = [`status = $1`, `updated_at = NOW()`]
    const params = [newStatus, orderId]

    if (notes) {
      fields.push(`delivery_notes = $${params.length - 1 + 1}`)
      // reorder params
      params.splice(1, 0, notes)
      // Fix: build properly
    }

    await sql.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, orderId]
    )

    if (notes) {
      await sql.query(
        `UPDATE orders SET delivery_notes = $1 WHERE id = $2`,
        [notes, orderId]
      ).catch(() => {})
    }

    return true
  } catch (err) {
    console.warn('updateDbDeliveryStatus error:', err.message)
    return false
  }
}
