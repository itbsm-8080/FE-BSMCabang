<script setup lang="ts">
const authStore = useAuthStore()

// Restore session
if (process.client) {
    authStore.restoreSession()
}

// Langsung redirect berdasarkan status login
if (authStore.isLoggedIn) {
    await navigateTo('/dashboard')
} else {
    await navigateTo('/auth/login')
}
</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
    </div>
</template>