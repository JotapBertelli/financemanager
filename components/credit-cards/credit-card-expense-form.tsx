"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { creditCardExpenseSchema, type CreditCardExpenseInput } from "@/lib/validations"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

interface Category {
  id: string
  name: string
  color: string
}

interface CreditCardExpenseData {
  id: string
  name: string
  description?: string | null
  totalAmount: number
  installments: number
  date: string | Date
  categoryId?: string | null
  creditCardId: string
}

interface CreditCardExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: CreditCardExpenseData | null
  creditCardId: string
  onSuccess: () => void
}

export function CreditCardExpenseForm({
  open,
  onOpenChange,
  expense,
  creditCardId,
  onSuccess,
}: CreditCardExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreditCardExpenseInput>({
    resolver: zodResolver(creditCardExpenseSchema),
    defaultValues: {
      installments: 1,
      date: new Date(),
      creditCardId,
    },
  })

  const selectedCategoryId = watch("categoryId")
  const watchedAmount = watch("totalAmount")
  const watchedInstallments = watch("installments")

  const installmentAmount =
    watchedAmount && watchedInstallments
      ? watchedAmount / watchedInstallments
      : 0

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (expense) {
      setValue("name", expense.name)
      setValue("description", expense.description || "")
      setValue("totalAmount", expense.totalAmount)
      setValue("installments", expense.installments)
      setValue("categoryId", expense.categoryId || undefined)
      setValue("creditCardId", creditCardId)
      const expenseDate = new Date(expense.date)
      setDate(expenseDate)
      setValue("date", expenseDate)
    } else {
      reset({
        installments: 1,
        date: new Date(),
        creditCardId,
      })
      setDate(new Date())
    }
  }, [expense, setValue, reset, creditCardId])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?type=EXPENSE")
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    }
  }

  const onSubmit = async (data: CreditCardExpenseInput) => {
    setIsLoading(true)

    try {
      const url = expense
        ? `/api/credit-cards/${creditCardId}/expenses/${expense.id}`
        : `/api/credit-cards/${creditCardId}/expenses`
      const method = expense ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: date.toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar compra")
      }

      toast({
        title: expense ? "Compra atualizada!" : "Compra registrada!",
        description: expense
          ? "A compra foi atualizada com sucesso."
          : "A compra foi registrada no cartão.",
        variant: "success",
      })

      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar compra",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Editar Compra" : "Nova Compra"}
          </DialogTitle>
          <DialogDescription>
            {expense
              ? "Atualize as informações da compra"
              : "Registre uma nova compra no cartão"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("creditCardId")} />

          <div className="space-y-2">
            <Label htmlFor="name">Descrição da compra</Label>
            <Input
              id="name"
              placeholder="Ex: Amazon, iFood"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Valor total</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("totalAmount", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.totalAmount && (
                <p className="text-sm text-destructive">{errors.totalAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min={1}
                max={48}
                placeholder="1"
                {...register("installments", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.installments && (
                <p className="text-sm text-destructive">{errors.installments.message}</p>
              )}
            </div>
          </div>

          {watchedInstallments > 1 && installmentAmount > 0 && (
            <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
              <p className="text-sm text-violet-700 dark:text-violet-300">
                {watchedInstallments}x de <strong>{formatCurrency(installmentAmount)}</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Data da compra</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) {
                      setDate(d)
                      setValue("date", d)
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={selectedCategoryId || ""}
              onValueChange={(value) => setValue("categoryId", value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Observação (opcional)</Label>
            <Input
              id="description"
              placeholder="Descrição adicional"
              {...register("description")}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : expense ? (
                "Atualizar"
              ) : (
                "Registrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
