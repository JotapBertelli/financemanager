"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, Camera, X, ImageIcon } from "lucide-react"
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
import { expenseSchema, type ExpenseInput } from "@/lib/validations"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  color: string
}

interface Expense {
  id: string
  name: string
  description?: string | null
  amount: number
  date: string | Date
  type: "FIXED" | "VARIABLE"
  categoryId?: string | null
  receipt?: string | null
}

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
  onSuccess: () => void
}

export function ExpenseForm({ open, onOpenChange, expense, onSuccess }: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [receipt, setReceipt] = useState<string | null>(null)
  const [receiptPreview, setReceiptPreview] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      type: "VARIABLE",
      date: new Date(),
    },
  })

  const selectedType = watch("type")
  const selectedCategoryId = watch("categoryId")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (expense) {
      setValue("name", expense.name)
      setValue("description", expense.description || "")
      setValue("amount", expense.amount)
      setValue("type", expense.type)
      setValue("categoryId", expense.categoryId || undefined)
      const expenseDate = new Date(expense.date)
      setDate(expenseDate)
      setValue("date", expenseDate)
      setReceipt(expense.receipt || null)
    } else {
      reset({
        type: "VARIABLE",
        date: new Date(),
      })
      setDate(new Date())
      setReceipt(null)
    }
  }, [expense, setValue, reset])

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

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setReceipt(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: ExpenseInput) => {
    setIsLoading(true)

    try {
      const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses"
      const method = expense ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: date.toISOString(),
          receipt,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar despesa")
      }

      toast({
        title: expense ? "Despesa atualizada!" : "Despesa criada!",
        description: expense
          ? "A despesa foi atualizada com sucesso."
          : "A despesa foi cadastrada com sucesso.",
        variant: "success",
      })

      onSuccess()
      onOpenChange(false)
      reset()
      setReceipt(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar despesa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {expense ? "Editar Despesa" : "Nova Despesa"}
            </DialogTitle>
            <DialogDescription>
              {expense
                ? "Atualize as informações da despesa"
                : "Preencha os dados para cadastrar uma nova despesa"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Supermercado"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("amount", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
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
              <Label>Tipo</Label>
              <Select
                value={selectedType}
                onValueChange={(value: "FIXED" | "VARIABLE") => setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VARIABLE">Variável</SelectItem>
                  <SelectItem value="FIXED">Fixo</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Descrição adicional"
                {...register("description")}
                disabled={isLoading}
              />
            </div>

            {/* Receipt upload */}
            <div className="space-y-2">
              <Label>Comprovante (opcional)</Label>
              {receipt ? (
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setReceiptPreview(true)}
                    className="w-full h-24 rounded-lg border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center gap-3 hover:bg-emerald-500/10 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={receipt}
                      alt="Comprovante"
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-emerald-600">Comprovante anexado</p>
                      <p className="text-xs text-muted-foreground">Clique para visualizar</p>
                    </div>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setReceipt(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-20 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-violet-500/40 hover:bg-violet-500/5">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Anexar comprovante</p>
                    <p className="text-xs text-muted-foreground/60">JPG, PNG até 2MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              )}
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
                  "Cadastrar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt preview dialog */}
      <Dialog open={receiptPreview} onOpenChange={setReceiptPreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Comprovante
            </DialogTitle>
          </DialogHeader>
          {receipt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={receipt}
              alt="Comprovante"
              className="w-full rounded-lg object-contain max-h-[60vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
