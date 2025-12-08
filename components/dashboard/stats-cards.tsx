"use client"

import { motion } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  totalIncome: number
  totalExpenses: number
  balance: number
  totalFixedExpenses: number
}

export function StatsCards({
  totalIncome,
  totalExpenses,
  balance,
  totalFixedExpenses,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Receitas",
      value: totalIncome,
      icon: TrendingUp,
      trend: "+12%",
      trendUp: true,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Despesas",
      value: totalExpenses,
      icon: TrendingDown,
      trend: "-5%",
      trendUp: false,
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-500/10 to-red-600/5",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600",
    },
    {
      title: "Saldo",
      value: balance,
      icon: Wallet,
      trend: balance >= 0 ? "+8%" : "-3%",
      trendUp: balance >= 0,
      gradient: "from-violet-500 to-violet-600",
      bgGradient: "from-violet-500/10 to-violet-600/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      title: "Gastos Fixos",
      value: totalFixedExpenses,
      icon: Receipt,
      trend: "Mensal",
      trendUp: null,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-500/10 to-amber-600/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <motion.div key={stat.title} variants={item}>
          <Card className={cn(
            "relative overflow-hidden border-0 shadow-lg",
            `bg-gradient-to-br ${stat.bgGradient}`
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  stat.iconBg
                )}>
                  <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
                </div>
                {stat.trendUp !== null && (
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                    stat.trendUp 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.trend}
                  </div>
                )}
                {stat.trendUp === null && (
                  <div className="rounded-full px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={cn(
                  "text-2xl font-bold mt-1",
                  index === 2 && balance < 0 && "text-red-600"
                )}>
                  {formatCurrency(stat.value)}
                </p>
              </div>
            </CardContent>
            {/* Decorative gradient line */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
              stat.gradient
            )} />
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

