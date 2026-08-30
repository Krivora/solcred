'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/shared/stores/auth.store'
import { authApi } from '@/features/auth/api/auth.api'
import { ApiError } from '@/shared/api/client'
import type {
    LoginFormValues,
    RegisterFormValues,
} from '@/shared/schemas/auth.schema'
import { authToast } from '@/shared/lib/toaster'
import { getDefaultRouteForRole } from '@/shared/config/route-permissions.config'
import { obtenerRolEfectivo } from '@/shared/types/auth.types'
const getErrorMessage = (err: unknown): string => {
    if (err instanceof ApiError) return err.message
    if (err instanceof Error) return err.message
    return 'Ocurrió un error inesperado'
}

export function useAuth() {
    const router = useRouter()
    const { setAuth, clearAuth } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const login = async (values: LoginFormValues) => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await authApi.login(values)
            setAuth(data.usuario, data.token)
            const { rol } = useAuthStore.getState() 
            authToast.loginSuccess()
            router.push(getDefaultRouteForRole(rol!))
        } catch (err: unknown) {
            const message = getErrorMessage(err)
            setError(message)
            authToast.loginError(message)
        } finally {
            setIsLoading(false)
        }
    }
    const register = async (values: RegisterFormValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const payload = {
                ...values,
                curp: values.curp || undefined,
                rfc: values.rfc || undefined,
            }
            await authApi.registro(payload)
            authToast.registerSuccess()
            router.push('/login?registered=true')
        } catch (err: unknown) {
            const message = getErrorMessage(err)
            setError(message)
            authToast.registerError(message)
        } finally {
            setIsLoading(false)
        }
    }
    const logout = () => {
        clearAuth()
        authToast.logoutSuccess()
        router.push('/login')
    }
    return {
        isLoading,
        error,
        login,
        register,
        logout,
    }
}