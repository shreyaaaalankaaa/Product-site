/**
 * Product rendering utilities
 * Handles the creation of product cards and related UI elements
 */
class ProductRenderer {
    constructor() {
        this.defaultImage = this.createDefaultProductImage();
    }

    createDefaultProductImage() {
        // Create SVG placeholder for products without images
        return `
            <svg viewBox="0 0 100 100" class="product-placeholder" aria-hidden="true">
                <rect width="100" height="100" fill="currentColor" opacity="0.1"/>
                <path d="M20 20h60v60H20z" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="35" cy="35" r="5" fill="currentColor" opacity="0.5"/>
                <path d="M25 65l10-10 10 10 15-15 15 15" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    }

    createProductCard(product, isFeatured = false) {
        if (!product || typeof product !== 'object') {
            console.error('Invalid product data:', product);
            return '';
        }

        const {
            id,
            name = 'Unnamed Product',
            description = 'No description available',
            price = 0,
            rating = 0,
            category = 'Other',
            badge = null,
            image = null
        } = product;

        const formattedPrice = this.formatPrice(price);
        const ratingStars = this.createRatingStars(rating);
        const productImage = image ? this.createProductImage(image, name) : this.defaultImage;
        const badgeHtml = badge ? `<div class="product-badge">${this.escapeHtml(badge)}</div>` : '';

        return `
            <article class="product-card ${isFeatured ? 'featured' : ''}" 
                     data-product-id="${id}"
                     data-category="${this.escapeHtml(category)}"
                     itemscope 
                     itemtype="https://schema.org/Product">
                ${badgeHtml}
                <div class="product-image">
                    ${productImage}
                </div>
                <div class="product-content">
                    <h3 class="product-name" itemprop="name">${this.escapeHtml(name)}</h3>
                    <p class="product-description" itemprop="description">${this.escapeHtml(description)}</p>
                    <div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                        <span itemprop="price" content="${price}">${formattedPrice}</span>
                        <meta itemprop="priceCurrency" content="USD">
                    </div>
                    <div class="product-rating" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                        ${ratingStars}
                        <span class="rating-text">
                            <span itemprop="ratingValue" content="${rating}">${rating.toFixed(1)}</span>
                            <meta itemprop="ratingCount" content="100">
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    createProductImage(imageSrc, altText) {
        // For now, return placeholder since we're not using actual images
        // This method can be extended to handle real images in the future
        return this.defaultImage;
    }

    createRatingStars(rating) {
        if (typeof rating !== 'number' || rating < 0 || rating > 5) {
            rating = 0;
        }

        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = '<div class="rating-stars" aria-label="Rating: ' + rating.toFixed(1) + ' out of 5 stars">';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += `
                <svg class="star" aria-hidden="true">
                    <use href="assets/icons.svg#star"></use>
                </svg>
            `;
        }

        // Half star
        if (hasHalfStar) {
            starsHtml += `
                <svg class="star half" aria-hidden="true">
                    <use href="assets/icons.svg#star-half"></use>
                </svg>
            `;
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += `
                <svg class="star empty" aria-hidden="true">
                    <use href="assets/icons.svg#star"></use>
                </svg>
            `;
        }

        starsHtml += '</div>';
        return starsHtml;
    }

    formatPrice(price) {
        if (typeof price !== 'number' || price < 0) {
            return '$0.00';
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }

    escapeHtml(text) {
        if (typeof text !== 'string') {
            return String(text || '');
        }

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createProductFeatures(features) {
        if (!Array.isArray(features) || features.length === 0) {
            return '<p>No additional features listed.</p>';
        }

        const featuresHtml = features.map(feature => 
            `<li>${this.escapeHtml(feature)}</li>`
        ).join('');

        return `
            <h3>Key Features</h3>
            <ul>${featuresHtml}</ul>
        `;
    }

    getProductById(products, id) {
        if (!Array.isArray(products) || typeof id !== 'number') {
            return null;
        }

        return products.find(product => product.id === id) || null;
    }

    validateProduct(product) {
        if (!product || typeof product !== 'object') {
            return false;
        }

        const requiredFields = ['id', 'name', 'price'];
        return requiredFields.every(field => 
            product.hasOwnProperty(field) && product[field] !== null && product[field] !== undefined
        );
    }

    sortProducts(products, sortBy = 'name', order = 'asc') {
        if (!Array.isArray(products)) {
            return [];
        }

        const validProducts = products.filter(this.validateProduct);
        
        return validProducts.sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];

            // Handle string comparisons
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            // Handle numeric comparisons
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return order === 'asc' ? valueA - valueB : valueB - valueA;
            }

            // Handle string comparisons
            if (valueA < valueB) {
                return order === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    filterProductsByPriceRange(products, minPrice = 0, maxPrice = Infinity) {
        if (!Array.isArray(products)) {
            return [];
        }

        return products.filter(product => {
            if (!this.validateProduct(product)) {
                return false;
            }
            
            const price = parseFloat(product.price);
            return price >= minPrice && price <= maxPrice;
        });
    }

    searchProducts(products, query) {
        if (!Array.isArray(products) || typeof query !== 'string') {
            return products || [];
        }

        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) {
            return products;
        }

        return products.filter(product => {
            if (!this.validateProduct(product)) {
                return false;
            }

            const searchableFields = [
                product.name || '',
                product.description || '',
                product.category || '',
                ...(product.features || [])
            ];

            return searchableFields.some(field => 
                field.toString().toLowerCase().includes(searchTerm)
            );
        });
    }
}

// Initialize product renderer
window.productRenderer = new ProductRenderer();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductRenderer;
}
