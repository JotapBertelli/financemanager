"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  DollarSign,
  Target,
  CalendarDays,
  Briefcase,
  Cake,
  Coins,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { registerSchema, type RegisterInput } from "@/lib/validations"

const financialGoals = [
  { value: "SAVE", label: "Economizar dinheiro" },
  { value: "INVEST", label: "Começar a investir" },
  { value: "PAY_DEBTS", label: "Sair das dívidas" },
  { value: "CONTROL_SPENDING", label: "Controlar gastos" },
  { value: "BUILD_EMERGENCY", label: "Reserva de emergência" },
  { value: "OTHER", label: "Outro" },
]

const currencies = [
  { value: "BRL", label: "R$ - Real Brasileiro" },
  { value: "USD", label: "$ - Dólar Americano" },
  { value: "EUR", label: "€ - Euro" },
  { value: "GBP", label: "£ - Libra Esterlina" },
  { value: "ARS", label: "$ - Peso Argentino" },
  { value: "CLP", label: "$ - Peso Chileno" },
  { value: "COP", label: "$ - Peso Colombiano" },
  { value: "MXN", label: "$ - Peso Mexicano" },
  { value: "PEN", label: "S/ - Sol Peruano" },
  { value: "UYU", label: "$ - Peso Uruguaio" },
]

const TOTAL_STEPS = 2

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      currency: "BRL",
    },
  })

  const handleNextStep = async () => {
    const isValid = await trigger(["name", "email", "password", "confirmPassword"])
    if (isValid) {
      setStep(2)
    }
  }

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)

    try {
      const payload = {
        ...data,
        monthlyIncome: data.monthlyIncome ? Number(data.monthlyIncome) : null,
        payDay: data.payDay ? Number(data.payDay) : null,
        birthDate: data.birthDate || null,
        profession: data.profession || null,
        financialGoal: data.financialGoal || null,
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta")
      }

      toast({
        title: "Conta criada!",
        description: "Sua conta foi criada com sucesso. Faça login para continuar.",
        variant: "success",
      })

      router.push("/login")
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Algo deu errado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-200/30 via-transparent to-transparent dark:from-violet-900/20" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-200/30 via-transparent to-transparent dark:from-emerald-900/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-500/40"
            >
              <Wallet className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                Criar conta
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {step === 1
                  ? "Comece com seus dados básicos"
                  : "Personalize sua experiência"}
              </CardDescription>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i + 1 <= step
                      ? "w-8 bg-gradient-to-r from-violet-600 to-violet-400"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        className="pl-10"
                        {...register("name")}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        {...register("email")}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...register("password")}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Mínimo 6 caracteres, com letra maiúscula e número
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...register("confirmPassword")}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="gradient"
                    className="w-full h-11"
                    onClick={handleNextStep}
                  >
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Link
                      href="/login"
                      className="text-violet-600 hover:text-violet-500 font-medium hover:underline"
                    >
                      Fazer login
                    </Link>
                  </p>
                </CardFooter>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="space-y-4 pt-4">
                  <p className="text-xs text-muted-foreground text-center -mt-2 mb-2">
                    Todos os campos abaixo são opcionais
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Renda mensal</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="monthlyIncome"
                          type="number"
                          placeholder="5.000"
                          className="pl-10"
                          {...register("monthlyIncome", { valueAsNumber: true })}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.monthlyIncome && (
                        <p className="text-sm text-destructive">{errors.monthlyIncome.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payDay">Dia do pagamento</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="payDay"
                          type="number"
                          min={1}
                          max={31}
                          placeholder="5"
                          className="pl-10"
                          {...register("payDay", { valueAsNumber: true })}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.payDay && (
                        <p className="text-sm text-destructive">{errors.payDay.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financialGoal">Objetivo financeiro</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
                      <Controller
                        name="financialGoal"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Selecione seu objetivo" />
                            </SelectTrigger>
                            <SelectContent>
                              {financialGoals.map((goal) => (
                                <SelectItem key={goal.value} value={goal.value}>
                                  {goal.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {errors.financialGoal && (
                      <p className="text-sm text-destructive">{errors.financialGoal.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profissão</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="profession"
                        type="text"
                        placeholder="Ex: Desenvolvedor, Médico, Autônomo..."
                        className="pl-10"
                        {...register("profession")}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.profession && (
                      <p className="text-sm text-destructive">{errors.profession.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de nascimento</Label>
                      <div className="relative">
                        <Cake className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="birthDate"
                          type="date"
                          className="pl-10"
                          {...register("birthDate")}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.birthDate && (
                        <p className="text-sm text-destructive">{errors.birthDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Moeda</Label>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
                        <Controller
                          name="currency"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="pl-10">
                                <SelectValue placeholder="BRL" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((curr) => (
                                  <SelectItem key={curr.value} value={curr.value}>
                                    {curr.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      {errors.currency && (
                        <p className="text-sm text-destructive">{errors.currency.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <div className="flex gap-3 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      className="flex-1 h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        "Criar conta"
                      )}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full text-muted-foreground text-sm"
                    disabled={isLoading}
                  >
                    Pular e criar conta sem preencher
                  </Button>
                </CardFooter>
              </motion.div>
            )}
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
