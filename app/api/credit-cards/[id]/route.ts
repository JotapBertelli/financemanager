import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { creditCardSchema } from '@/lib/validations'
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
      include: {
        expenses: {
          include: { category: true },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!creditCard) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: creditCard })
  } catch (error) {
    console.error('Erro ao buscar cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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

    const existing = await prisma.creditCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = creditCardSchema.parse(body)

    const creditCard = await prisma.creditCard.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({ success: true, data: creditCard })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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

    const existing = await prisma.creditCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    await prisma.creditCard.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Cartão excluído' })
  } catch (error) {
    console.error('Erro ao excluir cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
