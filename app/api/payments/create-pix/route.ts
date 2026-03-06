import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { paymentClient } from '@/lib/mercadopago'
import { PLAN_DETAILS } from '@/lib/plan-limits'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Você precisa estar autenticado.' },
        { status: 401 }
      )
    }

    const { plan } = await request.json()

    if (!plan || !['PRO', 'BUSINESS'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      )
    }

    const planDetails = PLAN_DETAILS[plan as keyof typeof PLAN_DETAILS]
    const amount = planDetails.price
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    const mpPayment = await paymentClient.create({
      body: {
        transaction_amount: amount,
        description: `FinanceApp - Plano ${planDetails.name} (mensal)`,
        payment_method_id: 'pix',
        payer: {
          email: user.email,
          first_name: user.name || undefined,
        },
        date_of_expiration: expiresAt.toISOString(),
        metadata: {
          userId: user.id,
          plan,
        },
      },
    })

    const pixData = mpPayment.point_of_interaction?.transaction_data

    const payment = await prisma.payment.create({
      data: {
        externalId: String(mpPayment.id),
        userId: user.id,
        amount,
        plan,
        status: 'pending',
        pixQrCode: pixData?.qr_code_base64 || null,
        pixQrCodeText: pixData?.qr_code || null,
        expiresAt,
      },
    })

    return NextResponse.json({
      paymentId: payment.id,
      qrCode: pixData?.qr_code_base64,
      qrCodeText: pixData?.qr_code,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('[PIX_CREATE_ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao criar pagamento PIX.' },
      { status: 500 }
    )
  }
}
