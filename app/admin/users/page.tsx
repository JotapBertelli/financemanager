"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users,
  Crown,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface User {
  id: string
  name: string | null
  email: string
  plan: string
  role: string
  subscriptionStatus: string | null
  createdAt: string
}

interface UsersResponse {
  users: User[]
  total: number
  page: number
  totalPages: number
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    FREE: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    PRO: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    BUSINESS: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
        styles[plan] || styles.FREE
      }`}
    >
      {plan === "PRO" && <Crown className="h-3 w-3" />}
      {plan === "BUSINESS" && <Shield className="h-3 w-3" />}
      {plan}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN"
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
        isAdmin
          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
          : "bg-gray-500/20 text-gray-400 border-gray-600/30"
      }`}
    >
      {isAdmin && <Shield className="h-3 w-3" />}
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-gray-500">—</span>
  }
  const colors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    canceled: "bg-red-500/20 text-red-400",
    past_due: "bg-amber-500/20 text-amber-400",
    trialing: "bg-blue-500/20 text-blue-400",
  }
  return (
    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || "bg-gray-500/20 text-gray-400"}`}>
      {status}
    </span>
  )
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      })
      if (search) params.set("search", search)
      if (planFilter !== "ALL") params.set("plan", planFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [page, search, planFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    setPage(1)
  }, [search, planFilter])

  const handleUpdateUser = async (userId: string, field: "plan" | "role", value: string) => {
    try {
      setUpdatingUserId(userId)
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, [field]: value }),
      })
      if (res.ok) {
        await fetchUsers()
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingUserId(null)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">
                Gerenciamento de Usuários
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {data ? `${data.total} usuários no total` : "Carregando..."}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
                />
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-44 bg-gray-800/50 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Filtrar por plano" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="ALL">Todos os planos</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-200">
              <Users className="h-5 w-5 text-violet-400" />
              Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Nome</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Plano</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Assinatura</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-200 font-medium">
                            {user.name || "—"}
                          </td>
                          <td className="py-3 px-4 text-gray-400">{user.email}</td>
                          <td className="py-3 px-4">
                            <PlanBadge plan={user.plan} />
                          </td>
                          <td className="py-3 px-4">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={user.subscriptionStatus} />
                          </td>
                          <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.plan}
                                onValueChange={(val) => handleUpdateUser(user.id, "plan", val)}
                                disabled={updatingUserId === user.id}
                              >
                                <SelectTrigger className="h-8 w-28 text-xs bg-gray-800/50 border-gray-700 text-gray-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-700">
                                  <SelectItem value="FREE">Free</SelectItem>
                                  <SelectItem value="PRO">Pro</SelectItem>
                                  <SelectItem value="BUSINESS">Business</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={user.role}
                                onValueChange={(val) => handleUpdateUser(user.id, "role", val)}
                                disabled={updatingUserId === user.id}
                              >
                                <SelectTrigger className="h-8 w-24 text-xs bg-gray-800/50 border-gray-700 text-gray-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-700">
                                  <SelectItem value="USER">User</SelectItem>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data?.users.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum usuário encontrado.
                    </p>
                  )}
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-500">
                      Página {data.page} de {data.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        disabled={page >= data.totalPages}
                        className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 disabled:opacity-30"
                      >
                        Próximo
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
