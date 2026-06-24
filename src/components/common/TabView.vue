<template>
    <div class="tab-view">
        <KeepAlive :max="10">
            <component 
                :is="currentComponent" 
                :key="componentKey"
            />
        </KeepAlive>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, shallowRef, watch, ref, computed } from 'vue'
import { useTabsStore } from '~/stores/tabs'
import { useRouter } from 'vue-router'

const tabsStore = useTabsStore()
const router = useRouter()

// Cache untuk komponen
const componentCache = new Map()
// 🔥 Track instance key untuk setiap tab (berubah saat tab dibuka ulang)
const tabInstanceKeys = ref<Record<string, number>>({})

// Mapping path ke komponen
const getComponentForPath = (path: string) => {
    const basePath = path.split('?')[0]
    
    const componentMap: Record<string, any> = {
        '/': () => import('~/pages/index.vue'),
        '/dashboard': () => import('~/pages/dashboard/index.vue'),
        '/master/barang': () => import('~/pages/master/barang/index.vue'),
        '/master/barang/form': () => import('~/pages/master/barang/form.vue'),
        '/master/customer': () => import('~/pages/master/customer/index.vue'),
        '/master/customer/form': () => import('~/pages/master/customer/form.vue'),
        '/penjualan/do': () => import('~/pages/penjualan/do/index.vue'),
        '/penjualan/do/form': () => import('~/pages/penjualan/do/form.vue'),
    }
    
    return componentMap[basePath] || (() => import('~/pages/index.vue'))
}

const currentComponent = shallowRef<any>(null)

// 🔥 Generate unique key untuk komponen
const getInstanceKey = (tabId: string): number => {
    if (!tabInstanceKeys.value[tabId]) {
        tabInstanceKeys.value[tabId] = 0
    }
    return tabInstanceKeys.value[tabId]
}

const componentKey = computed(() => {
    const activeId = tabsStore.activeTabId
    if (!activeId) return 'default'
    
    const instanceKey = getInstanceKey(activeId)
    return `${activeId}-${instanceKey}`
})

// 🔥 Increment instance key (force destroy & recreate)
const incrementInstanceKey = (tabId: string) => {
    if (!tabInstanceKeys.value[tabId]) {
        tabInstanceKeys.value[tabId] = 0
    }
    tabInstanceKeys.value[tabId]++
    console.log(`🔄 Instance key incremented for ${tabId}: ${tabInstanceKeys.value[tabId]}`)
}

// Watch active tab dan load komponen
watch(() => tabsStore.activeTabId, async (newId, oldId) => {
    if (!newId) return
    
    const activeTab = tabsStore.activeTab
    if (!activeTab) return
    
    console.log('🔄 Loading tab:', activeTab.title, activeTab.path)
    
    // Cek apakah komponen sudah ada di cache
    if (componentCache.has(newId)) {
        currentComponent.value = componentCache.get(newId)
        console.log('📦 Using cached component for:', newId)
    } else {
        // Load komponen baru
        const loader = getComponentForPath(activeTab.path)
        const comp = defineAsyncComponent(loader)
        componentCache.set(newId, comp)
        currentComponent.value = comp
        console.log('🆕 New component loaded for:', newId)
    }
    
    // Update URL
    const targetPath = activeTab.query && Object.keys(activeTab.query).length > 0
        ? { path: activeTab.path, query: activeTab.query }
        : activeTab.path
    
    router.push(targetPath).catch(() => {})
}, { immediate: true })

// 🔥 PENTING: Saat tab ditutup, hapus dari cache DAN increment key untuk pembukaan berikutnya
watch(() => tabsStore.tabs.length, (newLen, oldLen) => {
    const activeTabIds = new Set(tabsStore.tabs.map(t => t.id))
    
    for (const [id] of componentCache) {
        if (!activeTabIds.has(id)) {
            // Hapus dari cache
            componentCache.delete(id)
            
            // 🔥 INCREMENT KEY agar komponen di-recreate saat dibuka lagi
            incrementInstanceKey(id)
            
            console.log(`🗑️ Tab closed, cache cleared & key incremented for: ${id}`)
        }
    }
    
    // 🔥 Bersihkan instance key untuk tab yang sudah lama tidak ada
    const existingIds = new Set(tabsStore.tabs.map(t => t.id))
    for (const id of Object.keys(tabInstanceKeys.value)) {
        if (!existingIds.has(id) && id !== tabsStore.activeTabId) {
            // Jangan hapus key-nya, biarkan tetap ada untuk tracking
        }
    }
})

// 🔥 Watch when a tab is opened (via middleware)
// Force new instance if it was previously closed
watch(() => tabsStore.tabs, (newTabs) => {
    // Tidak perlu action khusus, karena componentKey akan otomatis menggunakan
    // instance key yang sudah di-increment saat tab ditutup sebelumnya
}, { deep: true })
</script>

<style lang="scss" scoped>
.tab-view {
    height: 100%; // 🔥 Full height content area
    overflow: hidden; // 🔥 NO SCROLL
}
</style>