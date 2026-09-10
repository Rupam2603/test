import React, { useState } from 'react'

export function PrescriptionUploadModal({ isOpen, onClose, onSuccess, user }) {
  const [file, setFile] = useState(null)
  const [patientName, setPatientName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '+91 ')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [prescriptionId, setPrescriptionId] = useState(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      alert('Please select or capture a prescription file to upload.')
      return
    }

    setIsSubmitting(true)
    // Simulate pharmacist upload & batch queue
    setTimeout(() => {
      const rxId = 'RX-' + Math.floor(100000 + Math.random() * 900000)
      setPrescriptionId(rxId)
      setIsSubmitting(false)
      setUploadSuccess(true)
      if (onSuccess) {
        onSuccess({
          id: rxId,
          fileName: file.name,
          patientName: patientName || 'Patient',
          uploadedAt: new Date().toLocaleDateString()
        })
      }
    }, 1200)
  }

  return (
    <div className="tracker-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tracker-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div className="tracker-hud-header" style={{ background: '#064e3b' }}>
          <div className="tracker-brand-badge">
            <span className="pulse-dot" style={{ background: '#34d399' }}></span>
            <div className="badge-text-group">
              <span className="fast-tag" style={{ color: '#a7f3d0' }}>📋 CLINICAL PHARMACY</span>
              <h3 className="tracker-heading">Upload Doctor's Prescription</h3>
            </div>
          </div>
          <button type="button" className="tracker-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {uploadSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>
                ✓
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                Prescription Uploaded Successfully!
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px', lineHeight: '1.5' }}>
                Reference ID: <strong style={{ color: '#0f172a' }}>{prescriptionId}</strong>. Our licensed clinical pharmacist is currently verifying the dosage and batch availability.
              </p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'left', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Patient Name:</span>
                  <strong>{patientName || 'Primary Patient'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Document:</span>
                  <strong>{file?.name || 'prescription_scan.jpg'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Status:</span>
                  <span style={{ color: '#059669', fontWeight: '800' }}>⚡ Under Verification (Est. 5 mins)</span>
                </div>
              </div>
              <button
                type="button"
                className="shelf-view-all-btn"
                style={{ width: '100%', height: '44px', background: '#16a34a', color: '#ffffff', borderColor: '#16a34a', fontSize: '14px', fontWeight: '700' }}
                onClick={onClose}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Drag and drop upload zone */}
              <div
                style={{
                  border: '2px dashed #86efac',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  background: '#f0fdf4',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('prescription-file-input').click()}
              >
                <input
                  id="prescription-file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📄</div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#14532d', fontWeight: '800' }}>
                  {file ? file.name : 'Click to Upload or Drag Prescription'}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>
                  Supports JPEG, PNG, PDF up to 15MB. Ensure doctor signature & clinic stamp are visible.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +91 98310 12345"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Special Instructions / Required Duration
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Deliver 1 month course, include diabetes test strips"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

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
                  disabled={isSubmitting}
                  style={{ flex: 2, height: '44px', borderRadius: '9999px', border: 'none', background: '#16a34a', color: '#ffffff', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}
                >
                  {isSubmitting ? 'Verifying with Pharmacist...' : 'Submit Prescription 📄'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrescriptionUploadModal

