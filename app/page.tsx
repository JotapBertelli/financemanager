import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import {
  Wallet,
  Receipt,
  PiggyBank,
  CreditCard,
  Target,
  Calculator,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  FadeUp,
  FadeIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  FloatingElement,
} from "@/components/landing/motion-wrapper"
import { LandingNavbar, MobileMenu } from "@/components/landing/navbar"

export default async function Home() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <LandingNavbar isLoggedIn={isLoggedIn} />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <FadeUp>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-600 dark:text-violet-400">
                  <Sparkles className="h-4 w-4" />
                  Gestão financeira inteligente
                </div>
              </FadeUp>

              <FadeUp delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                  Controle suas finanças{" "}
                  <span className="gradient-text">de forma inteligente</span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                  Organize despesas, acompanhe orçamentos, gerencie cartões e
                  alcance suas metas financeiras em um único lugar.
                </p>
              </FadeUp>

              <FadeUp delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isLoggedIn ? (
                    <Button variant="gradient" size="lg" asChild>
                      <Link href="/dashboard">
                        Ir para Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="gradient" size="lg" asChild>
                        <Link href="/register">
                          Começar Grátis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <Link href="/login">Entrar</Link>
                      </Button>
                    </>
                  )}
                </div>
              </FadeUp>

              <FadeUp delay={0.4}>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    Dados seguros
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-violet-500" />
                    100% gratuito
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Hero illustration - Dashboard mockup */}
            <FadeIn delay={0.3}>
              <FloatingElement>
                <div className="relative">
                  <div className="glow rounded-2xl">
                    <div className="glass rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
                      {/* Mock dashboard header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Saldo total</p>
                          <p className="text-2xl font-bold text-emerald-500">R$ 12.450,00</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      {/* Mock chart bars */}
                      <div className="flex items-end gap-2 h-24 pt-4">
                        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map(
                          (h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-600 to-violet-400 opacity-80"
                              style={{ height: `${h}%` }}
                            />
                          )
                        )}
                      </div>

                      {/* Mock stats row */}
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Receitas</p>
                          <p className="text-sm font-semibold text-emerald-500">R$ 8.500</p>
                        </div>
                        <div className="rounded-lg bg-red-500/10 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Despesas</p>
                          <p className="text-sm font-semibold text-red-500">R$ 3.200</p>
                        </div>
                        <div className="rounded-lg bg-violet-500/10 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Metas</p>
                          <p className="text-sm font-semibold text-violet-500">75%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FloatingElement>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <FadeUp>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Tudo que você precisa para{" "}
                <span className="gradient-text">gerenciar seu dinheiro</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Ferramentas poderosas para controlar cada aspecto da sua vida
                financeira, de forma simples e visual.
              </p>
            </div>
          </FadeUp>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Receipt,
                title: "Controle de Despesas",
                description:
                  "Registre e categorize todas as suas despesas. Visualize para onde seu dinheiro está indo com gráficos detalhados.",
                color: "text-red-500",
                bg: "bg-red-500/10",
              },
              {
                icon: PiggyBank,
                title: "Orçamento Mensal",
                description:
                  "Defina limites de gastos por categoria e receba alertas quando estiver próximo do limite.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                icon: CreditCard,
                title: "Cartões de Crédito",
                description:
                  "Gerencie faturas, limites e gastos de todos os seus cartões em um só lugar.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Target,
                title: "Metas Financeiras",
                description:
                  "Crie metas de economia e acompanhe seu progresso. Defina objetivos e conquiste cada um deles.",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
              {
                icon: Calculator,
                title: "Simulador de Investimentos",
                description:
                  "Simule rendimentos e compare cenários para tomar as melhores decisões financeiras.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                icon: TrendingUp,
                title: "Score Financeiro",
                description:
                  "Acompanhe sua saúde financeira com um score personalizado baseado nos seus hábitos.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-4 transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 h-full">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
          <FadeUp>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Comece em{" "}
                <span className="gradient-text">3 passos simples</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Em poucos minutos você já estará no controle das suas finanças.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                icon: UserPlus,
                title: "Cadastre-se",
                description:
                  "Crie sua conta gratuita em segundos. Sem cartão de crédito, sem compromisso.",
              },
              {
                step: "02",
                icon: Settings,
                title: "Configure",
                description:
                  "Adicione suas contas, cartões e defina seus orçamentos e metas financeiras.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Controle",
                description:
                  "Acompanhe seus gastos, veja relatórios e tome decisões mais inteligentes.",
              },
            ].map((item, index) => (
              <ScaleIn key={item.step} delay={index * 0.15}>
                <div className="relative text-center space-y-4 p-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/25 mx-auto">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <span className="block text-xs font-bold text-violet-500 tracking-widest uppercase">
                    Passo {item.step}
                  </span>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <FadeUp>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Planos que cabem{" "}
                <span className="gradient-text">no seu bolso</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comece gratuitamente e faça upgrade quando precisar de mais
                recursos.
              </p>
            </div>
          </FadeUp>

          <StaggerContainer className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
            {[
              {
                name: "Gratuito",
                price: "R$ 0",
                period: "para sempre",
                description: "Perfeito para começar a organizar suas finanças.",
                features: [
                  "Até 50 despesas por mês",
                  "Até 3 orçamentos",
                  "Até 2 cartões de crédito",
                  "Score financeiro básico",
                  "Dashboard completo",
                ],
                cta: "Começar Grátis",
                href: "/register",
                popular: false,
              },
              {
                name: "Premium",
                price: "R$ 15",
                period: "/mês",
                description:
                  "Acesso completo a todas as funcionalidades.",
                features: [
                  "Tudo ilimitado",
                  "Exportação CSV",
                  "Score financeiro detalhado",
                  "Comprovantes em despesas",
                  "Alertas por email",
                  "Suporte prioritário",
                ],
                cta: "Assinar Premium",
                href: "/pricing",
                popular: true,
              },
            ].map((plan) => (
              <StaggerItem key={plan.name}>
                <div
                  className={`relative rounded-2xl border p-6 lg:p-8 space-y-6 h-full flex flex-col transition-all duration-300 ${
                    plan.popular
                      ? "border-violet-500/50 bg-violet-500/5 shadow-lg shadow-violet-500/10 scale-[1.02]"
                      : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-violet-500/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-violet-400 px-4 py-1 text-xs font-semibold text-white">
                        <Sparkles className="h-3 w-3" />
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm"
                      >
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "gradient" : "outline"}
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-500 to-violet-700" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

              <div className="relative px-6 py-16 sm:px-12 sm:py-20 text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Pronto para transformar sua vida financeira?
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Junte-se a milhares de pessoas que já estão no controle das
                  suas finanças com o FinanceApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  {isLoggedIn ? (
                    <Button
                      size="lg"
                      className="bg-white text-violet-700 hover:bg-white/90 shadow-xl"
                      asChild
                    >
                      <Link href="/dashboard">
                        Ir para Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="bg-white text-violet-700 hover:bg-white/90 shadow-xl"
                        asChild
                      >
                        <Link href="/register">
                          Começar Grátis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                        asChild
                      >
                        <Link href="/login">Já tenho conta</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">FinanceApp</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Gestão financeira pessoal inteligente e visual. Controle suas
                finanças de forma simples.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#funcionalidades"
                    className="hover:text-foreground transition-colors"
                  >
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link
                    href="#precos"
                    className="hover:text-foreground transition-colors"
                  >
                    Preços
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Atualizações
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contato
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FinanceApp. Todos os direitos
              reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Feito com 💜 no Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
