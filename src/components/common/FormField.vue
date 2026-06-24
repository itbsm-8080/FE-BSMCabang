<template>
    <div class="form-field" :class="{ 'has-error': error }" :style="fieldStyle">
        <label v-if="label">
            {{ label }}
            <span v-if="required" class="required">*</span>
        </label>
        <slot />
        <small v-if="helpText" class="field-help">{{ helpText }}</small>
        <small v-if="error" class="field-error">{{ error }}</small>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    label?: string
    required?: boolean
    helpText?: string
    error?: string
    colSpan?: number
}>()

const fieldStyle = computed(() => ({
    gridColumn: props.colSpan ? `span ${props.colSpan}` : 'span 1'
}))
</script>

<style lang="scss" scoped>
.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    label {
        font-size: 0.688rem;
        font-weight: 600;
        color: var(--text-color-secondary);
        text-transform: uppercase;
        letter-spacing: 0.025em;
        .required { color: #dc2626; }
    }
    .field-help { font-size: 0.625rem; color: var(--text-color-secondary); }
    .field-error { font-size: 0.625rem; color: #dc2626; }
}
</style>