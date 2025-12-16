import { Metadata } from 'next'
import EnhancedLogin from '@/components/auth/enhanced-login'

export const metadata: Metadata = {
  title: 'Sign In - Temple Crowd Management',
  description: 'Sign in to your devotee account to book darshan and manage your temple visits',
  robots: 'noindex',
}

export default function LoginPage() {
  return <EnhancedLogin />
}