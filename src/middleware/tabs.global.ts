// middleware/tabs.global.ts
import { getFlatMenuItems } from '~/config/menu'

export default defineNuxtRouteMiddleware((to) => {
    // Skip untuk halaman auth
    const authPaths = ['/auth/login', '/auth/access', '/auth/error', '/landing']
    if (authPaths.includes(to.path)) {
        return
    }

    const tabsStore = useTabsStore()

    // 🔥 CARI DI MENU CONFIG (auto-detect)
    const flatMenu = getFlatMenuItems()
    const menuItem = flatMenu.find(item => {
        // Exact match atau path without query
        const itemPath = item.to?.split('?')[0]
        const currentPath = to.path.split('?')[0]
        return itemPath === currentPath
    })

    // Default values
    let title = 'Page'
    let icon = 'pi pi-file'
    let closable = true

    if (menuItem) {
        // 🔥 PAKAI DATA DARI MENU CONFIG
        title = menuItem.tabTitle || menuItem.label
        icon = menuItem.tabIcon || menuItem.icon || 'pi pi-file'
        closable = menuItem.closable !== false
    } else {
        // 🔥 FALLBACK: Deteksi dari path (untuk halaman dinamis)
        if (to.path.includes('/form')) {
            const basePath = to.path.replace('/form', '')
            const parentMenu = flatMenu.find(item => item.to === basePath)

            if (parentMenu) {
                const prefix = to.query.id ? 'Edit' : 'Tambah'
                title = `${prefix} ${parentMenu.tabTitle || parentMenu.label}`
                icon = parentMenu.tabIcon || parentMenu.icon || 'pi pi-pencil'
            } else {
                title = to.query.id ? 'Edit' : 'Tambah'
                icon = 'pi pi-pencil'
            }
        } else {
            // Dynamic routes (misal: /master/group)
            title = to.path.split('/').pop()?.replace(/-/g, ' ') || 'Page'
            title = title.charAt(0).toUpperCase() + title.slice(1)
        }
    }

    // Buka tab
    tabsStore.openTab({
        title,
        path: to.path,
        query: to.query,
        icon,
        closable
    })
})