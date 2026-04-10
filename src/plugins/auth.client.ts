// plugins/auth.client.ts
export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()

    // Restore session saat app pertama kali load
    authStore.restoreSession()

    return {
        provide: {
            auth: authStore
        }
    }
})