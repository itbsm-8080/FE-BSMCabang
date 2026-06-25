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
import { shallowRef, watch, ref, computed } from 'vue'
import { useTabsStore } from '~/stores/tabs'
import { useRouter } from 'vue-router'

const tabsStore = useTabsStore()
const router = useRouter()

const componentCache = new Map<string, any>()
const tabInstanceKeys = ref<Record<string, number>>({})

// 🔥 Auto-detect semua pages
const pageModules = import.meta.glob('~/pages/**/*.vue')

// 🔥 Resolve component
const getComponentForPath = (path: string) => {
    const basePath = path.split('?')[0]
    
    if (componentCache.has(basePath)) {
        return componentCache.get(basePath)
    }
    
    const cleanPath = basePath.replace(/^\//, '')
    
    // Cari exact match: index.vue dulu
    let foundKey = Object.keys(pageModules).find(key => 
        key.endsWith(`${cleanPath}/index.vue`)
    )
    
    // Kalau nggak ketemu, coba .vue langsung (form, dll)
    if (!foundKey) {
        foundKey = Object.keys(pageModules).find(key => 
            key.endsWith(`${cleanPath}.vue`)
        )
    }
    
    if (foundKey) {
        const comp = defineAsyncComponent(pageModules[foundKey])
        componentCache.set(basePath, comp)
        return comp
    }
    
    // Fallback: dashboard
    const fallbackKey = Object.keys(pageModules).find(k => k.includes('dashboard/index'))!
    const comp = defineAsyncComponent(pageModules[fallbackKey])
    componentCache.set(basePath, comp)
    return comp
}

const currentComponent = shallowRef<any>(null)

const componentKey = computed(() => {
    const id = tabsStore.activeTabId
    return id ? `${id}-${tabInstanceKeys.value[id] || 0}` : 'default'
})

watch(() => tabsStore.activeTabId, (newId) => {
    if (!newId) return
    const tab = tabsStore.activeTab
    if (!tab) return
    
    currentComponent.value = getComponentForPath(tab.path)
    
    const target = tab.query && Object.keys(tab.query).length > 0
        ? { path: tab.path, query: tab.query }
        : tab.path
    router.push(target).catch(() => {})
}, { immediate: true })

watch(() => tabsStore.tabs.length, () => {
    const activePaths = new Set(tabsStore.tabs.map(t => t.path.split('?')[0]))
    for (const [path] of componentCache) {
        if (!activePaths.has(path)) componentCache.delete(path)
    }
})
</script>

<style lang="scss" scoped>
.tab-view {
    flex: 1;
    overflow: auto;
    height: 100%;
}
</style>