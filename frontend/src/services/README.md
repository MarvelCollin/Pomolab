# Authentication Trigger System

## Overview
The `AuthTrigger` service provides centralized authentication checking for all API operations that modify data (POST, PUT, DELETE). This ensures consistent authentication behavior across the entire application.

## How It Works

### 1. Configuration
The `AuthTrigger` is configured in the main Home component with:
- Current user information
- Login modal trigger function

### 2. API Integration
All API classes use `AuthTrigger.wrapApiCall()` for mutation operations:

```typescript
// Example usage in FriendApi
static async createFriendRequest(data: FriendData): Promise<IFriend | null> {
  return AuthTrigger.wrapApiCall(authOperations.create, async () => {
    // API call implementation
  });
}
```

### 3. Automatic Authentication
- GET requests: No authentication check (allows browsing)
- POST/PUT/DELETE requests: Automatic authentication check
- If user is not logged in: Automatically shows login modal
- If API returns 401: Automatically shows login modal

## Benefits

1. **Centralized Maintenance**: All auth logic in one place
2. **Consistent Behavior**: Same auth flow across all APIs  
3. **Automatic Handling**: No need to manually check auth in components
4. **Error Recovery**: Automatic login prompt on auth errors

## Files Modified

- `frontend/src/services/auth-trigger.ts` - Core service
- `frontend/src/apis/friend-api.ts` - Updated to use AuthTrigger
- `frontend/src/components/common/search-modal.tsx` - Simplified auth logic
- `frontend/src/pages/home.tsx` - AuthTrigger configuration

## TODO

Apply the same pattern to:
- `frontend/src/apis/user-api.ts`
- `frontend/src/apis/task-api.ts`
- `frontend/src/apis/message-api.ts`
- Other API files as needed

## Usage Pattern

For new APIs, wrap mutation operations:

```typescript
// GET operations - no auth check needed
static async getData(): Promise<Data[]> {
  const response = await fetch(url);
  return response.json();
}

// POST/PUT/DELETE operations - wrap with AuthTrigger
static async createData(data: CreateData): Promise<Data | null> {
  return AuthTrigger.wrapApiCall(authOperations.create, async () => {
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to create');
    return response.json();
  });
}
```
