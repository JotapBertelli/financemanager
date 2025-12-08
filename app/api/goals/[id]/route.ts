import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { investmentGoalSchema } from '@/lib/validations'
import { ZodError } from 'zod'

// GET - Buscar meta por ID
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

    const goal = await prisma.investmentGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!goal) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error('Erro ao buscar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar meta
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

    const existing = await prisma.investmentGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Converte a data se for string
    if (typeof body.deadline === 'string') {
      body.deadline = new Date(body.deadline)
    }

    const validatedData = investmentGoalSchema.parse(body)

    const goal = await prisma.investmentGoal.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        isCompleted: validatedData.currentAmount >= validatedData.targetAmount,
      },
    })

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir meta
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

    const existing = await prisma.investmentGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    await prisma.investmentGoal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Meta excluída' })
  } catch (error) {
    console.error('Erro ao excluir meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

