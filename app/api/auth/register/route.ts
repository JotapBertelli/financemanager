import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validação com Zod
    const validatedData = registerSchema.parse(body)

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await hash(validatedData.password, 12)

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    })

    // Cria categorias padrão para o usuário
    const defaultCategories = [
      { name: 'Alimentação', color: '#ef4444', type: 'EXPENSE' as const },
      { name: 'Transporte', color: '#f59e0b', type: 'EXPENSE' as const },
      { name: 'Moradia', color: '#10b981', type: 'EXPENSE' as const },
      { name: 'Saúde', color: '#06b6d4', type: 'EXPENSE' as const },
      { name: 'Educação', color: '#8b5cf6', type: 'EXPENSE' as const },
      { name: 'Lazer', color: '#ec4899', type: 'EXPENSE' as const },
      { name: 'Compras', color: '#f97316', type: 'EXPENSE' as const },
      { name: 'Outros', color: '#6b7280', type: 'EXPENSE' as const },
    ]

    await prisma.category.createMany({
      data: defaultCategories.map(cat => ({
        ...cat,
        userId: user.id,
      })),
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Conta criada com sucesso!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

