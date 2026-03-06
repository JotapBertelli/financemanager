"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle2, PieChart, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface BudgetItem {
  id: string
  amount: number
  categoryId: string
  category: {
    id: string
    name: string
    color: string
  }
  spent: number
  percentage: number
}

interface BudgetOverviewProps {
  budgets: BudgetItem[]
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "[&>div]:bg-red-500"
    if (percentage >= 80) return "[&>div]:bg-amber-500"
    return "[&>div]:bg-emerald-500"
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-red-500"
    if (percentage >= 80) return "text-amber-500"
    return "text-emerald-500"
  }

  const exceededCount = budgets.filter((b) => b.percentage >= 100).length
  const warningCount = budgets.filter((b) => b.percentage >= 80 && b.percentage < 100).length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5 text-violet-500" />
            Orçamento
          </CardTitle>
          <Link href="/dashboard/budgets">
            <Button variant="ghost" size="sm" className="text-xs text-violet-600 hover:text-violet-500">
              Ver todos
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {(exceededCount > 0 || warningCount > 0) && (
                <div className="flex gap-3 text-xs">
                  {exceededCount > 0 && (
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      {exceededCount} estourado{exceededCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      {warningCount} quase no limite
                    </span>
                  )}
                </div>
              )}

              {budgets.slice(0, 4).map((budget) => (
                <div key={budget.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                      />
                      <span className="font-medium truncate max-w-[120px]">{budget.category.name}</span>
                    </div>
                    <span className={`text-xs font-bold ${getStatusColor(budget.percentage)}`}>
                      {budget.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className={`h-2 ${getProgressColor(budget.percentage)}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">Nenhum orçamento definido</p>
              <Link href="/dashboard/budgets">
                <Button variant="link" size="sm" className="text-violet-600 text-xs mt-1">
                  Criar orçamento
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
