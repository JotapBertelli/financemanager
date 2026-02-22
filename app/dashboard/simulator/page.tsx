"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  Calculator,
  Loader2,
  TrendingUp,
  Wallet,
  PiggyBank,
  Trash2,
  Save,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useToast } from "@/hooks/use-toast"
import {
  formatCurrency,
  calculateCompoundInterest,
  calculateSimpleInterest,
} from "@/lib/utils"
import { investmentSimulationSchema, type InvestmentSimulationInput } from "@/lib/validations"

interface Simulation {
  id: string
  name: string
  initialAmount: number
  monthlyContribution: number
  interestRate: number
  interestType: "SIMPLE" | "COMPOUND"
  periodMonths: number
  projectedAmount: number | null
}

interface ProjectionData {
  month: number
  totalInvested: number
  totalWithInterest: number
  interest: number
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-medium mb-2">Mês {label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function SimulatorPage() {
  const [savedSimulations, setSavedSimulations] = useState<Simulation[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([])
  const [results, setResults] = useState<{
    finalAmount: number
    totalInvested: number
    totalInterest: number
  } | null>(null)
  const [deleteSimulation, setDeleteSimulation] = useState<Simulation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InvestmentSimulationInput>({
    resolver: zodResolver(investmentSimulationSchema),
    defaultValues: {
      name: "",
      initialAmount: 0,
      monthlyContribution: 500,
      interestRate: 12,
      interestType: "COMPOUND",
      periodMonths: 60,
    },
  })

  const interestType = watch("interestType")
  const initialAmount = watch("initialAmount")
  const monthlyContribution = watch("monthlyContribution")
  const interestRate = watch("interestRate")
  const periodMonths = watch("periodMonths")

  const fetchSavedSimulations = useCallback(async () => {
    try {
      const response = await fetch("/api/simulations")
      const result = await response.json()
      if (result.success) {
        setSavedSimulations(result.data)
      }
    } catch (error) {
      console.error("Erro ao buscar simulações:", error)
    } finally {
      setIsLoadingSaved(false)
    }
  }, [])

  useEffect(() => {
    fetchSavedSimulations()
  }, [fetchSavedSimulations])

  // Calcula a projeção quando os valores mudam
  useEffect(() => {
    if (!initialAmount && !monthlyContribution) {
      setProjectionData([])
      setResults(null)
      return
    }

    const data: ProjectionData[] = []
    const monthlyRate = interestRate / 100 / 12

    for (let month = 0; month <= periodMonths; month++) {
      let totalWithInterest: number

      if (interestType === "COMPOUND") {
        totalWithInterest = calculateCompoundInterest(
          initialAmount,
          monthlyContribution,
          interestRate,
          month
        )
      } else {
        totalWithInterest = calculateSimpleInterest(
          initialAmount,
          monthlyContribution,
          interestRate,
          month
        )
      }

      const totalInvested = initialAmount + monthlyContribution * month
      const interest = totalWithInterest - totalInvested

      data.push({
        month,
        totalInvested,
        totalWithInterest,
        interest,
      })
    }

    setProjectionData(data)

    const lastData = data[data.length - 1]
    if (lastData) {
      setResults({
        finalAmount: lastData.totalWithInterest,
        totalInvested: lastData.totalInvested,
        totalInterest: lastData.interest,
      })
    }
  }, [initialAmount, monthlyContribution, interestRate, periodMonths, interestType])

  const onSave = async (data: InvestmentSimulationInput) => {
    if (!data.name) {
      toast({
        title: "Erro",
        description: "Digite um nome para salvar a simulação.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar simulação")
      }

      toast({
        title: "Simulação salva!",
        description: "Sua simulação foi salva com sucesso.",
        variant: "success",
      })

      fetchSavedSimulations()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteSimulation) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/simulations/${deleteSimulation.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Simulação excluída!",
          description: "A simulação foi excluída com sucesso.",
          variant: "success",
        })
        fetchSavedSimulations()
      } else {
        throw new Error("Erro ao excluir")
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a simulação.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteSimulation(null)
    }
  }

  const loadSimulation = (simulation: Simulation) => {
    setValue("name", simulation.name)
    setValue("initialAmount", simulation.initialAmount)
    setValue("monthlyContribution", simulation.monthlyContribution)
    setValue("interestRate", simulation.interestRate)
    setValue("interestType", simulation.interestType)
    setValue("periodMonths", simulation.periodMonths)
    toast({
      title: "Simulação carregada!",
      description: `"${simulation.name}" foi carregada no simulador.`,
    })
  }

  const handleReset = () => {
    reset({
      name: "",
      initialAmount: 0,
      monthlyContribution: 500,
      interestRate: 12,
      interestType: "COMPOUND",
      periodMonths: 60,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
          Simulador de Investimentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Simule o crescimento dos seus investimentos com juros simples ou compostos
        </p>
      </motion.div>

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="simulator" className="gap-2">
            <Calculator className="h-4 w-4" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <PiggyBank className="h-4 w-4" />
            Salvas ({savedSimulations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-violet-600" />
                    Parâmetros
                  </CardTitle>
                  <CardDescription>
                    Configure os valores da simulação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da simulação</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Aposentadoria"
                        {...register("name")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="initialAmount">Valor inicial</Label>
                      <Input
                        id="initialAmount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...register("initialAmount", { valueAsNumber: true })}
                      />
                      {errors.initialAmount && (
                        <p className="text-sm text-destructive">
                          {errors.initialAmount.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyContribution">Aporte mensal</Label>
                      <Input
                        id="monthlyContribution"
                        type="number"
                        step="0.01"
                        placeholder="500,00"
                        {...register("monthlyContribution", { valueAsNumber: true })}
                      />
                      {errors.monthlyContribution && (
                        <p className="text-sm text-destructive">
                          {errors.monthlyContribution.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Taxa de juros (% ao ano)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        placeholder="12"
                        {...register("interestRate", { valueAsNumber: true })}
                      />
                      {errors.interestRate && (
                        <p className="text-sm text-destructive">
                          {errors.interestRate.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de juros</Label>
                      <Select
                        value={interestType}
                        onValueChange={(value: "SIMPLE" | "COMPOUND") =>
                          setValue("interestType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COMPOUND">Juros Compostos</SelectItem>
                          <SelectItem value="SIMPLE">Juros Simples</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="periodMonths">Período (meses)</Label>
                      <Input
                        id="periodMonths"
                        type="number"
                        placeholder="60"
                        {...register("periodMonths", { valueAsNumber: true })}
                      />
                      {errors.periodMonths && (
                        <p className="text-sm text-destructive">
                          {errors.periodMonths.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(periodMonths / 12)} anos e {periodMonths % 12} meses
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleReset}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Limpar
                      </Button>
                      <Button
                        type="submit"
                        variant="gradient"
                        className="flex-1"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Summary Cards */}
              {results && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500/10 to-emerald-600/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Valor Final
                          </p>
                          <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(results.finalAmount)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500/10 to-violet-600/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Investido
                          </p>
                          <p className="text-xl font-bold text-violet-600">
                            {formatCurrency(results.totalInvested)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <PiggyBank className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Juros Ganhos
                          </p>
                          <p className="text-xl font-bold text-amber-600">
                            {formatCurrency(results.totalInterest)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Projeção de Crescimento</CardTitle>
                  <CardDescription>
                    Evolução do investimento ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projectionData.length > 0 ? (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={projectionData}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="month"
                            className="text-xs fill-muted-foreground"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${value}m`}
                          />
                          <YAxis
                            className="text-xs fill-muted-foreground"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) =>
                              `${(value / 1000).toFixed(0)}k`
                            }
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="totalWithInterest"
                            name="Total com Juros"
                            stroke="#10b981"
                            fill="url(#colorTotal)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="totalInvested"
                            name="Total Investido"
                            stroke="#8b5cf6"
                            fill="url(#colorInvested)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      Configure os parâmetros para ver a projeção
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Simulações Salvas</CardTitle>
                <CardDescription>
                  Clique em uma simulação para carregá-la no simulador
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSaved ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                  </div>
                ) : savedSimulations.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {savedSimulations.map((simulation) => (
                      <div
                        key={simulation.id}
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => loadSimulation(simulation)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold">{simulation.name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-2 -mt-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteSimulation(simulation)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Inicial:</span>
                            <span>{formatCurrency(simulation.initialAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mensal:</span>
                            <span>{formatCurrency(simulation.monthlyContribution)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taxa:</span>
                            <span>{simulation.interestRate}% a.a.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Período:</span>
                            <span>{simulation.periodMonths} meses</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-muted-foreground">Resultado:</span>
                            <span className="font-semibold text-emerald-600">
                              {simulation.projectedAmount
                                ? formatCurrency(simulation.projectedAmount)
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <PiggyBank className="h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma simulação salva</p>
                    <p className="text-sm mt-1">
                      Crie uma simulação e clique em &quot;Salvar&quot;
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteSimulation}
        onOpenChange={() => setDeleteSimulation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir simulação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deleteSimulation?.name}&quot;? Esta
              ação não pode ser desfeita.
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

