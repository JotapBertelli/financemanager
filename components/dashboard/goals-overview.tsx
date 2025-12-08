"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Target, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, calculatePercentage } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface InvestmentGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Date | string
  priority: number
}

interface GoalsOverviewProps {
  goals: InvestmentGoal[]
}

const priorityColors: Record<number, string> = {
  1: "bg-gray-500",
  2: "bg-blue-500",
  3: "bg-amber-500",
  4: "bg-orange-500",
  5: "bg-red-500",
}

export function GoalsOverview({ goals }: GoalsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Metas de Investimento
          </CardTitle>
          <Target className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="space-y-6">
              {goals.map((goal, index) => {
                const progress = calculatePercentage(goal.currentAmount, goal.targetAmount)
                const daysLeft = Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            priorityColors[goal.priority]
                          )}
                        />
                        <span className="font-medium">{goal.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-violet-600">
                        {progress}%
                      </span>
                    </div>

                    <Progress value={progress} className="h-2" />

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {formatCurrency(goal.currentAmount)} de{" "}
                        {formatCurrency(goal.targetAmount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {daysLeft > 0
                            ? `${daysLeft} dias`
                            : format(new Date(goal.deadline), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Nenhuma meta cadastrada</p>
              <p className="text-xs mt-1">Crie metas para acompanhar seu progresso</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

