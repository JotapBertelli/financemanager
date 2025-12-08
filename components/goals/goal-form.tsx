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
import { investmentGoalSchema, type InvestmentGoalInput } from "@/lib/validations"
import { cn } from "@/lib/utils"

interface InvestmentGoal {
  id: string
  name: string
  description?: string | null
  targetAmount: number
  currentAmount: number
  deadline: string | Date
  priority: number
}

interface GoalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: InvestmentGoal | null
  onSuccess: () => void
}

export function GoalForm({ open, onOpenChange, goal, onSuccess }: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [deadline, setDeadline] = useState<Date>(new Date())
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvestmentGoalInput>({
    resolver: zodResolver(investmentGoalSchema),
    defaultValues: {
      currentAmount: 0,
      priority: 3,
      deadline: new Date(),
    },
  })

  const selectedPriority = watch("priority")

  useEffect(() => {
    if (goal) {
      setValue("name", goal.name)
      setValue("description", goal.description || "")
      setValue("targetAmount", goal.targetAmount)
      setValue("currentAmount", goal.currentAmount)
      setValue("priority", goal.priority)
      const goalDeadline = new Date(goal.deadline)
      setDeadline(goalDeadline)
      setValue("deadline", goalDeadline)
    } else {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      reset({
        currentAmount: 0,
        priority: 3,
        deadline: futureDate,
      })
      setDeadline(futureDate)
    }
  }, [goal, setValue, reset])

  const onSubmit = async (data: InvestmentGoalInput) => {
    setIsLoading(true)

    try {
      const url = goal ? `/api/goals/${goal.id}` : "/api/goals"
      const method = goal ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          deadline: deadline.toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar meta")
      }

      toast({
        title: goal ? "Meta atualizada!" : "Meta criada!",
        description: goal
          ? "A meta foi atualizada com sucesso."
          : "A meta foi cadastrada com sucesso.",
        variant: "success",
      })

      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar meta",
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
            {goal ? "Editar Meta" : "Nova Meta de Investimento"}
          </DialogTitle>
          <DialogDescription>
            {goal
              ? "Atualize as informações da meta"
              : "Defina uma meta financeira para alcançar"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da meta</Label>
            <Input
              id="name"
              placeholder="Ex: Reserva de emergência"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Valor alvo</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("targetAmount", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.targetAmount && (
                <p className="text-sm text-destructive">{errors.targetAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Valor atual</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("currentAmount", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.currentAmount && (
                <p className="text-sm text-destructive">{errors.currentAmount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: ptBR }) : "Selecione o prazo"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(d) => {
                    if (d) {
                      setDeadline(d)
                      setValue("deadline", d)
                    }
                  }}
                  locale={ptBR}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select
              value={selectedPriority?.toString()}
              onValueChange={(value) => setValue("priority", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Baixa (1)</SelectItem>
                <SelectItem value="2">Normal-Baixa (2)</SelectItem>
                <SelectItem value="3">Média (3)</SelectItem>
                <SelectItem value="4">Normal-Alta (4)</SelectItem>
                <SelectItem value="5">Alta (5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Descrição da meta"
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
              ) : goal ? (
                "Atualizar"
              ) : (
                "Criar Meta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

