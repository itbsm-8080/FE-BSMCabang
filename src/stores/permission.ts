// stores/permission.ts
import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permission', {
    state: () => ({
        hakList: [] as any[],           // Semua hak user
        menuList: [] as any[],          // Semua menu
        isLoaded: false,
    }),

    getters: {
        // 🔥 Cek hak untuk menu tertentu
        getHakByMenuId: (state) => (menuId: number) => {
            const hak = state.hakList.find((h: any) => h.HAK_MEN_ID === menuId)
            return {
                hasAccess: !!hak,
                insert: hak?.hak_men_insert === 'Y',
                edit: hak?.hak_men_edit === 'Y',
                delete: hak?.hak_men_delete === 'Y',
            }
        },

        // 🔥 Cek hak untuk route tertentu
        getHakByRoute: (state) => (route: string) => {
            const menu = state.menuList.find((m: any) => m.men_route === route)
            if (!menu) return { hasAccess: false, insert: false, edit: false, delete: false }

            const hak = state.hakList.find((h: any) => h.HAK_MEN_ID === menu.MEN_ID)
            return {
                hasAccess: !!hak,
                insert: hak?.hak_men_insert === 'Y',
                edit: hak?.hak_men_edit === 'Y',
                delete: hak?.hak_men_delete === 'Y',
            }
        },

        // 🔥 Cek apakah user punya akses ke route
        canAccessRoute: (state) => (route: string) => {
            const menu = state.menuList.find((m: any) => m.men_route === route)
            if (!menu) return false
            return state.hakList.some((h: any) => h.HAK_MEN_ID === menu.MEN_ID)
        },
    },

    actions: {
        async fetchAll() {
            if (this.isLoaded) return

            try {
                const { $api } = useNuxtApp()
                const authStore = useAuthStore()
                const kode = authStore.user?.kode || authStore.user?.USER_KODE

                if (!kode) return

                // 🔥 Fetch paralel: hak user + semua menu
                const [hakRes, menuRes] = await Promise.all([
                    $api.get(`/hak-user/${kode}`),
                    $api.get('/menu-items')
                ])

                if (hakRes.data.success) this.hakList = hakRes.data.data
                if (menuRes.data.success) this.menuList = menuRes.data.data

                this.isLoaded = true

                console.log('📦 Permission loaded:')
                console.log('  hakList:', this.hakList.length, 'items')
                console.log('  menuList:', this.menuList.length, 'items')
                console.log('  Sample menu:', this.menuList.slice(0, 3))
            } catch (error) {
                console.error('Failed to fetch permissions:', error)
            }
        },

        reset() {
            this.hakList = []
            this.menuList = []
            this.isLoaded = false
        }
    }
})