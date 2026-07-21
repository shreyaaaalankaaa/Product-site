class CartManager {
  constructor() {
    this.storageKey = 'shophub-cart-v2';
    this.items = this.load();
    this.products = [];
    this.drawer = document.getElementById('cart-drawer');
    this.overlay = document.getElementById('drawer-overlay');
    this.itemsContainer = document.getElementById('cart-items');
    this.emptyState = document.getElementById('cart-empty');
    this.summary = document.getElementById('cart-summary');
    this.countElement = document.getElementById('cart-count');
    this.subtotalElement = document.getElementById('cart-subtotal');
    this.bindEvents();
    this.render();
  }

  setProducts(products) {
    this.products = products;
    this.items = this.items.filter(item => products.some(product => product.id === item.id));
    this.save();
    this.render();
  }

  bindEvents() {
    document.getElementById('open-cart')?.addEventListener('click', () => this.open());
    document.getElementById('close-cart')?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());
    document.getElementById('clear-cart')?.addEventListener('click', () => this.clear());
    document.getElementById('demo-checkout')?.addEventListener('click', () => {
      window.showToast?.('Checkout is intentionally disabled in this portfolio demo.');
    });

    this.itemsContainer?.addEventListener('click', event => {
      const button = event.target.closest('button[data-cart-action]');
      if (!button) return;
      const id = Number(button.dataset.productId);
      const action = button.dataset.cartAction;
      if (action === 'increase') this.changeQuantity(id, 1);
      if (action === 'decrease') this.changeQuantity(id, -1);
      if (action === 'remove') this.remove(id);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.drawer?.classList.contains('open')) this.close();
    });
  }

  load() {
    try {
      const stored = JSON.parse(localStorage.getItem(this.storageKey));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  add(productId, quantity = 1) {
    const product = this.products.find(item => item.id === Number(productId));
    if (!product) return;
    const existing = this.items.find(item => item.id === product.id);
    if (existing) existing.quantity += quantity;
    else this.items.push({ id: product.id, quantity });
    this.save();
    this.render();
    window.showToast?.(`${product.name} added to cart.`);
  }

  changeQuantity(productId, delta) {
    const item = this.items.find(entry => entry.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) this.items = this.items.filter(entry => entry.id !== productId);
    this.save();
    this.render();
  }

  remove(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
    this.render();
  }

  clear() {
    this.items = [];
    this.save();
    this.render();
    window.showToast?.('Cart cleared.');
  }

  getDetailedItems() {
    return this.items.map(item => {
      const product = this.products.find(entry => entry.id === item.id);
      return product ? { ...item, product } : null;
    }).filter(Boolean);
  }

  render() {
    const detailed = this.getDetailedItems();
    const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    if (this.countElement) this.countElement.textContent = itemCount;

    if (!this.itemsContainer || !this.emptyState || !this.summary) return;
    this.emptyState.hidden = detailed.length > 0;
    this.summary.hidden = detailed.length === 0;
    this.itemsContainer.hidden = detailed.length === 0;

    this.itemsContainer.innerHTML = detailed.map(({ product, quantity }) => `
      <article class="cart-item">
        <img src="${product.image || 'assets/product-placeholder.svg'}" alt="" onerror="this.onerror=null;this.src='assets/product-placeholder.svg'">
        <div>
          <h3>${window.productRenderer.escapeHtml(product.name)}</h3>
          <div class="cart-item-price">${window.productRenderer.formatCurrency(product.price)}</div>
          <div class="quantity-control" aria-label="Quantity for ${window.productRenderer.escapeHtml(product.name)}">
            <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Decrease quantity">−</button>
            <span>${quantity}</span>
            <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}" aria-label="Remove ${window.productRenderer.escapeHtml(product.name)}">
          <svg aria-hidden="true"><use href="assets/icons.svg#trash"></use></svg>
        </button>
      </article>`).join('');

    const subtotal = detailed.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (this.subtotalElement) this.subtotalElement.textContent = window.productRenderer.formatCurrency(subtotal);
  }

  open() {
    if (!this.drawer || !this.overlay) return;
    this.overlay.hidden = false;
    this.drawer.classList.add('open');
    this.drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    document.getElementById('close-cart')?.focus();
  }

  close() {
    if (!this.drawer || !this.overlay) return;
    this.drawer.classList.remove('open');
    this.drawer.setAttribute('aria-hidden', 'true');
    this.overlay.hidden = true;
    document.body.classList.remove('no-scroll');
  }
}

window.cartManager = new CartManager();
