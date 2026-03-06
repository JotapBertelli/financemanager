"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  color: string
}

interface BudgetItem {
  id: string
  amount: number
  month: number
  year: number
  categoryId: string
  category: Category
  spent: number
  percentage: number
}

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export default function BudgetsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`)
      const result = await response.json()
      if (result.success) {
        setBudgets(result.data)
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os orçamentos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [month, year, toast])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      const result = await response.json()
      if (result.success) {
        setCategories(result.data.filter((c: Category & { type: string }) => c.type === "EXPENSE"))
      }
    } catch {
      console.error("Erro ao buscar categorias")
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
  }, [fetchBudgets, fetchCategories])

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
    setIsLoading(true)
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
    setIsLoading(true)
  }

  const handleSaveBudget = async () => {
    if (!selectedCategory || !budgetAmount) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          amount: parseFloat(budgetAmount),
          month,
          year,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast({ title: "Orçamento salvo!", description: "Orçamento definido com sucesso.", variant: "success" })
      setIsDialogOpen(false)
      setSelectedCategory("")
      setBudgetAmount("")
      fetchBudgets()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar orçamento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Removido!", description: "Orçamento removido com sucesso.", variant: "success" })
        fetchBudgets()
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" })
    }
  }

  const usedCategoryIds = budgets.map((b) => b.categoryId)
  const availableCategories = categories.filter((c) => !usedCategoryIds.includes(c.id))

  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0)
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0)
  const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-red-500"
    if (percentage >= 80) return "text-amber-500"
    return "text-emerald-500"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "[&>div]:bg-red-500"
    if (percentage >= 80) return "[&>div]:bg-amber-500"
    return "[&>div]:bg-emerald-500"
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
            Orçamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Defina limites de gastos por categoria
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => setIsDialogOpen(true)}
          disabled={availableCategories.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </motion.div>

      {/* Month navigation */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {monthNames[month - 1]} {year}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Total summary */}
      {budgets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Total geral</span>
                <span className={`text-sm font-bold ${getStatusColor(totalPercentage)}`}>
                  {totalPercentage}%
                </span>
              </div>
              <Progress value={Math.min(totalPercentage, 100)} className={`h-3 ${getProgressColor(totalPercentage)}`} />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                <span>R$ {totalBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Budget list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: budget.category.color }}
                      >
                        {budget.category.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{budget.category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          R$ {budget.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R$ {budget.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {budget.percentage >= 100 ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : budget.percentage >= 80 ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Utilizado</span>
                      <span className={`font-bold ${getStatusColor(budget.percentage)}`}>
                        {budget.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(budget.percentage, 100)}
                      className={`h-2.5 ${getProgressColor(budget.percentage)}`}
                    />
                    {budget.percentage >= 100 && (
                      <p className="text-xs text-red-500 font-medium">
                        Excedido em R$ {(budget.spent - budget.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum orçamento definido</p>
            <p className="text-sm mt-1">Crie orçamentos para controlar seus gastos por categoria</p>
          </CardContent>
        </Card>
      )}

      {/* New Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
            <DialogDescription>
              Defina um limite de gastos para {monthNames[month - 1]} {year}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Limite (R$)</Label>
              <Input
                type="number"
                placeholder="500.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                min={0}
                step={0.01}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleSaveBudget} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
