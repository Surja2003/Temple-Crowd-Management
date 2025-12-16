// Authentication and Authorization Types

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  templeId?: string; // For temple staff, which temple they belong to
  permissions: Permission[];
  preferences: UserPreferences;
  profile: UserProfile;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 
  | 'public'           // Unregistered users (view-only access)
  | 'devotee'          // Registered devotees (booking, personal data)
  | 'temple_staff'     // Temple staff (temple management)
  | 'temple_admin'     // Temple administrator (full temple control)
  | 'super_admin';     // System administrator (all temples)

export type Permission = 
  // Public permissions
  | 'view_temple_info'
  | 'view_crowd_data'
  | 'view_timings'
  
  // Devotee permissions
  | 'create_booking'
  | 'manage_own_bookings'
  | 'view_own_history'
  | 'update_own_profile'
  | 'receive_notifications'
  
  // Temple staff permissions
  | 'view_temple_bookings'
  | 'manage_temple_queue'
  | 'send_temple_alerts'
  | 'view_temple_analytics'
  | 'manage_temple_capacity'
  | 'update_temple_timings'
  
  // Temple admin permissions
  | 'manage_temple_staff'
  | 'configure_temple_settings'
  | 'manage_temple_content'
  | 'view_temple_reports'
  | 'manage_temple_finances'
  | 'configure_temple_access'
  
  // Super admin permissions
  | 'manage_all_temples'
  | 'manage_system_users'
  | 'view_system_analytics'
  | 'configure_system_settings'
  | 'manage_system_integrations'
  | 'access_audit_logs';

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  privacy: {
    profileVisible: boolean;
    allowMarketing: boolean;
    dataSharing: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
}

export interface UserProfile {
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  devoteeInfo?: {
    preferredDeity: string[];
    vegetarian: boolean;
    specialNeeds?: string[];
    membershipLevel: 'basic' | 'premium' | 'vip';
    membershipExpiry?: string;
  };
}

// Authentication Context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  preferences?: Partial<UserPreferences>;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Session Management
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
  };
  lastActivity: string;
}

// Role-based Access Control
export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermission[] = [
  {
    role: 'public',
    permissions: [
      'view_temple_info',
      'view_crowd_data',
      'view_timings'
    ],
    description: 'Basic read-only access for unregistered users'
  },
  {
    role: 'devotee',
    permissions: [
      'view_temple_info',
      'view_crowd_data',
      'view_timings',
      'create_booking',
      'manage_own_bookings',
      'view_own_history',
      'update_own_profile',
      'receive_notifications'
    ],
    description: 'Standard access for registered devotees'
  },
  {
    role: 'temple_staff',
    permissions: [
      'view_temple_info',
      'view_crowd_data',
      'view_timings',
      'view_temple_bookings',
      'manage_temple_queue',
      'send_temple_alerts',
      'view_temple_analytics',
      'manage_temple_capacity',
      'update_temple_timings'
    ],
    description: 'Operational access for temple staff members'
  },
  {
    role: 'temple_admin',
    permissions: [
      'view_temple_info',
      'view_crowd_data',
      'view_timings',
      'view_temple_bookings',
      'manage_temple_queue',
      'send_temple_alerts',
      'view_temple_analytics',
      'manage_temple_capacity',
      'update_temple_timings',
      'manage_temple_staff',
      'configure_temple_settings',
      'manage_temple_content',
      'view_temple_reports',
      'manage_temple_finances',
      'configure_temple_access'
    ],
    description: 'Full administrative access for temple management'
  },
  {
    role: 'super_admin',
    permissions: [
      'view_temple_info',
      'view_crowd_data',
      'view_timings',
      'create_booking',
      'manage_own_bookings',
      'view_own_history',
      'update_own_profile',
      'receive_notifications',
      'view_temple_bookings',
      'manage_temple_queue',
      'send_temple_alerts',
      'view_temple_analytics',
      'manage_temple_capacity',
      'update_temple_timings',
      'manage_temple_staff',
      'configure_temple_settings',
      'manage_temple_content',
      'view_temple_reports',
      'manage_temple_finances',
      'configure_temple_access',
      'manage_all_temples',
      'manage_system_users',
      'view_system_analytics',
      'configure_system_settings',
      'manage_system_integrations',
      'access_audit_logs'
    ],
    description: 'Complete system access for super administrators'
  }
];

// API Types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}