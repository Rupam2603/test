import React, { useState } from 'react'

export function AppWholesaleBanner({ onExplore, onCatalog }) {
  const [slideIndex, setSlideIndex] = useState(0)

  const slides = [
    {
      badge: 'B2B WHOLESALE PHARMACY',
      tagline: '⚡ High Retailer Margins',
      titleHighlight: 'Licensed Retailers & Clinics',
      titlePrefix: 'Direct Supply for ',
      description: 'Special distributor prices for registered pharmacies. Bulk medicine orders, batch test documentation, GST invoices & priority scheduled dispatch.',
      primaryBtn: 'Explore Wholesale Deals →',
      secondaryBtn: 'Wholesale Catalog',
      marginText: 'Up to 45% Margin',
      previewImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80'
    },
    {
      badge: 'DIRECT DISTRIBUTOR DEALS',
      tagline: '🏛️ Verified Wholesale Drug License',
      titleHighlight: 'Pharma Wholesaler',
      titlePrefix: 'West Bengal Medicine ',
      description: 'Serving pharmacies, retail medical stores, and healthcare institutions across Hooghly & Kolkata with authentic supply batches.',
      primaryBtn: 'Check Stock & Rates →',
      secondaryBtn: 'Licensing Info',
      marginText: 'Best B2B Rates',
      previewImage: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=80'
    }
  ]

  const current = slides[slideIndex]

  const handlePrev = () => {
    setSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="app-wholesale-hero-card">
      <div className="app-hero-pill-badge">{current.badge}</div>
      <div className="app-hero-subtag">{current.tagline}</div>

      <h2 className="app-hero-main-title">
        {current.titlePrefix}
        <span className="app-highlight-orange">{current.titleHighlight}</span>
      </h2>

      <p className="app-hero-body-text">{current.description}</p>

      <div className="app-hero-action-row">
        <button 
          className="app-hero-orange-btn" 
          onClick={onExplore || (() => alert('Opening Wholesale Deals'))}
        >
          {current.primaryBtn}
        </button>
        <button 
          className="app-hero-white-btn" 
          onClick={onCatalog || (() => alert('Opening Wholesale Catalog'))}
        >
          {current.secondaryBtn}
        </button>
      </div>

      {/* Carousel Arrow Controls */}
      <button className="app-hero-carousel-arrow arrow-left" onClick={handlePrev} aria-label="Previous slide">
        ‹
      </button>
      <button className="app-hero-carousel-arrow arrow-right" onClick={handleNext} aria-label="Next slide">
        ›
      </button>

      {/* Bottom Preview Card */}
      <div className="app-hero-preview-box">
        <img src={current.previewImage} alt="Wholesale medicine supply preview" />
        <div className="app-margin-badge-circle">
          <span>{current.marginText.split(' ')[0]}</span>
          <strong>{current.marginText.split(' ').slice(1, 3).join(' ')}</strong>
          <small>{current.marginText.split(' ').slice(3).join(' ') || 'Margin'}</small>
        </div>
      </div>
    </div>
  )
}

export default AppWholesaleBanner

