import React, { useEffect } from 'react'
import { FOOTER_CONTENT } from '../../data/footerContent'

export function FooterPageModal({ pageKey, onClose }) {
  const content = FOOTER_CONTENT[pageKey]

  useEffect(() => {
    // Scroll top when opened
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [pageKey])

  if (!content) return null

  return (
    <div className="footer-modal-backdrop" onClick={onClose}>
      <div className="footer-modal-container" onClick={e => e.stopPropagation()}>
        <div className="footer-modal-header">
          <div>
            <span className="modal-category">Subhone Health Group • Information</span>
            <h2 className="modal-title">{content.title}</h2>
            {content.subtitle && <p className="modal-subtitle">{content.subtitle}</p>}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close page">
            ✕
          </button>
        </div>

        <div className="footer-modal-body">
          {content.sections.map((sec, idx) => (
            <div key={idx} className="modal-content-section">
              <h3 className="section-h3">{sec.heading}</h3>
              <div className="section-text">
                {sec.content.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            </div>
          ))}

          {pageKey === 'license' && (
            <div className="license-badge-card">
              <h4>Official Verification Badges</h4>
              <div className="badges-row">
                <span className="badge-item">🏛️ WHOLESALE DRUG LICENSE</span>
                <span className="badge-item">🥗 FSSAI: 22823086000064</span>
                <span className="badge-item">📋 UDYAM-WB-07-0138605</span>
              </div>
            </div>
          )}

          <div className="modal-contact-box">
            <h4>Direct Wholesale Enquiries</h4>
            <p><strong>Subhone Health Group</strong></p>
            <p>📍 Pandit Satghara, Mallickpara, Serampore, Hooghly, West Bengal, Pin- 712203</p>
            <p>📞 Phone: <a href="tel:+919836307553">+91 9836307553</a></p>
            <p>✉️ Email: <a href="mailto:subhonehealthgroup@gmail.com">subhonehealthgroup@gmail.com</a></p>
          </div>
        </div>

        <div className="footer-modal-footer">
          <button className="back-btn" onClick={onClose}>
            ← Back to App / Website
          </button>
        </div>
      </div>
    </div>
  )
}

export default FooterPageModal

