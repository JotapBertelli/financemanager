import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export const dynamic = 'force-dynamic'

interface ScoreBreakdown {
  label: string
  score: number
  maxScore: number
  status: 'good' | 'warning' | 'bad'
  tip: string
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const startDate = startOfMonth(now)
    const endDate = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    const [
      user,
      currentIncome,
      currentExpenses,
      fixedExpenses,
      lastMonthExpenses,
      goals,
      budgets,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { monthlyIncome: true },
      }),
      prisma.income.aggregate({
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.fixedExpense.aggregate({
        where: { userId, isActive: true },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      prisma.investmentGoal.findMany({
        where: { userId, isCompleted: false },
      }),
      prisma.budget.findMany({
        where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
      }),
    ])

    const income = currentIncome._sum.amount || user?.monthlyIncome || 0
    const expenses = (currentExpenses._sum.amount || 0) + (fixedExpenses._sum.amount || 0)
    const lastExpenses = (lastMonthExpenses._sum.amount || 0) + (fixedExpenses._sum.amount || 0)

    const breakdown: ScoreBreakdown[] = []

    // 1. Razão gastos/receita (0-25 pontos)
    let ratioScore = 0
    let ratioStatus: 'good' | 'warning' | 'bad' = 'bad'
    let ratioTip = ''
    if (income > 0) {
      const ratio = expenses / income
      if (ratio <= 0.5) { ratioScore = 25; ratioStatus = 'good'; ratioTip = 'Excelente! Você gasta menos da metade da sua renda.' }
      else if (ratio <= 0.7) { ratioScore = 20; ratioStatus = 'good'; ratioTip = 'Bom controle de gastos em relação à renda.' }
      else if (ratio <= 0.85) { ratioScore = 15; ratioStatus = 'warning'; ratioTip = 'Atenção: seus gastos estão altos em relação à renda.' }
      else if (ratio <= 1) { ratioScore = 8; ratioStatus = 'warning'; ratioTip = 'Cuidado! Você está gastando quase tudo que ganha.' }
      else { ratioScore = 0; ratioStatus = 'bad'; ratioTip = 'Seus gastos ultrapassam sua renda. Revise urgentemente.' }
    } else {
      ratioTip = 'Cadastre sua renda para uma análise mais precisa.'
    }
    breakdown.push({ label: 'Gastos vs Receita', score: ratioScore, maxScore: 25, status: ratioStatus, tip: ratioTip })

    // 2. Controle de gastos fixos (0-20 pontos)
    let fixedScore = 0
    let fixedStatus: 'good' | 'warning' | 'bad' = 'bad'
    let fixedTip = ''
    const fixedAmount = fixedExpenses._sum.amount || 0
    if (income > 0) {
      const fixedRatio = fixedAmount / income
      if (fixedRatio <= 0.3) { fixedScore = 20; fixedStatus = 'good'; fixedTip = 'Seus gastos fixos estão bem controlados.' }
      else if (fixedRatio <= 0.5) { fixedScore = 15; fixedStatus = 'good'; fixedTip = 'Gastos fixos em nível aceitável.' }
      else if (fixedRatio <= 0.7) { fixedScore = 8; fixedStatus = 'warning'; fixedTip = 'Gastos fixos comprometem boa parte da renda.' }
      else { fixedScore = 3; fixedStatus = 'bad'; fixedTip = 'Gastos fixos muito altos. Tente renegociar contratos.' }
    } else {
      fixedScore = fixedAmount === 0 ? 20 : 10
      fixedStatus = fixedAmount === 0 ? 'good' : 'warning'
      fixedTip = 'Cadastre sua renda para uma análise mais precisa.'
    }
    breakdown.push({ label: 'Gastos Fixos', score: fixedScore, maxScore: 20, status: fixedStatus, tip: fixedTip })

    // 3. Tendência de gastos mês a mês (0-15 pontos)
    let trendScore = 0
    let trendStatus: 'good' | 'warning' | 'bad' = 'warning'
    let trendTip = ''
    if (lastExpenses > 0 && expenses > 0) {
      const change = ((expenses - lastExpenses) / lastExpenses) * 100
      if (change <= -10) { trendScore = 15; trendStatus = 'good'; trendTip = `Ótimo! Seus gastos diminuíram ${Math.abs(Math.round(change))}% em relação ao mês passado.` }
      else if (change <= 0) { trendScore = 12; trendStatus = 'good'; trendTip = 'Seus gastos estão estáveis ou em queda.' }
      else if (change <= 10) { trendScore = 8; trendStatus = 'warning'; trendTip = `Seus gastos aumentaram ${Math.round(change)}% em relação ao mês passado.` }
      else { trendScore = 3; trendStatus = 'bad'; trendTip = `Alerta: gastos subiram ${Math.round(change)}% em relação ao mês passado.` }
    } else {
      trendScore = 8
      trendTip = 'Continue registrando para acompanhar a tendência.'
    }
    breakdown.push({ label: 'Tendência Mensal', score: trendScore, maxScore: 15, status: trendStatus, tip: trendTip })

    // 4. Metas de investimento (0-20 pontos)
    let goalsScore = 0
    let goalsStatus: 'good' | 'warning' | 'bad' = 'warning'
    let goalsTip = ''
    if (goals.length > 0) {
      const totalProgress = goals.reduce((acc, g) => {
        return acc + Math.min((g.currentAmount / g.targetAmount) * 100, 100)
      }, 0) / goals.length
      if (totalProgress >= 70) { goalsScore = 20; goalsStatus = 'good'; goalsTip = 'Suas metas estão bem encaminhadas!' }
      else if (totalProgress >= 40) { goalsScore = 14; goalsStatus = 'good'; goalsTip = 'Bom progresso nas metas. Continue assim!' }
      else if (totalProgress >= 15) { goalsScore = 8; goalsStatus = 'warning'; goalsTip = 'Aumente os aportes para atingir suas metas no prazo.' }
      else { goalsScore = 4; goalsStatus = 'bad'; goalsTip = 'Suas metas precisam de mais atenção e aportes.' }
    } else {
      goalsScore = 5
      goalsTip = 'Defina metas financeiras para melhorar seu score.'
    }
    breakdown.push({ label: 'Metas de Investimento', score: goalsScore, maxScore: 20, status: goalsStatus, tip: goalsTip })

    // 5. Uso de orçamento (0-20 pontos)
    let budgetScore = 0
    let budgetStatus: 'good' | 'warning' | 'bad' = 'warning'
    let budgetTip = ''
    if (budgets.length > 0) {
      const expensesByCategory = await prisma.expense.groupBy({
        by: ['categoryId'],
        where: { userId, date: { gte: startDate, lte: endDate }, categoryId: { not: null } },
        _sum: { amount: true },
      })
      const spentMap = new Map<string, number>()
      for (const e of expensesByCategory) {
        if (e.categoryId) spentMap.set(e.categoryId, e._sum.amount || 0)
      }
      let withinBudget = 0
      for (const b of budgets) {
        const spent = spentMap.get(b.categoryId) || 0
        if (spent <= b.amount) withinBudget++
      }
      const withinRatio = withinBudget / budgets.length
      if (withinRatio >= 0.9) { budgetScore = 20; budgetStatus = 'good'; budgetTip = 'Parabéns! Quase todos os orçamentos estão dentro do limite.' }
      else if (withinRatio >= 0.7) { budgetScore = 15; budgetStatus = 'good'; budgetTip = 'A maioria dos orçamentos está sob controle.' }
      else if (withinRatio >= 0.5) { budgetScore = 10; budgetStatus = 'warning'; budgetTip = 'Alguns orçamentos estão estourados. Revise seus gastos.' }
      else { budgetScore = 4; budgetStatus = 'bad'; budgetTip = 'A maioria dos orçamentos foi ultrapassada.' }
    } else {
      budgetScore = 5
      budgetTip = 'Crie orçamentos por categoria para melhorar seu score.'
    }
    breakdown.push({ label: 'Controle de Orçamento', score: budgetScore, maxScore: 20, status: budgetStatus, tip: budgetTip })

    const totalScore = breakdown.reduce((acc, b) => acc + b.score, 0)

    let overallStatus: 'good' | 'warning' | 'bad' = 'bad'
    let overallLabel = ''
    if (totalScore >= 80) { overallStatus = 'good'; overallLabel = 'Excelente' }
    else if (totalScore >= 60) { overallStatus = 'good'; overallLabel = 'Bom' }
    else if (totalScore >= 40) { overallStatus = 'warning'; overallLabel = 'Regular' }
    else if (totalScore >= 20) { overallStatus = 'warning'; overallLabel = 'Ruim' }
    else { overallStatus = 'bad'; overallLabel = 'Crítico' }

    return NextResponse.json({
      success: true,
      data: {
        score: totalScore,
        maxScore: 100,
        status: overallStatus,
        label: overallLabel,
        breakdown,
        summary: {
          income,
          expenses,
          balance: income - expenses,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao calcular score financeiro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
