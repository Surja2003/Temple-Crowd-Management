'use client'

import React from 'react'
import { apiFetch } from '@/lib/http'
import { authPath } from '@/lib/paths'
import { User, AuthState, LoginCredentials, RegisterData, Permission, UserRole, DEFAULT_ROLE_PERMISSIONS } from '@/types/auth'

// Create the auth context
const AuthContext = React.createContext<{
  auth: AuthState
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  refreshToken: () => Promise<void>
} | null>(null)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  const getBypassEnabled = React.useCallback(() => {
    // Opt-in dev bypass: set NEXT_PUBLIC_AUTH_BYPASS=1
    return process.env.NEXT_PUBLIC_AUTH_BYPASS === '1'
  }, [])

  const makeDummyUser = React.useCallback((email?: string, name?: string, role: UserRole = 'devotee'): User => {
    const perms = DEFAULT_ROLE_PERMISSIONS.find(r => r.role === role)?.permissions || []
    const now = new Date().toISOString()
    return {
      id: 'dev-user',
      email: email || 'dev@example.com',
      name: name || 'Developer',
      role,
      permissions: perms,
      preferences: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        notifications: { email: true, sms: false, whatsapp: false, push: false },
        privacy: { profileVisible: false, allowMarketing: false, dataSharing: false },
        accessibility: { fontSize: 'medium', screenReader: false, keyboardNavigation: true },
      },
      profile: {},
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    }
  }, [])

  // Initialize auth state
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (getBypassEnabled()) {
          // Dev bypass: instantly authenticate with a dummy user
          const dummy = makeDummyUser()
          setAuth({ user: dummy, isAuthenticated: true, isLoading: false, error: null })
          if (typeof window !== 'undefined') {
            console.warn('[auth] Bypass enabled: using dummy user')
          }
          return
        }
        const token = localStorage.getItem('auth_token')
        if (token) {
          // Validate token and get user info
          const response = await apiFetch(authPath('/me'), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          
          if (response.ok) {
            const user = await response.json()
            setAuth({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            setAuth({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        } else {
          setAuth({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
        })
      }
    }

    initializeAuth()
  }, [getBypassEnabled, makeDummyUser])

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Demo mode: Handle demo credentials without backend
      const isDemo = credentials.email === 'pilgrim' || credentials.email === 'admin'
      
      if (isDemo || getBypassEnabled()) {
        // Create mock user based on credentials
        const role: UserRole = credentials.email === 'admin' ? 'super_admin' : 'devotee'
        const name = credentials.email === 'admin' ? 'Admin User' : 'Pilgrim User'
        const dummy = makeDummyUser(credentials.email, name, role)
        
        // Store mock token for persistence
        localStorage.setItem('auth_token', 'demo-token')
        localStorage.setItem('demo_user', JSON.stringify(dummy))
        
        setAuth({ user: dummy, isAuthenticated: true, isLoading: false, error: null })
        return
      }

      // Try backend login if not demo
      // FastAPI expects OAuth2PasswordRequestForm: username + password (form-encoded)
      const form = new URLSearchParams()
      form.set('username', credentials.email)
      form.set('password', credentials.password)

      const response = await apiFetch(authPath('/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const raw = await response.json()
      // Support multiple token response shapes
      const accessToken = raw.access_token || raw.token
      const refreshToken = raw.refresh_token || raw.refreshToken
      if (!accessToken) {
        throw new Error('Login did not return an access token')
      }

      localStorage.setItem('auth_token', accessToken)
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken)

      // Fetch current user from /me
      const meRes = await apiFetch(authPath('/me'), {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      if (!meRes.ok) {
        throw new Error('Failed to load user profile')
      }
      const user = await meRes.json()

      setAuth({ user, isAuthenticated: true, isLoading: false, error: null })
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }))
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }))
      // Backend expects JSON user payload; returns UserResponse (no tokens)
      const response = await apiFetch(authPath('/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }
      // Auto-login after successful registration
      await login({ email: data.email, password: data.password })
      setAuth(prev => ({ ...prev, isLoading: false }))
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }))
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        await apiFetch(authPath('/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('Not authenticated')

      const response = await apiFetch(authPath('/me'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Profile update failed')
      }

      const updatedUser = await response.json()
      setAuth(prev => ({
        ...prev,
        user: updatedUser,
      }))
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!auth.user) return false
    return auth.user.permissions.includes(permission)
  }

  const hasRole = (role: UserRole): boolean => {
    if (!auth.user) return false
    return auth.user.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!auth.user) return false
    return roles.includes(auth.user.role)
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token')
      if (!refreshTokenValue) throw new Error('No refresh token')

      const form = new URLSearchParams()
      form.set('refresh_token', refreshTokenValue)
      const response = await apiFetch(authPath('/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const raw = await response.json()
      const newAccess = raw.access_token || raw.token
      const newRefresh = raw.refresh_token || raw.refreshToken
      if (newAccess) localStorage.setItem('auth_token', newAccess)
      if (newRefresh) localStorage.setItem('refresh_token', newRefresh)
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, logout the user
      await logout()
      throw error
    }
  }

  const value = {
    auth,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    hasRole,
    hasAnyRole,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use the auth context
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook for protected routes
export function useRequireAuth(redirectTo: string | null | undefined = '/welcome') {
  const { auth } = useAuth()

  React.useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && redirectTo) {
      if (typeof window !== 'undefined') {
        if (window.location.pathname !== redirectTo) {
          window.location.href = redirectTo
        }
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, redirectTo])

  return auth
}

// Permission wrapper component
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasPermission } = useAuth()
  
  if (hasPermission(permission)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Role wrapper component
export function RoleGuard({
  roles,
  children,
  fallback = null,
}: {
  roles: UserRole | UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasRole, hasAnyRole } = useAuth()
  
  const hasAccess = Array.isArray(roles) 
    ? hasAnyRole(roles)
    : hasRole(roles)
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}