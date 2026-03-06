import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id, month, year },
      include: { category: true },
      orderBy: { category: { name: 'asc' } },
    })

    const now = new Date(year, month - 1)
    const startDate = startOfMonth(now)
    const endDate = endOfMonth(now)

    const expensesByCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
        categoryId: { not: null },
      },
      _sum: { amount: true },
    })

    const fixedByCategory = await prisma.fixedExpense.groupBy({
      by: ['categoryId'],
      where: {
        userId: session.user.id,
        isActive: true,
        categoryId: { not: null },
      },
      _sum: { amount: true },
    })

    const spentMap = new Map<string, number>()
    for (const e of expensesByCategory) {
      if (e.categoryId) {
        spentMap.set(e.categoryId, (spentMap.get(e.categoryId) || 0) + (e._sum.amount || 0))
      }
    }
    for (const e of fixedByCategory) {
      if (e.categoryId) {
        spentMap.set(e.categoryId, (spentMap.get(e.categoryId) || 0) + (e._sum.amount || 0))
      }
    }

    const data = budgets.map((budget) => ({
      id: budget.id,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      categoryId: budget.categoryId,
      category: {
        id: budget.category.id,
        name: budget.category.name,
        color: budget.category.color,
      },
      spent: spentMap.get(budget.categoryId) || 0,
      percentage: budget.amount > 0
        ? Math.round(((spentMap.get(budget.categoryId) || 0) / budget.amount) * 100)
        : 0,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryId, amount, month, year } = body

    if (!categoryId || !amount || !month || !year) {
      return NextResponse.json({ error: 'Campos obrigatórios: categoryId, amount, month, year' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'O valor deve ser positivo' }, { status: 400 })
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: session.user.id },
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId,
          month,
          year,
        },
      },
      update: { amount },
      create: {
        userId: session.user.id,
        categoryId,
        amount,
        month,
        year,
      },
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: budget }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar/atualizar orçamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    await prisma.budget.deleteMany({
      where: { id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
