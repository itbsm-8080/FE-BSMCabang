<template>
    <div class="status-chips">
        <div 
            v-for="chip in chips" 
            :key="chip.field"
            class="status-chip"
            :class="{ 'active': modelValue[chip.field] }"
            @click="toggle(chip.field)"
        >
            <i :class="['pi', chip.icon]"></i>
            <span>{{ chip.label }}</span>
            <ToggleSwitch :modelValue="modelValue[chip.field]" @click.stop @update:modelValue="(v: boolean) => updateChip(chip.field, v)" />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: Record<string, boolean>
    chips: { field: string; label: string; icon: string }[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, boolean>): void
}>()

const toggle = (field: string) => {
    const newValue = { ...props.modelValue, [field]: !props.modelValue[field] }
    emit('update:modelValue', newValue)
}

const updateChip = (field: string, value: boolean) => {
    const newValue = { ...props.modelValue, [field]: value }
    emit('update:modelValue', newValue)
}
</script>

<style lang="scss" scoped>
.status-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.status-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: var(--surface-100);
    border: 1.5px solid var(--surface-border);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s;
    
    i { color: var(--text-color-secondary); font-size: 0.875rem; }
    span { font-size: 0.75rem; color: var(--text-color-secondary); }
    
    &:hover { background: var(--surface-200); }
    
    &.active {
        background: var(--primary-50);
        border-color: var(--primary-300);
        i { color: var(--primary-600); }
        span { color: var(--primary-700); font-weight: 500; }
    }
}
</style>