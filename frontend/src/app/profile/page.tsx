import { Metadata } from 'next'
import ProfileManagement from '@/components/pages/profile-management'

export const metadata: Metadata = {
  title: 'Profile - Temple Crowd Management',
  description: 'Manage your devotee account settings and preferences',
  robots: 'noindex',
}

export default function ProfilePage() {
  return <ProfileManagement />
}