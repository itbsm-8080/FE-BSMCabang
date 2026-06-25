<template>
    <Dialog 
        v-model:visible="visible" 
        :modal="true" 
        :style="{ width: width }"
        :pt="{
            root: { class: 'success-dialog-root' },
            header: { class: 'success-dialog-header' },
            content: { class: 'success-dialog-content' }
        }"
    >
        <div class="success-dialog-body">
            <!-- Confetti Canvas -->
            <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
            
            <!-- Animated Icon -->
            <div class="success-icon-wrapper">
                <div class="success-icon-circle">
                    <i :class="['pi', icon, 'success-icon']"></i>
                </div>
                <div class="success-ripple" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.15}s` }"></div>
            </div>
            
            <!-- Message -->
            <div class="success-text">
                <h3 class="success-title">Berhasil!</h3>
                <p class="success-message">{{ message }}</p>
                <p v-if="subMessage" class="success-sub">{{ subMessage }}</p>
            </div>
        </div>
        
        <template #header>
            <div class="dialog-header-custom">
                <i class="pi pi-check-circle header-icon"></i>
                <span>Sukses</span>
            </div>
        </template>
        
        <template #footer>
            <div class="success-footer">
                <Button 
                    v-if="showStayButton"
                    :label="stayLabel" 
                    severity="secondary" 
                    size="small"
                    outlined
                    @click="onStay"
                    class="footer-btn stay-btn"
                />
                <Button 
                    :label="closeLabel" 
                    severity="primary" 
                    size="small" 
                    @click="onClose"
                    class="footer-btn close-btn"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = withDefaults(defineProps<{
    modelValue?: boolean
    message?: string
    subMessage?: string
    icon?: string
    width?: string
    showStayButton?: boolean
    stayLabel?: string
    closeLabel?: string
}>(), {
    message: 'Data berhasil disimpan.',
    icon: 'pi-check-circle',
    width: '420px',
    showStayButton: true,
    stayLabel: 'Tetap di Sini',
    closeLabel: 'Tutup Tab'
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'stay'): void
    (e: 'close'): void
}>()

const visible = ref(props.modelValue || false)
const confettiCanvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

watch(() => props.modelValue, (val) => {
    visible.value = val || false
    if (val) {
        nextTick(() => startConfetti())
    } else {
        stopConfetti()
    }
})

watch(visible, (val) => {
    emit('update:modelValue', val)
    if (!val) stopConfetti()
})

const onStay = () => {
    visible.value = false
    emit('stay')
}

const onClose = () => {
    visible.value = false
    emit('close')
}

// 🔥 Simple Confetti Animation
interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    color: string
    size: number
    rotation: number
    rotationSpeed: number
    opacity: number
}

const particles: Particle[] = []
const colors = ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#fbbf24', '#3b82f6', '#8b5cf6', '#ec4899']

const startConfetti = () => {
    if (!confettiCanvas.value) return
    
    const canvas = confettiCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    // Create particles
    particles.length = 0
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2 - 30,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 8 - 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1
        })
    }
    
    const animate = () => {
        if (!ctx || !canvas) return
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        for (const p of particles) {
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.15 // gravity
            p.rotation += p.rotationSpeed
            p.opacity -= 0.003
            
            if (p.opacity <= 0) continue
            
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate((p.rotation * Math.PI) / 180)
            ctx.globalAlpha = p.opacity
            ctx.fillStyle = p.color
            
            // Rectangle confetti
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
            
            ctx.restore()
        }
        
        // Remove dead particles
        const alive = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 20)
        particles.length = 0
        particles.push(...alive)
        
        if (particles.length > 0) {
            animationId = requestAnimationFrame(animate)
        }
    }
    
    animate()
}

const stopConfetti = () => {
    if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
    }
    particles.length = 0
}

onUnmounted(() => {
    stopConfetti()
})
</script>

<style lang="scss" scoped>
// Dialog overrides
:deep(.success-dialog-root) {
    border-radius: 1.25rem !important;
    overflow: hidden !important;
}

:deep(.success-dialog-header) {
    background: linear-gradient(135deg, var(--green-500), var(--green-600)) !important;
    color: white !important;
    padding: 0.75rem 1.25rem !important;
    border: none !important;
}

:deep(.success-dialog-content) {
    padding: 0 !important;
}

.dialog-header-custom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 0.938rem;
    
    .header-icon {
        font-size: 1.25rem;
    }
}

.success-dialog-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1.5rem 1.5rem;
    position: relative;
    overflow: hidden;
    min-height: 200px;
}

// Confetti
.confetti-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

// Animated Icon
.success-icon-wrapper {
    position: relative;
    margin-bottom: 1.25rem;
    z-index: 2;
}

.success-icon-circle {
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--green-100), var(--green-200));
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    animation: iconPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    .success-icon {
        font-size: 2.25rem;
        color: var(--green-500);
        animation: iconCheck 0.5s ease 0.2s both;
    }
}

.success-ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 50%;
    border: 2px solid var(--green-300);
    transform: translate(-50%, -50%);
    animation: rippleOut 1.5s ease-out infinite;
    
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
    &:nth-child(4) { animation-delay: 0.45s; }
}

// Text
.success-text {
    text-align: center;
    z-index: 2;
    animation: fadeInUp 0.5s ease 0.3s both;
}

.success-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0 0 0.5rem;
}

.success-message {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin: 0;
    line-height: 1.5;
}

.success-sub {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    opacity: 0.7;
    margin-top: 0.375rem;
}

// Footer
.success-footer {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    padding: 0.5rem 0;
    
    .footer-btn {
        min-width: 110px;
    }
}

// Animations
@keyframes iconPop {
    0% { transform: scale(0); }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

@keyframes iconCheck {
    0% { transform: scale(0) rotate(-45deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes rippleOut {
    0% { width: 4.5rem; height: 4.5rem; opacity: 1; }
    100% { width: 8rem; height: 8rem; opacity: 0; }
}

@keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
}
</style>