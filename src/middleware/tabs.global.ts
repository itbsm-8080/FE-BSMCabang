// middleware/tabs.global.ts
import { useMenu } from '~/layouts/composables/menu.js'

export default defineNuxtRouteMiddleware((to) => {
    const authPaths = ['/auth/login', '/auth/access', '/auth/error', '/landing']
    if (authPaths.includes(to.path)) return

    const tabsStore = useTabsStore()
    const { model: menuItems } = useMenu()

    let title = ''
    let icon = 'pi pi-file'
    let closable = true

    if (to.path === '/dashboard' || to.path === '/') {
        title = 'Dashboard'
        icon = 'pi pi-home'
        closable = false
    } else {
        const allItems: any[] = []
        const flatten = (items: any[]) => {
            for (const item of items) {
                if (item.to) allItems.push(item)
                if (item.items) flatten(item.items)
            }
        }
        flatten(menuItems.value)

        const found = allItems.find(item => item.to === to.path || to.path.startsWith(item.to))

        if (found) {
            title = found.tabTitle || found.label

            if (to.path.includes('/form')) {
                const prefix = to.query.id ? 'Edit' : 'Tambah'
                title = `${prefix} ${found.tabTitle || found.label}`
            }

            icon = found.tabIcon || found.icon || 'pi pi-file'
        } else {
            title = to.path.split('/').pop()?.replace(/-/g, ' ') || 'Page'
            title = title.charAt(0).toUpperCase() + title.slice(1)
        }
    }

    tabsStore.openTab({ title, path: to.path, query: to.query, icon, closable })
})