import React from 'react'

export function AppProductCard({ product, onAddToCart, onProductClick }) {
  const handleAdd = (e) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    } else {
      alert(`Added ${product.name} to cart!`)
    }
  }

  const handleClick = () => {
    if (onProductClick) onProductClick(product)
  }

  return (
    <div className="app-deal-product-card" onClick={handleClick}>
      {/* Badges Row */}
      <div className="app-deal-badge-row">
        {product.discount && (
          <span className="app-discount-pill-badge">{product.discount}</span>
        )}

      </div>

      {/* Product Image */}
      <div className="app-deal-image-wrap">
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
          }}
        />
      </div>

      {/* Title */}
      <h3 className="app-deal-title">{product.name}</h3>

      {/* Pack info & Category Tag */}
      <div className="app-deal-meta-row">
        {product.pack && <span className="app-deal-pack-text">{product.pack}</span>}
        {product.tag && <span className="app-deal-tag-pill">{product.tag}</span>}
      </div>

      {/* Price & Plus Add Action Button */}
      <div className="app-deal-footer-row">
        <div className="app-deal-pricing">
          <span className="app-deal-price">₹{product.price}</span>
          {product.mrp && <span className="app-deal-mrp">₹{product.mrp}</span>}
        </div>

        <button 
          className="app-deal-add-plus-btn icon-only"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AppProductCard
