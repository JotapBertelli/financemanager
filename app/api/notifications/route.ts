import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    })

    return NextResponse.json({ success: true, data: { notifications, unreadCount } })
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, markAllRead } = body

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'ID ou markAllRead é obrigatório' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
