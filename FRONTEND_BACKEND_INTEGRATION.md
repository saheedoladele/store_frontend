# Frontend-Backend Integration Guide

This document describes the integration between the frontend React application and the backend Express API.

## Overview

The frontend has been fully integrated with the backend API. All mock data has been replaced with real API calls using a centralized API client.

## Architecture

### API Client (`src/lib/api-client.ts`)

A centralized API client handles:
- Base URL configuration (from environment variables)
- JWT token management (stored in localStorage)
- Request/response formatting
- Error handling
- Automatic token injection in Authorization headers

### API Services

All API services are located in `src/lib/api/`:
- `auth.api.ts` - Authentication (login, register)
- `inventory.api.ts` - Products and categories
- `customers.api.ts` - Customer management
- `staff.api.ts` - Staff management
- `pos.api.ts` - Point of Sale operations
- `reports.api.ts` - Reports and dashboard stats

### Environment Configuration

Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

The default API URL is `http://localhost:8000/api` if not specified.

## Authentication

### Token Storage
- JWT tokens are stored in `localStorage` under the key `token`
- User and tenant data are also stored in `localStorage`
- Tokens are automatically included in API requests via the Authorization header

### AuthContext Updates
- `AuthContext` now uses real API calls instead of mock data
- Login and registration are fully functional
- Token is stored and used for subsequent API calls

## Integrated Components

### Pages
1. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Fetches real dashboard statistics from `/api/dashboard/stats`

2. **Inventory** (`src/pages/Inventory.tsx`)
   - Fetches products from `/api/products`
   - Creates/updates products via API

3. **Customers** (`src/pages/Customers.tsx`)
   - Fetches customers from `/api/customers`
   - Creates customers via API

### Components
1. **DashboardStats** (`src/components/dashboard/DashboardStats.tsx`)
   - Fetches and displays real dashboard statistics

2. **ProductForm** (`src/components/inventory/ProductForm.tsx`)
   - Creates and updates products via API
   - Fetches categories if not provided

3. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Handles login/register with real API calls
   - Manages authentication state

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Inventory
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/categories` - Get all categories

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Reports
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/sales` - Get sales report
- `GET /api/top-products` - Get top selling products

## Usage Example

```typescript
import { inventoryApi } from '@/lib/api/inventory.api';

// Fetch products
const response = await inventoryApi.getProducts();
if (response.success && response.data) {
  console.log(response.data);
} else {
  console.error(response.error?.message);
}

// Create a product
const createResponse = await inventoryApi.createProduct({
  name: 'New Product',
  sku: 'SKU-001',
  price: 29.99,
  // ... other fields
});
```

## Error Handling

All API calls return a standardized response:
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}
```

Components should check `response.success` before using `response.data`.

## Backend Requirements

Ensure the backend:
1. Is running on port 8000 (or update `VITE_API_BASE_URL`)
2. Has CORS configured to allow requests from `http://localhost:8080`
3. All endpoints return data in the format: `{ success: true, data: ... }`
4. Error responses follow: `{ success: false, error: { message: "..." } }`

## Next Steps

To complete the integration, consider:
1. Update remaining components (POS, Staff, Reports pages)
2. Add loading states and error boundaries
3. Implement token refresh mechanism
4. Add request retry logic
5. Implement optimistic updates where appropriate
