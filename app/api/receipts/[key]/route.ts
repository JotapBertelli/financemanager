import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReceiptUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { key: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const key = decodeURIComponent(params.key)
    const url = await getReceiptUrl(key)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Erro ao buscar comprovante:', error)
    return NextResponse.json({ error: 'Erro ao buscar comprovante' }, { status: 500 })
  }
}
