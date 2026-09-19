import React from 'react'

export function OrderSuccessModal({ isOpen, order, onClose, onTrackLive, onViewOrders }) {
  if (!isOpen || !order) return null

  return (
    <div className="tracker-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tracker-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        {/* Header HUD */}
        <div className="tracker-hud-header" style={{ background: '#14532d' }}>
          <div className="tracker-brand-badge">
            <span className="pulse-dot" style={{ background: '#4ade80' }}></span>
            <div className="badge-text-group">
              <span className="fast-tag" style={{ color: '#bbf7d0' }}> ORDER PLACED • 10 MIN DISPATCH</span>
              <h3 className="tracker-heading">Order Confirmed & Sent to Hub</h3>
            </div>
          </div>
          <button type="button" className="tracker-close-btn" onClick={onClose} aria-label="Close modal">
            
          </button>
        </div>

        <div style={{ padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 16px', border: '3px solid #86efac' }}>
            
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px' }}>
            Thank You for Your Order!
          </h3>
          <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 20px' }}>
            Order Number: <strong style={{ color: '#15803d', fontSize: '16px' }}>{order.orderNumber || order.id}</strong>
          </p>

          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '16px', textAlign: 'left', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Total Paid / Payable:</span>
              <strong style={{ fontSize: '16px', color: '#0f172a' }}>₹{Number(order.totalAmount || 0).toLocaleString()} ({order.paymentMethod || 'COD'})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Delivery Guarantee:</span>
              <span style={{ fontWeight: '800', color: '#16a34a' }}> Within 10 Minutes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Fulfillment Hub:</span>
              <span>SubhOne Central Dark Store #04 (Park Street)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
              <span style={{ color: '#64748b' }}>Delivery Spot:</span>
              <span style={{ fontWeight: '700', color: '#334155' }}>
                {order.shippingAddress?.line1 || 'Park Street, Kolkata'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={() => {
                onClose()
                if (onTrackLive) onTrackLive(order)
              }}
              style={{
                width: '100%',
                height: '48px',
                background: '#16a34a',
                color: '#ffffff',
                borderColor: '#16a34a',
                fontSize: '15px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
              }}
            >
              <span>Track Live Delivery on Google Maps</span>
              <span></span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                if (onViewOrders) onViewOrders()
              }}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '9999px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              View All Orders & Invoices 
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessModal

