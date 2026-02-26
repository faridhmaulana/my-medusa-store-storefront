# Storefront - Supabase Auth Integration Guide

Quick guide for integrating the Medusa Supabase Auth into your Next.js storefront.

## Overview

Your Medusa backend now handles authentication via Supabase. The storefront only needs to call Medusa API endpoints - no direct Supabase integration required!

## Backend Endpoints

- **Register**: `POST http://localhost:9000/store/auth/register`
- **Login**: `POST http://localhost:9000/store/auth/login`

## Implementation Examples

### 1. Basic Fetch API

```typescript
// lib/auth.ts
const BACKEND_URL = 'http://localhost:9000'

export interface AuthResponse {
  customer: {
    id: string
    email: string
    first_name: string
    last_name: string
    phone: string
    has_account: boolean
    created_at: string
  }
  token: string
}

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND_URL}/store/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Registration failed')
  }

  return await response.json()
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND_URL}/store/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Login failed')
  }

  return await response.json()
}
```

### 2. Next.js Server Actions (Recommended)

```typescript
// app/actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export async function registerAction(formData: FormData) {
  const response = await fetch(`${BACKEND_URL}/store/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return { error: error.message || 'Registration failed' }
  }

  const data = await response.json()

  // Store token in HTTP-only cookie
  cookies().set('medusa_auth_token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  redirect('/account')
}

export async function loginAction(formData: FormData) {
  const response = await fetch(`${BACKEND_URL}/store/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return { error: error.message || 'Login failed' }
  }

  const data = await response.json()

  cookies().set('medusa_auth_token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/account')
}

export async function logoutAction() {
  cookies().delete('medusa_auth_token')
  redirect('/')
}

// Helper to get token for authenticated requests
export async function getAuthToken() {
  const cookieStore = cookies()
  return cookieStore.get('medusa_auth_token')?.value
}
```

### 3. React Components

#### Login Form

```tsx
// components/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)

      // Store token
      localStorage.setItem('medusa_auth_token', data.token)

      // Redirect to account
      router.push('/account')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

#### Register Form

```tsx
// components/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/auth'

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )

      // Store token
      localStorage.setItem('medusa_auth_token', data.token)

      // Redirect to account
      router.push('/account')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium">
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password (min 8 characters)
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  )
}
```

### 4. Making Authenticated Requests

```typescript
// lib/api.ts
const BACKEND_URL = 'http://localhost:9000'

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('medusa_auth_token')

  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('medusa_auth_token')
    window.location.href = '/login'
    throw new Error('Authentication required')
  }

  return response
}

// Example: Get customer coins
export async function getCustomerCoins() {
  const response = await fetchWithAuth(`${BACKEND_URL}/store/customers/me/points`)
  return await response.json()
}

// Example: Redeem coins
export async function redeemCoins(cartId: string, variantIds?: string[]) {
  const response = await fetchWithAuth(`${BACKEND_URL}/store/customers/me/points/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart_id: cartId, variant_ids: variantIds }),
  })
  return await response.json()
}
```

### 5. Auth Context (React)

```tsx
// context/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  customer: Customer | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load token from localStorage
    const savedToken = localStorage.getItem('medusa_auth_token')
    if (savedToken) {
      setToken(savedToken)
      // TODO: Fetch customer data with token
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:9000/store/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) throw new Error('Login failed')

    const data = await response.json()
    setToken(data.token)
    setCustomer(data.customer)
    localStorage.setItem('medusa_auth_token', data.token)
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const response = await fetch('http://localhost:9000/store/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    })

    if (!response.ok) throw new Error('Registration failed')

    const data = await response.json()
    setToken(data.token)
    setCustomer(data.customer)
    localStorage.setItem('medusa_auth_token', data.token)
  }

  const logout = () => {
    setToken(null)
    setCustomer(null)
    localStorage.removeItem('medusa_auth_token')
  }

  return (
    <AuthContext.Provider value={{ customer, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

## Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

## Security Best Practices

### Development
- ✅ Use localStorage for quick prototyping
- ✅ Test with different email/password combinations
- ✅ Handle error states properly

### Production
- ⚠️ Use HTTP-only cookies (not localStorage)
- ⚠️ Enable HTTPS
- ⚠️ Implement CSRF protection
- ⚠️ Add rate limiting
- ⚠️ Implement token refresh
- ⚠️ Clear sensitive data on logout

## Integration Checklist

- [ ] Install dependencies (none needed - just fetch API!)
- [ ] Create auth helper functions (`lib/auth.ts`)
- [ ] Build login form component
- [ ] Build register form component
- [ ] Implement token storage (localStorage or cookies)
- [ ] Add authenticated API calls
- [ ] Handle token expiration
- [ ] Implement logout functionality
- [ ] Add loading and error states
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test authenticated endpoints

## Testing

```bash
# From backend directory
./test-supabase-auth.sh

# Test in browser
1. Go to your storefront (http://localhost:4001)
2. Navigate to register page
3. Create an account
4. Verify in Supabase dashboard
5. Logout and login again
6. Test coin redemption with auth
```

## Next Steps

1. Build UI for login/register
2. Integrate with existing cart/checkout
3. Add protected routes for account pages
4. Implement coin redemption UI with auth
5. Test end-to-end user flow

## Support

See backend documentation:
- `../my-medusa-store/docs/supabase-auth.md`
- `../my-medusa-store/SUPABASE_AUTH_SETUP.md`
