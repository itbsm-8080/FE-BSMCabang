<template>
    <Teleport to="body">
        <Transition name="dialog-fade">
            <div v-if="visible" class="perm-overlay" @click.self="visible = false">
                <div class="perm-dialog">
                    <div class="perm-icon">
                        <i class="pi pi-lock"></i>
                    </div>
                    <h3>Akses Ditolak</h3>
                    <p>{{ message }}</p>
                    <button class="perm-btn" @click="visible = false">Mengerti</button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue?: boolean; message?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const visible = ref(false)

watch(() => props.modelValue, (v) => visible.value = v || false)
watch(visible, (v) => emit('update:modelValue', v))
</script>

<style lang="scss" scoped>
.perm-overlay {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
    padding: 1rem;
}

.perm-dialog {
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 1.25rem;
    padding: 2rem 1.5rem 1.5rem;
    max-width: 340px;
    width: 100%;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.perm-icon {
    width: 3.5rem; height: 3.5rem;
    border-radius: 1rem;
    background: #fef2f2;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
    i { font-size: 1.5rem; color: #ef4444; }
}

h3 { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; }
p { font-size: 0.813rem; color: #64748b; margin: 0 0 1.5rem; line-height: 1.5; }

.perm-btn {
    padding: 0.5rem 2rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.813rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    &:hover { background: #dc2626; }
}

.dialog-fade-enter-active { transition: all 0.2s ease; }
.dialog-fade-leave-active { transition: all 0.15s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; transform: scale(0.95); }
</style>