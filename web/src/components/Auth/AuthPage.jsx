import React, { useState } from 'react'
import { usePlatform } from '../../hooks/usePlatform'
import { getDbClient, saveDbUserProfile } from '../../services/db'
import { api } from '../../services/api'
import '../../styles/auth.css'

export function AuthPage({ 
  initialMode = 'login', 
  isApp: propIsApp, 
  onSuccess, 
  onClose 
}) {
  const { isApp: detectedIsApp } = usePlatform()
  const isApp = Boolean(
    propIsApp === true ||
    detectedIsApp ||
    (typeof window !== 'undefined' && (
      window.isAndroidApp === true ||
      new URLSearchParams(window.location.search).get('platform') === 'android_app' ||
      document.body.classList.contains('android-app') ||
      window.location.pathname.startsWith('/app')
    ))
  )

  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [shopName, setShopName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Status & Feedback
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Verification status modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusQuery, setStatusQuery] = useState('')
  const [statusResult, setStatusResult] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  // Handle Login - Supports Customer, Retailer, Admin, Staff via Email OR Phone Number
  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email || !password) {
      setErrorMsg('Please enter your email or mobile number and password.')
      return
    }

    setLoading(true)
    try {
      const sql = getDbClient()
      const cleanIdentifier = email.trim()
      const lowerIdentifier = cleanIdentifier.toLowerCase()
      const digitsOnly = cleanIdentifier.replace(/\D/g, '')
      const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : (digitsOnly.length > 0 ? digitsOnly : null)
      const isEmailInput = lowerIdentifier.includes('@')

      let verifiedUser = null

      if (sql) {
        try {
          // Check users table in Neon
          let userRows = await sql.query(
            `SELECT * FROM users 
             WHERE LOWER(email) = $1 
                OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(email, ''), '[^0-9]', '', 'g'), 10) = $2)
             LIMIT 1`,
            [lowerIdentifier, last10Digits]
          ).catch(() => [])

          // Fallback to profiles table
          if (!userRows || userRows.length === 0) {
            userRows = await sql.query(
              `SELECT * FROM profiles 
               WHERE LOWER(email) = $1 
                  OR phone = $1
                  OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $2)
               LIMIT 1`,
              [lowerIdentifier, last10Digits]
            ).catch(() => [])
          }

          if (userRows && userRows.length > 0) {
            verifiedUser = userRows[0]
          }
        } catch (dbErr) {
          console.warn('Profile/User query fallback:', dbErr.message)
        }
      }

      let dbProfile = null
      if (sql) {
        try {
          const { fetchDbUserProfile } = await import('../../services/db')
          dbProfile = await fetchDbUserProfile(cleanIdentifier)
        } catch (dbErr) {
          console.warn('user_profiles login query note:', dbErr.message)
        }
      }

      // STRICT CHECK: If user was deleted or never existed, and is not system super-admin, strictly reject login
      const isSuperAdminEmail = lowerIdentifier === 'subhonehealthgroup@gmail.com'
      if (!dbProfile && !verifiedUser && !isSuperAdminEmail) {
        setErrorMsg('Account not found or has been deleted by an administrator. Please check your credentials or create a new account.')
        setLoading(false)
        return
      }

      // Universal Role Detection: Customer, Retailer, Admin, Staff
      let detectedRole = dbProfile?.role || verifiedUser?.role || null
      if (!detectedRole) {
        if (isSuperAdminEmail || lowerIdentifier.includes('admin')) {
          detectedRole = 'admin'
        } else if (lowerIdentifier.includes('staff') || lowerIdentifier.includes('delivery')) {
          detectedRole = 'delivery_partner'
        } else if (lowerIdentifier.includes('retailer') || lowerIdentifier.includes('pharmacy') || lowerIdentifier.includes('partner') || dbProfile?.shopName || verifiedUser?.shop_name) {
          detectedRole = 'retailer'
        } else {
          detectedRole = 'customer'
        }
      }

      // If logging in as Retailer, verify admin approval status before allowing access
      if (detectedRole === 'retailer') {
        let isApproved = false
        // 1. Check dbProfile approvalStatus
        if (dbProfile?.approvalStatus === 'approved') {
          isApproved = true
        }

        // 2. Check profiles / retailer_approvals table if sql is connected
        if (!isApproved && sql) {
          try {
            const retRes = await sql.query(
              `SELECT approval_status, status FROM retailer_approvals 
               WHERE LOWER(email) = $1 
                  OR phone = $1
                  OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $2)
               LIMIT 1`,
              [lowerIdentifier, last10Digits]
            ).catch(() => [])

            const profRes = await sql.query(
              `SELECT approval_status FROM profiles 
               WHERE LOWER(email) = $1 
                  OR phone = $1
                  OR ($2::text IS NOT NULL AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $2)
               LIMIT 1`,
              [lowerIdentifier, last10Digits]
            ).catch(() => [])

            const retStatus = String(retRes?.[0]?.approval_status || retRes?.[0]?.status || '').toLowerCase()
            const profStatus = String(profRes?.[0]?.approval_status || '').toLowerCase()

            if (retStatus === 'approved' || profStatus === 'approved') {
              isApproved = true
            }
          } catch (apprErr) {
            console.warn('Retailer approval verification note:', apprErr.message)
          }
        }

        if (!isApproved) {
          setErrorMsg('Your retailer account is currently pending admin approval. You cannot log in until verified by our administration. Please check your application status below or contact support.')
          setLoading(false)
          return
        }
      }

      // Friendly Role Label
      const roleDisplayName = 
        detectedRole === 'admin' ? 'Administrator' :
        detectedRole === 'retailer' ? 'Retailer Partner' :
        (detectedRole === 'delivery_partner' || detectedRole === 'staff') ? 'Staff / Delivery Partner' :
        'Customer'

      const finalEmail = dbProfile?.email || verifiedUser?.email || (isEmailInput ? lowerIdentifier : '')
      const finalPhone = dbProfile?.phone || verifiedUser?.phone || (!isEmailInput ? cleanIdentifier : '')
      const resolvedName = dbProfile?.name || verifiedUser?.full_name || verifiedUser?.name || (isEmailInput ? finalEmail.split('@')[0] : `User ${finalPhone.slice(-4) || ''}`)

      const userPayload = {
        id: dbProfile?.id || verifiedUser?.id || 'usr_' + Date.now(),
        name: resolvedName,
        firstName: dbProfile?.firstName || (resolvedName ? resolvedName.split(' ')[0] : ''),
        lastName: dbProfile?.lastName || '',
        email: finalEmail,
        phone: finalPhone,
        avatar: dbProfile?.avatar || verifiedUser?.avatar_url || '',
        address: dbProfile?.address || '',
        dob: dbProfile?.dob || '',
        age: dbProfile?.age || '',
        gender: dbProfile?.gender || '',
        role: detectedRole,
        portal: detectedRole,
        shopName: dbProfile?.shopName || verifiedUser?.shop_name || verifiedUser?.business_name || (detectedRole === 'retailer' ? 'SubhOne Partner Store' : ''),
        signupMethod: dbProfile?.signupMethod || (finalEmail ? 'email' : 'phone'),
        isVerified: true,
        loginAt: new Date().toISOString()
      }

      localStorage.setItem('subhone_auth_user', JSON.stringify(userPayload))
      localStorage.setItem('app_role', detectedRole)
      setSuccessMsg(`Welcome back, ${userPayload.name}! Logged in as ${roleDisplayName}.`)

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(userPayload)
        } else if (onClose) {
          onClose()
        }
      }, 700)

    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Signup - Supports Customer & Retailer with unified creation
  const handleSignup = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const sql = getDbClient()
      const cleanEmail = email.toLowerCase().trim()
      const assignedUserId = 'usr_' + Date.now()
      const signupRole = 'customer'

      // Save user profile reliably using centralized saveDbUserProfile
      const signupMethod = cleanEmail ? 'email' : 'phone'
      const nameParts = fullName.trim().split(' ')
      const fName = nameParts[0] || ''
      const lName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

      try {
        await saveDbUserProfile({
          id: assignedUserId,
          email: cleanEmail,
          phone: phone.trim() || '',
          firstName: fName,
          lastName: lName,
          name: fullName.trim(),
          role: signupRole,
          shopName: '',
          signupMethod: signupMethod
        })
      } catch (profErr) {
        console.warn('saveDbUserProfile signup sync note:', profErr.message)
      }

      // Regular customers can directly log in
      const userPayload = {
        id: assignedUserId,
        name: fullName.trim(),
        firstName: fName,
        lastName: lName,
        email: cleanEmail,
        phone: phone.trim(),
        shopName: '',
        role: signupRole,
        portal: signupRole,
        signupMethod: signupMethod,
        isVerified: true,
        status: 'ACTIVE',
        registeredAt: new Date().toISOString()
      }

      localStorage.setItem('subhone_auth_user', JSON.stringify(userPayload))
      localStorage.setItem('app_role', signupRole)
      setSuccessMsg('Account created successfully! Welcome to SubhOne Health.')

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(userPayload)
        } else if (onClose) {
          onClose()
        }
      }, 900)

    } catch (err) {
      setErrorMsg(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Check Retailer Verification Status
  const handleCheckStatus = async (e) => {
    e.preventDefault()
    if (!statusQuery.trim()) return

    setStatusLoading(true)
    setStatusResult(null)
    try {
      const sql = getDbClient()
      let statusData = null

      if (sql) {
        try {
          const res = await sql.query(
            'SELECT * FROM retailer_approvals WHERE email ILIKE $1 OR phone ILIKE $1 LIMIT 1',
            [`%${statusQuery.trim()}%`]
          )
          if (res && res.length > 0) {
            statusData = res[0]
          } else {
            const profRes = await sql.query(
              'SELECT * FROM profiles WHERE (email ILIKE $1 OR phone ILIKE $1) AND role = \'retailer\' LIMIT 1',
              [`%${statusQuery.trim()}%`]
            )
            if (profRes && profRes.length > 0) {
              statusData = profRes[0]
            }
          }
        } catch (e) {
          console.warn('Status lookup note:', e.message)
        }
      }

      if (statusData) {
        const rawStatus = (statusData.approval_status || statusData.status || 'PENDING').toUpperCase()
        setStatusResult({
          found: true,
          shopName: statusData.shop_name || statusData.full_name || statusData.retailer_name || 'Retailer Pharmacy',
          status: rawStatus,
          date: statusData.created_at ? new Date(statusData.created_at).toLocaleDateString() : 'Recent'
        })
      } else {
        setStatusResult({
          found: false,
          message: 'No retailer application found for this email or phone. If you just registered, please ensure your email/phone matches.'
        })
      }
    } catch (err) {
      setStatusResult({ found: false, message: 'No record found. Please verify details.' })
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className={`auth-page-wrapper ${isApp ? 'app-mode' : 'web-mode'}`}>
      {/* Decorative background elements */}
      <div className="auth-bg-deco auth-bg-deco-1">+</div>
      <div className="auth-bg-deco auth-bg-deco-2">+</div>
      <div className="auth-bg-deco auth-bg-deco-3">+</div>
      <div className="auth-bg-deco auth-bg-deco-4">+</div>

      <div className="auth-container">
        {/* Left Side: Hero Branding Panel (Visible on Website, Hidden in Mobile App) */}
        {!isApp && (
          <div className="auth-hero-panel">
            <div className="auth-hero-brand">
              <div className="auth-brand-badge-img">
                <img src="./subhone_logo.png" alt="SubhOne Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="auth-hero-brand-text">
                <h1>SubhOne <span className="brand-red-sub">Health Group</span></h1>
              </div>
            </div>

            <div className="auth-welcome-pill">
              <span>{mode === 'login' ? ' Welcome Back' : ' Join SubhOne Health'}</span>
            </div>

            <h2 className="auth-hero-title">
              Your Health
              <span>Our Priority</span>
            </h2>

            <p className="auth-hero-desc">
              {mode === 'login'
                ? 'Log in to access your account and continue your health journey with verified genuine medicines.'
                : 'Join SubhOne Health Group to unlock wholesale medicine rates, direct distributor billing, and fast dispatch.'
              }
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-box"></div>
                <div className="auth-feature-text">
                  <strong>Wide Range</strong>
                  <span>of Health Products & Certified Brands</span>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-box"></div>
                <div className="auth-feature-text">
                  <strong>Trusted</strong>
                  <span>Quality, Lab Certified & 100% Genuine Care</span>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-box"></div>
                <div className="auth-feature-text">
                  <strong>Fast & Reliable</strong>
                  <span>Doorstep Express Delivery Across Pin Codes</span>
                </div>
              </div>
            </div>

            <div className="auth-fleet-card">
              <div className="auth-fleet-left">
                <span className="auth-fleet-icon"></span>
                <div className="auth-fleet-info">
                  <strong>SubhOne Express Fleet</strong>
                  <span>Safe cold-chain & tamper-proof medicine boxes</span>
                </div>
              </div>
              <span className="auth-fleet-badge">ACTIVE</span>
            </div>
          </div>
        )}

        {/* Right Side: Elevated Form Card */}
        <div className="auth-form-card">
          {/* Top navigation controls (Back / Close button if embedded) */}
          <div className="auth-card-top-nav">
            {onClose && (
              <button 
                type="button" 
                className="auth-back-btn" 
                onClick={onClose}
              >
                ← Back to Store
              </button>
            )}

          </div>

          {/* Centered Brand Header */}
          <div className="auth-card-brand">
            <div className="auth-card-logo-box">
              <img src="./subhone_logo.png" alt="SubhOne Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h3 className="auth-card-brand-title">SubhOne <span style={{ color: '#ef4444' }}>Health Group</span></h3>


          </div>

          {/* Mode Switcher: Sign In vs Create Account */}
          <div className="auth-mode-switcher">
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="auth-alert-error" role="alert">
              <span></span>
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="auth-alert-success" role="status">
              <span></span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {mode === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-input-group">
                <label className="auth-input-label">
                  Email Address or Mobile Number <span className="required">*</span>
                </label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    className="auth-input-field"
                    placeholder="name@example.com or 10-digit mobile"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  Password <span className="required">*</span>
                </label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" x2="22" y1="2" y2="22"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-remember-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-forgot-btn"
                  onClick={() => alert('Password reset instructions will be sent to your registered email.')}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Login →'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignup}>
              <div className="auth-input-group">
                <label className="auth-input-label">
                  Full Name <span className="required">*</span>
                </label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="auth-input-field"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  Email Address <span className="required">*</span>
                </label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="auth-input-field"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">
                  Phone Number (Optional)
                </label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <input
                    type="tel"
                    className="auth-input-field"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-two-col-row">
                <div className="auth-input-group">
                  <label className="auth-input-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="auth-input-box">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input-field"
                      style={{ paddingLeft: '14px' }}
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-input-label">
                    Confirm <span className="required">*</span>
                  </label>
                  <div className="auth-input-box">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="auth-input-field"
                      style={{ paddingLeft: '14px' }}
                      placeholder="Confirm"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>
          )}

          {/* Footer Links */}
          <div className="auth-footer-links">
            <div className="auth-switch-mode-text">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setMode('signup')}>
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('login')}>
                    Sign In
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              className="auth-verification-status-link"
              onClick={() => setShowStatusModal(true)}
            >
              Applied as Retailer? Check your verification status →
            </button>
          </div>
        </div>
      </div>

      {/* Retailer Verification Status Modal */}
      {showStatusModal && (
        <div className="auth-modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="auth-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h3>Check Retailer Verification Status</h3>
              <button 
                type="button" 
                className="auth-modal-close-btn"
                onClick={() => setShowStatusModal(false)}
              >
                
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '14px' }}>
              Enter your registered business email or phone number to check your SubhOne wholesale approval state.
            </p>

            <form onSubmit={handleCheckStatus} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                className="auth-input-field"
                style={{ paddingLeft: '14px' }}
                placeholder="Enter Email or Phone number"
                value={statusQuery}
                onChange={e => setStatusQuery(e.target.value)}
                required
              />
              <button
                type="submit"
                className="auth-submit-btn"
                style={{ height: '42px', fontSize: '13.5px' }}
                disabled={statusLoading}
              >
                {statusLoading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {statusResult && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                {statusResult.found ? (
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{statusResult.shopName}</div>
                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Status:</span>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '999px', 
                        fontWeight: '700', 
                        fontSize: '11px',
                        background: statusResult.status === 'APPROVED' ? '#dcfce7' : '#fef3c7',
                        color: statusResult.status === 'APPROVED' ? '#15803d' : '#b45309'
                      }}>
                        {statusResult.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#ef4444' }}>{statusResult.message}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthPage
