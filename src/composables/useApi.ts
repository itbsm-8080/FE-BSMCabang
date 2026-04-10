// composables/useApi.ts
import { useToast } from 'primevue/usetoast'

export const useApi = () => {
    const { $api } = useNuxtApp()
    const toast = useToast()

    const get = async <T = any>(url: string, showToast = false): Promise<T> => {
        try {
            const response = await $api.get<T>(url)
            return response.data
        } catch (error: any) {
            if (showToast) {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: error.response?.data?.message || 'Terjadi kesalahan',
                    life: 3000
                })
            }
            throw error
        }
    }

    const post = async <T = any>(url: string, data: any, showToast = false): Promise<T> => {
        try {
            const response = await $api.post<T>(url, data)
            return response.data
        } catch (error: any) {
            if (showToast) {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: error.response?.data?.message || 'Terjadi kesalahan',
                    life: 3000
                })
            }
            throw error
        }
    }

    return { get, post, $api }
}