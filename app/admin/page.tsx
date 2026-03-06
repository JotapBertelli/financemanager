"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users,
  Crown,
  Shield,
  TrendingUp,
  DollarSign,
  UserPlus,
  UserMinus,
  BarChart3,
  Loader2,
  RefreshCw,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AdminStats {
  totalUsers: number
  newUsersThisMonth: number
  newUsersLastMonth: number
  usersByPlan: { FREE?: number; PRO?: number; BUSINESS?: number }
  activeSubscriptions: number
  mrr: number
  recentUsers: {
    id: string
    name: string
    email: string
    plan: string
    createdAt: string
  }[]
  churnedThisMonth: number
  signupsByMonth: { month: string; count: number }[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function GrowthBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  const isPositive = pct >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isPositive
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-red-500/20 text-red-400"
      }`}
    >
      <TrendingUp className={`h-3 w-3 ${!isPositive ? "rotate-180" : ""}`} />
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  )
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

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true)
      const res = await fetch("/api/admin/stats")
      const json = await res.json()
      if (json.success) {
        setStats(json.data)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-gray-400">Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Erro ao carregar dados.</p>
      </div>
    )
  }

  const totalByPlan = (stats.usersByPlan.FREE || 0) + (stats.usersByPlan.PRO || 0) + (stats.usersByPlan.BUSINESS || 0)
  const maxSignups = Math.max(...stats.signupsByMonth.map((s) => s.count), 1)

  const planColors = {
    FREE: { bar: "bg-gray-500", text: "text-gray-300", label: "Free" },
    PRO: { bar: "bg-violet-500", text: "text-violet-300", label: "Pro" },
    BUSINESS: { bar: "bg-emerald-500", text: "text-emerald-300", label: "Business" },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-gray-400 mt-1">Visão geral do FinanceApp SaaS</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="w-fit border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total de Usuarios */}
          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total de Usuários</CardTitle>
              <Users className="h-5 w-5 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString("pt-BR")}</div>
              <div className="mt-2 flex items-center gap-2">
                <GrowthBadge current={stats.newUsersThisMonth} previous={stats.newUsersLastMonth} />
                <span className="text-xs text-gray-500">vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* MRR */}
          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">MRR</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{formatCurrency(stats.mrr)}</div>
              <p className="mt-2 text-xs text-gray-500">Receita recorrente mensal</p>
            </CardContent>
          </Card>

          {/* Assinaturas Ativas */}
          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Assinaturas Ativas</CardTitle>
              <UserPlus className="h-5 w-5 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.activeSubscriptions.toLocaleString("pt-BR")}</div>
              <p className="mt-2 text-xs text-gray-500">Planos pagos ativos</p>
            </CardContent>
          </Card>

          {/* Churn Mensal */}
          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Churn Mensal</CardTitle>
              <UserMinus className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.churnedThisMonth}</div>
              <p className="mt-2 text-xs text-gray-500">Cancelamentos este mês</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
          {/* Cadastros por Mês */}
          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-gray-200">
                <BarChart3 className="h-5 w-5 text-violet-400" />
                Cadastros por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {stats.signupsByMonth.map((item) => {
                  const heightPct = (item.count / maxSignups) * 100
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </span>
                      <div className="w-full relative flex items-end" style={{ height: "160px" }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-400 min-h-[4px]"
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 truncate w-full text-center">
                        {item.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Plano */}
          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-gray-200">
                <Crown className="h-5 w-5 text-violet-400" />
                Distribuição por Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                {/* Donut-like visual */}
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 36 36" className="h-40 w-40 -rotate-90">
                    {(() => {
                      const plans = [
                        { key: "FREE" as const, color: "#6b7280" },
                        { key: "PRO" as const, color: "#8b5cf6" },
                        { key: "BUSINESS" as const, color: "#10b981" },
                      ]
                      let offset = 0
                      return plans.map(({ key, color }) => {
                        const count = stats.usersByPlan[key] || 0
                        const pct = totalByPlan > 0 ? (count / totalByPlan) * 100 : 0
                        const el = (
                          <circle
                            key={key}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="none"
                            stroke={color}
                            strokeWidth="3.5"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeDashoffset={`${-offset}`}
                            strokeLinecap="round"
                          />
                        )
                        offset += pct
                        return el
                      })
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{totalByPlan}</span>
                    <span className="text-xs text-gray-400">usuários</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4">
                  {(["FREE", "PRO", "BUSINESS"] as const).map((plan) => {
                    const count = stats.usersByPlan[plan] || 0
                    const pct = totalByPlan > 0 ? ((count / totalByPlan) * 100).toFixed(1) : "0"
                    const info = planColors[plan]
                    return (
                      <div key={plan} className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${info.bar}`} />
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${info.text}`}>{info.label}</span>
                          <span className="text-xs text-gray-500">
                            {count} ({pct}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Users Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-200">
                <Users className="h-5 w-5 text-violet-400" />
                Usuários Recentes
              </CardTitle>
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                >
                  Gerenciar usuários
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Nome</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Plano</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Data de Cadastro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-200 font-medium">{user.name || "—"}</td>
                        <td className="py-3 px-4 text-gray-400">{user.email}</td>
                        <td className="py-3 px-4">
                          <PlanBadge plan={user.plan} />
                        </td>
                        <td className="py-3 px-4 text-gray-400">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {stats.recentUsers.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Nenhum usuário encontrado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Management Link */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <Link href="/admin/users">
            <Button variant="gradient" size="lg" className="gap-2">
              <Shield className="h-5 w-5" />
              Gerenciamento Completo de Usuários
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
