import React from 'react'
import {
  HOME_CATEGORY_CARDS,
  PAIN_RELIEF_PRODUCTS,
  IMMUNITY_WELLNESS_PRODUCTS,
  MEDICAL_SUPPLIES_PRODUCTS,
  MENS_HEALTH_PRODUCTS,
  DIAGNOSTIC_PACKAGES,
  TRUST_FEATURES
} from '../../data/homeCategoriesData'

export function CategoryWiseHomeSection({ 
  products = [], 
  services = [], 
  onSelectCategory, 
  onAddToCart, 
  onBookService,
  onUploadPrescription 
}) {
  // Filter only strictly listed products (is_listed !== false)
  const listedOnly = products.filter(p => p.is_listed !== false && p.isListed !== false)

  // Dynamically derive or fall back to verified listed products
  const dbPain = listedOnly.filter(p => p.category?.toLowerCase().includes('pain'))
  const painProducts = dbPain.length > 0 ? dbPain : PAIN_RELIEF_PRODUCTS

  const dbWellness = listedOnly.filter(p => p.category?.toLowerCase().includes('wellness') || p.category?.toLowerCase().includes('immunity'))
  const wellnessProducts = dbWellness.length > 0 ? dbWellness : IMMUNITY_WELLNESS_PRODUCTS

  const dbSupplies = listedOnly.filter(p => 
    p.category?.toLowerCase().includes('supplies') || 
    p.category?.toLowerCase().includes('monsoon') || 
    p.category?.toLowerCase().includes('digestive') ||
    p.category?.toLowerCase().includes('diet')
  )
  const suppliesProducts = dbSupplies.length > 0 ? dbSupplies : MEDICAL_SUPPLIES_PRODUCTS

  const dbMens = listedOnly.filter(p => p.category?.toLowerCase().includes('men'))
  const mensProducts = dbMens.length > 0 ? dbMens.slice(0, 4) : MENS_HEALTH_PRODUCTS

  // Diagnostics: use database lab_packages if available
  const diagnosticsList = services && services.length > 0 
    ? services.slice(0, 3).map(s => ({
        id: s.id,
        name: s.name,
        badge: s.badge || 'NABL Lab',
        cert: 'NABL Certified Lab',
        includes: s.description || 'Comprehensive Pathology Testing',
        duration: s.duration || 'Fast 20 mins Sample Collection',
        reportTime: s.reportTurnaround || 'Digital Report within 24 Hours',
        price: s.price,
        mrp: s.mrp || (s.price * 2),
        discount: s.mrp ? Math.round(((s.mrp - s.price)/s.mrp)*100) + '% OFF' : '50% OFF'
      }))
    : DIAGNOSTIC_PACKAGES

  return (
    <div className="category-wise-home-wrapper">
      {/* 1. Explore by Category Grid */}
      <section className="home-category-explore-section">
        <div className="shelf-header">
          <div>
            <span className="shelf-pill-tag">EXPLORE BY CONCERN</span>
            <h3 className="shelf-title">Shop Healthcare by Category</h3>
          </div>
          <button 
            type="button" 
            className="shelf-view-all-btn"
            onClick={() => onSelectCategory('all')}
          >
            All Categories →
          </button>
        </div>

        <div className="home-category-cards-grid">
          {HOME_CATEGORY_CARDS.map(cat => (
            <div
              key={cat.id}
              className="home-category-card"
              style={{ background: cat.gradient, borderColor: cat.borderColor }}
              onClick={() => onSelectCategory(cat.categoryName || cat.id)}
              role="button"
              tabIndex={0}
            >
              <div className="home-cat-card-header">
                <span className="home-cat-card-icon">{cat.icon}</span>
                <span className="home-cat-card-badge" style={{ color: cat.textColor }}>
                  {cat.badge}
                </span>
              </div>
              <h4 className="home-cat-card-name" style={{ color: cat.textColor }}>
                {cat.title || cat.name}
              </h4>
              <p className="home-cat-card-desc">{cat.subtitle || cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Category Shelf 1: Pain Relief & Muscle Care */}
      <section className="home-shelf-section">
        <div className="shelf-header">
          <div>
            <div className="shelf-badge-row">
              <span className="shelf-pill-tag red">⚡ FAST RELIEF</span>
              <span className="shelf-meta-text">Verified Listed Medicines</span>
            </div>
            <h3 className="shelf-title">Pain Relief & Muscle Care</h3>
            <p className="shelf-subtitle">Clinically proven balms and gels for rapid joint and muscular relief.</p>
          </div>
          <button 
            type="button" 
            className="shelf-view-all-btn"
            onClick={() => onSelectCategory('Pain Relief & Muscle Care')}
          >
            View All ({painProducts.length}) →
          </button>
        </div>

        <div className="home-product-shelf-grid">
          {painProducts.map(item => (
            <div key={item.id} className="home-curated-product-card">
              <div className="product-card-media">
                <span className="product-discount-chip">{item.discount || 'Special Price'}</span>
                <img src={item.image} alt={item.name} loading="lazy" />
                <span className="product-card-tag">{item.featurePill || item.brand || 'Verified'}</span>
              </div>
              <div className="product-card-details">
                <div className="product-rating-row">
                  <span className="rating-pill">{item.rating || '4.8 ★'}</span>
                  <span className="pack-label">{item.pack || item.brand || 'Standard'}</span>
                </div>
                <h4 className="product-title" title={item.name}>{item.name}</h4>
                <div className="product-price-action-row">
                  <div className="price-block">
                    <span className="current-price">₹{item.price}</span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="mrp-price">₹{item.mrp}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="shelf-add-cart-btn"
                    onClick={() => onAddToCart && onAddToCart(item)}
                    title={"Add " + item.name + " to cart"}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Prescription Upload Callout Banner */}
      <section className="home-prescription-callout-banner">
        <div className="prescription-banner-content">
          <div className="prescription-badge">
            <span>📋 CLINICAL PHARMACY SERVICE</span>
          </div>
          <h3>Have a Doctor's Prescription?</h3>
          <p>
            Upload your prescription directly. Our registered clinical pharmacists will review, verify, and pack your medicines with 100% genuine batch verification.
          </p>
          <div className="prescription-actions">
            <button 
              type="button" 
              className="prescription-upload-btn"
              onClick={() => onUploadPrescription ? onUploadPrescription() : onSelectCategory('all')}
            >
              Upload Prescription 📄
            </button>
            <button 
              type="button" 
              className="prescription-call-btn"
              onClick={() => alert('SubhOne Pharmacy Helpline: +91 1800-202-9900')}
            >
              📞 1800-202-9900 (Toll-Free)
            </button>
          </div>
        </div>
        <div className="prescription-banner-art">
          <div className="art-pill-circle">💊</div>
          <div className="art-badge-verified">✓ 100% Verified</div>
        </div>
      </section>

      {/* 4. Category Shelf 2: Daily Wellness & Immunity */}
      <section className="home-shelf-section">
        <div className="shelf-header">
          <div>
            <div className="shelf-badge-row">
              <span className="shelf-pill-tag green">🌿 100% GENUINE</span>
              <span className="shelf-meta-text">Daily Defense & Nutrition</span>
            </div>
            <h3 className="shelf-title">Daily Wellness & Immunity</h3>
            <p className="shelf-subtitle">Authentic energy drinks, pure honey, and whey protein supplements.</p>
          </div>
          <button 
            type="button" 
            className="shelf-view-all-btn"
            onClick={() => onSelectCategory('Daily Wellness & Immunity')}
          >
            View All ({wellnessProducts.length}) →
          </button>
        </div>

        <div className="home-product-shelf-grid">
          {wellnessProducts.map(item => (
            <div key={item.id} className="home-curated-product-card">
              <div className="product-card-media">
                <span className="product-discount-chip green">{item.discount || 'Special Offer'}</span>
                <img src={item.image} alt={item.name} loading="lazy" />
                <span className="product-card-tag green">{item.featurePill || item.brand || 'Wellness'}</span>
              </div>
              <div className="product-card-details">
                <div className="product-rating-row">
                  <span className="rating-pill green">{item.rating || '4.8 ★'}</span>
                  <span className="pack-label">{item.pack || item.brand || 'Unit'}</span>
                </div>
                <h4 className="product-title" title={item.name}>{item.name}</h4>
                <div className="product-price-action-row">
                  <div className="price-block">
                    <span className="current-price">₹{item.price}</span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="mrp-price">₹{item.mrp}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="shelf-add-cart-btn"
                    onClick={() => onAddToCart && onAddToCart(item)}
                    title={"Add " + item.name + " to cart"}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Category Shelf 3: Diagnostic & Clinical Pathology Packages */}
      <section className="home-shelf-section diagnostics-shelf">
        <div className="shelf-header">
          <div>
            <div className="shelf-badge-row">
              <span className="shelf-pill-tag purple">🧪 NABL ACCREDITED LABS</span>
              <span className="shelf-meta-text">Certified Laboratory Testing</span>
            </div>
            <h3 className="shelf-title">Diagnostic Health Packages</h3>
            <p className="shelf-subtitle">Certified medical laboratory tests with digital reports and free home collection.</p>
          </div>
          <button 
            type="button" 
            className="shelf-view-all-btn"
            onClick={() => onBookService && onBookService()}
          >
            View Diagnostics →
          </button>
        </div>

        <div className="home-diagnostics-shelf-grid">
          {diagnosticsList.map(pkg => (
            <div key={pkg.id} className="home-diagnostic-card">
              <div className="diagnostic-card-header">
                <span className="diag-badge-pill">{pkg.badge}</span>
                <span className="diag-cert-text">✓ {pkg.cert}</span>
              </div>
              <h4 className="diag-package-name">{pkg.name || pkg.title}</h4>
              <p className="diag-includes-text">{pkg.includes || pkg.summary}</p>
              
              <div className="diag-features-list">
                <div className="diag-feature-item">
                  <span>⏱️</span>
                  <span>{pkg.duration}</span>
                </div>
                <div className="diag-feature-item">
                  <span>📑</span>
                  <span>{pkg.reportTime || pkg.turnaround}</span>
                </div>
              </div>

              <div className="diag-card-footer">
                <div className="diag-price-group">
                  <div className="diag-main-price">
                    <span className="price-val">₹{pkg.price}</span>
                    <span className="mrp-val">₹{pkg.mrp}</span>
                  </div>
                  <span className="diag-discount-tag">{pkg.discount}</span>
                </div>
                <button
                  type="button"
                  className="diag-book-btn"
                  onClick={() => onBookService && onBookService(pkg)}
                >
                  Book Test →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Category Shelf 4: Medical Supplies, Antiseptics & Digestive Care */}
      <section className="home-shelf-section">
        <div className="shelf-header">
          <div>
            <div className="shelf-badge-row">
              <span className="shelf-pill-tag orange">🩺 HOSPITAL GRADE</span>
              <span className="shelf-meta-text">Certified Clinical Supplies</span>
            </div>
            <h3 className="shelf-title">Medical Supplies & Antiseptic Care</h3>
            <p className="shelf-subtitle">Surgical protection masks, hospital cotton rolls, and antiseptic disinfectants.</p>
          </div>
          <button 
            type="button" 
            className="shelf-view-all-btn"
            onClick={() => onSelectCategory('Medical Supplies & Devices')}
          >
            View All ({suppliesProducts.length}) →
          </button>
        </div>

        <div className="home-product-shelf-grid">
          {suppliesProducts.map(item => (
            <div key={item.id} className="home-curated-product-card">
              <div className="product-card-media">
                <span className="product-discount-chip orange">{item.discount || 'In Stock'}</span>
                <img src={item.image} alt={item.name} loading="lazy" />
                <span className="product-card-tag orange">{item.featurePill || item.brand || 'Hospital Grade'}</span>
              </div>
              <div className="product-card-details">
                <div className="product-rating-row">
                  <span className="rating-pill orange">{item.rating || '4.7 ★'}</span>
                  <span className="pack-label">{item.pack || item.brand || 'Pack'}</span>
                </div>
                <h4 className="product-title" title={item.name}>{item.name}</h4>
                <div className="product-price-action-row">
                  <div className="price-block">
                    <span className="current-price">₹{item.price}</span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="mrp-price">₹{item.mrp}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="shelf-add-cart-btn"
                    onClick={() => onAddToCart && onAddToCart(item)}
                    title={"Add " + item.name + " to cart"}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Category Shelf 5: Men's Health & Grooming */}
      <section className="home-shelf-section">
        <div className="shelf-header">
          <div>
            <div className="shelf-badge-row">
              <span className="shelf-pill-tag">👔 PREMIUM GROOMING</span>
              <span className="shelf-meta-text">NIVEA & Park Avenue</span>
            </div>
            <h3 className="shelf-title">Men's Health & Grooming</h3>
            <p className="shelf-subtitle">Specialized face washes, body sprays, eau de parfums, and shaving essentials.</p>
          </div>
          <button 
            type="button" 
            className="shelf-view-all-btn"
            onClick={() => onSelectCategory("Men's Health & Vitality")}
          >
            View All ({mensProducts.length}) →
          </button>
        </div>

        <div className="home-product-shelf-grid">
          {mensProducts.map(item => (
            <div key={item.id} className="home-curated-product-card">
              <div className="product-card-media">
                <span className="product-discount-chip">{item.discount || '15% OFF'}</span>
                <img src={item.image} alt={item.name} loading="lazy" />
                <span className="product-card-tag">{item.featurePill || item.brand || 'Grooming'}</span>
              </div>
              <div className="product-card-details">
                <div className="product-rating-row">
                  <span className="rating-pill">{item.rating || '4.8 ★'}</span>
                  <span className="pack-label">{item.pack || item.brand || 'Standard'}</span>
                </div>
                <h4 className="product-title" title={item.name}>{item.name}</h4>
                <div className="product-price-action-row">
                  <div className="price-block">
                    <span className="current-price">₹{item.price}</span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="mrp-price">₹{item.mrp}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="shelf-add-cart-btn"
                    onClick={() => onAddToCart && onAddToCart(item)}
                    title={"Add " + item.name + " to cart"}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Trust & Guarantee Strip */}
      <section className="home-trust-features-section">
        <div className="trust-grid">
          {TRUST_FEATURES.map((item, idx) => (
            <div key={idx} className="trust-card">
              <div className="trust-icon-box">{item.icon}</div>
              <div className="trust-text-box">
                <h5 className="trust-title">{item.title}</h5>
                <p className="trust-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CategoryWiseHomeSection
