// Tipos para a aplicação de gestão financeira

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string | null
  type: 'EXPENSE' | 'INCOME'
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  id: string
  name: string
  description: string | null
  amount: number
  date: Date
  type: 'FIXED' | 'VARIABLE'
  categoryId: string | null
  category?: Category | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface FixedExpense {
  id: string
  name: string
  description: string | null
  amount: number
  dueDay: number
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  categoryId: string | null
  category?: Category | null
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Income {
  id: string
  name: string
  description: string | null
  amount: number
  date: Date
  type: 'SALARY' | 'FREELANCE' | 'INVESTMENT' | 'BONUS' | 'GIFT' | 'EXTRA' | 'OTHER'
  isRecurring: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface InvestmentGoal {
  id: string
  name: string
  description: string | null
  targetAmount: number
  currentAmount: number
  deadline: Date
  priority: number
  isCompleted: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface FutureInvestmentSimulation {
  id: string
  name: string
  initialAmount: number
  monthlyContribution: number
  interestRate: number
  interestType: 'SIMPLE' | 'COMPOUND'
  periodMonths: number
  projectedAmount: number | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Tipos para Dashboard
export interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  totalFixedExpenses: number
  expensesByCategory: CategorySummary[]
  monthlyData: MonthlyData[]
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  categoryColor: string
  total: number
  percentage: number
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
}

// Tipos para filtros
export interface DateFilter {
  startDate: Date
  endDate: Date
}

export interface ExpenseFilter extends DateFilter {
  categoryId?: string
  type?: 'FIXED' | 'VARIABLE'
}

export interface IncomeFilter extends DateFilter {
  type?: Income['type']
}

// Tipos para formulários
export type ExpenseFormData = Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'category'>
export type FixedExpenseFormData = Omit<FixedExpense, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'category'>
export type IncomeFormData = Omit<Income, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
export type InvestmentGoalFormData = Omit<InvestmentGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isCompleted'>
export type SimulationFormData = Omit<FutureInvestmentSimulation, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'projectedAmount'>

// Tipos para respostas da API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Tipo para projeção de investimento
export interface InvestmentProjection {
  month: number
  totalInvested: number
  totalWithInterest: number
  interest: number
}

