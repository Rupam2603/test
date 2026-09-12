import React, { useState, useEffect, useRef } from 'react'

const SLIDES = [
  {
    id: 1,
    badge: 'DAILY IMMUNITY & DEFENSE',
    tag: '🌿 100% Genuine Brands',
    title: 'Boost Family Health with',
    titleAccent: 'Immunity Essentials',
    titleEnd: '',
    accentColor: '#059669',
    buttonColor: '#059669',
    description: 'Clinically tested multivitamins, Ayurvedic tonics, antiseptic washes & modern diagnostic monitors with guaranteed fast doorstep dispatch.',
    primaryBtn: 'Shop Immunity Care →',
    secondaryBtn: 'Explore Top Brands',
    actionTab: 'category',
    categoryTarget: 'Daily Wellness & Immunity',
    image: '/banners/modern_slide1_immunity.jpg',
    badgeTop: 'FAST',
    badgeSub: '30 MIN',
    badgeLabel: 'Doorstep',
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
    borderColor: '#a7f3d0'
  },

  {
    id: 3,
    badge: 'B2B WHOLESALE PHARMACY',
    tag: '⚡ High Retailer Margins',
    title: 'Direct Supply for',
    titleAccent: 'Licensed Retailers & Clinics',
    titleEnd: '',
    accentColor: '#ea580c',
    buttonColor: '#ea580c',
    description: 'Special distributor prices for registered pharmacies. Bulk medicine orders, batch test documentation, GST invoices & priority scheduled dispatch.',
    primaryBtn: 'Explore Wholesale Deals →',
    secondaryBtn: 'Wholesale Catalog',
    actionTab: 'products',
    categoryTarget: 'Medical Supplies & Devices',
    image: '/banners/modern_slide3_wholesale.jpg',
    badgeTop: 'UP TO',
    badgeSub: '45%',
    badgeLabel: 'Margin',
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)',
    borderColor: '#fde68a'
  },
  {
    id: 4,
    badge: 'LIMITED TIME OFFER',
    tag: '🛡️ 100% Genuine Pharmacy',
    title: 'Flat',
    titleAccent: '20% Off',
    titleEnd: 'on First Order',
    accentColor: '#f43f5e',
    buttonColor: '#f43f5e',
    description: 'Genuine medicines, certified wellness supplements, baby care & emergency essentials – delivered to your doorstep in 30 mins.',
    primaryBtn: 'Shop Medicines →',
    secondaryBtn: 'Explore Deals',
    actionTab: 'category',
    categoryTarget: 'All',
    image: '/banners/modern_slide4_delivery.jpg',
    badgeTop: '30',
    badgeSub: 'MIN',
    badgeLabel: 'Delivery',
    gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fff5f5 100%)',
    borderColor: '#fecdd3'
  }
]

export function WebHeroSlideshow({ onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('slide')
      if (p !== null) {
        const val = parseInt(p, 10)
        if (!isNaN(val) && val >= 0 && val < SLIDES.length) return val
      }
    } catch {}
    return 0
  })
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Preload all banner slides for instant zero-lag rendering
  useEffect(() => {
    SLIDES.forEach(s => {
      const img = new Image()
      img.src = s.image
    })
  }, [])

  // Auto-play every 5 seconds (disabled if ?slide= is specified)
  useEffect(() => {
    const hasFixedSlide = new URLSearchParams(window.location.search).get('slide') !== null
    if (isPaused || hasFixedSlide) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, currentIndex])

  const goToSlide = (idx) => {
    setCurrentIndex(idx)
  }

  const prevSlide = (e) => {
    if (e) e.stopPropagation()
    setCurrentIndex(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1))
  }

  const nextSlide = (e) => {
    if (e) e.stopPropagation()
    setCurrentIndex(prev => (prev + 1) % SLIDES.length)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) {
      nextSlide()
    } else if (diff < -50) {
      prevSlide()
    }
    touchStartX.current = 0
    touchEndX.current = 0
  }


  return (
    <div 
      className="web-hero-slideshow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Featured Promotions Slideshow"
    >
      <div className="slideshow-inner">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex
          return (
            <div
              key={slide.id}
              className={`slide-item ${isActive ? 'active' : ''}`}
              style={{ background: slide.gradient }}
              aria-hidden={!isActive}
            >
              <div className="slide-content-layout">
                {/* Left: Text & Interactive CTA buttons */}
                <div className="slide-text-col">
                  <div className="slide-pill-cluster">
                    <span className="slide-badge-pill">{slide.badge}</span>
                    <span className="slide-tag-pill">{slide.tag}</span>
                  </div>

                  <h2 className="slide-title">
                    {slide.title}{' '}
                    {slide.titleAccent && (
                      <span className="slide-title-accent" style={{ color: slide.accentColor }}>
                        {slide.titleAccent}
                      </span>
                    )}{' '}
                    {slide.titleEnd}
                  </h2>

                  <p className="slide-desc">{slide.description}</p>

                  <div className="slide-action-btns">
                    <button
                      type="button"
                      className="slide-primary-btn"
                      style={{ background: slide.buttonColor }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onNavigate) onNavigate(slide.actionTab, slide.categoryTarget)
                      }}
                    >
                      {slide.primaryBtn}
                    </button>

                    <button
                      type="button"
                      className="slide-secondary-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onNavigate) {
                          onNavigate(slide.actionTab === 'services' ? 'services' : 'products')
                        }
                      }}
                    >
                      {slide.secondaryBtn}
                    </button>
                  </div>
                </div>

                {/* Right: Modern Photography Showcase Card */}
                <div className="slide-visual-col">
                  <div className="slide-image-card-frame">
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="slide-showcase-img"
                      loading="eager"
                    />
                    {/* Floating circular metric badge */}
                    <div className="slide-floating-badge" style={{ borderColor: slide.borderColor }}>
                      <span className="badge-micro-top">{slide.badgeTop}</span>
                      <span className="badge-main-text" style={{ color: slide.accentColor }}>
                        {slide.badgeSub}
                      </span>
                      <span className="badge-micro-bottom">{slide.badgeLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Floating Navigation Controls (Left & Right Arrows) */}
        <button
          type="button"
          className="slideshow-arrow-btn prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          className="slideshow-arrow-btn next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Floating Interactive Pagination Dots Bar */}
        <div className="slideshow-pagination-bar" onClick={(e) => e.stopPropagation()}>
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex
            return (
              <button
                key={slide.id}
                type="button"
                className={`slideshow-dot ${isActive ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={isActive}
              >
                {isActive && <span className="slideshow-dot-fill" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default WebHeroSlideshow
