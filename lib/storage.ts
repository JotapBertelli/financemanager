import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET_NAME!

export async function uploadReceipt(base64Data: string, userId: string): Promise<string> {
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) throw new Error('Formato de imagem inválido')

  const extension = matches[1]
  const buffer = Buffer.from(matches[2], 'base64')
  const key = `receipts/${userId}/${randomUUID()}.${extension}`

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: `image/${extension}`,
  }))

  return key
}

export async function getReceiptUrl(key: string): Promise<string> {
  if (key.startsWith('data:')) return key

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return getSignedUrl(s3, command, { expiresIn: 3600 })
}

export async function deleteReceipt(key: string): Promise<void> {
  if (key.startsWith('data:')) return

  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }))
}
