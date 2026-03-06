import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadReceipt } from '@/lib/storage'
import { checkFeatureAccess } from '@/lib/plan-limits'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const hasAccess = await checkFeatureAccess(session.user.id, 'receipts')
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Comprovantes disponíveis apenas nos planos Pro e Business' },
        { status: 403 }
      )
    }

    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: 'Imagem é obrigatória' }, { status: 400 })
    }

    const sizeInBytes = Buffer.from(image.split(',')[1] || '', 'base64').length
    if (sizeInBytes > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem deve ter no máximo 5MB' }, { status: 400 })
    }

    const key = await uploadReceipt(image, session.user.id)
    return NextResponse.json({ success: true, key })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
