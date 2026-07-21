class ProductModal {
  constructor() {
    this.overlay = document.getElementById('product-modal');
    this.dialog = this.overlay?.querySelector('.product-modal');
    this.currentProduct = null;
    this.previousFocus = null;
    this.bindEvents();
  }

  bindEvents() {
    this.overlay?.addEventListener('click', event => {
      if (event.target === this.overlay) this.close();
    });
    this.overlay?.querySelector('.modal-close')?.addEventListener('click', () => this.close());
    document.getElementById('modal-add-to-cart')?.addEventListener('click', () => {
      if (!this.currentProduct) return;
      window.cartManager.add(this.currentProduct.id);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.overlay && !this.overlay.hidden) this.close();
      if (event.key === 'Tab' && this.overlay && !this.overlay.hidden) this.trapFocus(event);
    });
  }

  open(product) {
    if (!this.overlay || !product) return;
    this.currentProduct = product;
    this.previousFocus = document.activeElement;
    document.getElementById('modal-image').src = product.image || 'assets/product-placeholder.svg';
    document.getElementById('modal-image').alt = product.name;
    document.getElementById('modal-category').textContent = product.category;
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-rating').innerHTML = window.productRenderer.ratingMarkup(product.rating);
    document.getElementById('modal-price').textContent = window.productRenderer.formatCurrency(product.price);
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('modal-features').innerHTML = window.productRenderer.featuresMarkup(product.features);
    this.overlay.hidden = false;
    document.body.classList.add('no-scroll');
    this.overlay.querySelector('.modal-close')?.focus();
  }

  close() {
    if (!this.overlay) return;
    this.overlay.hidden = true;
    document.body.classList.remove('no-scroll');
    this.currentProduct = null;
    this.previousFocus?.focus?.();
  }

  trapFocus(event) {
    const focusable = [...this.dialog.querySelectorAll('button, a, input, select, [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.disabled && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

window.productModal = new ProductModal();
