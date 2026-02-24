import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { creditCardSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const creditCards = await prisma.creditCard.findMany({
      where: { userId: session.user.id },
      include: {
        expenses: {
          include: { category: true },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: creditCards })
  } catch (error) {
    console.error('Erro ao buscar cartões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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
    const validatedData = creditCardSchema.parse(body)

    const creditCard = await prisma.creditCard.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      { success: true, data: creditCard },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao criar cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
