"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Loader2,
  Wallet,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { FixedExpenseForm } from "@/components/fixed-expenses/fixed-expense-form"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface FixedExpense {
  id: string
  name: string
  description?: string | null
  amount: number
  dueDay: number
  frequency: "WEEKLY" | "MONTHLY" | "YEARLY"
  categoryId?: string | null
  isActive: boolean
  category?: {
    name: string
    color: string
  } | null
}

const frequencyLabels: Record<string, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
}

export default function FixedExpensesPage() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<FixedExpense | null>(null)
  const [deleteExpense, setDeleteExpense] = useState<FixedExpense | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const fetchFixedExpenses = useCallback(async () => {
    try {
      const response = await fetch("/api/fixed-expenses")
      const result = await response.json()
      if (result.success) {
        setFixedExpenses(result.data)
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os gastos fixos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchFixedExpenses()
  }, [fetchFixedExpenses])

  const handleToggleActive = async (expense: FixedExpense) => {
    try {
      const response = await fetch(`/api/fixed-expenses/${expense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...expense,
          isActive: !expense.isActive,
        }),
      })

      if (response.ok) {
        toast({
          title: expense.isActive ? "Desativado!" : "Ativado!",
          description: `O gasto fixo foi ${expense.isActive ? "desativado" : "ativado"}.`,
          variant: "success",
        })
        fetchFixedExpenses()
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteExpense) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/fixed-expenses/${deleteExpense.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Gasto fixo excluído!",
          description: "O gasto fixo foi excluído com sucesso.",
          variant: "success",
        })
        fetchFixedExpenses()
      } else {
        throw new Error("Erro ao excluir")
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o gasto fixo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteExpense(null)
    }
  }

  const filteredExpenses = fixedExpenses.filter((expense) =>
    expense.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeExpenses = filteredExpenses.filter((e) => e.isActive)
  const totalActive = activeExpenses.reduce((sum, e) => sum + e.amount, 0)
  const today = new Date().getDate()

  // Gastos próximos do vencimento (próximos 7 dias)
  const upcomingExpenses = activeExpenses.filter((e) => {
    const daysUntil = e.dueDay >= today ? e.dueDay - today : 30 - today + e.dueDay
    return daysUntil <= 7
  })

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
            Gastos Fixos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas despesas recorrentes
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => {
            setSelectedExpense(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Gasto Fixo
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Mensal</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {formatCurrency(totalActive)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500/10 to-emerald-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {activeExpenses.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500/10 to-red-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {upcomingExpenses.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar gastos fixos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Lista de Gastos Fixos</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const daysUntil =
                      expense.dueDay >= today
                        ? expense.dueDay - today
                        : 30 - today + expense.dueDay
                    const isUrgent = daysUntil <= 3 && expense.isActive

                    return (
                      <TableRow
                        key={expense.id}
                        className={cn(isUrgent && "bg-red-50 dark:bg-red-950/20")}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isUrgent && (
                              <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                            )}
                            {expense.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {expense.category ? (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${expense.category.color}20`,
                                color: expense.category.color,
                              }}
                            >
                              {expense.category.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Sem categoria
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">Dia {expense.dueDay}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({daysUntil === 0 ? "Hoje" : `${daysUntil} dias`})
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                            {frequencyLabels[expense.frequency]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-amber-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {expense.isActive ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <Switch
                              checked={expense.isActive}
                              onCheckedChange={() => handleToggleActive(expense)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedExpense(expense)
                                setIsFormOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteExpense(expense)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum gasto fixo encontrado</p>
                <p className="text-sm mt-1">
                  Clique em "Novo Gasto Fixo" para adicionar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Dialog */}
      <FixedExpenseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        fixedExpense={selectedExpense}
        onSuccess={fetchFixedExpenses}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteExpense} onOpenChange={() => setDeleteExpense(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir gasto fixo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deleteExpense?.name}&quot;? Esta
              ação não pode ser desfeita.
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

