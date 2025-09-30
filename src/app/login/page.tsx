'use client'

import { signup } from './actions'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect, use } from 'react'
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; success?: string }>
}) {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
    const [errors, setErrors] = useState<{email?: string, password?: string}>({})
    const [touched, setTouched] = useState<{email?: boolean, password?: boolean}>({})
    const [passwordStrength, setPasswordStrength] = useState(0)

    // Unwrap searchParams using React.use()
    const params = use(searchParams)

    // Mostrar notificaciones basadas en searchParams
    useEffect(() => {
        if (params.success === 'account-created') {
            toast.success('¡Cuenta creada exitosamente!', {
                description: 'Por favor revisa tu email para confirmar tu cuenta.',
                duration: 5000,
            })
        }
        if (params.error === 'login-failed') {
            toast.error('Error al iniciar sesión', {
                description: 'Verifica tus credenciales e inténtalo de nuevo.',
                duration: 4000,
            })
        }
        if (params.error === 'signup-failed') {
            toast.error('Error al crear la cuenta', {
                description: 'El email podría ya estar registrado. Intenta iniciar sesión.',
                duration: 4000,
            })
        }
    }, [params])

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
            
            // Calcular fortaleza de contraseña
            let strength = 0
            if (value.length >= 6) strength++
            if (value.length >= 8) strength++
            if (/[A-Z]/.test(value)) strength++
            if (/[a-z]/.test(value)) strength++
            if (/[0-9]/.test(value)) strength++
            if (/[^A-Za-z0-9]/.test(value)) strength++
            setPasswordStrength(strength)
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))
        validateField(name, value)
    }

    const handleSubmit = async (formData: FormData, action: 'login' | 'signup') => {
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        
        // Validar todos los campos
        const emailValid = validateField('email', email)
        const passwordValid = validateField('password', password)
        
        if (!emailValid || !passwordValid) {
            setTouched({ email: true, password: true })
            return
        }
        
        setIsLoading(true)
        setErrors({})
        
        try {
            if (action === 'login') {
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                })
                
                if (result?.error) {
                    setErrors({ email: 'Credenciales inválidas. Inténtalo de nuevo.' })
                } else {
                    window.location.href = '/'
                }
            } else {
                await signup(formData)
            }
        } catch (error) {
            console.error('Error during authentication:', error)
            setErrors({ email: 'Error de autenticación. Inténtalo de nuevo.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40">
                <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
            </div>
            
            <motion.div 
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800 backdrop-blur-sm overflow-hidden">
                    {/* Decorative Header */}
                    <div className="h-2 bg-slate-200 dark:bg-slate-700" />
                    
                    <CardHeader className="space-y-4 text-center pt-8">
                        <motion.div 
                            className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                            >
                                <UserPlus className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                            </motion.div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                Bienvenido
                            </CardTitle>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {activeTab === 'login' 
                                            ? 'Inicia sesión en tu cuenta' 
                                            : 'Crea una nueva cuenta'
                                        }
                                    </motion.span>
                                </AnimatePresence>
                            </CardDescription>
                        </motion.div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Tab Navigation */}
                        <motion.div 
                            className="relative flex space-x-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            {/* Active Tab Background */}
                            <motion.div
                                className="absolute top-1 bottom-1 bg-white dark:bg-slate-600 rounded-lg shadow-sm"
                                layoutId="activeTab"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            
                            <motion.button
                                type="button"
                                onClick={() => setActiveTab('login')}
                                className="relative flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors z-10"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    <span className="hidden sm:inline">Iniciar Sesión</span>
                                    <span className="sm:hidden">Login</span>
                                </div>
                            </motion.button>
                            
                            <motion.button
                                type="button"
                                onClick={() => setActiveTab('signup')}
                                className="relative flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors z-10"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Registrarse</span>
                                    <span className="sm:hidden">Signup</span>
                                </div>
                            </motion.button>
                        </motion.div>

                        {/* Success/Error Messages */}
                        <AnimatePresence>
                            {params.success === 'account-created' && (
                                <motion.div 
                                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <div className="flex items-start">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                                        </motion.div>
                                        <div className="text-sm text-green-800 dark:text-green-200">
                                            <p className="font-medium">¡Cuenta creada exitosamente!</p>
                                            <p className="mt-1">Por favor revisa tu email para confirmar tu cuenta.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {params.error === 'email-not-confirmed' && (
                                <motion.div 
                                    className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <div className="flex items-start">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                        >
                                            <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                                        </motion.div>
                                        <div className="text-sm text-amber-800 dark:text-amber-200">
                                            <p className="font-medium">Email no confirmado</p>
                                            <p className="mt-1">Por favor revisa tu bandeja de entrada o contacta al administrador.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {(params.error === 'login-failed' || params.error === 'signup-failed') && (
                                <motion.div 
                                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <div className="flex items-start">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                        >
                                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                                        </motion.div>
                                        <div className="text-sm text-red-800 dark:text-red-200">
                                            <p className="font-medium">
                                                {params.error === 'login-failed' ? 'Error al iniciar sesión' : 'Error al crear la cuenta'}
                                            </p>
                                            <p className="mt-1">
                                                {params.error === 'login-failed' 
                                                    ? 'Verifica tus credenciales e inténtalo de nuevo.'
                                                    : 'El email podría ya estar registrado. Intenta iniciar sesión.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Forms */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'login' ? (
                                <motion.form 
                                    key="login"
                                    className="space-y-5"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <motion.div 
                                        className="space-y-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, duration: 0.3 }}
                                    >
                                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <motion.div
                                                animate={{ 
                                                    color: errors.email && touched.email ? '#ef4444' : '#94a3b8'
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                            </motion.div>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                onChange={handleInputChange}
                                                className={`pl-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                                                    errors.email && touched.email 
                                                        ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500' 
                                                        : 'border-slate-200 dark:border-slate-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
                                                }`}
                                                placeholder="tu@email.com"
                                                aria-invalid={!!(errors.email && touched.email)}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.email && touched.email && (
                                                <motion.p 
                                                    className="text-sm text-red-600 dark:text-red-400 flex items-center"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                                    {errors.email}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div 
                                        className="space-y-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                                            Contraseña
                                        </Label>
                                        <div className="relative">
                                            <motion.div
                                                animate={{ 
                                                    color: errors.password && touched.password ? '#ef4444' : '#94a3b8'
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                            </motion.div>
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                onChange={handleInputChange}
                                                className={`pl-12 pr-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                                                    errors.password && touched.password 
                                                        ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500' 
                                                        : 'border-slate-200 dark:border-slate-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
                                                }`}
                                                placeholder="••••••••"
                                                aria-invalid={!!(errors.password && touched.password)}
                                            />
                                            <motion.button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
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
                                                    className="text-sm text-red-600 dark:text-red-400 flex items-center"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                                    {errors.password}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.3 }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                formAction={(formData) => handleSubmit(formData, 'login')}
                                                disabled={isLoading}
                                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                                            >
                                                {isLoading ? (
                                                    <motion.div 
                                                        className="flex items-center"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <motion.div 
                                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        />
                                                        Iniciando sesión...
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        className="flex items-center"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <LogIn className="w-5 h-5 mr-3" />
                                                        Iniciar Sesión
                                                    </motion.div>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </motion.form>
                        ) : (
                            <motion.form 
                                key="signup"
                                className="space-y-5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <motion.div 
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                >
                                    <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300 font-medium">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <motion.div
                                            animate={{ 
                                                color: errors.email && touched.email ? '#ef4444' : '#94a3b8'
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                        </motion.div>
                                        <Input
                                            id="signup-email"
                                            name="email"
                                            type="email"
                                            required
                                            onChange={handleInputChange}
                                            className={`pl-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                                                errors.email && touched.email 
                                                    ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500' 
                                                    : 'border-slate-200 dark:border-slate-600 focus-visible:border-green-500 focus-visible:ring-green-500/50'
                                            }`}
                                            placeholder="tu@email.com"
                                            aria-invalid={!!(errors.email && touched.email)}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {errors.email && touched.email && (
                                            <motion.p 
                                                className="text-sm text-red-600 dark:text-red-400 flex items-center"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                                {errors.email}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                <motion.div 
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                    <Label htmlFor="signup-password" className="text-slate-700 dark:text-slate-300 font-medium">
                                        Contraseña
                                    </Label>
                                    <div className="relative">
                                        <motion.div
                                            animate={{ 
                                                color: errors.password && touched.password ? '#ef4444' : '#94a3b8'
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                        </motion.div>
                                        <Input
                                            id="signup-password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            onChange={handleInputChange}
                                            className={`pl-12 pr-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                                                errors.password && touched.password 
                                                    ? 'border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500' 
                                                    : 'border-slate-200 dark:border-slate-600 focus-visible:border-green-500 focus-visible:ring-green-500/50'
                                            }`}
                                            placeholder="••••••••"
                                            aria-invalid={!!(errors.password && touched.password)}
                                        />
                                        <motion.button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
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
                                    
                                    {/* Password Strength Indicator */}
                                    <AnimatePresence>
                                        {touched.password && (
                                            <motion.div 
                                                className="space-y-2"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className={`h-full ${
                                                                passwordStrength <= 2 ? 'bg-red-500' :
                                                                passwordStrength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(passwordStrength / 6) * 100}%` }}
                                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                    <motion.span 
                                                        className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                                                        key={passwordStrength}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {passwordStrength <= 2 ? 'Débil' : passwordStrength <= 4 ? 'Media' : 'Fuerte'}
                                                    </motion.span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    <AnimatePresence>
                                        {errors.password && touched.password && (
                                            <motion.p 
                                                className="text-sm text-red-600 dark:text-red-400 flex items-center"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                                {errors.password}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3 }}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            formAction={(formData) => handleSubmit(formData, 'signup')}
                                            disabled={isLoading}
                                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            {isLoading ? (
                                                <motion.div 
                                                    className="flex items-center"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <motion.div 
                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    Creando cuenta...
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    className="flex items-center"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <UserPlus className="w-5 h-5 mr-3" />
                                                    Crear Cuenta
                                                </motion.div>
                                            )}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </motion.form>
                        )}
                        </AnimatePresence>

                        <motion.div 
                            className="relative"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            <Separator className="my-6" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.span 
                                    className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-500 dark:text-slate-400 font-medium"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.9, duration: 0.3 }}
                                >
                                    O continúa con
                                </motion.span>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="text-center text-sm text-slate-600 dark:text-slate-400"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-center gap-1"
                                >
                                    {activeTab === 'login' ? (
                                        <>
                                            <span>¿No tienes una cuenta?</span>
                                            <motion.button
                                                type="button"
                                                onClick={() => setActiveTab('signup')}
                                                className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Regístrate aquí
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <span>¿Ya tienes una cuenta?</span>
                                            <motion.button
                                                type="button"
                                                onClick={() => setActiveTab('login')}
                                                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Inicia sesión
                                            </motion.button>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}