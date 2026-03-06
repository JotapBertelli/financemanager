import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (admin?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Total users
    const totalUsers = await prisma.user.count()

    // New users this month
    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    })

    // New users last month (for comparison)
    const newUsersLastMonth = await prisma.user.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    })

    // Users by plan
    const usersByPlan = await prisma.user.groupBy({
      by: ['plan'],
      _count: { id: true },
    })

    // Active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' },
    })

    // MRR (Monthly Recurring Revenue) - calculated from active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      select: { plan: true },
    })

    let mrr = 0
    for (const sub of subscriptions) {
      if (sub.plan === 'PRO') {
        mrr += 19.9
      } else if (sub.plan === 'BUSINESS') {
        mrr += 39.9
      }
    }

    // Recent signups (last 10)
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    })

    // Churn: subscriptions canceled this month
    const churnedThisMonth = await prisma.subscription.count({
      where: {
        status: 'canceled',
        updatedAt: { gte: startOfMonth },
      },
    })

    // Signups over last 6 months (for chart)
    const signupsByMonth = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const count = await prisma.user.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      })
      signupsByMonth.push({
        month: monthStart.toLocaleDateString('pt-BR', {
          month: 'short',
          year: '2-digit',
        }),
        count,
      })
    }

    // Revenue by month (last 6 months) - from approved payments
    const revenueByMonth = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const payments = await prisma.payment.aggregate({
        where: {
          status: 'approved',
          paidAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      })
      revenueByMonth.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        revenue: payments._sum.amount || 0,
      })
    }

    return NextResponse.json({
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      usersByPlan: usersByPlan.reduce(
        (acc, item) => {
          acc[item.plan] = item._count.id
          return acc
        },
        {} as Record<string, number>
      ),
      activeSubscriptions,
      mrr,
      recentUsers,
      churnedThisMonth,
      signupsByMonth,
      revenueByMonth,
    })
  } catch (error) {
    console.error('Erro admin stats:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
