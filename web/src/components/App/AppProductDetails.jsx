import React, { useState } from 'react'

export function AppProductDetails({ product, onBack, onAddToCart }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  // Mock multiple images by reusing the main image
  const images = [
    product.image,
    product.image,
    product.image,
    product.image
  ]

  const handleAdd = (e) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    }
  }


  return (
    <div className="app-product-details-page">
      {/* Top Header */}
      <div className="app-pd-header">
        <button className="app-pd-back-btn" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="app-pd-header-actions">
          <button className="app-pd-action-btn" aria-label="Share">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="app-pd-image-gallery">
        <div className="app-pd-image-container">
          <img src={images[activeImageIndex]} alt={product.name} />
          {product.discount && (
            <span className="app-pd-discount-badge">{product.discount}</span>
          )}
        </div>
        <div className="app-pd-image-dots">
          {images.map((_, idx) => (
            <span 
              key={idx} 
              className={`app-pd-dot ${activeImageIndex === idx ? 'active' : ''}`}
              onClick={() => setActiveImageIndex(idx)}
            ></span>
          ))}
        </div>
      </div>

      <div className="app-pd-content">
        {/* Product Title & Basic Info */}
        <div className="app-pd-section">
          <div className="app-pd-title-row">
            <h1 className="app-pd-title">{product.name}</h1>
          </div>
          <div className="app-pd-meta">
            {product.pack && <span className="app-pd-pack">{product.pack}</span>}
            {product.category && <span className="app-pd-category-tag">{product.category}</span>}
            <span className="app-pd-rating">
              4.6 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </span>
          </div>
          {product.stockBadge && (
            <div className={`app-pd-stock-status ${product.isLowStock ? 'low-stock' : 'in-stock'}`}>
              <span className="stock-dot"></span>
              {product.stockBadge.replace('Stock: ', '')} units available
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="app-pd-section app-pd-pricing-section">
          <div className="app-pd-price-row">
            <span className="app-pd-price">₹{product.price}</span>
            {product.mrp && <span className="app-pd-mrp">MRP ₹{product.mrp}</span>}
          </div>
          <p className="app-pd-tax-info">Inclusive of all taxes</p>
        </div>

        {/* Offers */}
        <div className="app-pd-section app-pd-offers-section">
          <h3 className="app-pd-section-title">Available Offers</h3>
          <div className="app-pd-offer-item">
            <div className="app-pd-offer-icon">%</div>
            <div className="app-pd-offer-text">
              <strong>Bank Offer</strong>
              <p>5% Cashback on SubhOne Axis Bank Credit Card</p>
            </div>
          </div>
          <div className="app-pd-offer-item">
            <div className="app-pd-offer-icon">₹</div>
            <div className="app-pd-offer-text">
              <strong>Wallet Offer</strong>
              <p>Flat ₹50 off on Paytm Postpaid</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="app-pd-section">
          <h3 className="app-pd-section-title">Product Details</h3>
          <p className="app-pd-description">
            {product.name} is a high-quality product sourced directly from verified distributors. 
            Store in a cool, dry place away from direct sunlight. 
            Check the packaging for exact expiration dates and manufacturing details.
          </p>
        </div>

        {/* Write a Review Section */}
        <div className="app-pd-section app-pd-write-review-section">
          <h3 className="app-pd-section-title">Ratings & Reviews</h3>
          <div className="app-pd-no-reviews">
            <div className="app-pd-no-reviews-icon">☆</div>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
          
          <div className="app-pd-write-review-form">
            <h4 className="app-pd-write-review-title">Write a Review</h4>
            <div className="app-pd-star-input">
              <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
            </div>
            <textarea 
              className="app-pd-review-textarea" 
              placeholder="Share your experience with this product..."
              rows="3"
            ></textarea>
            <button className="app-pd-submit-review-btn">Submit Review</button>
          </div>
        </div>
        {/* Spacer for sticky footer */}
        <div style={{ height: '80px' }}></div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="app-pd-sticky-footer">
        <button className="app-pd-cart-btn" onClick={handleAdd}>
          <span className="cart-btn-text">Add to Cart</span>
          <span className="cart-btn-price">₹{product.price}</span>
        </button>
      </div>
    </div>
  )
}

export default AppProductDetails
