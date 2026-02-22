"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle>Recuperar senha</CardTitle>
            <CardDescription>
              Esta funcionalidade ainda nao foi implementada.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground text-center">
            Por enquanto, entre em contato com o suporte para redefinicao de senha.
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="gradient">
              <Link href="/login">Voltar para login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
