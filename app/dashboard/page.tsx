"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { Charts } from "@/components/dashboard/charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { GoalsOverview } from "@/components/dashboard/goals-overview"
import { FixedExpensesAlert } from "@/components/dashboard/fixed-expenses-alert"
import { useToast } from "@/hooks/use-toast"

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  totalFixedExpenses: number
  expensesByCategory: Array<{
    categoryId: string
    categoryName: string
    categoryColor: string
    total: number
    percentage: number
  }>
  monthlyData: Array<{
    month: string
    income: number
    expenses: number
  }>
  recentExpenses: Array<{
    id: string
    name: string
    amount: number
    date: string
    category?: { name: string; color: string } | null
  }>
  recentIncomes: Array<{
    id: string
    name: string
    amount: number
    date: string
    type: string
  }>
  investmentGoals: Array<{
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    deadline: string
    priority: number
  }>
  upcomingFixedExpenses: Array<{
    id: string
    name: string
    amount: number
    dueDay: number
    frequency: string
    category?: { name: string; color: string } | null
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchData = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true)
      
      const response = await fetch("/api/dashboard")
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        if (showRefreshToast) {
          toast({
            title: "Atualizado!",
            description: "Dados atualizados com sucesso.",
            variant: "success",
          })
        }
      } else {
        throw new Error(result.error)
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const currentDate = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground capitalize mt-1">{currentDate}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="w-fit"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </motion.div>

      {/* Stats Cards */}
      {data && (
        <>
          <StatsCards
            totalIncome={data.totalIncome}
            totalExpenses={data.totalExpenses}
            balance={data.balance}
            totalFixedExpenses={data.totalFixedExpenses}
          />

          {/* Charts */}
          <Charts
            monthlyData={data.monthlyData}
            expensesByCategory={data.expensesByCategory}
          />

          {/* Bottom Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <RecentTransactions
                expenses={data.recentExpenses}
                incomes={data.recentIncomes}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <GoalsOverview goals={data.investmentGoals} />
              <FixedExpensesAlert fixedExpenses={data.upcomingFixedExpenses} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

