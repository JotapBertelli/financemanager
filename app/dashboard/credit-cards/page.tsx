"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Plus,
  CreditCard as CreditCardIcon,
  Trash2,
  Pencil,
  Loader2,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Progress } from "@/components/ui/progress"
import { CreditCardForm } from "@/components/credit-cards/credit-card-form"
import { CreditCardExpenseForm } from "@/components/credit-cards/credit-card-expense-form"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface CreditCardExpense {
  id: string
  name: string
  description?: string | null
  totalAmount: number
  installments: number
  date: string
  categoryId?: string | null
  creditCardId: string
  category?: {
    name: string
    color: string
  } | null
}

interface CreditCardData {
  id: string
  name: string
  lastDigits?: string | null
  brand: string
  limit: number
  closingDay: number
  dueDay: number
  color: string
  isActive: boolean
  expenses: CreditCardExpense[]
}

const brandLabels: Record<string, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  ELO: "Elo",
  AMEX: "Amex",
  HIPERCARD: "Hipercard",
  OTHER: "Outro",
}

function getCurrentBillAmount(expenses: CreditCardExpense[], closingDay: number): number {
  const now = new Date()
  let total = 0

  for (const expense of expenses) {
    const purchaseDate = new Date(expense.date)
    const installmentAmount = expense.totalAmount / expense.installments

    for (let i = 0; i < expense.installments; i++) {
      const installmentMonth = new Date(purchaseDate)
      if (purchaseDate.getDate() > closingDay) {
        installmentMonth.setMonth(installmentMonth.getMonth() + i + 1)
      } else {
        installmentMonth.setMonth(installmentMonth.getMonth() + i)
      }

      if (
        installmentMonth.getMonth() === now.getMonth() &&
        installmentMonth.getFullYear() === now.getFullYear()
      ) {
        total += installmentAmount
      }
    }
  }

  return total
}

export default function CreditCardsPage() {
  const [creditCards, setCreditCards] = useState<CreditCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCardFormOpen, setIsCardFormOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CreditCardData | null>(null)
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<CreditCardExpense | null>(null)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [deleteCard, setDeleteCard] = useState<CreditCardData | null>(null)
  const [deleteExpense, setDeleteExpense] = useState<{ expense: CreditCardExpense; cardId: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const fetchCreditCards = useCallback(async () => {
    try {
      const response = await fetch("/api/credit-cards")
      const result = await response.json()
      if (result.success) {
        setCreditCards(result.data)
        if (result.data.length > 0 && !activeCardId) {
          setExpandedCards(new Set([result.data[0].id]))
        }
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cartões.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, activeCardId])

  useEffect(() => {
    fetchCreditCards()
  }, [fetchCreditCards])

  const handleDeleteCard = async () => {
    if (!deleteCard) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/credit-cards/${deleteCard.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Cartão excluído!",
          description: "O cartão e suas compras foram excluídos.",
          variant: "success",
        })
        fetchCreditCards()
      } else {
        throw new Error("Erro ao excluir")
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cartão.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteCard(null)
    }
  }

  const handleDeleteExpense = async () => {
    if (!deleteExpense) return
    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/credit-cards/${deleteExpense.cardId}/expenses/${deleteExpense.expense.id}`,
        { method: "DELETE" }
      )
      if (response.ok) {
        toast({
          title: "Compra excluída!",
          description: "A compra foi removida do cartão.",
          variant: "success",
        })
        fetchCreditCards()
      } else {
        throw new Error("Erro ao excluir")
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a compra.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteExpense(null)
    }
  }

  const toggleCardExpanded = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }

  const totalBillAllCards = creditCards.reduce(
    (sum, card) => sum + getCurrentBillAmount(card.expenses, card.closingDay),
    0
  )

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
            Cartões de Crédito
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus cartões e acompanhe as faturas
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => {
            setSelectedCard(null)
            setIsCardFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cartão
        </Button>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500/10 to-violet-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Fatura total do mês ({creditCards.length} {creditCards.length === 1 ? "cartão" : "cartões"})
                </p>
                <p className="text-3xl font-bold text-violet-600 mt-1">
                  {formatCurrency(totalBillAllCards)}
                </p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <CreditCardIcon className="h-7 w-7 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Credit Cards */}
      {creditCards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CreditCardIcon className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum cartão cadastrado</p>
              <p className="text-sm mt-1">
                Clique em &quot;Novo Cartão&quot; para adicionar
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        creditCards.map((card, index) => {
          const currentBill = getCurrentBillAmount(card.expenses, card.closingDay)
          const usagePercent = card.limit > 0 ? Math.min((currentBill / card.limit) * 100, 100) : 0
          const isExpanded = expandedCards.has(card.id)

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 2) }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                {/* Card Header Visual */}
                <div
                  className="p-6 text-white relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">
                        {brandLabels[card.brand] || card.brand}
                      </p>
                      <h3 className="text-xl font-bold mt-1">{card.name}</h3>
                      {card.lastDigits && (
                        <p className="text-white/70 text-sm mt-1">
                          •••• •••• •••• {card.lastDigits}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/80 hover:text-white hover:bg-white/20"
                        onClick={() => {
                          setSelectedCard(card)
                          setIsCardFormOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/80 hover:text-white hover:bg-white/20"
                        onClick={() => setDeleteCard(card)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/80">Fatura atual</span>
                      <span className="font-semibold">
                        {formatCurrency(currentBill)} / {formatCurrency(card.limit)}
                      </span>
                    </div>
                    <Progress
                      value={usagePercent}
                      className="h-2 bg-white/20"
                    />
                    <div className="flex justify-between text-xs mt-2 text-white/60">
                      <span>Fecha dia {card.closingDay}</span>
                      <span>Vence dia {card.dueDay}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Expenses */}
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveCardId(card.id)
                        setSelectedExpense(null)
                        setIsExpenseFormOpen(true)
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Nova Compra
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpanded(card.id)}
                    >
                      {card.expenses.length} {card.expenses.length === 1 ? "compra" : "compras"}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="p-4">
                      {card.expenses.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Compra</TableHead>
                              <TableHead>Categoria</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Parcelas</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="w-[80px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {card.expenses.map((expense) => (
                              <TableRow key={expense.id}>
                                <TableCell className="font-medium">
                                  {expense.name}
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
                                    <span className="text-muted-foreground text-sm">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(expense.date), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={cn(
                                      "px-2 py-1 rounded-full text-xs font-medium",
                                      expense.installments > 1
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    )}
                                  >
                                    {expense.installments > 1
                                      ? `${expense.installments}x ${formatCurrency(expense.totalAmount / expense.installments)}`
                                      : "À vista"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatCurrency(expense.totalAmount)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setActiveCardId(card.id)
                                        setSelectedExpense(expense)
                                        setIsExpenseFormOpen(true)
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setDeleteExpense({ expense, cardId: card.id })
                                      }
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
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">Nenhuma compra registrada</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })
      )}

      {/* Forms */}
      <CreditCardForm
        open={isCardFormOpen}
        onOpenChange={setIsCardFormOpen}
        creditCard={selectedCard}
        onSuccess={fetchCreditCards}
      />

      {activeCardId && (
        <CreditCardExpenseForm
          open={isExpenseFormOpen}
          onOpenChange={setIsExpenseFormOpen}
          expense={selectedExpense}
          creditCardId={activeCardId}
          onSuccess={fetchCreditCards}
        />
      )}

      {/* Delete Card Confirmation */}
      <AlertDialog open={!!deleteCard} onOpenChange={() => setDeleteCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cartão &quot;{deleteCard?.name}&quot;?
              Todas as compras associadas também serão excluídas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
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

      {/* Delete Expense Confirmation */}
      <AlertDialog open={!!deleteExpense} onOpenChange={() => setDeleteExpense(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deleteExpense?.expense.name}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
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
