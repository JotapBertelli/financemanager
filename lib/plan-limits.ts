import { prisma } from './prisma'
import { startOfMonth, endOfMonth } from 'date-fns'

export type Plan = 'FREE' | 'PRO' | 'BUSINESS'

export const PLAN_LIMITS = {
  FREE: {
    maxExpensesPerMonth: 50,
    maxBudgets: 3,
    maxCreditCards: 2,
    maxGoals: 3,
    csvExport: false,
    detailedScore: false,
    receipts: false,
    emailAlerts: false,
  },
  PRO: {
    maxExpensesPerMonth: Infinity,
    maxBudgets: Infinity,
    maxCreditCards: Infinity,
    maxGoals: Infinity,
    csvExport: true,
    detailedScore: true,
    receipts: true,
    emailAlerts: true,
  },
  BUSINESS: {
    maxExpensesPerMonth: Infinity,
    maxBudgets: Infinity,
    maxCreditCards: Infinity,
    maxGoals: Infinity,
    csvExport: true,
    detailedScore: true,
    receipts: true,
    emailAlerts: true,
  },
} as const

export const PLAN_DETAILS = {
  FREE: {
    name: 'Gratuito',
    price: 0,
    description: 'Para começar a organizar suas finanças',
    features: [
      'Até 50 despesas por mês',
      'Até 3 orçamentos',
      'Até 2 cartões de crédito',
      'Até 3 metas',
      'Dashboard básico',
      'Score financeiro resumido',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 19.90,
    description: 'Para quem leva finanças a sério',
    features: [
      'Despesas ilimitadas',
      'Orçamentos ilimitados',
      'Cartões ilimitados',
      'Metas ilimitadas',
      'Exportação CSV',
      'Score financeiro detalhado',
      'Comprovantes em despesas',
      'Alertas por email',
    ],
  },
  BUSINESS: {
    name: 'Business',
    price: 39.90,
    description: 'Para famílias e pequenas equipes',
    features: [
      'Tudo do Pro',
      'Multi-usuário (em breve)',
      'Relatórios avançados (em breve)',
      'Suporte prioritário',
    ],
  },
} as const

export async function getUserPlan(userId: string): Promise<Plan> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })
  return (user?.plan as Plan) || 'FREE'
}

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE
}

export async function checkExpenseLimit(userId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)

  if (limits.maxExpensesPerMonth === Infinity) {
    return { allowed: true, current: 0, limit: Infinity }
  }

  const now = new Date()
  const count = await prisma.expense.count({
    where: {
      userId,
      date: {
        gte: startOfMonth(now),
        lte: endOfMonth(now),
      },
    },
  })

  return {
    allowed: count < limits.maxExpensesPerMonth,
    current: count,
    limit: limits.maxExpensesPerMonth,
  }
}

export async function checkBudgetLimit(userId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)

  if (limits.maxBudgets === Infinity) {
    return { allowed: true, current: 0, limit: Infinity }
  }

  const now = new Date()
  const count = await prisma.budget.count({
    where: {
      userId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  })

  return {
    allowed: count < limits.maxBudgets,
    current: count,
    limit: limits.maxBudgets,
  }
}

export async function checkFeatureAccess(userId: string, feature: keyof typeof PLAN_LIMITS.FREE): Promise<boolean> {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)
  return !!limits[feature]
}
