"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { KeyRound, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao processar solicitação")
      }

      setEmailSent(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Algo deu errado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-200/30 via-transparent to-transparent dark:from-violet-900/20" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-200/30 via-transparent to-transparent dark:from-emerald-900/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-500/40"
            >
              {emailSent ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : (
                <KeyRound className="h-8 w-8 text-white" />
              )}
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                {emailSent ? "Email enviado!" : "Recuperar senha"}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {emailSent
                  ? "Verifique sua caixa de entrada e spam"
                  : "Informe seu email para receber o link de recuperação"
                }
              </CardDescription>
            </div>
          </CardHeader>

          {emailSent ? (
            <>
              <CardContent className="text-center space-y-4 pt-4">
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-4">
                  <p className="text-sm text-violet-700 dark:text-violet-300">
                    Se o email estiver cadastrado, enviaremos um link para redefinir sua senha. O link expira em <strong>1 hora</strong>.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Não recebeu o email? Verifique a pasta de spam ou tente novamente.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Tentar novamente
                </Button>
                <Button asChild variant="gradient" className="w-full h-11">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para login
                  </Link>
                </Button>
              </CardFooter>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      {...register("email")}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  Lembrou a senha?{" "}
                  <Link
                    href="/login"
                    className="text-violet-600 hover:text-violet-500 font-medium hover:underline"
                  >
                    Fazer login
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
