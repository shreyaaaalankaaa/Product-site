class WishlistManager {
  constructor() {
    this.storageKey = 'shophub-wishlist-v1';
    this.ids = new Set(this.load());
    this.countElement = document.getElementById('wishlist-count');
    this.renderCount();
  }

  load() {
    try {
      const value = JSON.parse(localStorage.getItem(this.storageKey));
      return Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : [];
    } catch {
      return [];
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify([...this.ids]));
  }

  has(productId) {
    return this.ids.has(Number(productId));
  }

  toggle(productId, productName = 'Product') {
    const id = Number(productId);
    if (this.ids.has(id)) {
      this.ids.delete(id);
      window.showToast?.(`${productName} removed from saved products.`);
    } else {
      this.ids.add(id);
      window.showToast?.(`${productName} saved for later.`);
    }
    this.save();
    this.renderCount();
    document.dispatchEvent(new CustomEvent('wishlist:changed', { detail: { id } }));
    return this.ids.has(id);
  }

  renderCount() {
    if (this.countElement) this.countElement.textContent = String(this.ids.size);
  }
}

window.wishlistManager = new WishlistManager();
