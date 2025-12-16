import { Metadata } from 'next'
import AdminOverview from '@/components/admin/admin-overview'

export const metadata: Metadata = {
  title: 'Admin Panel - Temple Crowd Management',
  description: 'Administrative interface for temple management',
  robots: 'noindex',
}

export default function AdminPage() {
  return <AdminOverview />
}