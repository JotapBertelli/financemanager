"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
    },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao redefinir senha")
      }

      setIsSuccess(true)
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

  if (!token) {
    return (
      <Card className="border-0 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/40"
          >
            <AlertCircle className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              Link inválido
            </CardTitle>
            <CardDescription className="text-base mt-2">
              O link de recuperação é inválido ou está incompleto.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Solicite um novo link de recuperação na página de recuperação de senha.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild variant="gradient" className="w-full h-11">
            <Link href="/forgot-password">Solicitar novo link</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card className="border-0 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/40"
          >
            <CheckCircle2 className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              Senha redefinida!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Sua senha foi alterada com sucesso.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Agora você pode fazer login com sua nova senha.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="gradient"
            className="w-full h-11"
            onClick={() => router.push("/login")}
          >
            Ir para o login
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
      <CardHeader className="space-y-4 text-center pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-500/40"
        >
          <ShieldCheck className="h-8 w-8 text-white" />
        </motion.div>
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
            Nova senha
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Crie uma nova senha para sua conta
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register("token")} />

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("password")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres, com letra maiúscula e número
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("confirmPassword")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
                Redefinindo...
              </>
            ) : (
              "Redefinir senha"
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            <Link
              href="/login"
              className="text-violet-600 hover:text-violet-500 font-medium hover:underline"
            >
              Voltar para login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={
          <Card className="border-0 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </CardContent>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
