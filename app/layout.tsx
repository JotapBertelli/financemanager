import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/toaster'
import { ServiceWorkerRegister } from '@/components/providers/sw-register'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'FinanceApp - Gestão Financeira Inteligente',
  description: 'Controle suas finanças de forma inteligente e visual. Despesas, orçamentos, metas e muito mais.',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinanceApp',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'FinanceApp - Gestão Financeira Inteligente',
    description: 'Controle suas finanças de forma inteligente e visual.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <ServiceWorkerRegister />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

