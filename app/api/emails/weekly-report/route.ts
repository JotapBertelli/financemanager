import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { weeklyReportEmail } from '@/lib/email-templates'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret')

    if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        plan: 'PREMIUM',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    let sent = 0
    const errors: string[] = []

    for (const user of users) {
      try {
        const [weeklyExpenses, expensesByCategory, budgets] = await Promise.all([
          prisma.expense.aggregate({
            where: {
              userId: user.id,
              date: { gte: weekStart, lte: weekEnd },
            },
            _sum: { amount: true },
          }),

          prisma.expense.groupBy({
            by: ['categoryId'],
            where: {
              userId: user.id,
              date: { gte: weekStart, lte: weekEnd },
              categoryId: { not: null },
            },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 5,
          }),

          prisma.budget.findMany({
            where: {
              userId: user.id,
              month: now.getMonth() + 1,
              year: now.getFullYear(),
            },
            include: { category: { select: { name: true } } },
          }),
        ])

        const categoryIds = expensesByCategory
          .map((e) => e.categoryId)
          .filter((id): id is string => id !== null)

        const categories = await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })

        const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

        const topCategories = expensesByCategory.map((e) => ({
          name: categoryMap.get(e.categoryId!) || 'Sem categoria',
          amount: e._sum.amount || 0,
        }))

        const monthExpensesByCategory = await prisma.expense.groupBy({
          by: ['categoryId'],
          where: {
            userId: user.id,
            date: { gte: monthStart, lte: monthEnd },
            categoryId: { not: null },
          },
          _sum: { amount: true },
        })

        const monthSpentMap = new Map<string, number>()
        for (const e of monthExpensesByCategory) {
          if (e.categoryId) monthSpentMap.set(e.categoryId, e._sum.amount || 0)
        }

        const budgetAlerts: string[] = []
        for (const budget of budgets) {
          const spent = monthSpentMap.get(budget.categoryId) || 0
          const percentage = (spent / budget.amount) * 100
          if (percentage >= 100) {
            budgetAlerts.push(
              `${budget.category.name}: orçamento excedido (${Math.round(percentage)}% utilizado)`
            )
          } else if (percentage >= 80) {
            budgetAlerts.push(
              `${budget.category.name}: próximo do limite (${Math.round(percentage)}% utilizado)`
            )
          }
        }

        const [userIncome, fixedExpenses, goals] = await Promise.all([
          prisma.income.aggregate({
            where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
            _sum: { amount: true },
          }),
          prisma.fixedExpense.aggregate({
            where: { userId: user.id, isActive: true },
            _sum: { amount: true },
          }),
          prisma.investmentGoal.findMany({
            where: { userId: user.id, isCompleted: false },
          }),
        ])

        const userInfo = await prisma.user.findUnique({
          where: { id: user.id },
          select: { monthlyIncome: true },
        })

        const income = userIncome._sum.amount || userInfo?.monthlyIncome || 0
        const totalMonthExpenses =
          (await prisma.expense.aggregate({
            where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
            _sum: { amount: true },
          }))._sum.amount || 0
        const allExpenses = totalMonthExpenses + (fixedExpenses._sum.amount || 0)

        let score = 0
        if (income > 0) {
          const ratio = allExpenses / income
          if (ratio <= 0.5) score += 25
          else if (ratio <= 0.7) score += 20
          else if (ratio <= 0.85) score += 15
          else if (ratio <= 1) score += 8
        }

        const fixedAmount = fixedExpenses._sum.amount || 0
        if (income > 0) {
          const fixedRatio = fixedAmount / income
          if (fixedRatio <= 0.3) score += 20
          else if (fixedRatio <= 0.5) score += 15
          else if (fixedRatio <= 0.7) score += 8
          else score += 3
        } else {
          score += fixedAmount === 0 ? 20 : 10
        }

        score += 8

        if (goals.length > 0) {
          const progress =
            goals.reduce((acc, g) => acc + Math.min((g.currentAmount / g.targetAmount) * 100, 100), 0) /
            goals.length
          if (progress >= 70) score += 20
          else if (progress >= 40) score += 14
          else if (progress >= 15) score += 8
          else score += 4
        } else {
          score += 5
        }

        if (budgets.length > 0) {
          let within = 0
          for (const b of budgets) {
            if ((monthSpentMap.get(b.categoryId) || 0) <= b.amount) within++
          }
          const withinRatio = within / budgets.length
          if (withinRatio >= 0.9) score += 20
          else if (withinRatio >= 0.7) score += 15
          else if (withinRatio >= 0.5) score += 10
          else score += 4
        } else {
          score += 5
        }

        const emailData = weeklyReportEmail(user.name || 'usuário', {
          totalExpenses: weeklyExpenses._sum.amount || 0,
          topCategories,
          budgetAlerts,
          score: Math.min(score, 100),
        })

        await sendEmail({
          to: user.email,
          subject: emailData.subject,
          html: emailData.html,
        })

        sent++
      } catch (err) {
        console.error(`Erro ao enviar email para ${user.email}:`, err)
        errors.push(user.email)
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Erro no cron de relatório semanal:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
