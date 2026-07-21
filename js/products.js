class ProductRenderer {
  formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = String(value ?? '');
    return element.innerHTML;
  }

  ratingMarkup(rating) {
    const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return `<span class="rating-stars" aria-hidden="true">${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}</span><span>${Number(rating).toFixed(1)}</span>`;
  }

  createProductCard(product) {
    const name = this.escapeHtml(product.name);
    const description = this.escapeHtml(product.description);
    const category = this.escapeHtml(product.category);
    const badge = product.badge ? `<span class="product-badge">${this.escapeHtml(product.badge)}</span>` : '';
    const image = this.escapeHtml(product.image || 'assets/product-placeholder.svg');
    const saved = window.wishlistManager?.has(product.id) ?? false;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-media">
          ${badge}
          <button class="wishlist-button${saved ? ' active' : ''}" type="button" data-action="wishlist" data-product-id="${product.id}" aria-label="${saved ? 'Remove' : 'Save'} ${name} ${saved ? 'from' : 'to'} wishlist" aria-pressed="${saved}">
            <svg aria-hidden="true"><use href="assets/icons.svg#heart"></use></svg>
          </button>
          <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/product-placeholder.svg'">
          <button class="quick-view" type="button" data-action="view" data-product-id="${product.id}" aria-label="View details for ${name}">Quick view</button>
        </div>
        <div class="product-body">
          <span class="product-category">${category}</span>
          <h3 class="product-title">${name}</h3>
          <p class="product-description">${description}</p>
          <div class="rating" aria-label="Rated ${product.rating} out of 5">${this.ratingMarkup(product.rating)}</div>
          <div class="product-footer">
            <span class="product-price">${this.formatCurrency(product.price)}</span>
            <button class="add-cart" type="button" data-action="add" data-product-id="${product.id}" aria-label="Add ${name} to cart">
              <svg aria-hidden="true"><use href="assets/icons.svg#shopping-cart"></use></svg>
            </button>
          </div>
        </div>
      </article>`;
  }

  featuresMarkup(features = []) {
    if (!features.length) return '';
    return `<h3>Key features</h3><ul>${features.map(feature => `<li>${this.escapeHtml(feature)}</li>`).join('')}</ul>`;
  }
}

window.productRenderer = new ProductRenderer();
