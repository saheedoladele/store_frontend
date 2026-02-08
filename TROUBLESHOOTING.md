# Troubleshooting: Frontend Not Calling Backend

## Quick Checks

1. **Backend Server Running?**
   - Check if backend is running on port 8000
   - Visit `http://localhost:8000/health` in browser - should return `{"status":"ok",...}`

2. **API Base URL**
   - Default: `http://localhost:8000/api`
   - Check browser console for: `[API] Base URL: http://localhost:8000/api`
   - Create `.env` file in root with: `VITE_API_BASE_URL=http://localhost:8000/api`

3. **CORS Configuration**
   - Backend should allow `http://localhost:8080`
   - Check backend `.env` has: `CORS_ORIGIN=http://localhost:8080`

4. **Browser Console**
   - Open DevTools (F12) → Console tab
   - Look for `[API]` prefixed logs
   - Check for network errors in Network tab

## Debugging Steps

### 1. Check API Client Initialization
Open browser console and look for:
```
[API] Base URL: http://localhost:8000/api
[API] Client initialized with base URL: http://localhost:8000/api
```

### 2. Check API Calls
When you try to login/register, you should see:
```
[API] POST http://localhost:8000/api/auth/login {...}
[API] Response status: 200 OK
[Auth] Login response: {...}
```

### 3. Common Issues

**Issue: Network Error**
- Backend not running
- Wrong port (check backend is on 8000)
- Firewall blocking connection

**Issue: CORS Error**
- Backend CORS not configured for frontend origin
- Check backend `.env` has correct `CORS_ORIGIN`

**Issue: 404 Not Found**
- Check backend routes are correct
- Auth routes should be at `/api/auth/login` and `/api/auth/register`

**Issue: 500 Server Error**
- Check backend logs
- Database connection issues
- Missing environment variables

### 4. Test Backend Connection

Open browser console and run:
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Should return: `{status: "ok", timestamp: "..."}`

### 5. Test API Endpoint

```javascript
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@test.com', password: 'test123'})
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## Environment Variables

### Frontend (`.env` in root)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (`.env` in backend folder)
```env
PORT=8000
CORS_ORIGIN=http://localhost:8080
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=store_management
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

## Network Tab Inspection

1. Open DevTools → Network tab
2. Try to login/register
3. Look for request to `http://localhost:8000/api/auth/login` or `/api/auth/register`
4. Check:
   - Request URL (should be correct)
   - Request Method (POST)
   - Request Headers (Content-Type: application/json)
   - Request Payload (should have email/password)
   - Response Status (200 = success, 4xx/5xx = error)
   - Response Body (check error messages)
