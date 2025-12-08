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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { incomeSchema, type IncomeInput } from "@/lib/validations"
import { cn } from "@/lib/utils"

interface Income {
  id: string
  name: string
  description?: string | null
  amount: number
  date: string | Date
  type: "SALARY" | "FREELANCE" | "INVESTMENT" | "BONUS" | "GIFT" | "EXTRA" | "OTHER"
  isRecurring: boolean
}

interface IncomeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  income?: Income | null
  onSuccess: () => void
}

const incomeTypes = [
  { value: "SALARY", label: "Salário" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "BONUS", label: "Bônus" },
  { value: "GIFT", label: "Presente" },
  { value: "EXTRA", label: "Extra" },
  { value: "OTHER", label: "Outros" },
]

export function IncomeForm({ open, onOpenChange, income, onSuccess }: IncomeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [isRecurring, setIsRecurring] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      type: "SALARY",
      date: new Date(),
      isRecurring: false,
    },
  })

  const selectedType = watch("type")

  useEffect(() => {
    if (income) {
      setValue("name", income.name)
      setValue("description", income.description || "")
      setValue("amount", income.amount)
      setValue("type", income.type)
      setValue("isRecurring", income.isRecurring)
      setIsRecurring(income.isRecurring)
      const incomeDate = new Date(income.date)
      setDate(incomeDate)
      setValue("date", incomeDate)
    } else {
      reset({
        type: "SALARY",
        date: new Date(),
        isRecurring: false,
      })
      setDate(new Date())
      setIsRecurring(false)
    }
  }, [income, setValue, reset])

  const onSubmit = async (data: IncomeInput) => {
    setIsLoading(true)

    try {
      const url = income ? `/api/incomes/${income.id}` : "/api/incomes"
      const method = income ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: date.toISOString(),
          isRecurring,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar receita")
      }

      toast({
        title: income ? "Receita atualizada!" : "Receita criada!",
        description: income
          ? "A receita foi atualizada com sucesso."
          : "A receita foi cadastrada com sucesso.",
        variant: "success",
      })

      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar receita",
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
            {income ? "Editar Receita" : "Nova Receita"}
          </DialogTitle>
          <DialogDescription>
            {income
              ? "Atualize as informações da receita"
              : "Cadastre um novo ganho"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Salário mensal"
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
            <Label>Tipo de receita</Label>
            <Select
              value={selectedType}
              onValueChange={(value: Income["type"]) => setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {incomeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
              <Label>Receita recorrente</Label>
              <p className="text-sm text-muted-foreground">
                Marque se essa receita se repete mensalmente
              </p>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={(checked) => {
                setIsRecurring(checked)
                setValue("isRecurring", checked)
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
              ) : income ? (
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

