"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Recupera preferência do usuário
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState))
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/20 via-transparent to-transparent dark:from-violet-950/20" />
      <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center opacity-[0.02] dark:opacity-[0.05]" />

      <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      
      <div className="flex flex-col min-h-screen">
        <Header sidebarCollapsed={sidebarCollapsed} />
        
        <motion.main
          initial={false}
          animate={{
            marginLeft: sidebarCollapsed ? 80 : 280,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "flex-1 p-6",
            "transition-all duration-300"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
}

