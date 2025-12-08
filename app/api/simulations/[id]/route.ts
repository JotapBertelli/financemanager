import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Excluir simulação
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

    const existing = await prisma.futureInvestmentSimulation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Simulação não encontrada' },
        { status: 404 }
      )
    }

    await prisma.futureInvestmentSimulation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Simulação excluída' })
  } catch (error) {
    console.error('Erro ao excluir simulação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

