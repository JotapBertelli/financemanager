import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fixedExpenseSchema } from '@/lib/validations'
import { ZodError } from 'zod'

// GET - Buscar gasto fixo por ID
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

    const fixedExpense = await prisma.fixedExpense.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    if (!fixedExpense) {
      return NextResponse.json(
        { error: 'Gasto fixo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: fixedExpense })
  } catch (error) {
    console.error('Erro ao buscar gasto fixo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar gasto fixo
export async function PUT(
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

    const existing = await prisma.fixedExpense.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Gasto fixo não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = fixedExpenseSchema.parse(body)

    const fixedExpense = await prisma.fixedExpense.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: fixedExpense })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar gasto fixo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Marcar como pago/não pago
export async function PATCH(
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

    const existing = await prisma.fixedExpense.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Gasto fixo não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { markAsPaid } = body

    const fixedExpense = await prisma.fixedExpense.update({
      where: { id: params.id },
      data: {
        lastPaidAt: markAsPaid ? new Date() : null,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: fixedExpense })
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir gasto fixo
export async function DELETE(
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

    const existing = await prisma.fixedExpense.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Gasto fixo não encontrado' },
        { status: 404 }
      )
    }

    await prisma.fixedExpense.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Gasto fixo excluído' })
  } catch (error) {
    console.error('Erro ao excluir gasto fixo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

