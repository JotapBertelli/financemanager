"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { creditCardSchema, type CreditCardInput } from "@/lib/validations"

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
}

interface CreditCardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creditCard?: CreditCardData | null
  onSuccess: () => void
}

const brandOptions = [
  { value: "VISA", label: "Visa" },
  { value: "MASTERCARD", label: "Mastercard" },
  { value: "ELO", label: "Elo" },
  { value: "AMEX", label: "American Express" },
  { value: "HIPERCARD", label: "Hipercard" },
  { value: "OTHER", label: "Outro" },
]

const colorOptions = [
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#6366f1", label: "Índigo" },
  { value: "#1e293b", label: "Escuro" },
]

export function CreditCardForm({ open, onOpenChange, creditCard, onSuccess }: CreditCardFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreditCardInput>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      brand: "VISA",
      color: "#8b5cf6",
      isActive: true,
    },
  })

  const selectedBrand = watch("brand")
  const selectedColor = watch("color")

  useEffect(() => {
    if (creditCard) {
      setValue("name", creditCard.name)
      setValue("lastDigits", creditCard.lastDigits || "")
      setValue("brand", creditCard.brand as CreditCardInput["brand"])
      setValue("limit", creditCard.limit)
      setValue("closingDay", creditCard.closingDay)
      setValue("dueDay", creditCard.dueDay)
      setValue("color", creditCard.color)
      setValue("isActive", creditCard.isActive)
    } else {
      reset({
        brand: "VISA",
        color: "#8b5cf6",
        isActive: true,
      })
    }
  }, [creditCard, setValue, reset])

  const onSubmit = async (data: CreditCardInput) => {
    setIsLoading(true)

    try {
      const url = creditCard ? `/api/credit-cards/${creditCard.id}` : "/api/credit-cards"
      const method = creditCard ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar cartão")
      }

      toast({
        title: creditCard ? "Cartão atualizado!" : "Cartão cadastrado!",
        description: creditCard
          ? "O cartão foi atualizado com sucesso."
          : "O cartão foi cadastrado com sucesso.",
        variant: "success",
      })

      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar cartão",
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
            {creditCard ? "Editar Cartão" : "Novo Cartão"}
          </DialogTitle>
          <DialogDescription>
            {creditCard
              ? "Atualize as informações do cartão"
              : "Cadastre um novo cartão de crédito"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do cartão</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank, Itaú Platinum"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastDigits">Últimos 4 dígitos</Label>
              <Input
                id="lastDigits"
                placeholder="1234"
                maxLength={4}
                {...register("lastDigits")}
                disabled={isLoading}
              />
              {errors.lastDigits && (
                <p className="text-sm text-destructive">{errors.lastDigits.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bandeira</Label>
              <Select
                value={selectedBrand}
                onValueChange={(value) => setValue("brand", value as CreditCardInput["brand"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bandeira" />
                </SelectTrigger>
                <SelectContent>
                  {brandOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Limite</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("limit", { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.limit && (
              <p className="text-sm text-destructive">{errors.limit.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closingDay">Dia de fechamento</Label>
              <Input
                id="closingDay"
                type="number"
                min={1}
                max={31}
                placeholder="10"
                {...register("closingDay", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.closingDay && (
                <p className="text-sm text-destructive">{errors.closingDay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDay">Dia de vencimento</Label>
              <Input
                id="dueDay"
                type="number"
                min={1}
                max={31}
                placeholder="20"
                {...register("dueDay", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.dueDay && (
                <p className="text-sm text-destructive">{errors.dueDay.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor do cartão</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    selectedColor === option.value
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setValue("color", option.value)}
                  title={option.label}
                />
              ))}
            </div>
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
              ) : creditCard ? (
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
