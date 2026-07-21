"""Small dependency-free checks for the static ShopHub project."""
from html.parser import HTMLParser
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    "index.html", "css/styles.css", "css/themes.css", "data/products.json",
    "js/main.js", "js/products.js", "js/cart.js", "js/modal.js", "js/theme.js"
]
REQUIRED_IDS = {
    "main-content", "featured-products", "products-grid", "search-input",
    "category-chips", "product-modal", "cart-drawer", "cart-items"
}

class IdParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "id" in attributes:
            self.ids.append(attributes["id"])

for relative_path in REQUIRED_FILES:
    assert (ROOT / relative_path).is_file(), f"Missing required file: {relative_path}"

parser = IdParser()
parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))
assert len(parser.ids) == len(set(parser.ids)), "Duplicate HTML IDs found"
assert REQUIRED_IDS.issubset(parser.ids), f"Missing IDs: {REQUIRED_IDS - set(parser.ids)}"

products = json.loads((ROOT / "data/products.json").read_text(encoding="utf-8"))["products"]
assert len(products) >= 12, "Expected at least 12 products"
assert len({product["id"] for product in products}) == len(products), "Duplicate product IDs"
for product in products:
    for key in ("id", "name", "description", "price", "rating", "category", "image"):
        assert product.get(key) not in (None, ""), f"Product {product.get('id')} missing {key}"
    assert product["price"] > 0
    assert 0 <= product["rating"] <= 5

print("ShopHub smoke tests passed.")
