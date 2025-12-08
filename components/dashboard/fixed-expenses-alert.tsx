"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Calendar, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface FixedExpense {
  id: string
  name: string
  amount: number
  dueDay: number
  frequency: string
  category?: {
    name: string
    color: string
  } | null
}

interface FixedExpensesAlertProps {
  fixedExpenses: FixedExpense[]
}

const frequencyLabels: Record<string, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
}

export function FixedExpensesAlert({ fixedExpenses }: FixedExpensesAlertProps) {
  const today = new Date().getDate()

  // Ordena por proximidade do vencimento
  const sortedExpenses = [...fixedExpenses].sort((a, b) => {
    const daysUntilA = a.dueDay >= today ? a.dueDay - today : 30 - today + a.dueDay
    const daysUntilB = b.dueDay >= today ? b.dueDay - today : 30 - today + b.dueDay
    return daysUntilA - daysUntilB
  })

  const getUrgencyClass = (dueDay: number) => {
    const daysUntil = dueDay >= today ? dueDay - today : 30 - today + dueDay
    if (daysUntil <= 3) return "border-l-red-500 bg-red-50 dark:bg-red-950/20"
    if (daysUntil <= 7) return "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20"
    return "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
  }

  const getDaysUntilDue = (dueDay: number) => {
    const daysUntil = dueDay >= today ? dueDay - today : 30 - today + dueDay
    if (daysUntil === 0) return "Vence hoje!"
    if (daysUntil === 1) return "Vence amanhã"
    return `${daysUntil} dias`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Gastos Fixos
          </CardTitle>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {sortedExpenses.length > 0 ? (
            <div className="space-y-3">
              {sortedExpenses.map((expense, index) => {
                const daysUntil = expense.dueDay >= today 
                  ? expense.dueDay - today 
                  : 30 - today + expense.dueDay

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-l-4 transition-colors",
                      getUrgencyClass(expense.dueDay)
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {daysUntil <= 3 && (
                        <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{expense.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {expense.category && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${expense.category.color}20`,
                                color: expense.category.color,
                              }}
                            >
                              {expense.category.name}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {frequencyLabels[expense.frequency]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(expense.amount)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>Dia {expense.dueDay}</span>
                        <span className="text-violet-600 font-medium">
                          ({getDaysUntilDue(expense.dueDay)})
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Nenhum gasto fixo cadastrado</p>
              <p className="text-xs mt-1">Cadastre suas despesas recorrentes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

