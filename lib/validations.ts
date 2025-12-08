import { z } from 'zod'

// Schema de validação para cadastro de usuário
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

// Schema de validação para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

// Schema de validação para despesa
export const expenseSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  amount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor deve ser positivo')
    .max(999999999, 'Valor muito alto'),
  date: z.date({ invalid_type_error: 'Data inválida' }),
  type: z.enum(['FIXED', 'VARIABLE'], {
    invalid_type_error: 'Tipo inválido',
  }),
  categoryId: z.string().optional().nullable(),
})

// Schema de validação para despesa fixa
export const fixedExpenseSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  amount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor deve ser positivo')
    .max(999999999, 'Valor muito alto'),
  dueDay: z
    .number({ invalid_type_error: 'Dia de vencimento inválido' })
    .int('Dia deve ser um número inteiro')
    .min(1, 'Dia deve ser entre 1 e 31')
    .max(31, 'Dia deve ser entre 1 e 31'),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY'], {
    invalid_type_error: 'Frequência inválida',
  }),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

// Schema de validação para receita
export const incomeSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  amount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor deve ser positivo')
    .max(999999999, 'Valor muito alto'),
  date: z.date({ invalid_type_error: 'Data inválida' }),
  type: z.enum(['SALARY', 'FREELANCE', 'INVESTMENT', 'BONUS', 'GIFT', 'EXTRA', 'OTHER'], {
    invalid_type_error: 'Tipo inválido',
  }),
  isRecurring: z.boolean().default(false),
})

// Schema de validação para meta de investimento
export const investmentGoalSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  targetAmount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor alvo deve ser positivo')
    .max(999999999, 'Valor muito alto'),
  currentAmount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .min(0, 'Valor atual não pode ser negativo')
    .max(999999999, 'Valor muito alto')
    .default(0),
  deadline: z.date({ invalid_type_error: 'Data inválida' }),
  priority: z
    .number()
    .int()
    .min(1, 'Prioridade deve ser entre 1 e 5')
    .max(5, 'Prioridade deve ser entre 1 e 5')
    .default(1),
})

// Schema de validação para simulação de investimento
export const investmentSimulationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  initialAmount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .min(0, 'Valor inicial não pode ser negativo')
    .max(999999999, 'Valor muito alto'),
  monthlyContribution: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .min(0, 'Aporte mensal não pode ser negativo')
    .max(999999999, 'Valor muito alto'),
  interestRate: z
    .number({ invalid_type_error: 'Taxa deve ser um número' })
    .min(0, 'Taxa não pode ser negativa')
    .max(100, 'Taxa deve ser no máximo 100%'),
  interestType: z.enum(['SIMPLE', 'COMPOUND'], {
    invalid_type_error: 'Tipo de juros inválido',
  }),
  periodMonths: z
    .number({ invalid_type_error: 'Período deve ser um número' })
    .int('Período deve ser um número inteiro')
    .min(1, 'Período deve ser de pelo menos 1 mês')
    .max(600, 'Período máximo de 50 anos'),
})

// Schema de validação para categoria
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (formato: #RRGGBB)')
    .default('#8b5cf6'),
  icon: z.string().max(50).optional().nullable(),
  type: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
})

// Types inferidos dos schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type FixedExpenseInput = z.infer<typeof fixedExpenseSchema>
export type IncomeInput = z.infer<typeof incomeSchema>
export type InvestmentGoalInput = z.infer<typeof investmentGoalSchema>
export type InvestmentSimulationInput = z.infer<typeof investmentSimulationSchema>
export type CategoryInput = z.infer<typeof categorySchema>

