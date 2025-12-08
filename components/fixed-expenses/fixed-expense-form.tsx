"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { useToast } from "@/hooks/use-toast"
import { fixedExpenseSchema, type FixedExpenseInput } from "@/lib/validations"

interface Category {
  id: string
  name: string
  color: string
}

interface FixedExpense {
  id: string
  name: string
  description?: string | null
  amount: number
  dueDay: number
  frequency: "WEEKLY" | "MONTHLY" | "YEARLY"
  categoryId?: string | null
  isActive: boolean
}

interface FixedExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fixedExpense?: FixedExpense | null
  onSuccess: () => void
}

export function FixedExpenseForm({
  open,
  onOpenChange,
  fixedExpense,
  onSuccess,
}: FixedExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isActive, setIsActive] = useState(true)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FixedExpenseInput>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: {
      frequency: "MONTHLY",
      isActive: true,
      dueDay: 1,
    },
  })

  const selectedFrequency = watch("frequency")
  const selectedCategoryId = watch("categoryId")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (fixedExpense) {
      setValue("name", fixedExpense.name)
      setValue("description", fixedExpense.description || "")
      setValue("amount", fixedExpense.amount)
      setValue("dueDay", fixedExpense.dueDay)
      setValue("frequency", fixedExpense.frequency)
      setValue("categoryId", fixedExpense.categoryId || undefined)
      setValue("isActive", fixedExpense.isActive)
      setIsActive(fixedExpense.isActive)
    } else {
      reset({
        frequency: "MONTHLY",
        isActive: true,
        dueDay: 1,
      })
      setIsActive(true)
    }
  }, [fixedExpense, setValue, reset])

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

  const onSubmit = async (data: FixedExpenseInput) => {
    setIsLoading(true)

    try {
      const url = fixedExpense
        ? `/api/fixed-expenses/${fixedExpense.id}`
        : "/api/fixed-expenses"
      const method = fixedExpense ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          isActive,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar gasto fixo")
      }

      toast({
        title: fixedExpense ? "Gasto fixo atualizado!" : "Gasto fixo criado!",
        description: fixedExpense
          ? "O gasto fixo foi atualizado com sucesso."
          : "O gasto fixo foi cadastrado com sucesso.",
        variant: "success",
      })

      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao salvar gasto fixo",
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
            {fixedExpense ? "Editar Gasto Fixo" : "Novo Gasto Fixo"}
          </DialogTitle>
          <DialogDescription>
            {fixedExpense
              ? "Atualize as informações do gasto fixo"
              : "Cadastre uma despesa recorrente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Aluguel"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDay">Dia do vencimento</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                placeholder="1-31"
                {...register("dueDay", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.dueDay && (
                <p className="text-sm text-destructive">{errors.dueDay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select
                value={selectedFrequency}
                onValueChange={(value: "WEEKLY" | "MONTHLY" | "YEARLY") =>
                  setValue("frequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                  <SelectItem value="MONTHLY">Mensal</SelectItem>
                  <SelectItem value="YEARLY">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Gasto fixo ativo será considerado nos cálculos
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => {
                setIsActive(checked)
                setValue("isActive", checked)
              }}
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
              ) : fixedExpense ? (
                "Atualizar"
              ) : (
                "Cadastrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

