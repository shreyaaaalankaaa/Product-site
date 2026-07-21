# ShopHub

A responsive e-commerce product showcase built with **HTML, CSS, and vanilla JavaScript**. ShopHub demonstrates client-side product rendering, search and category filters, sorting, accessible product details, theme persistence, and a shopping cart saved with `localStorage`.

## Live demo

After enabling GitHub Pages, add the deployed URL here:

`https://shreyaaaalankaaa.github.io/Product-site/`

## Features

- Responsive product grid for desktop, tablet, and mobile
- Product search with debouncing
- Category filters and multiple sorting options
- Featured-product section
- Accessible product-detail modal with keyboard support
- Shopping cart with quantity controls and persistent browser storage
- Light and dark themes with saved user preference
- Empty, loading, error, and toast states
- Indian Rupee price formatting
- GitHub Pages-compatible static deployment

## Built with

- HTML5
- CSS3
- JavaScript
- JSON
- Local Storage API
- Python development server

## Project structure

```text
Product-site/
├── assets/
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
│   └── theme.js
├── index.html
├── README.md
└── server.py
```

## Run locally

Opening `index.html` directly can prevent the browser from loading `products.json`. Run the included local server instead.

```bash
python server.py
```

Then open:

```text
http://localhost:5000
```

A different port can be used when needed:

```bash
python server.py --port 8080
```

## Run the checks

A small dependency-free smoke test verifies the project files, HTML IDs, and product data.

```bash
python tests/smoke_test.py
```

## Deploy with GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/root` folder.
5. Save and wait for the deployment link to appear.

## Accessibility

The interface includes semantic page sections, visible focus states, descriptive button labels, a skip link, keyboard-accessible controls, modal focus management, and reduced-motion support.

## Current limitations

- Checkout is intentionally a demo and does not process payments.
- Product data is loaded from a local JSON file rather than a backend database.
- Product images are loaded from Unsplash and use a local fallback when unavailable.
- Authentication, inventory management, and order processing are outside the current scope.

## Future improvements

- Replace static JSON with a Flask or Node.js API
- Store products and orders in MySQL or MongoDB
- Add authentication and user accounts
- Add automated accessibility and UI tests
- Add product reviews and wishlist functionality

## Image credits

Product photography is loaded from [Unsplash](https://unsplash.com/). A local SVG placeholder is displayed when an image is unavailable.

## Author

**Shreya Lanka**

- GitHub: (https://github.com/shreyaaaalankaaa)
- LinkedIn: www.linkedin.com/in/shreya-lanka-057a0b28a
