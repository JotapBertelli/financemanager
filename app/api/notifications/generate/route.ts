import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, startOfDay, subHours } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const today = now.getDate()
    const recentCutoff = subHours(now, 12)

    const created: string[] = []

    // --- 1. Orçamentos estourados ou perto do limite ---
    const budgets = await prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      include: { category: true },
    })

    if (budgets.length > 0) {
      const startDate = startOfMonth(now)
      const endDate = endOfMonth(now)

      const expenses = await prisma.expense.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
          categoryId: { not: null },
        },
        _sum: { amount: true },
      })

      const fixedExpenses = await prisma.fixedExpense.groupBy({
        by: ['categoryId'],
        where: { userId, isActive: true, categoryId: { not: null } },
        _sum: { amount: true },
      })

      const spentMap = new Map<string, number>()
      for (const e of expenses) {
        if (e.categoryId) spentMap.set(e.categoryId, (spentMap.get(e.categoryId) || 0) + (e._sum.amount || 0))
      }
      for (const e of fixedExpenses) {
        if (e.categoryId) spentMap.set(e.categoryId, (spentMap.get(e.categoryId) || 0) + (e._sum.amount || 0))
      }

      for (const budget of budgets) {
        const spent = spentMap.get(budget.categoryId) || 0
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

        if (percentage >= 100) {
          const existing = await prisma.notification.findFirst({
            where: {
              userId,
              type: 'BUDGET_EXCEEDED',
              data: budget.categoryId,
              createdAt: { gte: startDate },
            },
          })
          if (!existing) {
            await prisma.notification.create({
              data: {
                userId,
                type: 'BUDGET_EXCEEDED',
                title: `Orçamento estourado: ${budget.category.name}`,
                message: `Você gastou R$ ${spent.toFixed(2)} de R$ ${budget.amount.toFixed(2)} em ${budget.category.name} este mês.`,
                data: budget.categoryId,
              },
            })
            created.push('BUDGET_EXCEEDED:' + budget.category.name)
          }
        } else if (percentage >= 80) {
          const existing = await prisma.notification.findFirst({
            where: {
              userId,
              type: 'BUDGET_WARNING',
              data: budget.categoryId,
              createdAt: { gte: startDate },
            },
          })
          if (!existing) {
            await prisma.notification.create({
              data: {
                userId,
                type: 'BUDGET_WARNING',
                title: `Orçamento quase no limite: ${budget.category.name}`,
                message: `Você já usou ${Math.round(percentage)}% do orçamento de ${budget.category.name} (R$ ${spent.toFixed(2)} de R$ ${budget.amount.toFixed(2)}).`,
                data: budget.categoryId,
              },
            })
            created.push('BUDGET_WARNING:' + budget.category.name)
          }
        }
      }
    }

    // --- 2. Gastos fixos com vencimento próximo (nos próximos 3 dias) ---
    const upcomingDays = [today, today + 1, today + 2, today + 3].map(d => d > 31 ? d - 31 : d)

    const upcomingFixed = await prisma.fixedExpense.findMany({
      where: {
        userId,
        isActive: true,
        dueDay: { in: upcomingDays },
      },
    })

    for (const expense of upcomingFixed) {
      const daysUntil = expense.dueDay >= today
        ? expense.dueDay - today
        : 31 - today + expense.dueDay

      if (daysUntil <= 3) {
        const todayStart = startOfDay(now)
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'DUE_DATE',
            data: expense.id,
            createdAt: { gte: todayStart },
          },
        })

        if (!existing) {
          const dueText = daysUntil === 0
            ? 'vence hoje'
            : daysUntil === 1
              ? 'vence amanhã'
              : `vence em ${daysUntil} dias`

          await prisma.notification.create({
            data: {
              userId,
              type: 'DUE_DATE',
              title: `${expense.name} ${dueText}`,
              message: `Seu gasto fixo "${expense.name}" de R$ ${expense.amount.toFixed(2)} ${dueText} (dia ${expense.dueDay}).`,
              data: expense.id,
            },
          })
          created.push('DUE_DATE:' + expense.name)
        }
      }
    }

    // --- 3. Metas atingidas ---
    const goals = await prisma.investmentGoal.findMany({
      where: { userId, isCompleted: false },
    })

    for (const goal of goals) {
      if (goal.currentAmount >= goal.targetAmount) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'GOAL_REACHED',
            data: goal.id,
            createdAt: { gte: recentCutoff },
          },
        })

        if (!existing) {
          await prisma.notification.create({
            data: {
              userId,
              type: 'GOAL_REACHED',
              title: `Meta atingida: ${goal.name}`,
              message: `Parabéns! Você atingiu sua meta "${goal.name}" de R$ ${goal.targetAmount.toFixed(2)}.`,
              data: goal.id,
            },
          })
          created.push('GOAL_REACHED:' + goal.name)
        }
      }
    }

    return NextResponse.json({ success: true, created })
  } catch (error) {
    console.error('Erro ao gerar notificações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
