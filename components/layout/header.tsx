"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface HeaderProps {
  sidebarCollapsed: boolean
  onMobileMenuToggle?: () => void
  isMobile?: boolean
}

export function Header({ sidebarCollapsed, onMobileMenuToggle, isMobile }: HeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile")
      const result = await response.json()
      if (result.success) {
        setProfileImage(result.data?.image || null)
        setUserName(result.data?.name || null)
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error)
    }
  }, [])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Atualiza a foto quando a sessão muda
  useEffect(() => {
    if (session) {
      fetchUserProfile()
    }
  }, [session, fetchUserProfile])

  // Escuta evento customizado para atualizar a foto em tempo real
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUserProfile()
    }

    window.addEventListener("profile-updated", handleProfileUpdate)
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate)
    }
  }, [fetchUserProfile])

  const displayName = userName || session?.user?.name || "Usuário"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <motion.header
      initial={false}
      animate={{
        marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 280),
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-xl",
        "flex items-center justify-between px-4 lg:px-6"
      )}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-xl"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 rounded-xl pl-2 pr-4 hover:bg-accent"
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={profileImage || ""} alt="Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-violet-500 text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => router.push("/dashboard/settings")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}

