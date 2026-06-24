<template>
    <div class="master-form-layout">
        <!-- Form Sections (Fixed) -->
        <div class="form-sections-fixed">
            <slot name="form-sections" />
        </div>

        <!-- Grid Section (Scrollable if needed) -->
        <div class="grid-section-scroll" v-if="$slots['grid-section']">
            <div class="grid-header">
                <slot name="grid-header" />
            </div>
            <div class="grid-body">
                <slot name="grid-section" />
            </div>
        </div>

        <!-- Bottom Bar (Fixed) -->
        <div class="form-bottom-bar">
            <div class="bottom-left">
                <slot name="bottom-left" />
            </div>
            <div class="bottom-actions">
                <slot name="bottom-actions">
                    <Button label="Batal" severity="secondary" text size="small" @click="$emit('cancel')" />
                    <Button label="Simpan & Baru" severity="secondary" size="small" :loading="saving" @click="$emit('save-new')" v-if="showSaveNew" />
                    <Button :label="saveLabel || 'Simpan'" severity="primary" size="small" :loading="saving" @click="$emit('save')" />
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    saving?: boolean
    showSaveNew?: boolean
    saveLabel?: string
}>()

defineEmits<{
    (e: 'save'): void
    (e: 'save-new'): void
    (e: 'cancel'): void
}>()
</script>

<style lang="scss" scoped>
.master-form-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

// Form sections - FIXED (no scroll)
.form-sections-fixed {
    flex-shrink: 0;
    padding: 0.75rem 0.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

// Grid section - SCROLLABLE
.grid-section-scroll {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin: 0.75rem;
    background: var(--surface-card);
    border-radius: 0.75rem;
    border: 1px solid var(--surface-border);
}

.grid-header {
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-border);
    font-weight: 600;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    :deep(i) { color: var(--primary-500); font-size: 0.813rem; }
}

.grid-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: var(--surface-300); border-radius: 2px; }
}

// Bottom bar - FIXED
.form-bottom-bar {
    flex-shrink: 0;
    background: var(--surface-card);
    border-top: 1px solid var(--surface-border);
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .bottom-actions {
        display: flex;
        gap: 0.375rem;
        margin-left: auto;
    }
}

// Responsive
@media (max-width: 768px) {
    .form-sections-fixed {
        padding: 0.5rem 0.5rem 0;
        gap: 0.375rem;
    }
    .grid-section-scroll {
        margin: 0.5rem;
    }
    .form-bottom-bar {
        padding: 0.375rem 0.5rem;
    }
}
</style>