<template>
    <div class="access-denied">
        <i class="pi pi-lock"></i>
        <h2>Akses Ditolak</h2>
        <p>{{ message }}</p>
        <Button v-if="showBack" label="Kembali" severity="secondary" size="small" @click="goBack" />
    </div>
</template>

<script setup lang="ts">
defineProps<{ message?: string; showBack?: boolean }>()

const goBack = () => {
    if (history.length > 1) navigateTo(-1)
    else navigateTo('/dashboard')
}
</script>

<style lang="scss" scoped>
.access-denied {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; padding: 2rem; text-align: center;
    i { font-size: 5rem; color: var(--red-400); margin-bottom: 1rem; opacity: 0.6; }
    h2 { font-size: 1.5rem; font-weight: 700; color: var(--text-color); margin: 0 0 0.5rem; }
    p { font-size: 0.875rem; color: var(--text-color-secondary); margin: 0 0 1.5rem; }
}
</style>