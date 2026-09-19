import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { useCurrentLocation } from '../../hooks/useCurrentLocation'

export function AddressManagementModal({ isOpen, onClose, user, onAddressSelected }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const { location, detectLocation } = useCurrentLocation()

  // New Address Form State
  const [label, setLabel] = useState('Home')
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '+91 9836307553')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('Kolkata')
  const [state, setState] = useState('West Bengal')
  const [pincode, setPincode] = useState('700016')
  const [isDefault, setIsDefault] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleAutofillLocation = async () => {
    if (detectLocation) {
      await detectLocation()
    }
    if (location) {
      setLine1(location.street || location.shortName || 'Park Street')
      setCity(location.city || 'Kolkata')
      setState(location.state || 'West Bengal')
      setPincode(location.pincode || '700016')
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadAddresses()
    }
  }, [isOpen])

  async function loadAddresses() {
    setLoading(true)
    try {
      const data = await api.getAddresses(user?.id)
      setAddresses(data)
    } catch (e) {
      console.warn('Error loading addresses:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (e) => {
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
        isDefault
      })

      setAddresses([newAddr, ...addresses])
      setShowAddForm(false)
      setSaving(false)
      if (onAddressSelected) onAddressSelected(newAddr)
    } catch (err) {
      alert('Failed to save address: ' + err.message)
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="tracker-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tracker-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="tracker-hud-header" style={{ background: '#0f172a' }}>
          <div className="tracker-brand-badge">
            <span className="pulse-dot" style={{ background: '#38bdf8' }}></span>
            <div className="badge-text-group">
              <span className="fast-tag" style={{ color: '#bae6fd' }}> DOORSTEP LOGISTICS</span>
              <h3 className="tracker-heading">Saved Delivery Addresses</h3>
            </div>
          </div>
          <button type="button" className="tracker-close-btn" onClick={onClose} aria-label="Close modal">
            
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '75vh' }}>
          {!showAddForm ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#475569' }}>
                  {addresses.length} {addresses.length === 1 ? 'Address Saved' : 'Addresses Saved'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #86efac',
                    borderRadius: '9999px',
                    padding: '6px 14px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  + Add New Address
                </button>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>Loading addresses from database...</p>
              ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', background: '#f8fafc', borderRadius: '16px' }}>
                  <span style={{ fontSize: '32px' }}></span>
                  <h4 style={{ margin: '8px 0 4px', color: '#0f172a' }}>No Saved Addresses Found</h4>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>Add your primary doorstep address for instant 10-minute dispatch.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="shelf-add-cart-btn"
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                  >
                    Add Delivery Address
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {addresses.map((addr, idx) => (
                    <div
                      key={addr.id || idx}
                      style={{
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '16px',
                        background: addr.is_default || addr.isDefault ? '#f0fdf4' : '#ffffff',
                        borderColor: addr.is_default || addr.isDefault ? '#86efac' : '#e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{addr.label || 'Home'}</span>
                          {(addr.is_default || addr.isDefault) && (
                            <span style={{ fontSize: '10px', fontWeight: '800', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px' }}>
                              Default Address
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                          {addr.name} • {addr.phone}
                        </p>
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: '1.4' }}>
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onAddressSelected) onAddressSelected(addr)
                          onClose()
                        }}
                        style={{
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
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
            <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Add New Delivery Address</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleAutofillLocation}
                    style={{
                      background: '#ecfdf5',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                     Auto-Fill Current Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    ← Back to List
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Address Tag</label>
                  <select
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="Home">Home</option>
                    <option value="Retail Pharmacy">Retail Pharmacy</option>
                    <option value="Clinic / Hospital">Clinic / Hospital</option>
                    <option value="Office / Warehouse">Office / Warehouse</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Recipient name"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9836307553"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Street Address / Flat / Floor *</label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={e => setLine1(e.target.value)}
                  placeholder="e.g. 12/A Park Street, 2nd Floor"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={e => setIsDefault(e.target.checked)}
                />
                <span>Set as default doorstep delivery address</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ flex: 1, height: '44px', borderRadius: '9999px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 2, height: '44px', borderRadius: '9999px', border: 'none', background: '#16a34a', color: '#ffffff', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}
                >
                  {saving ? 'Saving to Database...' : 'Save Address to Neon Postgres '}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddressManagementModal

