"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wallet,
  Check,
  ArrowLeft,
  Sparkles,
  ChevronDown,
  Loader2,
  Crown,
  Zap,
  Copy,
  CheckCircle2,
  X,
  QrCode,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/landing/motion-wrapper"

const faqItems = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim! Você pode cancelar sua assinatura a qualquer momento. Não há contratos ou taxas de cancelamento. Ao cancelar, você continua com acesso ao plano até o fim do período pago.",
  },
  {
    question: "Como funciona o pagamento via PIX?",
    answer:
      "Ao assinar, geramos um QR code PIX para você pagar instantaneamente pelo app do seu banco. O plano é ativado assim que o pagamento é confirmado (geralmente em segundos). A cada mês, enviamos um novo PIX por email para renovação.",
  },
  {
    question: "Meus dados são mantidos se eu cancelar?",
    answer:
      "Sim, seus dados nunca são apagados. Se você voltar para o plano gratuito, os dados existentes são mantidos, mas funcionalidades exclusivas ficam desabilitadas até um novo upgrade.",
  },
  {
    question: "O plano gratuito tem alguma limitação de tempo?",
    answer:
      "Não! O plano gratuito é para sempre. Você pode usá-lo pelo tempo que quiser, sem nenhum custo. Faça upgrade apenas quando sentir necessidade.",
  },
  {
    question: "E se eu não pagar a renovação?",
    answer:
      "Você tem até 3 dias de prazo para realizar o pagamento da renovação. Após esse período, seu plano é revertido automaticamente para o Gratuito, sem perda de dados.",
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden transition-colors hover:border-violet-500/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 text-left"
      >
        <span className="font-medium text-sm sm:text-base">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface PixPaymentData {
  paymentId: string
  qrCode: string
  qrCodeText: string
  expiresAt: string
}

function PixModal({
  data,
  onClose,
}: {
  data: PixPaymentData
  onClose: () => void
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<string>("pending")
  const [timeLeft, setTimeLeft] = useState("")
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payments/status/${data.paymentId}`)
      const result = await res.json()

      if (result.status === "approved") {
        setStatus("approved")
        if (pollingRef.current) clearInterval(pollingRef.current)
        setTimeout(() => {
          router.push("/dashboard?checkout=success")
          router.refresh()
        }, 2000)
      } else if (["rejected", "cancelled"].includes(result.status)) {
        setStatus(result.status)
        if (pollingRef.current) clearInterval(pollingRef.current)
      }
    } catch {
      // Keep polling
    }
  }, [data.paymentId, router])

  useEffect(() => {
    pollingRef.current = setInterval(checkStatus, 3000)

    timerRef.current = setInterval(() => {
      const now = new Date().getTime()
      const expires = new Date(data.expiresAt).getTime()
      const diff = expires - now

      if (diff <= 0) {
        setTimeLeft("Expirado")
        setStatus("expired")
        if (pollingRef.current) clearInterval(pollingRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        const min = Math.floor(diff / 60000)
        const sec = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${min}:${sec.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [checkStatus, data.expiresAt])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.qrCodeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={status !== "approved" ? onClose : undefined}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-card border border-border/50 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {status === "approved" ? (
          <div className="text-center space-y-4 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold">Pagamento confirmado!</h3>
            <p className="text-muted-foreground">
              Seu plano Premium foi ativado. Redirecionando...
            </p>
          </div>
        ) : status === "expired" ? (
          <div className="text-center space-y-4 py-8">
            <Clock className="h-16 w-16 text-orange-500 mx-auto" />
            <h3 className="text-xl font-bold">PIX expirado</h3>
            <p className="text-muted-foreground">
              O tempo para pagamento expirou. Tente novamente.
            </p>
            <Button variant="gradient" onClick={onClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-violet-500">
                <QrCode className="h-5 w-5" />
                <span className="text-sm font-medium">Pagar com PIX</span>
              </div>
              <h3 className="text-xl font-bold">Plano Premium - R$ 15,00/mês</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Expira em {timeLeft}</span>
              </div>
            </div>

            {data.qrCode && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${data.qrCode}`}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Ou copie o código PIX:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-xs font-mono break-all max-h-20 overflow-y-auto">
                  {data.qrCodeText}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-violet-500/10 rounded-xl p-4">
              <Loader2 className="h-5 w-5 text-violet-500 animate-spin shrink-0" />
              <p className="text-sm text-muted-foreground">
                Aguardando confirmação do pagamento...
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<PixPaymentData | null>(null)

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch("/api/payments/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "PREMIUM" }),
      })

      if (res.status === 401) {
        router.push("/login?callbackUrl=/pricing")
        return
      }

      const data = await res.json()

      if (data.paymentId) {
        setPixData(data)
      }
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">FinanceApp</span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Header */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <FadeUp>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-600 dark:text-violet-400">
                <Sparkles className="h-4 w-4" />
                Pague com PIX
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
                Desbloqueie{" "}
                <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                  tudo
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Um único plano com acesso completo. Simples, sem surpresas.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 lg:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <StaggerContainer className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Free */}
            <StaggerItem>
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 lg:p-8 space-y-6 h-full flex flex-col hover:border-violet-500/20 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold">Gratuito</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">R$ 0</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Perfeito para começar a organizar suas finanças.
                  </p>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    "Até 50 despesas por mês",
                    "Até 3 orçamentos",
                    "Até 2 cartões",
                    "Até 3 metas",
                    "Dashboard básico",
                    "Score resumido",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <Link href="/register">Começar Grátis</Link>
                </Button>
              </div>
            </StaggerItem>

            {/* Premium */}
            <StaggerItem>
              <div className="relative rounded-2xl border border-violet-500/50 bg-violet-500/5 shadow-xl shadow-violet-500/10 p-6 lg:p-8 space-y-6 h-full flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-violet-400 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    Recomendado
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 text-white">
                      <Crown className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold">Premium</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">R$ 15</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acesso completo a todas as funcionalidades.
                  </p>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    "Despesas ilimitadas",
                    "Orçamentos ilimitados",
                    "Cartões ilimitados",
                    "Metas ilimitadas",
                    "Exportação CSV",
                    "Score financeiro detalhado",
                    "Comprovantes em despesas",
                    "Alertas por email",
                    "Suporte prioritário",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                  onClick={handleSubscribe}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    "Assinar com PIX"
                  )}
                </Button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <FadeUp>
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Perguntas{" "}
                <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                  frequentes
                </span>
              </h2>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <FAQItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <Wallet className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold">FinanceApp</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FinanceApp. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {pixData && <PixModal data={pixData} onClose={() => setPixData(null)} />}
      </AnimatePresence>
    </div>
  )
}
