# ShopHub E-commerce Product Showcase

## Overview

ShopHub is a modern, responsive e-commerce product showcase website built entirely with vanilla technologies (HTML5, CSS3, and JavaScript). It provides a comprehensive product browsing experience with advanced search capabilities, category filtering, and detailed product modals. The application emphasizes accessibility, performance, and user experience with features like keyboard navigation, ARIA compliance, theme switching, and mobile-first responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure Vanilla Stack**: Built without frameworks using HTML5, CSS3, and ES6+ JavaScript for maximum performance and minimal dependencies
- **Modular JavaScript Design**: Component-based architecture with separate modules for main app controller, product rendering, modal management, and theme handling
- **CSS Custom Properties**: Theme system using CSS variables for consistent styling and easy theme switching
- **Mobile-First Responsive Design**: Progressive enhancement approach starting from mobile layouts

### Data Management
- **Static JSON Data Store**: Products stored in `data/products.json` file with structured schema including categories, ratings, features, and metadata
- **Client-Side Data Handling**: All data processing, filtering, and search operations performed in the browser
- **In-Memory State Management**: Application state managed through JavaScript classes with reactive updates

### User Interface Components
- **Product Grid System**: Responsive card-based layout with featured product highlighting
- **Modal System**: Accessible overlay modals for detailed product views with focus management
- **Search and Filter System**: Real-time search with category filtering and debounced input handling
- **Theme System**: Light/dark mode toggle with system preference detection and localStorage persistence

### Accessibility Implementation
- **Full Keyboard Navigation**: Complete keyboard support with proper focus management and skip links
- **ARIA Compliance**: Comprehensive ARIA labels, live regions, and semantic HTML structure
- **Screen Reader Support**: Proper content hierarchy and descriptive elements for assistive technologies
- **Motion Sensitivity**: Respects user preferences for reduced motion

### Performance Optimizations
- **Resource Preloading**: Critical CSS and data files preloaded for faster initial render
- **Efficient DOM Manipulation**: Minimal DOM updates with batched operations
- **Image Optimization**: SVG placeholders for missing images and proper image handling
- **Caching Strategy**: HTTP cache headers for static assets

## External Dependencies

### Development Server
- **Python HTTP Server**: Custom HTTP server (`server.py`) with CORS support and proper MIME type handling for local development
- **Static File Serving**: Serves HTML, CSS, JavaScript, JSON, and SVG files with appropriate cache headers

### Browser APIs
- **Fetch API**: For loading product data from JSON files
- **LocalStorage API**: For persisting user theme preferences
- **MediaQuery API**: For detecting system theme preferences and responsive breakpoints
- **Intersection Observer API**: For potential future enhancements like lazy loading

### Asset Dependencies
- **SVG Icon System**: Custom SVG sprite system for scalable icons (cart, theme toggle, ratings)
- **Web Fonts**: System font stack using native fonts for optimal performance
- **JSON Data**: Structured product data with comprehensive product information including features, categories, and metadata