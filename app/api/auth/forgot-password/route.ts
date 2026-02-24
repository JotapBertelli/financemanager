import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validation = forgotPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email } = validation.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Sempre retorna sucesso para não revelar se o email existe
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link de recuperação.',
      })
    }

    // Invalida tokens anteriores não utilizados
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: { used: true },
    })

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token,
      })
    } catch (emailError) {
      console.error('Erro ao enviar email de recuperação:', emailError)
      return NextResponse.json(
        { error: 'Erro ao enviar email. Verifique a configuração SMTP do servidor.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá um link de recuperação.',
    })
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}
