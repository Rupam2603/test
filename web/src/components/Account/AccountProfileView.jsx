import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import '../../styles/account.css'

export default function AccountProfileView({ user, onUpdateUser, onLogout, showToast }) {
  const isRetailer = user?.role === 'retailer' || user?.portal === 'retailer' || Boolean(user?.shopName)

  // Determine what method the user used to sign up (default to 'email' if email is present)
  // 'email' means created with Email (Email is locked, Phone is editable)
  // 'phone' means created with Phone (Phone is locked, Email is editable)
  const isEmailSignup = user?.signupMethod === 'phone' 
    ? false 
    : (user?.signupMethod === 'email' ? true : Boolean(user?.email && !user?.phone))

  // Split name into first and last name if available
  const initialFirstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : '')
  const initialLastName = user?.lastName || (user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '')

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [dob, setDob] = useState(user?.dob || '')
  const [age, setAge] = useState(user?.age || '')
  const [gender, setGender] = useState(user?.gender || 'Prefer not to say')
  const [address, setAddress] = useState(user?.address || '')
  const [shopName, setShopName] = useState(user?.shopName || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Helper: Automatically calculate age from Date of Birth
  const calculateAgeFromDob = (birthDateString) => {
    if (!birthDateString) return ''
    const birthDate = new Date(birthDateString)
    if (isNaN(birthDate.getTime())) return ''
    const today = new Date()
    let calculatedAge = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--
    }
    return calculatedAge >= 0 ? calculatedAge : 0
  }

  // Handle Date of Birth Change and auto-compute Age
  const handleDobChange = (e) => {
    const selectedDob = e.target.value
    setDob(selectedDob)
    const computedAge = calculateAgeFromDob(selectedDob)
    setAge(computedAge !== '' ? computedAge : '')
  }

  // Fetch persisted profile from database on mount or when user changes
  useEffect(() => {
    let isMounted = true
    async function loadLatestProfile() {
      const queryKey = user?.email || user?.phone || user?.id
      if (!queryKey) return
      setLoadingProfile(true)
      try {
        const dbProfile = await api.getUserProfile(queryKey)
        if (dbProfile && isMounted) {
          if (dbProfile.firstName) setFirstName(dbProfile.firstName)
          if (dbProfile.lastName) setLastName(dbProfile.lastName)
          if (dbProfile.email) setEmail(dbProfile.email)
          if (dbProfile.phone) setPhone(dbProfile.phone)
          if (dbProfile.dob) {
            setDob(dbProfile.dob)
            const computedAge = calculateAgeFromDob(dbProfile.dob)
            setAge(computedAge !== '' ? computedAge : (dbProfile.age || ''))
          } else if (dbProfile.age) {
            setAge(dbProfile.age)
          }
          if (dbProfile.gender) setGender(dbProfile.gender)
          if (dbProfile.address) setAddress(dbProfile.address)
          if (dbProfile.shopName) setShopName(dbProfile.shopName)
          if (dbProfile.avatar) setAvatar(dbProfile.avatar)

          // Sync into localStorage and parent state
          const updatedUserObj = { ...user, ...dbProfile }
          localStorage.setItem('subhone_auth_user', JSON.stringify(updatedUserObj))
          if (onUpdateUser) onUpdateUser(updatedUserObj)
        }
      } catch (err) {
        console.warn('Could not sync latest database profile:', err.message)
      } finally {
        if (isMounted) setLoadingProfile(false)
      }
    }

    loadLatestProfile()
    return () => { isMounted = false }
  }, [user?.email, user?.phone, user?.id])

  // Handle Photo Upload (Converts image to base64 data URI so it persists in the database)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      if (showToast) showToast('Image size should be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatar(reader.result)
      if (showToast) showToast('Profile photo selected! Click Save to apply.')
    }
    reader.readAsDataURL(file)
  }

  // Handle Save Profile
  const handleSave = async (e) => {
    e?.preventDefault()
    setSaving(true)

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || email.split('@')[0] || phone || 'User'
    const computedAge = dob ? calculateAgeFromDob(dob) : age

    const payload = {
      id: user?.id || user?.email || user?.phone || 'usr_' + Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
      email: email.trim(),
      phone: phone.trim(),
      dob: dob.trim(),
      age: computedAge !== '' ? String(computedAge) : '',
      gender,
      address: address.trim(),
      shopName: isRetailer ? shopName.trim() : (user?.shopName || ''),
      avatar,
      role: user?.role || (isRetailer ? 'retailer' : 'customer'),
      portal: user?.portal || (isRetailer ? 'retailer' : 'customer'),
      signupMethod: user?.signupMethod || (isEmailSignup ? 'email' : 'phone'),
      isVerified: user?.isVerified ?? true
    }

    try {
      // Save directly to Neon database
      const saved = await api.updateUserProfile(payload)
      const mergedUser = { ...user, ...payload, ...saved }

      // Persist to local storage for instant sync across tabs
      localStorage.setItem('subhone_auth_user', JSON.stringify(mergedUser))
      if (onUpdateUser) onUpdateUser(mergedUser)

      setIsEditing(false)
      if (showToast) showToast('Profile details successfully saved to database!')
    } catch (err) {
      console.error('Error saving profile:', err)
      if (showToast) showToast('Failed to save profile. Please check connection.')
    } finally {
      setSaving(false)
    }
  }

  const displayName = `${firstName} ${lastName}`.trim() || user?.name || 'Valued Member'

  return (
    <section className="catalog-section web-account-view">
      <div className="section-title-bar">
        <div>
          <h2>Account & Healthcare Profile</h2>
          <p>View, update and manage your personal details, delivery address, and store credentials.</p>
        </div>
        {!isEditing ? (
          <button 
            type="button" 
            className="edit-profile-action-btn"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="edit-btn-group">
            <button 
              type="button" 
              className="cancel-profile-btn"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="account-profile-container">
        {/* Left Column: Profile Card & Quick Stats */}
        <div className="account-sidebar-card">
          <div className="account-avatar-wrapper">
            <div className="account-avatar-circle">
              {avatar ? (
                <img src={avatar} alt={displayName} className="account-avatar-img" />
              ) : (
                <span className="account-avatar-letter">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {isEditing && (
              <label className="avatar-upload-badge" title="Change profile photo">
                📷
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            )}
          </div>

          <div className="account-primary-info">
            <h3 className="account-user-name">{displayName}</h3>
            <p className="account-user-email">{email || phone || 'No email registered'}</p>
            {isRetailer && shopName && (
              <div className="account-store-badge">
                🏪 {shopName}
              </div>
            )}
            <span className="account-status-badge">
              {isRetailer ? '🛡️ Verified Retailer Partner' : '⭐ SubhOne Health Member'}
            </span>
          </div>

          <div className="account-summary-stats">
            <div className="acc-stat-box">
              <span className="acc-stat-value">₹450</span>
              <span className="acc-stat-label">Health Wallet</span>
            </div>
            <div className="acc-stat-box">
              <span className="acc-stat-value">100%</span>
              <span className="acc-stat-label">Verified</span>
            </div>
          </div>

          {onLogout && (
            <button type="button" className="account-logout-btn" onClick={onLogout}>
              🚪 Sign Out of Account
            </button>
          )}
        </div>

        {/* Right Column: Editable Details Form */}
        <div className="account-details-card">
          <div className="card-header-row">
            <h4>{isEditing ? 'Edit Personal Information' : 'Personal & Healthcare Details'}</h4>
            {loadingProfile && <span className="sync-badge">🔄 Syncing with Database...</span>}
          </div>

          <form onSubmit={handleSave} className="account-form-grid">
            {/* First Name & Last Name */}
            <div className="form-group-col">
              <label className="field-label">First Name *</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="account-input" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  placeholder="First Name" 
                  required 
                />
              ) : (
                <div className="field-display-value">{firstName || '—'}</div>
              )}
            </div>

            <div className="form-group-col">
              <label className="field-label">Last Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="account-input" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  placeholder="Last Name" 
                />
              ) : (
                <div className="field-display-value">{lastName || '—'}</div>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group-col">
              <label className="field-label">
                Email Address
                {isEmailSignup ? (
                  <span className="locked-badge" title="Registered identifier cannot be altered">🔒 Primary Login</span>
                ) : (
                  <span className="editable-badge">✏️ Editable</span>
                )}
              </label>
              {isEditing ? (
                <input 
                  type="email" 
                  className={`account-input ${isEmailSignup ? 'input-locked' : ''}`} 
                  value={email} 
                  onChange={e => !isEmailSignup && setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  readOnly={isEmailSignup}
                  title={isEmailSignup ? "Registered account email cannot be changed" : "Enter your email"}
                />
              ) : (
                <div className="field-display-value">{email || '—'}</div>
              )}
            </div>

            {/* Phone Number */}
            <div className="form-group-col">
              <label className="field-label">
                Phone Number
                {!isEmailSignup ? (
                  <span className="locked-badge" title="Registered identifier cannot be altered">🔒 Primary Login</span>
                ) : (
                  <span className="editable-badge">✏️ Editable</span>
                )}
              </label>
              {isEditing ? (
                <input 
                  type="tel" 
                  className={`account-input ${!isEmailSignup ? 'input-locked' : ''}`} 
                  value={phone} 
                  onChange={e => isEmailSignup && setPhone(e.target.value)} 
                  placeholder="+91 98765 43210" 
                  readOnly={!isEmailSignup}
                  title={!isEmailSignup ? "Registered account phone cannot be changed" : "Enter your phone number"}
                />
              ) : (
                <div className="field-display-value">{phone || '—'}</div>
              )}
            </div>

            {/* Date of Birth & Calculated Age */}
            <div className="form-group-col">
              <label className="field-label">Date of Birth</label>
              {isEditing ? (
                <input 
                  type="date" 
                  className="account-input" 
                  value={dob} 
                  onChange={handleDobChange} 
                  max={new Date().toISOString().split('T')[0]}
                />
              ) : (
                <div className="field-display-value">
                  {dob ? new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </div>
              )}
            </div>

            <div className="form-group-col">
              <label className="field-label">
                Age
                <span className="auto-calc-badge">⚡ Auto-calculated</span>
              </label>
              <div className="field-display-value age-highlight">
                {age ? `${age} years old` : (dob ? `${calculateAgeFromDob(dob)} years old` : '—')}
              </div>
            </div>

            {/* Gender */}
            <div className="form-group-col full-width">
              <label className="field-label">Gender</label>
              {isEditing ? (
                <select 
                  className="account-select" 
                  value={gender} 
                  onChange={e => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <div className="field-display-value">{gender || 'Prefer not to say'}</div>
              )}
            </div>

            {/* Store Name - Rendered conditionally only for Retailer Accounts */}
            {isRetailer && (
              <div className="form-group-col full-width">
                <label className="field-label">
                  Store / Pharmacy Name <span className="retailer-tag">Retailer Account</span>
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="account-input" 
                    value={shopName} 
                    onChange={e => setShopName(e.target.value)} 
                    placeholder="e.g. LifeCare Pharmacy, Apollo Retail Partner" 
                  />
                ) : (
                  <div className="field-display-value highlight-store">{shopName || 'Not Provided'}</div>
                )}
              </div>
            )}

            {/* Address */}
            <div className="form-group-col full-width">
              <label className="field-label">Primary Delivery Address</label>
              {isEditing ? (
                <textarea 
                  className="account-textarea" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="Flat/House No, Building, Street, Area, City, Pin Code" 
                  rows={3} 
                />
              ) : (
                <div className="field-display-value address-box">{address || 'No primary delivery address saved yet.'}</div>
              )}
            </div>

            {isEditing && (
              <div className="form-actions-bar full-width">
                <button 
                  type="submit" 
                  className="save-profile-btn"
                  disabled={saving}
                >
                  {saving ? 'Saving to Database...' : 'Save All Details'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
