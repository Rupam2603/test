import React, { useState } from 'react'

export function ProductDetails({ product, onBack, onAddToCart }) {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    
    const newReview = {
      id: Date.now(),
      author: 'Guest User',
      rating,
      text: reviewText,
      date: new Date().toLocaleDateString()
    }
    
    setReviews([newReview, ...reviews])
    setReviewText('')
    setRating(5)
  }

  if (!product) return null

  return (
    <section className="product-details-section">
      <div className="product-details-header">
        <button className="back-btn" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </div>

      <div className="product-details-container">
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
          {product.featurePill && (
            <span className="product-details-pill">{product.featurePill}</span>
          )}
        </div>
        
        <div className="product-details-info">
          <h1 className="product-details-title">{product.name}</h1>
          <p className="product-details-brand">Brand: <span>{product.brand}</span></p>
          
          <div className="product-details-meta">
            <div className="rating-badge">⭐ {product.rating}</div>
            <span className="reviews-count">({product.reviewsCount} reviews)</span>
          </div>

          <div className="product-details-pricing">
            <span className="current-price">₹{product.price}</span>
            {product.mrp && <span className="mrp-price">₹{product.mrp}</span>}
            {product.discount && <span className="discount-tag">{product.discount}</span>}
          </div>

          <p className="product-details-pack">Pack size: {product.pack}</p>

          <div className="product-details-stock">
            <span className="stock-label">Availability: </span>
            <span className={(product.stock !== undefined ? product.stock : 15) > 0 ? "stock-in" : "stock-out"}>
              {(product.stock !== undefined ? product.stock : 15) > 0 ? `${product.stock !== undefined ? product.stock : 15} items in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="product-details-description">
            <h3>About this product</h3>
            <p>{product.description || 'No description available for this product.'}</p>
          </div>

          <div className="product-reviews-section">
            <h3 className="section-title">Customer Reviews</h3>
            
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h4 className="form-title">Write a Review</h4>
              <div className="star-rating-select">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star}
                    className={`star ${rating >= star ? 'selected' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea 
                className="review-textarea"
                placeholder="Share your experience with this product..." 
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows="3"
                required
              />
              <button type="submit" className="submit-review-btn">Submit Review</button>
            </form>

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="review-card">
                    <div className="review-header">
                      <span className="review-author">{rev.author}</span>
                      <span className="review-date">{rev.date}</span>
                    </div>
                    <div className="review-stars">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className="review-text">{rev.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            className="product-details-add-btn" 
            onClick={() => onAddToCart(product)}
            disabled={(product.stock !== undefined ? product.stock : 15) <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  )
}

export default ProductDetails
