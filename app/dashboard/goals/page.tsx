"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { GoalForm } from "@/components/goals/goal-form"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, calculatePercentage } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface InvestmentGoal {
  id: string
  name: string
  description?: string | null
  targetAmount: number
  currentAmount: number
  deadline: string
  priority: number
  isCompleted: boolean
}

const priorityLabels: Record<number, string> = {
  1: "Baixa",
  2: "Normal-Baixa",
  3: "Média",
  4: "Normal-Alta",
  5: "Alta",
}

const priorityColors: Record<number, string> = {
  1: "bg-gray-500",
  2: "bg-blue-500",
  3: "bg-amber-500",
  4: "bg-orange-500",
  5: "bg-red-500",
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<InvestmentGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<InvestmentGoal | null>(null)
  const [deleteGoal, setDeleteGoal] = useState<InvestmentGoal | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const fetchGoals = useCallback(async () => {
    try {
      const response = await fetch("/api/goals")
      const result = await response.json()
      if (result.success) {
        setGoals(result.data)
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleDelete = async () => {
    if (!deleteGoal) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/goals/${deleteGoal.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Meta excluída!",
          description: "A meta foi excluída com sucesso.",
          variant: "success",
        })
        fetchGoals()
      } else {
        throw new Error("Erro ao excluir")
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a meta.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteGoal(null)
    }
  }

  const activeGoals = goals.filter((g) => !g.isCompleted)
  const completedGoals = goals.filter((g) => g.isCompleted)
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0)

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

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
            Metas de Investimento
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu progresso financeiro
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => {
            setSelectedGoal(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500/10 to-violet-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total a Investir</p>
                <p className="text-2xl font-bold text-violet-600 mt-1">
                  {formatCurrency(totalTarget)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500/10 to-emerald-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Já Investido</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(totalCurrent)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Metas Concluídas</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {completedGoals.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-violet-600" />
              Metas Ativas ({activeGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {activeGoals.map((goal, index) => {
                  const progress = calculatePercentage(goal.currentAmount, goal.targetAmount)
                  const daysLeft = differenceInDays(new Date(goal.deadline), new Date())
                  const remaining = goal.targetAmount - goal.currentAmount

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-3 w-3 rounded-full",
                              priorityColors[goal.priority]
                            )}
                          />
                          <h3 className="font-semibold">{goal.name}</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedGoal(goal)
                              setIsFormOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteGoal(goal)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {goal.description}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-semibold text-violet-600">
                            {progress}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Investido</p>
                            <p className="font-semibold text-emerald-600">
                              {formatCurrency(goal.currentAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Meta</p>
                            <p className="font-semibold">
                              {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {daysLeft > 0
                                ? `${daysLeft} dias restantes`
                                : `Venceu há ${Math.abs(daysLeft)} dias`}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              priorityColors[goal.priority],
                              "text-white"
                            )}
                          >
                            {priorityLabels[goal.priority]}
                          </span>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground">
                            Falta {formatCurrency(remaining)} para completar
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma meta ativa</p>
                <p className="text-sm mt-1">
                  Clique em &quot;Nova Meta&quot; para criar sua primeira meta
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                Metas Concluídas ({completedGoals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-semibold">{goal.name}</h3>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Meta de {formatCurrency(goal.targetAmount)} alcançada!
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Concluída em{" "}
                      {format(new Date(goal.deadline), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Form Dialog */}
      <GoalForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        goal={selectedGoal}
        onSuccess={fetchGoals}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteGoal} onOpenChange={() => setDeleteGoal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deleteGoal?.name}&quot;? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

