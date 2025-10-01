'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRole } from '@prisma/client'

export default function CreateUserPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string, password?: string, name?: string, role?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean, password?: boolean, name?: boolean, role?: boolean }>({})
  const formRef = useRef<HTMLFormElement>(null)

    // Redirect if not authenticated or not admin
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        router.push('/login')
        return null
    }

    if (session?.user?.role !== 'ADMIN') {
        router.push('/')
        return null
    }

    const validateField = (name: string, value: string) => {
        const newErrors = { ...errors }

        if (name === 'email') {
            if (!value) {
                newErrors.email = 'El email es requerido'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors.email = 'Formato de email inválido'
            } else {
                delete newErrors.email
            }
        }

        if (name === 'password') {
            if (!value) {
                newErrors.password = 'La contraseña es requerida'
            } else if (value.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
            } else {
                delete newErrors.password
            }
        }

        if (name === 'name') {
            if (!value) {
                newErrors.name = 'El nombre es requerido'
            } else if (value.length < 2) {
                newErrors.name = 'El nombre debe tener al menos 2 caracteres'
            } else {
                delete newErrors.name
            }
        }

        if (name === 'role') {
            if (!value) {
                newErrors.role = 'El rol es requerido'
            } else {
                delete newErrors.role
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))
        validateField(name, value)
    }

    const handleSelectChange = (value: string) => {
        setTouched(prev => ({ ...prev, role: true }))
        validateField('role', value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string
        const role = formData.get('role') as string

        // Validate all fields
        const emailValid = validateField('email', email)
        const passwordValid = validateField('password', password)
        const nameValid = validateField('name', name)
        const roleValid = validateField('role', role)

        if (!emailValid || !passwordValid || !nameValid || !roleValid) {
            setTouched({ email: true, password: true, name: true, role: true })
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    role: role as UserRole,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear el usuario')
            }

      toast.success('Usuario creado exitosamente', {
        description: `El usuario ${email} ha sido creado correctamente.`,
        duration: 5000,
        className: 'toast-success',
        style: {
          background: '#fff',
          color: '#000',
        },
      })

      // Reset form
      if (formRef.current) {
        formRef.current.reset()
      }
      setTouched({})
      setErrors({})

        } catch (error) {
            console.error('Error creating user:', error)
      toast.error('Error al crear el usuario', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
        duration: 4000,
        className: 'toast-error',
        style: {
          background: '#fff',
          color: '#000',
        },
      })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Crear Usuario</h1>
                            <p className="text-slate-600">Agregar un nuevo usuario al sistema</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Información del Usuario
                        </CardTitle>
                        <CardDescription>
                            Completa los datos para crear un nuevo usuario en el sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                                        Nombre completo *
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        onChange={handleInputChange}
                                        className={`h-12 rounded-lg border-2 transition-all duration-200 ${errors.name && touched.name
                                                ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500'
                                                : 'border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
                                            }`}
                                        placeholder="Juan Pérez"
                                        aria-invalid={!!(errors.name && touched.name)}
                                    />
                                    <AnimatePresence>
                                        {errors.name && touched.name && (
                                            <motion.p
                                                className="text-sm text-red-600 flex items-center"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                {errors.name}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                        Correo electrónico *
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        onChange={handleInputChange}
                                        className={`h-12 rounded-lg border-2 transition-all duration-200 ${errors.email && touched.email
                                                ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500'
                                                : 'border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
                                            }`}
                                        placeholder="usuario@ejemplo.com"
                                        aria-invalid={!!(errors.email && touched.email)}
                                    />
                                    <AnimatePresence>
                                        {errors.email && touched.email && (
                                            <motion.p
                                                className="text-sm text-red-600 flex items-center"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                {errors.email}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                        Contraseña *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            onChange={handleInputChange}
                                            className={`h-12 rounded-lg border-2 transition-all duration-200 pr-10 ${errors.password && touched.password
                                                    ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500'
                                                    : 'border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
                                                }`}
                                            placeholder="••••••••"
                                            aria-invalid={!!(errors.password && touched.password)}
                                        />
                                        <motion.button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={showPassword ? 'hide' : 'show'}
                                                    initial={{ rotate: -90, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                    exit={{ rotate: 90, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </motion.div>
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>
                                    <AnimatePresence>
                                        {errors.password && touched.password && (
                                            <motion.p
                                                className="text-sm text-red-600 flex items-center"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                {errors.password}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Role Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                                        Rol *
                                    </Label>
                                    <Select name="role" onValueChange={handleSelectChange}>
                                        <SelectTrigger className={`h-12 rounded-lg border-2 transition-all duration-200 ${errors.role && touched.role
                                                ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500'
                                                : 'border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
                                            }`}>
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="VIEWER">Viewer - Solo lectura</SelectItem>
                                            <SelectItem value="EDITOR">Editor - Crear y editar</SelectItem>
                                            <SelectItem value="ADMIN">Admin - Acceso completo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <AnimatePresence>
                                        {errors.role && touched.role && (
                                            <motion.p
                                                className="text-sm text-red-600 flex items-center"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                {errors.role}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isLoading ? (
                                        <motion.div
                                            className="flex items-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <motion.div
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            Creando usuario...
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="w-4 h-4" />
                                            Crear Usuario
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
