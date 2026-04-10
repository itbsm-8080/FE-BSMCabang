// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()

    // Restore session dari localStorage (hanya di client)
    if (process.client) {
        authStore.restoreSession()
    }

    // 🔥 DAFTAR HALAMAN YANG TIDAK PERLU LOGIN (PUBLIC)
    const publicPages = ['/auth/login', '/auth/access', '/auth/error', '/landing']

    // Cek apakah halaman saat ini termasuk public atau master
    const isPublicPage = publicPages.includes(to.path)

    console.log('🔍 Auth Check:', {
        path: to.path,
        isLoggedIn: authStore.isLoggedIn,
        isPublicPage
    })

    // Jika belum login dan mencoba akses halaman non-public
    if (!authStore.isLoggedIn && !isPublicPage) {
        console.log('❌ Not logged in, redirect to login')
        return navigateTo('/auth/login')
    }

    // Jika sudah login dan mencoba akses halaman login
    if (authStore.isLoggedIn && to.path === '/auth/login') {
        console.log('✅ Already logged in, redirect to dashboard')
        return navigateTo('/dashboard')
    }

    console.log('✅ Access granted')
})