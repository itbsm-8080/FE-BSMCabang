import { ref } from 'vue'

const model = ref([])
const isLoaded = ref(false)

export function useMenu() {
    const fetchMenu = async () => {
        const { $api } = useNuxtApp()
        const authStore = useAuthStore()
        const kode = authStore.user?.kode || authStore.user?.USER_KODE

        if (!kode) return

        try {
            const response = await $api.get(`/menu/user/${kode}`)
            if (response.data.success) {
                model.value = response.data.data
                isLoaded.value = true
            }
        } catch (error) {
            console.error('Failed to load menu:', error)
        }
    }

    // 🔥 RESET: Panggil saat logout/login
    const resetMenu = () => {
        model.value = []
        isLoaded.value = false
    }

    return { model, fetchMenu, resetMenu, isLoaded }
}