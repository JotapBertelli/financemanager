import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - FinanceApp',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950">
      {children}
    </div>
  )
}
