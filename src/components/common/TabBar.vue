<template>
    <div class="tab-bar-chrome" v-if="tabsStore.tabs.length > 0">
        <div class="tabs-scroll-container" ref="tabsContainerRef" @wheel.prevent="onWheelScroll">
            <div class="tabs-list">
                <div 
                    v-for="tab in tabsStore.tabs" 
                    :key="tab.id"
                    class="tab-item"
                    :class="{ 
                        'active': tabsStore.activeTabId === tab.id,
                        'pinned': !tab.closable
                    }"
                    @click="tabsStore.setActiveTab(tab.id)"
                    @contextmenu.prevent="showContextMenu($event, tab)"
                    @mousedown.middle.prevent="closeTab(tab)"
                    :title="tab.title"
                >
                    <div class="tab-content">
                        <i :class="['pi', tab.icon || 'pi-file']" class="tab-icon"></i>
                        <span class="tab-title-text">{{ tab.title }}</span>
                        
                        <button 
                            v-if="tab.closable"
                            class="tab-close"
                            @click.stop="closeTab(tab)"
                        >
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                    
                    <div class="tab-active-bar" v-if="tabsStore.activeTabId === tab.id"></div>
                </div>
            </div>
        </div>
        
        <div class="tab-actions">
            <button class="tab-action-btn" @click="toggleMoreMenu" title="More">
                <i class="pi pi-ellipsis-h"></i>
            </button>
        </div>
        
        <Menu ref="contextMenu" :model="contextMenuItems" :popup="true" />
        <Menu ref="moreMenu" :model="moreMenuItems" :popup="true" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useTabsStore, type TabItem } from '~/stores/tabs'

const tabsStore = useTabsStore()
const contextMenu = ref()
const moreMenu = ref()
const tabsContainerRef = ref<HTMLElement | null>(null)

const contextMenuItems = [
    { label: 'Tutup Tab', icon: 'pi pi-times', command: () => { if (tabsStore.activeTab?.closable) tabsStore.closeTab(tabsStore.activeTabId) } },
    { label: 'Tutup Tab Lain', icon: 'pi pi-minus-circle', command: () => tabsStore.closeOtherTabs(tabsStore.activeTabId) },
    { label: 'Tutup Tab di Kanan', icon: 'pi pi-arrow-right', command: () => {
        const idx = tabsStore.tabs.findIndex(t => t.id === tabsStore.activeTabId)
        tabsStore.tabs.slice(idx + 1).filter(t => t.closable).forEach(t => tabsStore.closeTab(t.id))
    }},
    { separator: true },
    { label: 'Tutup Semua Tab', icon: 'pi pi-times-circle', command: () => tabsStore.closeAllTabs() }
]

const moreMenuItems = [
    { label: 'Tutup Semua Tab', icon: 'pi pi-times-circle', command: () => tabsStore.closeAllTabs() },
    { label: 'Tutup Tab Lain', icon: 'pi pi-minus-circle', command: () => tabsStore.closeOtherTabs(tabsStore.activeTabId) }
]

const showContextMenu = (event: MouseEvent, tab: TabItem) => {
    tabsStore.setActiveTab(tab.id)
    nextTick(() => contextMenu.value?.show(event))
}

const toggleMoreMenu = (event: Event) => moreMenu.value?.toggle(event)
const closeTab = (tab: TabItem) => { if (tab.closable) tabsStore.closeTab(tab.id) }

const onWheelScroll = (event: WheelEvent) => {
    if (tabsContainerRef.value) {
        event.preventDefault()
        tabsContainerRef.value.scrollLeft += event.deltaY
    }
}

const scrollToActiveTab = () => {
    nextTick(() => {
        if (tabsContainerRef.value) {
            const active = tabsContainerRef.value.querySelector('.tab-item.active')
            if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
        }
    })
}

watch(() => tabsStore.activeTabId, () => scrollToActiveTab())
onMounted(() => nextTick(() => scrollToActiveTab()))
</script>

<style lang="scss" scoped>
.tab-bar-chrome {
    display: flex;
    align-items: center;
    height: 2.75rem;
    background: transparent; // 🔥 Transparent, ikut parent
    padding: 0 0.5rem;
    gap: 0.25rem;
    border-radius: 0; // 🔥 Hapus border radius
}

.tabs-scroll-container {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    
    .tabs-list {
        display: flex;
        align-items: center;
        height: 100%;
        gap: 0.125rem;
    }
}

.tab-item {
    position: relative;
    display: flex;
    align-items: center;
    height: 2.25rem;
    padding: 0 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
    max-width: 180px;
    
    .tab-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
    }
    
    .tab-icon {
        font-size: 0.875rem;
        color: var(--text-color-secondary);
        transition: color 0.15s;
    }
    
    .tab-title-text {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-color-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .tab-close {
        width: 1.25rem; height: 1.25rem;
        border-radius: 50%;
        border: none; background: transparent;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: all 0.1s;
        i { font-size: 0.5rem; color: var(--text-color-secondary); }
        &:hover { background: var(--surface-300); i { color: var(--text-color); } }
    }
    
    .tab-active-bar {
        position: absolute; bottom: 0; left: 0.75rem; right: 0.75rem;
        height: 2.5px; background: var(--primary-500); border-radius: 2px 2px 0 0; opacity: 0;
    }
    
    &:hover {
        background: var(--surface-100);
        .tab-title-text { color: var(--text-color); }
        .tab-close { opacity: 1; }
    }
    
    &.active {
        background: var(--surface-ground);
        .tab-active-bar { opacity: 1; }
        .tab-icon { color: var(--primary-600); }
        .tab-title-text { color: var(--text-color); font-weight: 600; }
        .tab-close { opacity: 1; }
    }
    
    &:active { background: var(--surface-200); }
}

.tab-actions {
    flex-shrink: 0;
    .tab-action-btn {
        width: 1.75rem; height: 1.75rem; border-radius: 0.375rem;
        border: none; background: transparent; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: var(--text-color-secondary);
        i { font-size: 0.75rem; }
        &:hover { background: var(--surface-200); color: var(--text-color); }
    }
}

:global(.app-dark) {
    .tab-item {
        &:hover { background: var(--surface-800); }
        &.active { background: var(--surface-900); }
        .tab-close:hover { background: var(--surface-600); }
    }
    .tab-action-btn:hover { background: var(--surface-700); }
}
</style>