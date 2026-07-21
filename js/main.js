class ShopHubApp {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.sortMode = 'featured';
    this.showWishlistOnly = false;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error('Invalid product data.');
      this.products = data.products;
      window.cartManager.setProducts(this.products);
      this.restoreStateFromUrl();
      this.renderCategoryChips();
      this.bindEvents();
      this.syncControls();
      this.applyFilters(false);
      this.renderFeatured();
      document.getElementById('current-year').textContent = new Date().getFullYear();
    } catch (error) {
      console.error(error);
      this.showLoadError();
    } finally {
      document.getElementById('loading-indicator')?.classList.add('hidden');
    }
  }

  bindEvents() {
    let debounce;
    document.getElementById('search-input')?.addEventListener('input', event => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        this.searchQuery = event.target.value.trim().toLowerCase();
        this.applyFilters();
      }, 220);
    });

    document.getElementById('sort-select')?.addEventListener('change', event => {
      this.sortMode = event.target.value;
      this.applyFilters();
    });

    document.querySelector('.clear-filters')?.addEventListener('click', () => this.clearFilters());
    document.getElementById('empty-clear')?.addEventListener('click', () => this.clearFilters());
    document.getElementById('wishlist-toggle')?.addEventListener('click', () => {
      this.showWishlistOnly = !this.showWishlistOnly;
      this.syncWishlistToggle();
      this.applyFilters();
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('category-chips')?.addEventListener('click', event => {
      const button = event.target.closest('button[data-category]');
      if (!button) return;
      this.selectedCategory = button.dataset.category;
      this.syncActiveChip();
      this.applyFilters();
    });

    document.addEventListener('wishlist:changed', () => {
      this.renderFeatured();
      this.applyFilters(false);
      window.productModal?.updateWishlistButton?.();
    });

    document.addEventListener('click', event => {
      const actionButton = event.target.closest('button[data-action][data-product-id]');
      if (actionButton) {
        const product = this.products.find(item => item.id === Number(actionButton.dataset.productId));
        if (!product) return;
        const action = actionButton.dataset.action;
        if (action === 'view') window.productModal.open(product);
        if (action === 'add') window.cartManager.add(product.id);
        if (action === 'wishlist') window.wishlistManager.toggle(product.id, product.name);
      }

      const footerFilter = event.target.closest('.footer-filter[data-category]');
      if (footerFilter) {
        this.selectedCategory = footerFilter.dataset.category;
        this.showWishlistOnly = false;
        this.syncControls();
        this.applyFilters();
        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    window.addEventListener('popstate', () => {
      this.restoreStateFromUrl();
      this.syncControls();
      this.applyFilters(false);
    });
  }

  restoreStateFromUrl() {
    const params = new URLSearchParams(location.search);
    this.searchQuery = (params.get('q') || '').toLowerCase();
    this.selectedCategory = params.get('category') || 'All';
    this.sortMode = params.get('sort') || 'featured';
    this.showWishlistOnly = params.get('saved') === '1';
  }

  updateUrl() {
    const params = new URLSearchParams();
    if (this.searchQuery) params.set('q', this.searchQuery);
    if (this.selectedCategory !== 'All') params.set('category', this.selectedCategory);
    if (this.sortMode !== 'featured') params.set('sort', this.sortMode);
    if (this.showWishlistOnly) params.set('saved', '1');
    const query = params.toString();
    history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
  }

  renderCategoryChips() {
    const categories = ['All', ...new Set(this.products.map(product => product.category))];
    document.getElementById('category-chips').innerHTML = categories.map(category => `
      <button class="category-chip" type="button" data-category="${window.productRenderer.escapeHtml(category)}" aria-pressed="false">
        ${window.productRenderer.escapeHtml(category)}
      </button>`).join('');
  }

  syncControls() {
    const search = document.getElementById('search-input');
    const sort = document.getElementById('sort-select');
    if (search) search.value = this.searchQuery;
    if (sort && [...sort.options].some(option => option.value === this.sortMode)) sort.value = this.sortMode;
    this.syncActiveChip();
    this.syncWishlistToggle();
  }

  syncActiveChip() {
    document.querySelectorAll('.category-chip').forEach(button => {
      const active = button.dataset.category === this.selectedCategory;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  syncWishlistToggle() {
    const button = document.getElementById('wishlist-toggle');
    button?.classList.toggle('active', this.showWishlistOnly);
    button?.setAttribute('aria-pressed', String(this.showWishlistOnly));
    button?.setAttribute('aria-label', this.showWishlistOnly ? 'Show all products' : 'Show saved products');
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.sortMode = 'featured';
    this.showWishlistOnly = false;
    this.syncControls();
    this.applyFilters();
    document.getElementById('search-input')?.focus();
  }

  applyFilters(updateUrl = true) {
    let products = this.products.filter(product => {
      const haystack = `${product.name} ${product.description} ${product.category} ${(product.features || []).join(' ')}`.toLowerCase();
      return (!this.searchQuery || haystack.includes(this.searchQuery))
        && (this.selectedCategory === 'All' || product.category === this.selectedCategory)
        && (!this.showWishlistOnly || window.wishlistManager.has(product.id));
    });

    products = [...products].sort((a, b) => {
      if (this.sortMode === 'price-asc') return a.price - b.price;
      if (this.sortMode === 'price-desc') return b.price - a.price;
      if (this.sortMode === 'rating-desc') return b.rating - a.rating;
      if (this.sortMode === 'name-asc') return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured) || a.id - b.id;
    });

    this.filteredProducts = products;
    this.renderProducts();
    if (updateUrl) this.updateUrl();
  }

  renderFeatured() {
    const featured = this.products.filter(product => product.featured).slice(0, 3);
    document.getElementById('featured-products').innerHTML = featured.map(product => window.productRenderer.createProductCard(product)).join('');
  }

  renderProducts() {
    const grid = document.getElementById('products-grid');
    const empty = document.getElementById('empty-state');
    const count = document.getElementById('products-count');
    const total = this.filteredProducts.length;
    count.textContent = this.showWishlistOnly
      ? `${total} saved ${total === 1 ? 'product' : 'products'}`
      : `${total} ${total === 1 ? 'product' : 'products'} shown`;
    grid.innerHTML = this.filteredProducts.map(product => window.productRenderer.createProductCard(product)).join('');
    grid.hidden = total === 0;
    empty.hidden = total !== 0;
    if (total === 0 && this.showWishlistOnly) {
      empty.querySelector('h3').textContent = 'No saved products yet';
      empty.querySelector('p').textContent = 'Use the heart button on any product to save it here.';
    } else {
      empty.querySelector('h3').textContent = 'No matching products';
      empty.querySelector('p').textContent = 'Try a different search term or clear the category filter.';
    }
  }

  showLoadError() {
    const grid = document.getElementById('products-grid');
    if (grid) grid.innerHTML = '<div class="load-error"><strong>Products could not be loaded.</strong><span>Run the included local server instead of opening index.html directly.</span></div>';
  }
}

window.showToast = function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__shopHubToastTimer);
  window.__shopHubToastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
};

document.addEventListener('DOMContentLoaded', () => { window.shopHubApp = new ShopHubApp(); });
