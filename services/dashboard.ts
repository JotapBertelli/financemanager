import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function getDashboardData(userId: string) {
  const now = new Date()
  const startDate = startOfMonth(now)
  const endDate = endOfMonth(now)

  // Total de receitas do mês
  const totalIncome = await prisma.income.aggregate({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  })

  // Total de despesas do mês
  const totalExpenses = await prisma.expense.aggregate({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  })

  // Total de gastos fixos ativos
  const fixedExpenses = await prisma.fixedExpense.aggregate({
    where: {
      userId,
      isActive: true,
    },
    _sum: {
      amount: true,
    },
  })

  // Despesas por categoria
  const expensesByCategory = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      categoryId: {
        not: null,
      },
    },
    _sum: {
      amount: true,
    },
  })

  const variableExpenseAmount = totalExpenses._sum.amount || 0
  const fixedExpenseAmount = fixedExpenses._sum.amount || 0
  const totalExpenseAmount = variableExpenseAmount + fixedExpenseAmount

  // Gastos fixos agrupados por categoria
  const fixedByCategory = await prisma.fixedExpense.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      isActive: true,
      categoryId: { not: null },
    },
    _sum: { amount: true },
  })

  const allCategoryIds = [
    ...expensesByCategory.map(e => e.categoryId),
    ...fixedByCategory.map(e => e.categoryId),
  ].filter((id): id is string => id !== null)

  const uniqueCategoryIds = [...new Set(allCategoryIds)]

  const allCategories = await prisma.category.findMany({
    where: { id: { in: uniqueCategoryIds } },
  })

  const categoryTotals = new Map<string, number>()
  for (const exp of expensesByCategory) {
    if (exp.categoryId) {
      categoryTotals.set(exp.categoryId, (categoryTotals.get(exp.categoryId) || 0) + (exp._sum.amount || 0))
    }
  }
  for (const exp of fixedByCategory) {
    if (exp.categoryId) {
      categoryTotals.set(exp.categoryId, (categoryTotals.get(exp.categoryId) || 0) + (exp._sum.amount || 0))
    }
  }

  const categorySummary = Array.from(categoryTotals.entries()).map(([catId, amount]) => {
    const category = allCategories.find(c => c.id === catId)
    return {
      categoryId: catId,
      categoryName: category?.name || 'Sem categoria',
      categoryColor: category?.color || '#6b7280',
      total: amount,
      percentage: totalExpenseAmount > 0 
        ? Math.round((amount / totalExpenseAmount) * 100) 
        : 0,
    }
  }).sort((a, b) => b.total - a.total)

  // Dados mensais dos últimos 6 meses
  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, async (_, i) => {
      const monthDate = subMonths(now, 5 - i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)

      const [income, expenses] = await Promise.all([
        prisma.income.aggregate({
          where: {
            userId,
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: {
            userId,
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { amount: true },
        }),
      ])

      return {
        month: format(monthDate, 'MMM', { locale: ptBR }),
        income: income._sum.amount || 0,
        expenses: (expenses._sum.amount || 0) + fixedExpenseAmount,
      }
    })
  )

  // Últimas transações
  const recentExpenses = await prisma.expense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: 'desc' },
    take: 5,
  })

  const recentIncomes = await prisma.income.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5,
  })

  // Metas de investimento
  const investmentGoals = await prisma.investmentGoal.findMany({
    where: { 
      userId,
      isCompleted: false,
    },
    orderBy: { deadline: 'asc' },
    take: 3,
  })

  // Gastos fixos próximos do vencimento
  const upcomingFixedExpenses = await prisma.fixedExpense.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: { category: true },
    orderBy: { dueDay: 'asc' },
    take: 5,
  })

  return {
    totalIncome: totalIncome._sum.amount || 0,
    totalExpenses: totalExpenseAmount,
    balance: (totalIncome._sum.amount || 0) - totalExpenseAmount,
    totalFixedExpenses: fixedExpenseAmount,
    expensesByCategory: categorySummary,
    monthlyData,
    recentExpenses,
    recentIncomes,
    investmentGoals,
    upcomingFixedExpenses,
  }
}

