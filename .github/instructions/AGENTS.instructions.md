---
description: This file provides development guidelines for the WordPress Gutenberg block plugin "WP Feed Display". It covers project overview, build commands, code style guidelines for JavaScript/JSX and PHP, architecture, error handling, and common tasks for contributing to the project.
---

# AGENTS.md - WP Feed Display Development Guide

## Project Overview
- WordPress Gutenberg block plugin for displaying posts in a lazy-loaded feed
- Uses @wordpress/scripts for build tooling
- Mixed codebase: JavaScript/JSX (frontend) + PHP (backend/REST API)
- No test framework currently configured

## Build & Development Commands

### Install Dependencies
```bash
npm install --registry https://registry.npmjs.org/
```

### Development
```bash
npm run start    # Watch mode with hot reload
```

### Production Build
```bash
npm run build    # Production build
./build.sh       # Build + create zip for WordPress
```

### Linting
```bash
npm run lint:js  # Lint JavaScript/JSX files
npm run lint:css # Lint CSS files
```

### Testing
- **No test framework configured** - Tests should be added if needed
- For single test runs, consider adding Jest/Jest-Preview with:
  ```bash
  npm run test          # Run all tests
  npm run test -- --watch # Watch mode
  ```

## Code Style Guidelines

### JavaScript/JSX (WordPress Block Editor)

**Formatting**
- Use tabs for indentation (WordPress standard)
- Max line length: 80 characters (soft limit)
- Use semicolons
- Use single quotes for strings, except when string contains single quote
- Add space after keywords: `if ( condition )` not `if(condition)`
- No space before function parentheses: `functionName()` not `functionName ()`

**Imports**
- Group imports in this order:
  1. External dependencies (@wordpress/*)
  2. Internal modules (relative paths)
  3. CSS imports
- Use named exports for components
- Example:
  ```javascript
  import { __ } from '@wordpress/i18n';
  import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
  import { PanelBody, SelectControl } from '@wordpress/components';
  import metadata from './block.json';
  import Edit from './edit';
  import save from './save';
  import './style.css';
  ```

**Naming Conventions**
- Components: PascalCase (e.g., `Edit`, `FeedDisplayBlock`)
- Functions: camelCase (e.g., `renderPostCard`)
- Constants: UPPER_SNAKE_CASE
- CSS classes: BEM-style with block prefix `wp-feed-display__element--modifier`

**React Patterns**
- Use functional components with arrow functions or `function` keyword
- Destructure props: `function Edit( { attributes, setAttributes } )`
- Use `className` not `class`
- Use `htmlFor` not `for` on labels
- Prefer optional chaining: `post?._embedded?.['wp:featuredmedia']`

**WordPress-Specific**
- Always use `__()` for translatable strings: `__( 'Label', 'wp-feed-display' )`
- Use WordPress data store: `useSelect` from `@wordpress/data`
- Use core store for entity records: `store as coreStore` from `@wordpress/core-data`

### PHP (WordPress Backend)

**Formatting**
- Tabs for indentation
- Opening brace on new line for classes/functions
- Spaces around operators: `$var = 'value'` not `$var='value'`
- No closing PHP tag `?>` at end of files

**Security**
- Always check `ABSPATH` defined before executing
- Use `$wpdb->prepare()` for database queries with placeholders
- Sanitize all input: `sanitize_text_field()`, `absint()`, `esc_url()`, etc.
- Escape all output: `esc_html()`, `esc_attr()`, `esc_url()`, etc.
- Use nonces for AJAX requests

**WordPress Standards**
- Prefix classes/functions: `WP_Feed_Display_*`
- Use action/filter hooks: `add_action()`, `add_filter()`
- Register REST routes with proper permission callbacks
- Use WordPress coding standards (see https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)

### CSS

**Structure**
- Use CSS custom properties for theming: `--feed-bg`, `--feed-text`
- Follow BEM naming: `.wp-feed-display__element--modifier`
- Use CSS Grid for layouts with `auto-fill` for responsiveness

**Editor vs Frontend**
- `style.css` - Frontend styles (loaded on published posts)
- `editor.css` - Editor only styles (loaded in block editor)

## Architecture

```
wp-feed-display/
├── wp-feed-display.php         # Plugin bootstrap
├── includes/
│   └── class-feed-rest-api.php # REST API endpoint
├── src/feed-display/
│   ├── block.json              # Block metadata
│   ├── index.js                # Block registration
│   ├── edit.js                 # Block editor component
│   ├── save.js                 # Server-side render
│   ├── render.php              # Frontend PHP render
│   ├── style.css               # Frontend styles
│   └── editor.css              # Editor styles
└── assets/js/
    └── lazy-load.js            # Frontend JS (if any)
```

## Error Handling

### JavaScript
- Use try/catch for async operations
- Check for null/undefined with optional chaining
- Use conditional rendering for missing data

### PHP
- Check for `is_wp_error()` on WP API returns
- Use `wp_send_json_success()` / `wp_send_json_error()` for AJAX
- Return proper REST responses with `rest_ensure_response()`

## Common Tasks

### Adding New Block Attributes
1. Add to `attributes` in `block.json`
2. Add default value to `DEFAULT_ATTRS` in `edit.js`
3. Add destructuring in component
4. Add UI control in InspectorControls

### Modifying REST API
- Edit `includes/class-feed-rest-api.php`
- Add sanitized args in `get_query_args()`
- Modify `query_posts()` for data changes

### Adding New View Mode
1. Add option to SelectControl in `edit.js`
2. Add condition checks (isGrid, isMasonry, etc.)
3. Add CSS in `style.css` and `editor.css`
4. Update `render.php` for server-side output