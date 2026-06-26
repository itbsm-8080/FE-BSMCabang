// middleware/permission.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
    const authPaths = ['/auth/login', '/auth/access', '/auth/error', '/landing', '/dashboard', '/']
    if (authPaths.includes(to.path)) return

    const permStore = usePermissionStore()

    // 🔥 Kalau permission belum loaded, izinkan dulu
    if (!permStore.isLoaded) return

    // 🔥 Cek akses untuk route ini
    let checkRoute = to.path

    // 🔥 Kalau ini halaman form, cek akses ke route induknya
    if (to.path.includes('/form')) {
        checkRoute = to.path.replace('/form', '')
    }

    const hasAccess = permStore.canAccessRoute(checkRoute)

    if (!hasAccess) {
        return navigateTo(`/auth/access?from=${to.path}`)
    }
})