import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina classes do Tailwind de forma inteligente
 * Usa clsx para condicionais e twMerge para resolver conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor monetário para Real brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma data para o padrão brasileiro
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Formata uma data com dia da semana
 */
export function formatDateLong(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Calcula a porcentagem
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Gera uma cor aleatória em hexadecimal
 */
export function generateRandomColor(): string {
  const colors = [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#6366f1', '#14b8a6',
    '#f97316', '#84cc16', '#22d3ee', '#a855f7',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Calcula juros compostos
 */
export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 100 / 12
  
  // Valor futuro do principal
  const futureValuePrincipal = principal * Math.pow(1 + monthlyRate, months)
  
  // Valor futuro das contribuições mensais (série uniforme)
  const futureValueContributions = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  
  return futureValuePrincipal + futureValueContributions
}

/**
 * Calcula juros simples
 */
export function calculateSimpleInterest(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 100 / 12
  
  // Total investido
  const totalInvested = principal + (monthlyContribution * months)
  
  // Juros simples sobre o principal
  const interestOnPrincipal = principal * monthlyRate * months
  
  // Juros sobre cada contribuição mensal (média)
  const averageMonths = (months + 1) / 2
  const interestOnContributions = monthlyContribution * months * monthlyRate * averageMonths / months
  
  return totalInvested + interestOnPrincipal + interestOnContributions
}

/**
 * Retorna o nome do mês
 */
export function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return months[month] || ''
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escapa aspas duplas e envolve em aspas se necessário
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

