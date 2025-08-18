/**
 * Main application controller
 * Handles initialization and coordination between modules
 */
class ShopHubApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.searchQuery = '';
        this.selectedCategory = '';
        
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            await this.loadProducts();
            this.setupEventListeners();
            this.renderProducts();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load products. Please refresh the page.');
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (!data.products || !Array.isArray(data.products)) {
                throw new Error('Invalid product data structure');
            }
            
            this.products = data.products;
            this.filteredProducts = [...this.products];
            this.categories = [...new Set(this.products.map(product => product.category))];
            this.populateCategoryFilter();
        } catch (error) {
            console.error('Error loading products:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const clearFiltersBtn = document.querySelector('.clear-filters');

        if (searchInput) {
            // Debounced search
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value.trim().toLowerCase();
                    this.filterProducts();
                }, 300);
            });

            // Handle enter key
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchQuery = e.target.value.trim().toLowerCase();
                    this.filterProducts();
                }
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.filterProducts();
            });
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Keyboard navigation for product cards
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.productModal) {
                window.productModal.close();
            }
        });
    }

    populateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;

        // Clear existing options (except "All Categories")
        const allOption = categoryFilter.querySelector('option[value=""]');
        categoryFilter.innerHTML = '';
        if (allOption) {
            categoryFilter.appendChild(allOption);
        }

        // Add category options
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
        });
    }

    filterProducts() {
        let filtered = [...this.products];

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery) ||
                product.category.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply category filter
        if (this.selectedCategory) {
            filtered = filtered.filter(product => 
                product.category === this.selectedCategory
            );
        }

        this.filteredProducts = filtered;
        this.renderProducts();
        this.updateProductCount();
    }

    clearFilters() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';

        this.searchQuery = '';
        this.selectedCategory = '';
        this.filteredProducts = [...this.products];
        this.renderProducts();
        this.updateProductCount();

        // Focus search input for accessibility
        if (searchInput) searchInput.focus();
    }

    renderProducts() {
        this.renderFeaturedProducts();
        this.renderAllProducts();
    }

    renderFeaturedProducts() {
        const featuredContainer = document.getElementById('featured-products');
        if (!featuredContainer) return;

        const featuredProducts = this.products.filter(product => product.featured).slice(0, 3);
        
        if (featuredProducts.length === 0) {
            featuredContainer.innerHTML = '<p class="text-center">No featured products available.</p>';
            return;
        }

        featuredContainer.innerHTML = featuredProducts.map(product => 
            window.productRenderer.createProductCard(product, true)
        ).join('');

        // Add event listeners to featured product cards
        this.addProductCardListeners(featuredContainer);
    }

    renderAllProducts() {
        const productsContainer = document.getElementById('products-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!productsContainer || !emptyState) return;

        if (this.filteredProducts.length === 0) {
            productsContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        productsContainer.style.display = 'grid';
        
        productsContainer.innerHTML = this.filteredProducts.map(product => 
            window.productRenderer.createProductCard(product, false)
        ).join('');

        // Add event listeners to product cards
        this.addProductCardListeners(productsContainer);
    }

    addProductCardListeners(container) {
        const productCards = container.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productId = parseInt(card.dataset.productId);
            const product = this.products.find(p => p.id === productId);
            
            if (!product) return;

            // Click handler
            card.addEventListener('click', () => {
                if (window.productModal) {
                    window.productModal.open(product);
                }
            });

            // Keyboard handler
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (window.productModal) {
                        window.productModal.open(product);
                    }
                }
            });

            // Make card focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${product.name}`);
        });
    }

    updateProductCount() {
        const productCount = document.getElementById('products-count');
        if (!productCount) return;

        const total = this.products.length;
        const filtered = this.filteredProducts.length;
        
        if (this.searchQuery || this.selectedCategory) {
            productCount.textContent = `Showing ${filtered} of ${total} products`;
        } else {
            productCount.textContent = `${total} products`;
        }
    }

    showLoading() {
        const loading = document.getElementById('loading-indicator');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading-indicator');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const productsContainer = document.getElementById('products-grid');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="error-state">
                    <svg class="error-icon" aria-hidden="true">
                        <use href="assets/icons.svg#alert-circle"></use>
                    </svg>
                    <h3>Error Loading Products</h3>
                    <p>${message}</p>
                </div>
            `;
        }
        this.hideLoading();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shopHubApp = new ShopHubApp();
});

// Handle page visibility changes for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, potentially pause non-critical operations
        return;
    }
    // Page is visible, resume operations if needed
});
