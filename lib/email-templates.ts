function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinanceApp</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">

    <div style="text-align: center; padding: 32px 0 24px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); padding: 12px 28px; border-radius: 12px;">
        <span style="color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">FinanceApp</span>
      </div>
    </div>

    <div style="background: #13131f; border: 1px solid #1e1e2e; border-radius: 16px; overflow: hidden;">
      ${content}
    </div>

    <div style="text-align: center; padding: 24px 16px 0;">
      <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 8px;">
        &copy; 2026 FinanceApp. Todos os direitos reservados.
      </p>
      <p style="color: #4b5563; font-size: 11px; line-height: 1.5; margin: 0;">
        Você recebeu este email porque possui uma conta no FinanceApp.<br/>
        Para deixar de receber, ajuste suas preferências de notificação nas configurações da conta.
      </p>
    </div>

  </div>
</body>
</html>`
}

function heading(text: string): string {
  return `<div style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700;">${text}</h1>
  </div>`
}

function body(content: string): string {
  return `<div style="padding: 32px;">${content}</div>`
}

function greeting(userName: string): string {
  return `<p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
    Olá, <strong style="color: #ffffff;">${userName}</strong>!
  </p>`
}

function button(text: string, url: string): string {
  return `<div style="text-align: center; margin: 28px 0;">
    <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
      ${text}
    </a>
  </div>`
}

export function welcomeEmail(userName: string): { subject: string; html: string } {
  const html = layout(`
    ${heading('Bem-vindo ao FinanceApp! 🎉')}
    ${body(`
      ${greeting(userName)}
      <p style="color: #9ca3af; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
        Estamos muito felizes em ter você conosco! O FinanceApp vai te ajudar a organizar suas finanças, 
        controlar seus gastos e alcançar seus objetivos financeiros.
      </p>

      <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #e5e7eb; font-size: 14px; font-weight: 600; margin: 0 0 16px;">Para começar, recomendamos:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #7c3aed; font-size: 18px; margin-right: 12px;">1.</span>
              <span style="color: #d1d5db; font-size: 14px;">Cadastre sua renda mensal</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #7c3aed; font-size: 18px; margin-right: 12px;">2.</span>
              <span style="color: #d1d5db; font-size: 14px;">Registre seus gastos fixos</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #7c3aed; font-size: 18px; margin-right: 12px;">3.</span>
              <span style="color: #d1d5db; font-size: 14px;">Crie orçamentos por categoria</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #7c3aed; font-size: 18px; margin-right: 12px;">4.</span>
              <span style="color: #d1d5db; font-size: 14px;">Defina suas metas financeiras</span>
            </td>
          </tr>
        </table>
      </div>

      ${button('Acessar minha conta', `${process.env.NEXTAUTH_URL || 'https://financeapp.com'}/dashboard`)}
    `)}
  `)

  return { subject: 'Bem-vindo ao FinanceApp! 🎉', html }
}

export function weeklyReportEmail(
  userName: string,
  data: {
    totalExpenses: number
    topCategories: { name: string; amount: number }[]
    budgetAlerts: string[]
    score: number
  }
): { subject: string; html: string } {
  const scoreColor = data.score >= 70 ? '#10b981' : data.score >= 40 ? '#f59e0b' : '#ef4444'
  const scoreLabel = data.score >= 80 ? 'Excelente' : data.score >= 60 ? 'Bom' : data.score >= 40 ? 'Regular' : data.score >= 20 ? 'Ruim' : 'Crítico'

  const categoriesRows = data.topCategories
    .slice(0, 5)
    .map(
      (cat) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #1e1e2e;">
          <span style="color: #d1d5db; font-size: 14px;">${cat.name}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #1e1e2e; text-align: right;">
          <span style="color: #f87171; font-size: 14px; font-weight: 600;">${formatCurrency(cat.amount)}</span>
        </td>
      </tr>`
    )
    .join('')

  const alertsHtml =
    data.budgetAlerts.length > 0
      ? `<div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 10px; padding: 16px; margin: 20px 0;">
          <p style="color: #f87171; font-size: 13px; font-weight: 600; margin: 0 0 8px;">⚠️ Alertas de Orçamento</p>
          ${data.budgetAlerts.map((a) => `<p style="color: #d1d5db; font-size: 13px; margin: 4px 0;">• ${a}</p>`).join('')}
        </div>`
      : ''

  const html = layout(`
    ${heading('Resumo Semanal 📊')}
    ${body(`
      ${greeting(userName)}
      <p style="color: #9ca3af; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
        Aqui está o resumo da sua semana financeira. Veja como andam suas finanças:
      </p>

      <div style="display: flex; gap: 16px; margin: 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td width="50%" style="padding-right: 8px;">
              <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Total Gasto</p>
                <p style="color: #f87171; font-size: 22px; font-weight: 700; margin: 0;">${formatCurrency(data.totalExpenses)}</p>
              </div>
            </td>
            <td width="50%" style="padding-left: 8px;">
              <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Score Financeiro</p>
                <p style="color: ${scoreColor}; font-size: 22px; font-weight: 700; margin: 0;">${data.score}<span style="font-size: 14px; color: #6b7280;">/100</span></p>
                <p style="color: ${scoreColor}; font-size: 11px; margin: 4px 0 0;">${scoreLabel}</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      ${
        data.topCategories.length > 0
          ? `<div style="margin: 24px 0;">
              <p style="color: #e5e7eb; font-size: 14px; font-weight: 600; margin: 0 0 12px;">Maiores gastos por categoria</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                ${categoriesRows}
              </table>
            </div>`
          : ''
      }

      ${alertsHtml}

      ${button('Ver relatório completo', `${process.env.NEXTAUTH_URL || 'https://financeapp.com'}/dashboard`)}
    `)}
  `)

  return { subject: 'Seu resumo semanal — FinanceApp 📊', html }
}

export function budgetAlertEmail(
  userName: string,
  categoryName: string,
  spent: number,
  limit: number
): { subject: string; html: string } {
  const percentage = Math.round((spent / limit) * 100)
  const exceeded = spent > limit
  const barColor = exceeded ? '#ef4444' : percentage >= 80 ? '#f59e0b' : '#10b981'

  const html = layout(`
    ${heading(exceeded ? 'Orçamento Excedido! 🚨' : 'Alerta de Orçamento ⚠️')}
    ${body(`
      ${greeting(userName)}
      <p style="color: #9ca3af; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
        ${
          exceeded
            ? `O orçamento da categoria <strong style="color: #ffffff;">${categoryName}</strong> foi ultrapassado.`
            : `O orçamento da categoria <strong style="color: #ffffff;">${categoryName}</strong> está próximo do limite.`
        }
      </p>

      <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0;">
              <span style="color: #9ca3af; font-size: 13px;">Categoria</span>
            </td>
            <td style="padding: 6px 0; text-align: right;">
              <span style="color: #ffffff; font-size: 14px; font-weight: 600;">${categoryName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">
              <span style="color: #9ca3af; font-size: 13px;">Gasto atual</span>
            </td>
            <td style="padding: 6px 0; text-align: right;">
              <span style="color: #f87171; font-size: 14px; font-weight: 600;">${formatCurrency(spent)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">
              <span style="color: #9ca3af; font-size: 13px;">Limite</span>
            </td>
            <td style="padding: 6px 0; text-align: right;">
              <span style="color: #10b981; font-size: 14px; font-weight: 600;">${formatCurrency(limit)}</span>
            </td>
          </tr>
        </table>

        <div style="margin: 16px 0 4px;">
          <div style="background: #2a2a3e; border-radius: 6px; height: 8px; overflow: hidden;">
            <div style="background: ${barColor}; height: 100%; width: ${Math.min(percentage, 100)}%; border-radius: 6px;"></div>
          </div>
          <p style="color: ${barColor}; font-size: 13px; font-weight: 600; margin: 8px 0 0; text-align: right;">
            ${percentage}% utilizado
          </p>
        </div>
      </div>

      ${
        exceeded
          ? `<p style="color: #f87171; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
              Você ultrapassou o limite em <strong>${formatCurrency(spent - limit)}</strong>. Revise seus gastos nesta categoria.
            </p>`
          : `<p style="color: #f59e0b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
              Restam apenas <strong>${formatCurrency(limit - spent)}</strong> disponíveis nesta categoria.
            </p>`
      }

      ${button('Gerenciar orçamentos', `${process.env.NEXTAUTH_URL || 'https://financeapp.com'}/dashboard`)}
    `)}
  `)

  return {
    subject: exceeded
      ? `Orçamento excedido: ${categoryName} — FinanceApp`
      : `Alerta de orçamento: ${categoryName} — FinanceApp`,
    html,
  }
}

export function trialExpiringEmail(userName: string, daysLeft: number): { subject: string; html: string } {
  const html = layout(`
    ${heading(daysLeft <= 1 ? 'Seu trial expira hoje! ⏰' : `Faltam ${daysLeft} dias para o fim do trial ⏳`)}
    ${body(`
      ${greeting(userName)}
      <p style="color: #9ca3af; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
        ${
          daysLeft <= 1
            ? 'Seu período de teste termina hoje. Para continuar usando todos os recursos premium, assine agora.'
            : `Seu período de teste no FinanceApp expira em <strong style="color: #ffffff;">${daysLeft} dias</strong>. Não perca acesso aos recursos premium!`
        }
      </p>

      <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #e5e7eb; font-size: 14px; font-weight: 600; margin: 0 0 16px;">Recursos que você pode perder:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0;"><span style="color: #d1d5db; font-size: 14px;">✦ Despesas ilimitadas</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><span style="color: #d1d5db; font-size: 14px;">✦ Score financeiro detalhado</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><span style="color: #d1d5db; font-size: 14px;">✦ Exportação CSV</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><span style="color: #d1d5db; font-size: 14px;">✦ Alertas por email</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><span style="color: #d1d5db; font-size: 14px;">✦ Orçamentos e metas ilimitados</span></td>
          </tr>
        </table>
      </div>

      ${button('Assinar agora', `${process.env.NEXTAUTH_URL || 'https://financeapp.com'}/dashboard/subscription`)}

      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
        Dúvidas? Responda este email e teremos prazer em ajudar.
      </p>
    `)}
  `)

  return {
    subject: daysLeft <= 1
      ? 'Seu trial expira hoje — FinanceApp'
      : `Faltam ${daysLeft} dias no seu trial — FinanceApp`,
    html,
  }
}

export function paymentFailedEmail(userName: string): { subject: string; html: string } {
  const html = layout(`
    ${heading('Falha no pagamento 💳')}
    ${body(`
      ${greeting(userName)}
      <p style="color: #9ca3af; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
        Não foi possível processar o pagamento da sua assinatura do FinanceApp. 
        Atualize seus dados de pagamento para manter o acesso aos recursos premium.
      </p>

      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #f87171; font-size: 32px; margin: 0 0 8px;">⚠️</p>
        <p style="color: #f87171; font-size: 15px; font-weight: 600; margin: 0 0 8px;">Pagamento não processado</p>
        <p style="color: #d1d5db; font-size: 13px; margin: 0;">
          Sua conta pode ser rebaixada para o plano gratuito se o problema não for resolvido.
        </p>
      </div>

      <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #e5e7eb; font-size: 14px; font-weight: 600; margin: 0 0 12px;">Possíveis causas:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0;"><span style="color: #d1d5db; font-size: 14px;">• Cartão expirado ou bloqueado</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><span style="color: #d1d5db; font-size: 14px;">• Saldo insuficiente</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><span style="color: #d1d5db; font-size: 14px;">• Dados de pagamento desatualizados</span></td>
          </tr>
        </table>
      </div>

      ${button('Atualizar pagamento', `${process.env.NEXTAUTH_URL || 'https://financeapp.com'}/dashboard/subscription`)}

      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
        Se o problema persistir, entre em contato com nosso suporte.
      </p>
    `)}
  `)

  return { subject: 'Falha no pagamento da sua assinatura — FinanceApp', html }
}
