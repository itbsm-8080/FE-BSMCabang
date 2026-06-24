// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    if (process.client) {
        authStore.restoreSession()
    }

    const publicPages = ['/auth/login', '/auth/access', '/auth/error', '/landing']
    const isPublicPage = publicPages.includes(to.path)

    if (!authStore.isLoggedIn && !isPublicPage) {
        return navigateTo('/auth/login')
    }

    if (authStore.isLoggedIn && to.path === '/auth/login') {
        return navigateTo('/dashboard')
    }
})