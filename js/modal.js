/**
 * Product Modal Component
 * Handles the display and interaction of product detail modals
 */
class ProductModal {
    constructor() {
        this.modal = document.getElementById('product-modal');
        this.modalContainer = null;
        this.isOpen = false;
        this.focusableElements = [];
        this.firstFocusableElement = null;
        this.lastFocusableElement = null;
        this.previousActiveElement = null;

        this.init();
    }

    init() {
        if (!this.modal) {
            console.error('Product modal element not found');
            return;
        }

        this.modalContainer = this.modal.querySelector('.modal-container');
        this.setupEventListeners();
        this.setupFocusManagement();
    }

    setupEventListeners() {
        // Close modal when clicking overlay
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close button
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isOpen) {
                this.handleKeyDown(e);
            }
        });

        // Add to cart button (placeholder functionality)
        const addToCartBtn = this.modal.querySelector('#modal-add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                this.handleAddToCart(e);
            });
        }
    }

    setupFocusManagement() {
        // Focus trap setup
        this.modal.addEventListener('focus', this.updateFocusableElements.bind(this));
    }

    updateFocusableElements() {
        if (!this.isOpen) return;

        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ];

        this.focusableElements = Array.from(
            this.modal.querySelectorAll(focusableSelectors.join(', '))
        ).filter(el => !el.hasAttribute('aria-hidden'));

        this.firstFocusableElement = this.focusableElements[0];
        this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }

    open(product) {
        if (!product || !this.modal) {
            console.error('Cannot open modal: invalid product or modal not found');
            return;
        }

        this.previousActiveElement = document.activeElement;
        this.populateModal(product);
        this.showModal();
        this.isOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Announce modal opening to screen readers
        this.announceToScreenReader(`Product details for ${product.name} opened`);

        // Focus management
        requestAnimationFrame(() => {
            this.updateFocusableElements();
            if (this.firstFocusableElement) {
                this.firstFocusableElement.focus();
            }
        });
    }

    close() {
        if (!this.isOpen) return;

        this.hideModal();
        this.isOpen = false;

        // Restore body scroll
        document.body.style.overflow = '';

        // Restore focus
        if (this.previousActiveElement) {
            this.previousActiveElement.focus();
            this.previousActiveElement = null;
        }

        // Announce modal closing to screen readers
        this.announceToScreenReader('Product details closed');
    }

    showModal() {
        this.modal.style.display = 'flex';
        this.modal.setAttribute('aria-hidden', 'false');
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.modal.classList.add('active');
        });
    }

    hideModal() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            if (!this.isOpen) {
                this.modal.style.display = 'none';
            }
        }, 300);
    }

    populateModal(product) {
        const {
            name = 'Unnamed Product',
            description = 'No description available',
            price = 0,
            rating = 0,
            features = [],
            category = 'Other'
        } = product;

        // Update modal title
        const modalTitle = this.modal.querySelector('#modal-title');
        if (modalTitle) {
            modalTitle.textContent = name;
        }

        // Update price
        const modalPrice = this.modal.querySelector('#modal-price');
        if (modalPrice) {
            modalPrice.textContent = window.productRenderer.formatPrice(price);
        }

        // Update rating
        const modalRating = this.modal.querySelector('#modal-rating');
        if (modalRating) {
            modalRating.innerHTML = window.productRenderer.createRatingStars(rating);
            
            // Add rating text
            const ratingText = document.createElement('span');
            ratingText.className = 'rating-text';
            ratingText.textContent = `${rating.toFixed(1)} out of 5 stars`;
            modalRating.appendChild(ratingText);
        }

        // Update description
        const modalDescription = this.modal.querySelector('#modal-description');
        if (modalDescription) {
            modalDescription.innerHTML = `
                <h3>Description</h3>
                <p>${window.productRenderer.escapeHtml(description)}</p>
                <div class="product-category">
                    <strong>Category:</strong> ${window.productRenderer.escapeHtml(category)}
                </div>
            `;
        }

        // Update features
        const modalFeatures = this.modal.querySelector('#modal-features');
        if (modalFeatures) {
            modalFeatures.innerHTML = window.productRenderer.createProductFeatures(features);
        }

        // Update image placeholder
        const modalImage = this.modal.querySelector('#modal-image');
        if (modalImage) {
            modalImage.innerHTML = window.productRenderer.defaultImage;
        }

        // Store product data for add to cart functionality
        this.currentProduct = product;
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
            
            case 'Tab':
                this.handleTabKey(e);
                break;
        }
    }

    handleTabKey(e) {
        if (!this.focusableElements.length) return;

        if (e.shiftKey) {
            // Shift + Tab - move backwards
            if (document.activeElement === this.firstFocusableElement) {
                e.preventDefault();
                this.lastFocusableElement.focus();
            }
        } else {
            // Tab - move forwards
            if (document.activeElement === this.lastFocusableElement) {
                e.preventDefault();
                this.firstFocusableElement.focus();
            }
        }
    }

    handleAddToCart(e) {
        e.preventDefault();
        
        if (!this.currentProduct) {
            console.error('No product selected');
            return;
        }

        // Placeholder add to cart functionality
        this.showAddToCartFeedback();
        
        // Log for development
        console.log('Add to cart:', this.currentProduct);
        
        // In a real application, this would integrate with a cart system
        this.simulateAddToCart(this.currentProduct);
    }

    simulateAddToCart(product) {
        // Simulate adding to cart
        const event = new CustomEvent('productAddedToCart', {
            detail: {
                product: product,
                quantity: 1,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }

    showAddToCartFeedback() {
        const addToCartBtn = this.modal.querySelector('#modal-add-to-cart');
        if (!addToCartBtn) return;

        const originalText = addToCartBtn.innerHTML;
        
        // Show success state
        addToCartBtn.innerHTML = `
            <svg class="btn-icon" aria-hidden="true">
                <use href="assets/icons.svg#check"></use>
            </svg>
            Added to Cart!
        `;
        addToCartBtn.disabled = true;
        addToCartBtn.style.background = '#10b981';

        // Announce to screen readers
        this.announceToScreenReader(`${this.currentProduct.name} added to cart`);

        // Reset after 2 seconds
        setTimeout(() => {
            if (addToCartBtn) {
                addToCartBtn.innerHTML = originalText;
                addToCartBtn.disabled = false;
                addToCartBtn.style.background = '';
            }
        }, 2000);
    }

    announceToScreenReader(message) {
        // Create temporary announcement element for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Public API for checking modal state
    isModalOpen() {
        return this.isOpen;
    }

    getCurrentProduct() {
        return this.currentProduct || null;
    }
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productModal = new ProductModal();

    // Listen for add to cart events
    document.addEventListener('productAddedToCart', (e) => {
        console.log('Product added to cart:', e.detail);
        // Here you could integrate with analytics, update cart UI, etc.
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductModal;
}
