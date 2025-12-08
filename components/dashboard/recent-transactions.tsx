"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  name: string
  amount: number
  date: Date | string
  type: "income" | "expense"
  category?: {
    name: string
    color: string
  } | null
}

interface RecentTransactionsProps {
  expenses: Array<{
    id: string
    name: string
    amount: number
    date: Date | string
    category?: { name: string; color: string } | null
  }>
  incomes: Array<{
    id: string
    name: string
    amount: number
    date: Date | string
    type: string
  }>
}

const incomeTypeLabels: Record<string, string> = {
  SALARY: "Salário",
  FREELANCE: "Freelance",
  INVESTMENT: "Investimento",
  BONUS: "Bônus",
  GIFT: "Presente",
  EXTRA: "Extra",
  OTHER: "Outros",
}

export function RecentTransactions({ expenses, incomes }: RecentTransactionsProps) {
  // Combina e ordena transações por data
  const transactions: Transaction[] = [
    ...expenses.map(e => ({
      id: e.id,
      name: e.name,
      amount: e.amount,
      date: e.date,
      type: "expense" as const,
      category: e.category,
    })),
    ...incomes.map(i => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
      date: i.date,
      type: "income" as const,
      category: { name: incomeTypeLabels[i.type] || i.type, color: "#10b981" },
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          transaction.type === "income"
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        )}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {transaction.category && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${transaction.category.color}20`,
                                color: transaction.category.color,
                              }}
                            >
                              {transaction.category.name}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "dd MMM", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "font-semibold",
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground py-10">
                Nenhuma transação registrada
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}

