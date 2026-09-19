import React from 'react'

export function AppFooter({ onOpenPage }) {
  const handleLinkClick = (e, pageKey) => {
    e.preventDefault()
    if (onOpenPage) onOpenPage(pageKey)
  }

  return (
    <footer className="app-footer-wrapper">
      <div className="app-footer-top">
        <div className="app-footer-brand">
          <h3>Subhone Health Group</h3>
          <span className="app-wholesale-badge">Medicine Wholesaler & Healthcare Distribution</span>
          <p className="app-brand-summary">
            A trusted pharmaceutical distribution company committed to making quality medicines accessible through a dependable supply network.
          </p>

          <div className="app-license-tags">
            <span className="app-tag">License: <strong>WHOLESALE</strong></span>
            <span className="app-tag">FSSAI: <strong>22823086000064</strong></span>
            <span className="app-tag">Udyam: <strong>UDYAM-WB-07-0138605</strong></span>
          </div>
        </div>

        <div className="app-footer-links-grid">
          <div className="app-footer-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>About Us</a></li>
              <li><a href="#careers" onClick={(e) => handleLinkClick(e, 'careers')}>Careers</a></li>
              <li><a href="#blog" onClick={(e) => handleLinkClick(e, 'blog')}>Blog</a></li>
              <li><a href="#pharmacists" onClick={(e) => handleLinkClick(e, 'pharmacists')}>Our Pharmacists</a></li>
            </ul>
          </div>

          <div className="app-footer-column">
            <h4>Legal & Compliance</h4>
            <ul>
              <li><a href="#terms" onClick={(e) => handleLinkClick(e, 'terms')}>Terms of Service</a></li>
              <li><a href="#privacy" onClick={(e) => handleLinkClick(e, 'privacy')}>Privacy Policy</a></li>
              <li><a href="#returns" onClick={(e) => handleLinkClick(e, 'returns')}>Return Policy</a></li>
              <li><a href="#license" onClick={(e) => handleLinkClick(e, 'license')}>Pharmacy License</a></li>
            </ul>
          </div>

          <div className="app-footer-column">
            <h4>Customer Support</h4>
            <ul>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>Contact Us</a></li>
              <li><a href="#terms" onClick={(e) => handleLinkClick(e, 'terms')}>Help Center</a></li>
              <li><a href="#returns" onClick={(e) => handleLinkClick(e, 'returns')}>Shipping & Delivery</a></li>
              <li><a href="#terms" onClick={(e) => handleLinkClick(e, 'terms')}>Order Tracking</a></li>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>FAQs</a></li>
            </ul>
          </div>

          <div className="app-footer-column">
            <h4>Business</h4>
            <ul>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>Become a Retailer</a></li>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>Wholesale Enquiry</a></li>
              <li><a href="#careers" onClick={(e) => handleLinkClick(e, 'careers')}>Supplier Registration</a></li>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>Bulk Orders</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="app-footer-contacts">
        <div className="app-contact-box">
          <span></span>
          <div>
            <strong>Registered Office:</strong>
            <p>Pandit Satghara, Mallickpara, Serampore, Hooghly, West Bengal, Pin- 712203</p>
          </div>
        </div>
        <div className="app-contact-box">
          <span></span>
          <div>
            <strong>Support Line:</strong>
            <p><a href="tel:+919836307553">+91 9836307553</a></p>
          </div>
        </div>
        <div className="app-contact-box">
          <span></span>
          <div>
            <strong>Email:</strong>
            <p><a href="mailto:subhonehealthgroup@gmail.com">subhonehealthgroup@gmail.com</a></p>
          </div>
        </div>
      </div>

      <div className="app-footer-disclaimer-card">
        <p>
          <strong>Disclaimer:</strong> The information provided on this application is for general informational purposes. Certain medicines may require a valid prescription or authorization. Product availability, pricing, and eligibility may vary. Please consult a qualified healthcare professional for medical advice. Subhone Health Group operates in strict accordance with applicable laws, drug regulations, and licensing requirements.
        </p>
      </div>

      <div className="app-footer-bottom-row">
        <p>© {new Date().getFullYear()} Subhone Health Group. All Rights Reserved.</p>
        <div className="app-bottom-tags">
          <span>WHOLESALE DISTRIBUTION</span>
          <span>•</span>
          <span>FSSAI 22823086000064</span>
          <span>•</span>
          <span>UDYAM-WB-07-0138605</span>
        </div>
      </div>
    </footer>
  )
}

export default AppFooter

