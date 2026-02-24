import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { creditCardExpenseSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const existing = await prisma.creditCardExpense.findFirst({
      where: {
        id: params.expenseId,
        creditCardId: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()

    if (typeof body.date === 'string') {
      body.date = new Date(body.date)
    }

    body.creditCardId = params.id

    const validatedData = creditCardExpenseSchema.parse(body)

    const expense = await prisma.creditCardExpense.update({
      where: { id: params.expenseId },
      data: validatedData,
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: expense })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar despesa do cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const existing = await prisma.creditCardExpense.findFirst({
      where: {
        id: params.expenseId,
        creditCardId: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    await prisma.creditCardExpense.delete({
      where: { id: params.expenseId },
    })

    return NextResponse.json({ success: true, message: 'Despesa excluída' })
  } catch (error) {
    console.error('Erro ao excluir despesa do cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
