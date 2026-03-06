"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#precos", label: "Preços" },
  { href: "#sobre", label: "Sobre" },
]

export function LandingNavbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">FinanceApp</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <Button variant="gradient" size="sm" asChild>
                  <Link href="/dashboard">
                    Ir para Dashboard
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button variant="gradient" size="sm" asChild>
                    <Link href="/register">Começar Grátis</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu isLoggedIn={isLoggedIn} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

export function MobileMenu({
  isLoggedIn,
  onClose,
}: {
  isLoggedIn: boolean
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-x-0 top-16 z-40 glass border-b border-border/50 md:hidden"
    >
      <div className="container mx-auto px-4 py-4 space-y-4">
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
          {isLoggedIn ? (
            <Button variant="gradient" size="sm" asChild>
              <Link href="/dashboard" onClick={onClose}>
                Ir para Dashboard
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login" onClick={onClose}>
                  Entrar
                </Link>
              </Button>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/register" onClick={onClose}>
                  Começar Grátis
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
