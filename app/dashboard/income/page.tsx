"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Pencil,
  Loader2,
  Download,
  PiggyBank,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { IncomeForm } from "@/components/income/income-form"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, exportToCSV } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Income {
  id: string
  name: string
  description?: string | null
  amount: number
  date: string
  type: "SALARY" | "FREELANCE" | "INVESTMENT" | "BONUS" | "GIFT" | "EXTRA" | "OTHER"
  isRecurring: boolean
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

const incomeTypeColors: Record<string, string> = {
  SALARY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  FREELANCE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  INVESTMENT: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  BONUS: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  GIFT: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  EXTRA: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
  const [deleteIncome, setDeleteIncome] = useState<Income | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const fetchIncomes = useCallback(async () => {
    try {
      const response = await fetch("/api/incomes")
      const result = await response.json()
      if (result.success) {
        setIncomes(result.data)
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as receitas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  const handleDelete = async () => {
    if (!deleteIncome) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/incomes/${deleteIncome.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Receita excluída!",
          description: "A receita foi excluída com sucesso.",
          variant: "success",
        })
        fetchIncomes()
      } else {
        throw new Error("Erro ao excluir")
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a receita.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteIncome(null)
    }
  }

  const handleExport = () => {
    const data = filteredIncomes.map(income => ({
      Nome: income.name,
      Valor: income.amount,
      Data: format(new Date(income.date), "dd/MM/yyyy"),
      Tipo: incomeTypeLabels[income.type],
      Recorrente: income.isRecurring ? "Sim" : "Não",
      Descrição: income.description || "",
    }))
    exportToCSV(data, `receitas-${format(new Date(), "yyyy-MM-dd")}`)
    toast({
      title: "Exportado!",
      description: "O arquivo CSV foi baixado.",
      variant: "success",
    })
  }

  const filteredIncomes = incomes.filter((income) => {
    const matchesSearch = income.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || income.type === filterType
    return matchesSearch && matchesType
  })

  const totalAmount = filteredIncomes.reduce((sum, i) => sum + i.amount, 0)
  const recurringTotal = filteredIncomes
    .filter((i) => i.isRecurring)
    .reduce((sum, i) => sum + i.amount, 0)

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
            Receitas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os seus ganhos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="gradient"
            onClick={() => {
              setSelectedIncome(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500/10 to-emerald-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Receitas</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500/10 to-violet-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas Recorrentes</p>
                <p className="text-2xl font-bold text-violet-600 mt-1">
                  {formatCurrency(recurringTotal)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registros</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {filteredIncomes.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar receitas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(incomeTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <CardTitle>Lista de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIncomes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Recorrente</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell className="font-medium">
                        {income.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            incomeTypeColors[income.type]
                          )}
                        >
                          {incomeTypeLabels[income.type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(income.date), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {income.isRecurring ? (
                          <span className="flex items-center gap-1 text-sm text-emerald-600">
                            <RefreshCw className="h-3 w-3" />
                            Sim
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Não</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        +{formatCurrency(income.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedIncome(income)
                              setIsFormOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteIncome(income)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <PiggyBank className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma receita encontrada</p>
                <p className="text-sm mt-1">
                  Clique em &quot;Nova Receita&quot; para adicionar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Dialog */}
      <IncomeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        income={selectedIncome}
        onSuccess={fetchIncomes}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteIncome} onOpenChange={() => setDeleteIncome(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deleteIncome?.name}&quot;? Esta ação
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

