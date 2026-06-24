<template>
    <div class="layout-wrapper" :class="containerClass">
        <!-- Floating Navbar -->
        <app-topbar></app-topbar>
        <app-sidebar v-if="layoutConfig.menuMode !== 'horizontal'"></app-sidebar>
        
        <!-- Main Area: Tab Bar + Content (menyatu) -->
        <div class="layout-main-area" v-if="tabsStore.isReady && tabsStore.tabs.length > 0">
            <!-- Tab Bar -->
            <div class="layout-tab-bar">
                <TabBar />
            </div>
            
            <!-- Content -->
            <div class="layout-content">
                <TabView v-if="tabsStore.isReady" />
            </div>
        </div>
        
        <!-- Fallback: No tabs -->
        <div class="layout-content-fallback" v-else-if="tabsStore.isReady">
            <TabView />
        </div>
        
        <div class="layout-mask animate-fadein"></div>
    </div>
    <Toast />
</template>

<script setup>
import { computed } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import TabBar from '~/components/common/TabBar.vue'
import TabView from '~/components/common/TabView.vue'
import { useLayout } from "~/layouts/composables/layout.js"
import { useTabsStore } from '~/stores/tabs'

const { layoutConfig, layoutState } = useLayout()
const tabsStore = useTabsStore()

onMounted(() => {
    tabsStore.initDefaultTabs()
})

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-horizontal': layoutConfig.menuMode === 'horizontal',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    }
})
</script>

<style lang="scss" scoped>
.layout-wrapper {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface-ground);
}

// ==================== MAIN AREA ====================
.layout-main-area {
    position: fixed;
    top: 4.5rem; // Navbar: 0.75rem (gap) + 3.5rem (height) + 0.25rem
    left: 0.75rem; // Sama dengan navbar gap
    right: 0.75rem; // Sama dengan navbar gap
    bottom: 0.75rem; // Gap dari bawah
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    // 🔥 BORDER RADIUS untuk seluruh area (tab bar + content)
    border-radius: 1rem;
    
    // 🔥 SHADOW menyatu
    box-shadow: 
        0 4px 24px rgba(0, 0, 0, 0.06),
        0 1px 4px rgba(0, 0, 0, 0.04);
}

// Tab Bar - di dalam main area
.layout-tab-bar {
    flex-shrink: 0;
    background: var(--surface-card);
    border-radius: 1rem 1rem 0 0; // Rounded top only
    border: 1px solid var(--surface-border);
    border-bottom: none;
    overflow: hidden;
}

// Content - fill sisa space
.layout-content {
    flex: 1;
    overflow: hidden;
    background: var(--surface-card);
    border-radius: 0 0 1rem 1rem; // Rounded bottom only
    border: 1px solid var(--surface-border);
    border-top: none;
}

// Fallback (no tabs)
.layout-content-fallback {
    position: fixed;
    top: 4.5rem;
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    overflow: hidden;
    background: var(--surface-card);
    border-radius: 1rem;
    border: 1px solid var(--surface-border);
    box-shadow: 
        0 4px 24px rgba(0, 0, 0, 0.06),
        0 1px 4px rgba(0, 0, 0, 0.04);
}
</style>