# Product Admin Dashboard

A responsive product management dashboard built with **Next.js, React, Tailwind CSS, and Axios**, using the [DummyJSON API](https://dummyjson.com) for authentication and product data.

## Live Demo

**Live:** https://product-admin-dashboard-one.vercel.app/products

## Repository

**GitHub:** https://github.com/shraddhayy/product-admin-dashboard

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* DummyJSON API

## Features Completed

### Authentication

* Login using DummyJSON authentication.
* Supplied credentials:

  * Username: `emilys`
  * Password: `emilyspass`
* Error handling for invalid credentials.
* Prevents repeated login requests while authentication is in progress.
* Protected product routes.
* Logout clears the stored authentication state.

### Product Management

* Responsive product management dashboard.
* Desktop table view.
* Mobile card view.
* Product image, title, category, price, rating, and stock.
* Product details page at `/products/[id]`.
* Product image gallery.
* Product description, price, rating, stock, and reviews.
* Not-found handling for invalid product IDs.

### Pagination

* API pagination using `limit` and `skip`.
* Page numbers.
* Previous / Next buttons.
* Page size options: `10`, `20`, `50`.
* Result summary such as:

  * `Showing 1–10 of 194 products`
  * `Showing 21–40 of 194 products`

### Search

* Uses `/products/search?q=`.
* Search input is debounced before making an API request.
* Search returns to page 1.
* Previous requests are cancelled when a newer request starts, preventing stale results from replacing newer results.

### Filter and Sort

* Category list loaded from `/products/categories`.
* Sorting by:

  * Price
  * Rating
  * Title
* Delay control for testing API loading behavior.

### Add / Edit / Delete

* Add product form.
* Edit product form.
* Client-side validation.
* Delete confirmation popup.
* Loading and disabled states while saving.

## URL State

The product list keeps its important state in the URL so the current view can be refreshed or shared.

Example:

```text
/products?page=2&pageSize=20&search=phone&sort=price-desc
```

Invalid values such as `page=abc` are handled safely, and an out-of-range page is corrected to a valid page.

## API Architecture

All API requests use a shared Axios instance in:

```text
src/lib/api.ts
```

The shared Axios setup:

* Adds the login token to requests.
* Handles API errors centrally.
* Supports request cancellation.

Product API operations are kept separately in:

```text
src/services/productService.ts
```

The UI components do not contain direct Axios calls.

## Search and Category Decision

DummyJSON does not support applying product search and category filtering together in the same request.

The application therefore treats them as mutually exclusive:

* Searching clears the category filter.
* Selecting a category clears the search.

This keeps API behavior predictable and avoids sending an unsupported combination of filters.

## DummyJSON CRUD Limitation

DummyJSON's create, update, and delete endpoints simulate mutations and do not permanently persist those changes on the server.

The application still calls the real API endpoints and then maintains the visible changes locally using browser storage.

The local layer tracks:

* Created products
* Updated products
* Deleted product IDs

This allows the UI to continue showing the user's changes after navigation or refresh during the session.

## Project Structure

```text
src/
├── app/
│   ├── login/
│   │   └── page.tsx
│   └── products/
│       ├── page.tsx
│       ├── ProductsClient.tsx
│       ├── new/
│       │   └── page.tsx
│       └── [id]/
│           ├── page.tsx
│           └── edit/
│               └── page.tsx
│
├── components/
│   ├── ProductForm.tsx
│   ├── ProductLogo.tsx
│   └── ProductNavbar.tsx
│
├── lib/
│   ├── api.ts
│   └── productLocalStore.ts
│
├── services/
│   ├── authService.ts
│   └── productService.ts
│
├── types/
│   └── product.ts
│
└── proxy.ts
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/shraddhayy/product-admin-dashboard.git
cd product-admin-dashboard
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Login with:

```text
Username: emilys
Password: emilyspass
```

## Production Build

To verify the production build:

```bash
npm run build
```

## Problem Faced and Solution

### Problem: stale search results

When a delayed API request was still running and the user entered a newer search, an older response could potentially arrive later and replace the newer result.

### Solution

Each product request uses an `AbortController`. When the product query changes, the previous request is cancelled before the new request completes.

This ensures that older search results cannot overwrite newer results.

## AI Usage

AI tools were used as a development assistant for:

* Structuring React and Next.js components.
* Debugging build and routing issues.
* Improving API/service organization.
* Reviewing edge cases such as pagination, stale requests, and URL state.
* Refactoring UI and validation logic.

All application behavior and implementation decisions were reviewed and understood during development, including Axios interceptors, URL state management, request cancellation, authentication flow, and the DummyJSON CRUD limitation.
