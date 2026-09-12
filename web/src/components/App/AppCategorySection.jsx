import React, { useState, useRef } from 'react'
import { APP_VISUAL_CATEGORIES } from '../../data/appCatalog'
import { WEB_CATEGORIES } from '../Navigation/WebTopCategoryBar'

export function AppCategorySection({ onSelectCategory }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const scrollRef = useRef(null)

  const handleFilterClick = (id) => {
    setActiveFilter(id)
    if (onSelectCategory) onSelectCategory(id)
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 160, behavior: 'smooth' })
    }
  }

  return (
    <div className="app-categories-wrapper">
      {/* Sleek Vector Category Strip */}
      <div className="app-categories-strip-section">
        <div className="app-categories-scroll-row" ref={scrollRef}>
          {WEB_CATEGORIES.map(cat => {
            const isActive = activeFilter === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                className={`app-filter-item-pill ${isActive ? 'is-active' : ''}`}
                onClick={() => handleFilterClick(cat.id)}
                aria-label={cat.label}
              >
                <div 
                  className="app-category-disc"
                  style={{ background: cat.circleBg }}
                >
                  {cat.renderIcon()}
                </div>
                <span className="app-category-label">{cat.label}</span>
                {isActive && <div className="app-active-indicator-dot"></div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Visual Category Grid (Image 2) */}
      <div className="app-visual-category-container">
        <div className="app-visual-category-grid">
          {APP_VISUAL_CATEGORIES.map(cat => (
            <div 
              key={cat.id} 
              className="app-visual-cat-card"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            >
              <div className="app-visual-cat-img-box">
                <img src={cat.image} alt={cat.title} loading="lazy" />
              </div>
              <h4 className="app-visual-cat-title">{cat.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AppCategorySection

