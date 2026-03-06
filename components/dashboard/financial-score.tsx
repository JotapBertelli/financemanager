"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ScoreBreakdown {
  label: string
  score: number
  maxScore: number
  status: "good" | "warning" | "bad"
  tip: string
}

interface ScoreData {
  score: number
  maxScore: number
  status: "good" | "warning" | "bad"
  label: string
  breakdown: ScoreBreakdown[]
}

const statusColors = {
  good: "text-emerald-500",
  warning: "text-amber-500",
  bad: "text-red-500",
}

const statusBg = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  bad: "bg-red-500",
}

const statusProgressColor = {
  good: "[&>div]:bg-emerald-500",
  warning: "[&>div]:bg-amber-500",
  bad: "[&>div]:bg-red-500",
}

const statusIcon = {
  good: TrendingUp,
  warning: Minus,
  bad: TrendingDown,
}

export function FinancialScore() {
  const [data, setData] = useState<ScoreData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const fetchScore = useCallback(async () => {
    try {
      const response = await fetch("/api/financial-score")
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error("Erro ao buscar score:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScore()
  }, [fetchScore])

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const StatusIcon = statusIcon[data.status]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-500" />
            Saúde Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score circle */}
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.score / data.maxScore) * 264} 264`}
                  className={statusColors[data.status]}
                  stroke="currentColor"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-2xl font-bold", statusColors[data.status])}>
                  {data.score}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-5 w-5", statusColors[data.status])} />
                <span className={cn("text-lg font-bold", statusColors[data.status])}>
                  {data.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Score baseado em 5 critérios financeiros
              </p>
            </div>
          </div>

          {/* Breakdown toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {expanded ? "Ocultar detalhes" : "Ver detalhes"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {/* Breakdown */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-1"
            >
              {data.breakdown.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{item.label}</span>
                    <span className={cn("font-bold", statusColors[item.status])}>
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                  <Progress
                    value={(item.score / item.maxScore) * 100}
                    className={cn("h-1.5", statusProgressColor[item.status])}
                  />
                  <p className="text-[11px] text-muted-foreground">{item.tip}</p>
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>

        <div className={cn("h-1", statusBg[data.status])} />
      </Card>
    </motion.div>
  )
}
