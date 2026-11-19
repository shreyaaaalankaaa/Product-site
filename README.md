# ShopHub

A polished, responsive storefront built with **HTML, CSS, and vanilla JavaScript**. ShopHub focuses on practical front-end engineering: data-driven UI rendering, accessible interactions, persistent client-side state, URL-synced filtering, and installable PWA support—without a framework.

## Live demo

**https://shreyaaaalankaaa.github.io/Product-site/**

## Highlights

- Search across product names, categories, descriptions, and features
- Category chips and five sorting modes
- Shareable filter state through URL query parameters
- Persistent shopping cart with quantity controls
- Persistent wishlist with a saved-products view
- Accessible product-detail modal with keyboard focus management
- Responsive layouts for mobile, tablet, and desktop
- Light/dark theme based on system preference and saved choice
- Installable PWA manifest and offline caching for core application files
- Empty, loading, error, and toast feedback states
- Indian Rupee currency formatting

## Engineering decisions

### Data-driven rendering

Products live in `data/products.json` and are rendered through reusable JavaScript templates. This keeps content separate from presentation and makes the catalogue easy to update.

### Persistent state

The cart, wishlist, and theme are stored with `localStorage`. Search, category, sorting, and saved-only filters are synchronized to the URL so a filtered view can be refreshed or shared.

### Accessibility

The interface includes semantic sections, a skip link, visible focus styles, descriptive controls, keyboard-accessible modals, focus restoration, `aria-live` updates, and reduced-motion support.

### Progressive web app support

`manifest.webmanifest` and `service-worker.js` make the core storefront installable and available after initial caching. Remote product photography still depends on network access and falls back to a local SVG placeholder.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- JSON
- Local Storage API
- Service Worker and Web App Manifest
- Python development server

## Project structure

```text
Product-site/
├── assets/
│   ├── favicon.svg
│   ├── icons.svg
│   └── product-placeholder.svg
├── css/
│   ├── styles.css
│   └── themes.css
├── data/
│   └── products.json
├── js/
│   ├── cart.js
│   ├── main.js
│   ├── modal.js
│   ├── products.js
│   ├── theme.js
│   └── wishlist.js
├── tests/
│   └── smoke_test.py
├── index.html
├── manifest.webmanifest
├── service-worker.js
└── server.py
```

## Run locally

The product catalogue is loaded with `fetch`, so use the included server instead of opening `index.html` directly.

```bash
python server.py
```

Then visit `http://localhost:5000`.

## Run the checks

```bash
python tests/smoke_test.py
```

The dependency-free smoke test verifies required files, unique HTML IDs, catalogue integrity, and PWA metadata. GitHub Actions runs it, plus JavaScript syntax and JSON checks, on every push.

## Deploy with GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Choose **Deploy from a branch**.
3. Select `main` and `/root`.
4. Save and wait for the deployment URL.

## Scope and limitations

ShopHub is intentionally a front-end portfolio project. Checkout does not process payments, products are loaded from static JSON, and there is no authentication or server-side inventory management.

A production version would add a backend API, database persistence, secure authentication, inventory control, payment integration, and automated browser/accessibility tests.

## Author

**Shreya Lanka**

- GitHub: [@shreyaaaalankaaa](https://github.com/shreyaaaalankaaa)
- LinkedIn: Add your LinkedIn URL here
