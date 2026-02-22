import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { investmentGoalSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

// GET - Listar metas de investimento
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const goals = await prisma.investmentGoal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isCompleted: 'asc' },
        { priority: 'desc' },
        { deadline: 'asc' },
      ],
    })

    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    console.error('Erro ao buscar metas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar meta de investimento
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Converte a data se for string
    if (typeof body.deadline === 'string') {
      body.deadline = new Date(body.deadline)
    }

    const validatedData = investmentGoalSchema.parse(body)

    const goal = await prisma.investmentGoal.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        isCompleted: validatedData.currentAmount >= validatedData.targetAmount,
      },
    })

    return NextResponse.json(
      { success: true, data: goal },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao criar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

