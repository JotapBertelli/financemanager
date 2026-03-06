import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentClient } from '@/lib/mercadopago'
import { addMonths } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'ID ausente' }, { status: 400 })
    }

    const mpPayment = await paymentClient.get({ id: paymentId })

    const externalId = String(mpPayment.id)
    const status = mpPayment.status

    const payment = await prisma.payment.findUnique({
      where: { externalId },
    })

    if (!payment) {
      return NextResponse.json({ received: true })
    }

    if (status === 'approved' && payment.status !== 'approved') {
      const now = new Date()

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'approved', paidAt: now },
      })

      await prisma.user.update({
        where: { id: payment.userId },
        data: { plan: payment.plan },
      })

      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          plan: payment.plan,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: addMonths(now, 1),
          lastPaymentId: payment.id,
        },
        update: {
          plan: payment.plan,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: addMonths(now, 1),
          lastPaymentId: payment.id,
        },
      })
    } else if (['rejected', 'cancelled', 'refunded'].includes(status || '')) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: status || 'rejected' },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[MP_WEBHOOK_ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook.' },
      { status: 500 }
    )
  }
}
