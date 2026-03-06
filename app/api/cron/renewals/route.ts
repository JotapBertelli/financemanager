import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentClient } from '@/lib/mercadopago'
import { PLAN_DETAILS } from '@/lib/plan-limits'
import { addMonths, addDays } from 'date-fns'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cronSecret = request.headers.get('x-cron-secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const now = new Date()
    const tomorrow = addDays(now, 1)

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: { lte: tomorrow },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    })

    let renewedCount = 0
    let downgradeCount = 0

    for (const sub of expiringSubscriptions) {
      const gracePeriodEnd = addDays(sub.currentPeriodEnd, 3)

      if (now > gracePeriodEnd) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'expired' },
        })
        await prisma.user.update({
          where: { id: sub.userId },
          data: { plan: 'FREE' },
        })
        downgradeCount++
        continue
      }

      const existingRenewal = await prisma.payment.findFirst({
        where: {
          userId: sub.userId,
          plan: sub.plan,
          status: 'pending',
          expiresAt: { gt: now },
        },
      })

      if (existingRenewal) continue

      const planDetails = PLAN_DETAILS[sub.plan as keyof typeof PLAN_DETAILS]
      if (!planDetails || planDetails.price === 0) continue

      const expiresAt = addDays(now, 3)

      try {
        const mpPayment = await paymentClient.create({
          body: {
            transaction_amount: planDetails.price,
            description: `FinanceApp - Renovação ${planDetails.name}`,
            payment_method_id: 'pix',
            payer: { email: sub.user.email },
            date_of_expiration: expiresAt.toISOString(),
            metadata: {
              userId: sub.userId,
              plan: sub.plan,
              type: 'renewal',
            },
          },
        })

        const pixData = mpPayment.point_of_interaction?.transaction_data

        await prisma.payment.create({
          data: {
            externalId: String(mpPayment.id),
            userId: sub.userId,
            amount: planDetails.price,
            plan: sub.plan,
            status: 'pending',
            pixQrCode: pixData?.qr_code_base64 || null,
            pixQrCodeText: pixData?.qr_code || null,
            expiresAt,
          },
        })

        const appUrl = process.env.NEXTAUTH_URL || 'https://financeapp.com'

        await sendEmail({
          to: sub.user.email,
          subject: `FinanceApp - Renovação do plano ${planDetails.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a14; color: #e5e7eb; padding: 32px; border-radius: 12px;">
              <h1 style="color: #7c3aed; margin-bottom: 16px;">FinanceApp</h1>
              <p>Olá ${sub.user.name || 'usuário'},</p>
              <p>Sua assinatura do plano <strong>${planDetails.name}</strong> está vencendo. Para continuar aproveitando todos os recursos, realize o pagamento via PIX:</p>
              <p style="font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 24px 0;">
                R$ ${planDetails.price.toFixed(2).replace('.', ',')}
              </p>
              ${pixData?.qr_code ? `<p style="text-align: center; font-size: 12px; word-break: break-all; background: #1a1a2e; padding: 12px; border-radius: 8px; color: #9ca3af;">${pixData.qr_code}</p>` : ''}
              <p style="text-align: center; margin-top: 24px;">
                <a href="${appUrl}/dashboard" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Acessar FinanceApp</a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">Você tem até 3 dias para realizar o pagamento. Após esse prazo, seu plano será revertido para o Gratuito.</p>
            </div>
          `,
        })

        renewedCount++
      } catch (err) {
        console.error(`[RENEWAL_ERROR] userId=${sub.userId}`, err)
      }
    }

    return NextResponse.json({
      processed: expiringSubscriptions.length,
      renewed: renewedCount,
      downgraded: downgradeCount,
    })
  } catch (error) {
    console.error('[CRON_RENEWALS_ERROR]', error)
    return NextResponse.json({ error: 'Erro no cron' }, { status: 500 })
  }
}
