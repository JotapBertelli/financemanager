import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { creditCardExpenseSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const creditCard = await prisma.creditCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!creditCard) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    const expenses = await prisma.creditCardExpense.findMany({
      where: {
        creditCardId: params.id,
        userId: session.user.id,
      },
      include: { category: true },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ success: true, data: expenses })
  } catch (error) {
    console.error('Erro ao buscar despesas do cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const creditCard = await prisma.creditCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!creditCard) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()

    if (typeof body.date === 'string') {
      body.date = new Date(body.date)
    }

    body.creditCardId = params.id

    const validatedData = creditCardExpenseSchema.parse(body)

    const expense = await prisma.creditCardExpense.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: { category: true },
    })

    return NextResponse.json(
      { success: true, data: expense },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao criar despesa do cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
