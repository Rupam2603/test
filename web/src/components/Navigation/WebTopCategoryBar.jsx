import React, { useRef } from 'react'

export const WEB_CATEGORIES = [
  {
    id: 'all',
    label: 'All',
    bgColor: '#fff1f2',
    iconColor: '#e11d48',
    isSpecialCard: true,
    renderIcon: () => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
      </svg>
    )
  },
  {
    id: 'skin',
    label: 'Skin',
    circleBg: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        <path
          d="M12 28C13 32 17 35 22 34C26.5 33 29 29.5 28.5 25C28.1 21 24.5 18 25.5 13C26.3 9 24.5 6 20 6C15 6 12.5 10 13 14C13.5 18 16 19.5 16 22C16 24 11 24 12 28Z"
          fill="#fda4af"
          opacity="0.35"
        />
        <path
          d="M14 26C15 28.5 18 31 22 30C25.5 29 27 26 26.5 22C26.1 19 23 16.5 23.8 12.5C24.4 9.5 23 7 19.5 7C16 7 14 10 14.5 13C15 16.5 17 18 17 20C17 22.5 13.2 23.5 14 26Z"
          fill="#f43f5e"
        />
        <path
          d="M20 12C20.8 14 22 15 22 17C22 19 20 20 20 22"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    id: 'pain-relief',
    label: 'Pain Relief',
    circleBg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Person Head & Torso */}
        <circle cx="20" cy="11" r="5" fill="#0284c7" />
        <path d="M12 32C12 24.5 15.5 20 20 20C24.5 20 28 24.5 28 32H12Z" fill="#0284c7" />
        {/* Radiating Pain Circles on Shoulder/Chest */}
        <circle cx="25" cy="18" r="7" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="3 2" fill="#fee2e2" fillOpacity="0.7" />
        <circle cx="25" cy="18" r="4.2" stroke="#dc2626" strokeWidth="1.8" fill="#f87171" />
        <circle cx="25" cy="18" r="1.8" fill="#ffffff" />
      </svg>
    )
  },
  {
    id: 'weight-loss',
    label: 'Weight Loss',
    circleBg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Weighing scale body */}
        <rect x="8" y="10" width="24" height="23" rx="6" fill="#0284c7" />
        <path d="M9 17H31V28C31 30.5 29 32 26.5 32H13.5C11 32 9 30.5 9 28V17Z" fill="#0369a1" opacity="0.4" />
        {/* Meter dial */}
        <circle cx="20" cy="15" r="5.5" fill="#ffffff" />
        <path d="M20 15L22 13" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="15" r="1.2" fill="#ef4444" />
      </svg>
    )
  },
  {
    id: 'wellness',
    label: 'Wellness',
    circleBg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Trio of fresh green leaves */}
        <path d="M20 7C20 7 27 12 27 22C27 27 23.5 29 20 30C16.5 29 13 27 13 22C13 12 20 7 20 7Z" fill="#16a34a" />
        <path d="M20 30V15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 17C23 19 28 20 31 24C32 26 31.5 29 29 30C26 31 22 28 20 25" fill="#22c55e" opacity="0.9" />
        <path d="M20 17C17 19 12 20 9 24C8 26 8.5 29 11 30C14 31 18 28 20 25" fill="#22c55e" opacity="0.9" />
      </svg>
    )
  },
  {
    id: 'baby-care',
    label: 'Baby Care',
    circleBg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Baby head with curl */}
        <path d="M20 11C21 8 23 8.5 23 10C23 11.2 21.8 11.5 20.8 12.5" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="21" r="10" stroke="#7e22ce" strokeWidth="2.2" fill="#faf5ff" />
        {/* Eyes & Smile */}
        <circle cx="16.5" cy="19.5" r="1.3" fill="#7e22ce" />
        <circle cx="23.5" cy="19.5" r="1.3" fill="#7e22ce" />
        <circle cx="14" cy="22.5" r="1.5" fill="#f472b6" opacity="0.6" />
        <circle cx="26" cy="22.5" r="1.5" fill="#f472b6" opacity="0.6" />
        <path d="M17 24C18 25.5 22 25.5 23 24" stroke="#7e22ce" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'women',
    label: 'Women',
    circleBg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Venus Symbol */}
        <circle cx="20" cy="17" r="7.5" stroke="#db2777" strokeWidth="3" fill="#ffffff" />
        <line x1="20" y1="24.5" x2="20" y2="34" stroke="#db2777" strokeWidth="3" strokeLinecap="round" />
        <line x1="15" y1="29" x2="25" y2="29" stroke="#db2777" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'men',
    label: 'Men',
    circleBg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Mars Symbol */}
        <circle cx="17" cy="23" r="7.5" stroke="#2563eb" strokeWidth="3" fill="#ffffff" />
        <line x1="22.5" y1="17.5" x2="31" y2="9" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
        <polyline points="24,9 31,9 31,16" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: 'diet',
    label: 'Diet',
    circleBg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Sprout leaves */}
        <path d="M20 19C20 14 24 11 27 12C27.5 15 24.5 19 20 19Z" fill="#16a34a" />
        <path d="M20 19C20 14 16 11 13 12C12.5 15 15.5 19 20 19Z" fill="#22c55e" />
        {/* Bowl */}
        <path d="M9 20H31C31 27 26 31 20 31C14 31 9 27 9 20Z" fill="#0d9488" />
        <rect x="15" y="31" width="10" height="2" rx="1" fill="#0f766e" />
      </svg>
    )
  },
  {
    id: 'hair-care',
    label: 'Hair Care',
    circleBg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Hair root & strand */}
        <path
          d="M20 7C22 13 25 18 25 24C25 28 22 30 19 30C15 30 13 26 15 22C17 18 20 11 20 7Z"
          fill="#1e293b"
        />
        {/* Sparkle stars */}
        <path d="M28 12L29 9L30 12L33 13L30 14L29 17L28 14L25 13L28 12Z" fill="#0ea5e9" />
        <path d="M31 21L31.7 19L32.4 21L34.5 21.7L32.4 22.4L31.7 24.5L31 22.4L28.9 21.7L31 21Z" fill="#38bdf8" />
      </svg>
    )
  },
  {
    id: 'medical-supplies',
    label: 'Medical Supplies',
    circleBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Medical kit briefcase */}
        <rect x="9" y="14" width="22" height="17" rx="4" fill="#7c3aed" />
        <path d="M15 14V11C15 9.5 16.5 8.5 18 8.5H22C23.5 8.5 25 9.5 25 11V14" stroke="#7c3aed" strokeWidth="2.5" />
        {/* White cross */}
        <rect x="18" y="18" width="4" height="9" rx="1" fill="#ffffff" />
        <rect x="15.5" y="20.5" width="9" height="4" rx="1" fill="#ffffff" />
      </svg>
    )
  },
  {
    id: 'insurance',
    label: 'Insurance',
    circleBg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    renderIcon: () => (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        {/* Shield with checkmark */}
        <path
          d="M20 7L10 11V21C10 27.5 14.5 32.5 20 34C25.5 32.5 30 27.5 30 21V11L20 7Z"
          fill="url(#shieldGrad)"
        />
        <path
          d="M16 20.5L19 23.5L24.5 17.5"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="shieldGrad" x1="10" y1="7" x2="30" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    )
  }
]

export function WebTopCategoryBar({ activeCategory = 'all', onSelectCategory }) {
  const scrollRef = useRef(null)

  const handleScroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <div className="web-top-category-strip">
      <div className="web-top-category-container">
        {/* Scroll Left Button */}
        <button 
          className="web-category-scroll-btn prev"
          onClick={() => handleScroll(-280)}
          aria-label="Scroll left categories"
          type="button"
        >
          ‹
        </button>

        <div className="web-category-scroll-track" ref={scrollRef}>
          {WEB_CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat.id
            const isAll = cat.id === 'all'

            if (isAll) {
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`web-category-item-btn all-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                  aria-label={cat.label}
                  aria-pressed={isSelected}
                >
                  <div className="all-icon-box">
                    {cat.renderIcon()}
                  </div>
                  <span className="category-item-label">{cat.label}</span>
                  <div className="all-active-indicator" />
                </button>
              )
            }

            return (
              <button
                key={cat.id}
                type="button"
                className={`web-category-item-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                aria-label={cat.label}
                aria-pressed={isSelected}
              >
                <div 
                  className="category-circle-icon-box"
                  style={{ background: cat.circleBg }}
                >
                  {cat.renderIcon()}
                </div>
                <span className="category-item-label">{cat.label}</span>
                {isSelected && <div className="category-active-dot" />}
              </button>
            )
          })}
        </div>

        {/* Scroll Right Button */}
        <button 
          className="web-category-scroll-btn next"
          onClick={() => handleScroll(280)}
          aria-label="Scroll right categories"
          type="button"
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default WebTopCategoryBar

