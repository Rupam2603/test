import React, { useState, useEffect, useMemo } from 'react'
import { api } from '../../services/api'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API || ''

export function DeliveryLocationModal({
  isOpen,
  onClose,
  location,
  detectLocation,
  onSelectAddress,
  user
}) {
  const [savedAddresses, setSavedAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [hasMapError, setHasMapError] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // New address form
  const [label, setLabel] = useState('Home')
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '+91 9836307553')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState(location?.city || 'Kolkata')
  const [state, setState] = useState(location?.state || 'West Bengal')
  const [pincode, setPincode] = useState(location?.pincode || '700016')
  const [saving, setSaving] = useState(false)

  const currentCoords = useMemo(() => ({
    lat: location?.lat || 22.5535,
    lng: location?.lng || 88.3512
  }), [location?.lat, location?.lng])

  useEffect(() => {
    if (isOpen) {
      loadSavedAddresses()
    }
  }, [isOpen])

  async function loadSavedAddresses() {
    setLoadingAddresses(true)
    try {
      const addrs = await api.getAddresses(user?.id)
      setSavedAddresses(addrs || [])
    } catch (e) {
      console.warn('Failed to load saved addresses:', e)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleUseCurrentLocation = async () => {
    setIsLocating(true)
    try {
      await detectLocation()
    } finally {
      setTimeout(() => setIsLocating(false), 800)
    }
  }

  const handleAutofillFromLocation = () => {
    if (location) {
      setLine1(location.street || location.shortName || 'Park Street')
      setCity(location.city || 'Kolkata')
      setState(location.state || 'West Bengal')
      setPincode(location.pincode || '700016')
    }
  }

  const handleConfirmCurrentLocation = () => {
    if (onSelectAddress) {
      onSelectAddress({
        label: 'Current Location',
        name: user?.name || 'Customer',
        phone: user?.phone || '+91 9836307553',
        line1: location?.street || location?.shortName || 'Current Location',
        city: location?.city || 'Kolkata',
        state: location?.state || 'West Bengal',
        pincode: location?.pincode || '700016',
        formatted: location?.address || 'Current Location, Kolkata',
        lat: location?.lat,
        lng: location?.lng
      })
    }
    onClose()
  }

  const handleSelectSaved = (addr) => {
    if (onSelectAddress) {
      onSelectAddress(addr)
    }
    onClose()
  }

  const handleSaveNewAddress = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const newAddr = await api.saveAddress({
        userId: user?.id || 'usr_guest_' + Date.now().toString(36),
        label,
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        isDefault: true
      })
      setSavedAddresses([newAddr, ...savedAddresses])
      setShowAddForm(false)
      if (onSelectAddress) {
        onSelectAddress(newAddr)
      }
      onClose()
    } catch (err) {
      alert('Failed to save address: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="tracker-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tracker-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="tracker-hud-header" style={{ background: '#ffffff', borderBottom: '1px solid #f3f4f6', padding: '20px' }}>
          <div className="tracker-brand-badge">
            <span className="pulse-dot" style={{ background: '#22c55e' }}></span>
            <div className="badge-text-group">
              <span className="fast-tag" style={{ color: '#6b7280', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>DELIVERY DESTINATION</span>
              <h3 className="tracker-heading" style={{ color: '#111827', fontSize: '18px', margin: '4px 0 0 0' }}>Select Address</h3>
            </div>
          </div>
          <button type="button" className="tracker-close-btn" onClick={onClose} aria-label="Close modal" style={{
            background: '#f3f4f6', color: '#4b5563', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '78vh' }}>
          {/* Current Location GPS Section */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '16px', color: '#111827' }}>Current Location</strong>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating || location?.loading}
                style={{
                  background: '#f9fafb',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: '9999px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{isLocating || location?.loading ? 'Detecting...' : 'Detect'}</span>
              </button>
            </div>

            {/* Detected Address Details */}
            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', border: '1px solid #f3f4f6', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {location?.isExact ? 'Exact GPS Match' : 'Detected Area'}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  PIN: <strong style={{ color: '#111827' }}>{location?.pincode || '700016'}</strong>
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#374151', lineHeight: '1.5' }}>
                {location?.address || 'Detecting exact street location...'}
              </p>
            </div>

            {/* Confirm Deliver to this Location button */}
            <button
              type="button"
              onClick={handleConfirmCurrentLocation}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '12px',
                border: 'none',
                background: '#111827',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Deliver to Current Location </span>
            </button>
          </div>

          {/* Saved Addresses Section */}
          {!showAddForm ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>
                  Saved Delivery Addresses ({savedAddresses.length})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    handleAutofillFromLocation()
                    setShowAddForm(true)
                  }}
                  style={{
                    background: '#f8fafc',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '9999px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  + Add New Address
                </button>
              </div>

              {loadingAddresses ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading saved addresses...</p>
              ) : savedAddresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    No saved addresses yet. You can use your current GPS location or add a new address.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedAddresses.map((addr, idx) => (
                    <div
                      key={addr.id || idx}
                      style={{
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        background: '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontWeight: '800', fontSize: '13.5px', color: '#0f172a' }}>{addr.label || 'Saved Address'}</span>
                          {addr.is_default && (
                            <span style={{ fontSize: '10px', fontWeight: '800', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '6px' }}>
                              Default
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.35' }}>
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectSaved(addr)}
                        style={{
                          background: '#f1f5f9',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          flexShrink: 0,
                          marginLeft: '12px'
                        }}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Add Address Form */
            <form onSubmit={handleSaveNewAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Add New Delivery Address</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleAutofillFromLocation}
                    style={{ background: '#ecfdf5', color: '#15803d', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                     Auto-Fill Current Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>Type</label>
                  <select
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="Home">Home</option>
                    <option value="Retail Pharmacy">Retail Pharmacy</option>
                    <option value="Clinic">Clinic / Hospital</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Name"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9836307553"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>Street Address / Floor *</label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={e => setLine1(e.target.value)}
                  placeholder="Street name, flat, or building"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                {saving ? 'Saving...' : 'Save & Deliver Here '}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryLocationModal

