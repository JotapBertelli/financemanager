import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const resetSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validation = resetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Link de recuperação inválido ou já utilizado.' },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Este link já foi utilizado. Solicite um novo.' },
        { status: 400 }
      )
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: 'Link expirado. Solicite um novo link de recuperação.' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso!',
    })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}
