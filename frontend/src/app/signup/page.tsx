import { Metadata } from 'next'
import SignupPage from '@/components/pages/signup-page'

export const metadata: Metadata = {
  title: 'Sign Up - Temple Crowd Management',
  description: 'Create your devotee account to book darshan and manage your temple visits',
  robots: 'noindex',
}

export default function SignupRoute() {
  return <SignupPage />
}
