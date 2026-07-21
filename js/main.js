class ShopHubApp {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.sortMode = 'featured';
    this.toastTimer = null;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error('Invalid product data.');
      this.products = data.products;
      this.filteredProducts = [...this.products];
      window.cartManager.setProducts(this.products);
      this.renderCategoryChips();
      this.bindEvents();
      this.applyFilters();
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

    document.getElementById('category-chips')?.addEventListener('click', event => {
      const button = event.target.closest('button[data-category]');
      if (!button) return;
      this.selectedCategory = button.dataset.category;
      this.syncActiveChip();
      this.applyFilters();
    });

    document.addEventListener('click', event => {
      const actionButton = event.target.closest('button[data-action][data-product-id]');
      if (actionButton) {
        const product = this.products.find(item => item.id === Number(actionButton.dataset.productId));
        if (!product) return;
        if (actionButton.dataset.action === 'view') window.productModal.open(product);
        if (actionButton.dataset.action === 'add') window.cartManager.add(product.id);
      }

      const footerFilter = event.target.closest('.footer-filter[data-category]');
      if (footerFilter) {
        this.selectedCategory = footerFilter.dataset.category;
        this.syncActiveChip();
        this.applyFilters();
        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  renderCategoryChips() {
    const categories = ['All', ...new Set(this.products.map(product => product.category))];
    const container = document.getElementById('category-chips');
    container.innerHTML = categories.map(category => `
      <button class="category-chip${category === 'All' ? ' active' : ''}" type="button" data-category="${window.productRenderer.escapeHtml(category)}" aria-pressed="${category === 'All'}">
        ${window.productRenderer.escapeHtml(category)}
      </button>`).join('');
  }

  syncActiveChip() {
    document.querySelectorAll('.category-chip').forEach(button => {
      const active = button.dataset.category === this.selectedCategory;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.sortMode = 'featured';
    const search = document.getElementById('search-input');
    if (search) search.value = '';
    const sort = document.getElementById('sort-select');
    if (sort) sort.value = 'featured';
    this.syncActiveChip();
    this.applyFilters();
    search?.focus();
  }

  applyFilters() {
    let products = this.products.filter(product => {
      const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      const matchesSearch = !this.searchQuery || haystack.includes(this.searchQuery);
      const matchesCategory = this.selectedCategory === 'All' || product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
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
    count.textContent = `${total} ${total === 1 ? 'product' : 'products'} shown`;
    grid.innerHTML = this.filteredProducts.map(product => window.productRenderer.createProductCard(product)).join('');
    grid.hidden = total === 0;
    empty.hidden = total !== 0;
  }

  showLoadError() {
    const grid = document.getElementById('products-grid');
    if (grid) grid.innerHTML = '<p>Products could not be loaded. Start the included local server instead of opening index.html directly.</p>';
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

document.addEventListener('DOMContentLoaded', () => {
  window.shopHubApp = new ShopHubApp();
});
