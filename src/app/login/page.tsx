'use client'

import { useState } from 'react'
import { login } from './actions'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        await login(formData)
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background with corporate blue */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e3a] via-[#254153] to-[#1a2e3a]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#254153]/50 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#3d6b85]/40 rounded-full blur-3xl"></div>
            </div>

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl border border-white/50 p-8 transition-all duration-500 hover:shadow-[#254153]/20 hover:shadow-3xl">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#254153] mb-4 shadow-lg shadow-[#254153]/30">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-[#254153] mb-2">
                            Bienvenido
                        </h1>
                        <p className="text-gray-500">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    {/* Form */}
                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-[#254153] block">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#254153] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#254153] focus:border-transparent transition-all duration-300"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-[#254153] block">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#254153] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#254153] focus:border-transparent transition-all duration-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-[#254153] text-white font-semibold rounded-xl shadow-lg shadow-[#254153]/30 hover:bg-[#1a2e3a] hover:shadow-[#254153]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Procesando...
                                </span>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </button>
                    </form>

                    {/* Decorative elements */}
                    <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-[#254153] to-transparent"></div>
                    <div className="absolute -bottom-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-[#254153]/50 to-transparent"></div>
                </div>

                {/* Footer */}
                <p className="text-center text-white/60 text-sm mt-8">
                    Protegido con autenticación segura
                </p>
            </div>
        </div>
    )
}
