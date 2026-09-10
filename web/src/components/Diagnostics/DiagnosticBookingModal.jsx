import React, { useState } from 'react'
import { api } from '../../services/api'

export function DiagnosticBookingModal({ isOpen, onClose, selectedService, user, onSuccess }) {
  const [patientName, setPatientName] = useState(user?.name || '')
  const [age, setAge] = useState('32')
  const [gender, setGender] = useState('Male')
  const [phone, setPhone] = useState(user?.phone || '+91 9836307553')
  const [addressLine, setAddressLine] = useState('Park Street, Kolkata')
  const [pincode, setPincode] = useState('700016')
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [timeSlot, setTimeSlot] = useState('07:00 AM - 08:30 AM (Fasting Ideal)')
  const [fastingConfirmed, setFastingConfirmed] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  if (!isOpen) return null

  const serviceName = selectedService?.name || 'Advanced Full Body Checkup (85 Tests)'
  const servicePrice = selectedService?.price || 999

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const bookingPayload = {
        packageId: selectedService?.id || 'pkg-1',
        packageName: serviceName,
        userId: user?.id || 'usr_guest_' + Date.now().toString(36),
        patientName,
        patientAge: parseInt(age, 10),
        patientGender: gender,
        patientPhone: phone,
        collectionAddress: {
          line1: addressLine,
          city: 'Kolkata',
          state: 'West Bengal',
          pincode
        },
        collectionDate: date,
        collectionTimeSlot: timeSlot,
        fastingConfirmed,
        totalAmount: servicePrice,
        paymentMethod
      }

      const res = await api.createBooking(bookingPayload)
      setBookingResult(res)
      setLoading(false)
      if (onSuccess) onSuccess(res)
    } catch (err) {
      alert('Error booking appointment: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="tracker-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tracker-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="tracker-hud-header" style={{ background: '#4c1d95' }}>
          <div className="tracker-brand-badge">
            <span className="pulse-dot" style={{ background: '#a855f7' }}></span>
            <div className="badge-text-group">
              <span className="fast-tag" style={{ color: '#d8b4fe' }}>🧪 NABL ACCREDITED LAB</span>
              <h3 className="tracker-heading">Book Home Sample Collection</h3>
            </div>
          </div>
          <button type="button" className="tracker-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '80vh' }}>
          {bookingResult ? (
            <div style={{ textAlign: 'center', padding: '16px 10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px' }}>
                ✓
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                Lab Test Appointment Confirmed!
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px' }}>
                Booking Reference: <strong style={{ color: '#7e22ce' }}>{bookingResult.bookingNumber || bookingResult.bookingId}</strong>
              </p>

              <div style={{ background: '#fdf4ff', border: '1.5px solid #f0abfc', borderRadius: '14px', padding: '16px', textAlign: 'left', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Package:</span>
                  <strong>{serviceName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Patient:</span>
                  <strong>{patientName} ({age} yrs, {gender})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Scheduled Slot:</span>
                  <strong style={{ color: '#7e22ce' }}>{date} • {timeSlot}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Address:</span>
                  <span>{addressLine}, {pincode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f5d0fe', paddingTop: '8px' }}>
                  <span style={{ color: '#64748b' }}>Total Payable:</span>
                  <strong style={{ color: '#16a34a', fontSize: '15px' }}>₹{servicePrice} (Pay via Cash/UPI to Phlebotomist)</strong>
                </div>
              </div>

              <button
                type="button"
                className="shelf-view-all-btn"
                style={{ width: '100%', height: '44px', background: '#7e22ce', color: '#ffffff', borderColor: '#7e22ce', fontSize: '14px', fontWeight: '800' }}
                onClick={onClose}
              >
                View in My Bookings
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Package Summary strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>{serviceName}</h4>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>✓ Free Certified Home Collection</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#7e22ce' }}>₹{servicePrice}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="Full Name"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Age *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Sample Pickup Address *</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  placeholder="House/Flat No., Road, Landmark"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Date of Collection *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Time Slot *</label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="07:00 AM - 08:30 AM (Fasting Ideal)">07:00 AM - 08:30 AM (Fasting Ideal)</option>
                    <option value="08:30 AM - 10:00 AM">08:30 AM - 10:00 AM</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="04:00 PM - 06:00 PM (Non-Fasting)">04:00 PM - 06:00 PM (Non-Fasting)</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155', cursor: 'pointer', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  checked={fastingConfirmed}
                  onChange={e => setFastingConfirmed(e.target.checked)}
                />
                <span>Patient agrees to 10-12 hours overnight fasting (water allowed) for accurate lipid/sugar profiling.</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ flex: 1, height: '44px', borderRadius: '9999px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 2, height: '44px', borderRadius: '9999px', border: 'none', background: '#7e22ce', color: '#ffffff', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)' }}
                >
                  {loading ? 'Booking Appointment...' : `Confirm Home Collection (₹${servicePrice}) →`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiagnosticBookingModal

