<template>
    <Teleport to="body">
        <Transition name="dialog-fade">
            <div v-if="visible" class="dialog-overlay" @click.self="onCancel">
                <div class="dialog-bubble">
                    <!-- Decorative blobs -->
                    <div class="bubble-blob blob-1"></div>
                    <div class="bubble-blob blob-2"></div>
                    
                    <!-- Icon Section -->
                    <div class="bubble-icon-wrapper">
                        <div class="bubble-icon-circle">
                            <svg class="bubble-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <div class="bubble-ripple" v-for="i in 2" :key="i" :style="{ animationDelay: `${i * 0.2}s` }"></div>
                    </div>
                    
                    <!-- Text -->
                    <div class="bubble-text">
                        <h3>{{ title }}</h3>
                        <p>{{ message }}</p>
                        <span v-if="subMessage" class="bubble-sub">{{ subMessage }}</span>
                    </div>
                    
                    <!-- Actions -->
                    <div class="bubble-actions">
                        <button 
                            class="bubble-btn bubble-btn-secondary"
                            @click="onCancel"
                            :disabled="loading"
                        >
                            <i class="pi pi-times"></i>
                            <span>{{ cancelLabel }}</span>
                        </button>
                        <button 
                            class="bubble-btn bubble-btn-danger"
                            @click="onConfirm"
                            :disabled="loading"
                        >
                            <i v-if="!loading" class="pi pi-trash"></i>
                            <i v-else class="pi pi-spinner pi-spin"></i>
                            <span>{{ confirmLabel }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
    modelValue?: boolean
    title?: string
    message?: string
    subMessage?: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
}>(), {
    title: 'Konfirmasi Hapus',
    message: 'Yakin ingin menghapus data ini?',
    subMessage: 'Tindakan ini tidak dapat dibatalkan.',
    confirmLabel: 'Hapus',
    cancelLabel: 'Batal'
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'confirm'): void
    (e: 'cancel'): void
}>()

const visible = ref(props.modelValue || false)

watch(() => props.modelValue, (val) => {
    visible.value = val || false
})

watch(visible, (val) => {
    emit('update:modelValue', val)
})

const onConfirm = () => {
    emit('confirm')
}

const onCancel = () => {
    visible.value = false
    emit('cancel')
}
</script>

<style lang="scss" scoped>
// 🔥 OVERLAY
.dialog-overlay {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    padding: 1rem;
}

// 🔥 BUBBLE CARD
.dialog-bubble {
    position: relative; width: 100%; max-width: 360px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255, 255, 255, 0.6);
    border-radius: 1.5rem;
    padding: 1.75rem 1.5rem 1.25rem;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.04);
}

// 🔥 DECORATIVE BLOBS
.bubble-blob {
    position: absolute; border-radius: 50%; filter: blur(30px); opacity: 0.3; pointer-events: none;
    &.blob-1 { width: 80px; height: 80px; background: #fecaca; top: -30px; right: -20px; }
    &.blob-2 { width: 60px; height: 60px; background: #fed7aa; bottom: 40px; left: -20px; }
}

// 🔥 ICON
.bubble-icon-wrapper { position: relative; z-index: 2; margin-bottom: 1rem; }
.bubble-icon-circle {
    width: 3.5rem; height: 3.5rem; border-radius: 1rem;
    background: #fef2f2;
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
    animation: iconShake 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    .bubble-icon-svg {
        width: 1.75rem; height: 1.75rem;
        color: #ef4444;
        animation: iconWarn 0.4s ease 0.3s both;
    }
}

.bubble-ripple {
    position: absolute; top: 50%; left: 50%;
    width: 3.5rem; height: 3.5rem; border-radius: 1rem;
    border: 2px solid #fca5a5;
    transform: translate(-50%, -50%);
    animation: rippleOut 1.5s ease-out infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
}

// 🔥 TEXT
.bubble-text {
    position: relative; z-index: 2; margin-bottom: 1.25rem;
    animation: fadeUp 0.5s ease 0.4s both;
    h3 { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0 0 0.375rem; }
    p { font-size: 0.813rem; color: #64748b; margin: 0; line-height: 1.5; }
    .bubble-sub { display: block; font-size: 0.688rem; color: #94a3b8; margin-top: 0.25rem; }
}

// 🔥 ACTIONS
.bubble-actions {
    position: relative; z-index: 2; display: flex; gap: 0.5rem; width: 100%;
    animation: fadeUp 0.5s ease 0.5s both;
}

// 🔥 BUTTON BASE
.bubble-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.375rem;
    padding: 0.5rem 1rem; border-radius: 0.75rem;
    font-size: 0.75rem; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease; border: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    i { font-size: 0.75rem; }
    span { color: inherit; }
    &:active { transform: scale(0.96); }
    &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
}

// 🔥 SECONDARY BUTTON - ABU-ABU
.bubble-btn-secondary {
    background: #f1f5f9 !important;
    color: #334155 !important;
    border: 1.5px solid #e2e8f0 !important;
    i { color: #334155 !important; }
    span { color: #334155 !important; }
    &:hover:not(:disabled) {
        background: #e2e8f0 !important;
        border-color: #cbd5e1 !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        color: #1e293b !important;
        i { color: #1e293b !important; }
        span { color: #1e293b !important; }
    }
}

// 🔥 DANGER BUTTON - MERAH
.bubble-btn-danger {
    background: #ef4444 !important;
    color: #ffffff !important;
    border: 1.5px solid #dc2626 !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
    i { color: #ffffff !important; }
    span { color: #ffffff !important; }
    &:hover:not(:disabled) {
        background: #dc2626 !important;
        box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4) !important;
        transform: translateY(-1px);
        color: #ffffff !important;
        i { color: #ffffff !important; }
        span { color: #ffffff !important; }
    }
}

// 🔥 ANIMATIONS
@keyframes iconShake {
    0% { transform: scale(0) rotate(-20deg); }
    40% { transform: scale(1.1) rotate(10deg); }
    60% { transform: scale(1.1) rotate(-10deg); }
    80% { transform: scale(1.05) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); }
}
@keyframes iconWarn {
    0% { transform: scale(0); opacity: 0; }
    80% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
}
@keyframes rippleOut {
    0% { width: 3.5rem; height: 3.5rem; opacity: 1; }
    100% { width: 6rem; height: 6rem; opacity: 0; }
}
@keyframes fadeUp {
    0% { opacity: 0; transform: translateY(15px); }
    100% { opacity: 1; transform: translateY(0); }
}

// 🔥 DIALOG TRANSITION
.dialog-fade-enter-active { transition: all 0.3s ease; .dialog-bubble { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); } }
.dialog-fade-leave-active { transition: all 0.2s ease; .dialog-bubble { transition: all 0.25s ease; } }
.dialog-fade-enter-from { opacity: 0; .dialog-bubble { opacity: 0; transform: scale(0.9) translateY(20px); } }
.dialog-fade-leave-to { opacity: 0; .dialog-bubble { opacity: 0; transform: scale(0.95) translateY(10px); } }

// 🔥 DARK MODE
:global(.app-dark) {
    .dialog-overlay { background: rgba(0, 0, 0, 0.6); }
    .dialog-bubble {
        background: rgba(20, 20, 30, 0.95);
        border-color: rgba(255, 255, 255, 0.06);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }
    .bubble-blob { opacity: 0.15; }
    .bubble-icon-circle { background: rgba(239, 68, 68, 0.15); .bubble-icon-svg { color: #f87171; } }
    .bubble-text { h3 { color: #e2e8f0; } p { color: #94a3b8; } .bubble-sub { color: #64748b; } }
    .bubble-ripple { border-color: #dc2626; }
    
    .bubble-btn-secondary {
        background: #334155 !important; color: #cbd5e1 !important; border-color: #475569 !important;
        i { color: #cbd5e1 !important; } span { color: #cbd5e1 !important; }
        &:hover:not(:disabled) { background: #475569 !important; color: #e2e8f0 !important; i { color: #e2e8f0 !important; } span { color: #e2e8f0 !important; } }
    }
    
    .bubble-btn-danger {
        background: #ef4444 !important; color: #ffffff !important; border-color: #dc2626 !important;
        i { color: #ffffff !important; } span { color: #ffffff !important; }
        &:hover:not(:disabled) { background: #dc2626 !important; color: #ffffff !important; i { color: #ffffff !important; } span { color: #ffffff !important; } }
    }
}
</style>