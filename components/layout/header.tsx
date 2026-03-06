"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  Target,
  Check,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

interface HeaderProps {
  sidebarCollapsed: boolean
  onMobileMenuToggle?: () => void
  isMobile?: boolean
}

const notificationIcons: Record<string, typeof AlertTriangle> = {
  BUDGET_EXCEEDED: AlertTriangle,
  BUDGET_WARNING: AlertTriangle,
  DUE_DATE: CalendarClock,
  GOAL_REACHED: Target,
}

const notificationColors: Record<string, string> = {
  BUDGET_EXCEEDED: "text-red-500 bg-red-500/10",
  BUDGET_WARNING: "text-amber-500 bg-amber-500/10",
  DUE_DATE: "text-blue-500 bg-blue-500/10",
  GOAL_REACHED: "text-emerald-500 bg-emerald-500/10",
}

export function Header({ sidebarCollapsed, onMobileMenuToggle, isMobile }: HeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)

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

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications")
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.unreadCount)
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
    }
  }, [])

  const generateNotifications = useCallback(async () => {
    try {
      await fetch("/api/notifications/generate", { method: "POST" })
      fetchNotifications()
    } catch (error) {
      console.error("Erro ao gerar notificações:", error)
    }
  }, [fetchNotifications])

  useEffect(() => {
    fetchUserProfile()
    generateNotifications()
  }, [fetchUserProfile, generateNotifications])

  useEffect(() => {
    if (session) fetchUserProfile()
  }, [session, fetchUserProfile])

  useEffect(() => {
    const handleProfileUpdate = () => fetchUserProfile()
    window.addEventListener("profile-updated", handleProfileUpdate)
    return () => window.removeEventListener("profile-updated", handleProfileUpdate)
  }, [fetchUserProfile])

  // Poll notifications every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      generateNotifications()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [generateNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Erro ao marcar como lida:", error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error)
    }
  }

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
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="hidden lg:block" />

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
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notificações</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-violet-600 hover:text-violet-500"
                  onClick={handleMarkAllRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[340px]">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell
                    const colorClass = notificationColors[notification.type] || "text-muted-foreground bg-muted"

                    return (
                      <button
                        key={notification.id}
                        className={cn(
                          "w-full flex items-start gap-3 p-4 text-left hover:bg-accent/50 transition-colors",
                          !notification.read && "bg-violet-50/50 dark:bg-violet-950/20"
                        )}
                        onClick={() => {
                          if (!notification.read) handleMarkAsRead(notification.id)
                        }}
                      >
                        <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-medium truncate", !notification.read && "font-semibold")}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-violet-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

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
