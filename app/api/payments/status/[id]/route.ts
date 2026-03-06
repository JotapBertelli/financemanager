import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { paymentClient } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
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

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    })

    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado.' },
        { status: 404 }
      )
    }

    if (payment.status === 'pending') {
      try {
        const mpPayment = await paymentClient.get({
          id: Number(payment.externalId),
        })

        if (mpPayment.status === 'approved') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'approved', paidAt: new Date() },
          })

          return NextResponse.json({
            status: 'approved',
            plan: payment.plan,
          })
        }

        if (['rejected', 'cancelled'].includes(mpPayment.status || '')) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: mpPayment.status || 'rejected' },
          })

          return NextResponse.json({
            status: mpPayment.status,
            plan: payment.plan,
          })
        }
      } catch {
        // Fallback to local status if MP API fails
      }
    }

    return NextResponse.json({
      status: payment.status,
      plan: payment.plan,
    })
  } catch (error) {
    console.error('[PAYMENT_STATUS_ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao consultar pagamento.' },
      { status: 500 }
    )
  }
}
