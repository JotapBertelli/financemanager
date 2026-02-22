import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { investmentSimulationSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { calculateCompoundInterest, calculateSimpleInterest } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET - Listar simulações
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const simulations = await prisma.futureInvestmentSimulation.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: simulations })
  } catch (error) {
    console.error('Erro ao buscar simulações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar simulação
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
    const validatedData = investmentSimulationSchema.parse(body)

    // Calcula o valor projetado
    const projectedAmount = validatedData.interestType === 'COMPOUND'
      ? calculateCompoundInterest(
          validatedData.initialAmount,
          validatedData.monthlyContribution,
          validatedData.interestRate,
          validatedData.periodMonths
        )
      : calculateSimpleInterest(
          validatedData.initialAmount,
          validatedData.monthlyContribution,
          validatedData.interestRate,
          validatedData.periodMonths
        )

    const simulation = await prisma.futureInvestmentSimulation.create({
      data: {
        ...validatedData,
        projectedAmount,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      { success: true, data: simulation },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao criar simulação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

