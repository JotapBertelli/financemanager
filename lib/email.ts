import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendResetEmailParams {
  to: string
  name: string | null
  token: string
}

export async function sendPasswordResetEmail({ to, name, token }: SendResetEmailParams) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`
  const displayName = name || 'usuário'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
        
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700;">
            Recuperação de Senha
          </h1>
        </div>
        
        <div style="padding: 40px 32px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
            Olá, <strong>${displayName}</strong>!
          </p>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
            Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
              Redefinir minha senha
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
            Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição, ignore este email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
            Se o botão não funcionar, copie e cole este link no navegador:<br/>
            <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px 32px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Assistente Financeiro &mdash; Gestão financeira pessoal
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"Assistente Financeiro" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Redefinição de senha - Assistente Financeiro',
    html,
  })
}
