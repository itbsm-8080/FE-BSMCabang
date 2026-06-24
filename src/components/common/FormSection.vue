<template>
    <div class="form-section-compact">
        <div class="section-header" v-if="title">
            <i :class="['pi', icon || 'pi-info-circle']"></i>
            <span>{{ title }}</span>
            <span v-if="required" class="required-badge">*</span>
        </div>
        <div class="section-body">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string; icon?: string; required?: boolean }>()
</script>

<style lang="scss" scoped>
.form-section-compact {
    background: var(--surface-card);
    border-radius: 0.5rem;
    border: 1px solid var(--surface-border);
    overflow: hidden;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-border);
    font-size: 0.688rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.025em;

    i { color: var(--primary-500); font-size: 0.75rem; }

    .required-badge {
        margin-left: auto;
        font-size: 0.625rem;
        color: #dc2626;
    }
}

.section-body {
    padding: 0.5rem 0.75rem;
}
</style>