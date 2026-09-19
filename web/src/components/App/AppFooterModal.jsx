import React, { useEffect } from 'react'
import { FOOTER_CONTENT } from '../../data/footerContent'

export function AppFooterModal({ pageKey, onClose }) {
  const content = FOOTER_CONTENT[pageKey]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [pageKey])

  if (!content) return null

  return (
    <div className="app-footer-modal-backdrop" onClick={onClose}>
      <div className="app-footer-modal-container" onClick={e => e.stopPropagation()}>
        <div className="app-footer-modal-header">
          <div>
            <span className="app-modal-category">Subhone Health Group • Information</span>
            <h2 className="app-modal-title">{content.title}</h2>
            {content.subtitle && <p className="app-modal-subtitle">{content.subtitle}</p>}
          </div>
          <button className="app-modal-close-btn" onClick={onClose} aria-label="Close page">
            
          </button>
        </div>

        <div className="app-footer-modal-body">
          {content.sections.map((sec, idx) => (
            <div key={idx} className="app-modal-content-section">
              <h3 className="app-section-h3">{sec.heading}</h3>
              <div className="app-section-text">
                {sec.content.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            </div>
          ))}

          {pageKey === 'license' && (
            <div className="app-license-badge-card">
              <h4>Official Verification Badges</h4>
              <div className="app-badges-row">
                <span className="app-badge-item"> WHOLESALE DRUG LICENSE</span>
                <span className="app-badge-item"> FSSAI: 22823086000064</span>
                <span className="app-badge-item"> UDYAM-WB-07-0138605</span>
              </div>
            </div>
          )}

          <div className="app-modal-contact-box">
            <h4>Direct Wholesale Enquiries</h4>
            <p><strong>Subhone Health Group</strong></p>
            <p> Pandit Satghara, Mallickpara, Serampore, Hooghly, West Bengal, Pin- 712203</p>
            <p> Phone: <a href="tel:+919836307553">+91 9836307553</a></p>
            <p> Email: <a href="mailto:subhonehealthgroup@gmail.com">subhonehealthgroup@gmail.com</a></p>
          </div>
        </div>

        <div className="app-footer-modal-footer">
          <button className="app-back-btn" onClick={onClose}>
            ← Back to App
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppFooterModal

