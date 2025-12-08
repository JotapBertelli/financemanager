"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import {
  User,
  Palette,
  Bell,
  Shield,
  Loader2,
  Plus,
  Trash2,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  color: string
  type: "EXPENSE" | "INCOME"
}

const colorOptions = [
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f59e0b", label: "Âmbar" },
  { value: "#10b981", label: "Esmeralda" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#8b5cf6", label: "Violeta" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#f97316", label: "Laranja" },
  { value: "#6b7280", label: "Cinza" },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#8b5cf6",
    type: "EXPENSE" as "EXPENSE" | "INCOME",
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    } finally {
      setIsLoadingCategories(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: "Erro",
        description: "Digite um nome para a categoria.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar categoria")
      }

      toast({
        title: "Categoria criada!",
        description: "A categoria foi criada com sucesso.",
        variant: "success",
      })

      setNewCategory({ name: "", color: "#8b5cf6", type: "EXPENSE" })
      setIsCategoryDialogOpen(false)
      fetchCategories()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar categoria",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Categoria excluída!",
          description: "A categoria foi excluída com sucesso.",
          variant: "success",
        })
        fetchCategories()
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e dados da conta
        </p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Shield className="h-4 w-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Visualize os dados da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                    {session?.user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U"}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {session?.user?.name || "Usuário"}
                    </h3>
                    <p className="text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={session?.user?.name || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={session?.user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Escolha entre tema claro, escuro ou automático
                    </p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>
                    Gerencie suas categorias personalizadas
                  </CardDescription>
                </div>
                <Button
                  variant="gradient"
                  onClick={() => setIsCategoryDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                  </div>
                ) : categories.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Categorias de Despesa
                      </h4>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {categories
                          .filter((c) => c.type === "EXPENSE")
                          .map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="font-medium">{category.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>

                    {categories.filter((c) => c.type === "INCOME").length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                          Categorias de Receita
                        </h4>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {categories
                            .filter((c) => c.type === "INCOME")
                            .map((category) => (
                              <div
                                key={category.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span className="font-medium">{category.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteCategory(category.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma categoria encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* New Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar suas transações
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Viagens"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={newCategory.type}
                onValueChange={(value: "EXPENSE" | "INCOME") =>
                  setNewCategory({ ...newCategory, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                  <SelectItem value="INCOME">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setNewCategory({ ...newCategory, color: color.value })
                    }
                    className={`h-8 w-8 rounded-full transition-transform ${
                      newCategory.color === color.value
                        ? "ring-2 ring-offset-2 ring-violet-600 scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreateCategory}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

