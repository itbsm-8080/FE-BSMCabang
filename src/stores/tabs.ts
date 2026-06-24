// stores/tabs.ts
import { defineStore } from 'pinia'

export interface TabItem {
    id: string
    title: string
    path: string
    query?: Record<string, any>
    icon?: string
    closable: boolean
    timestamp: number
}

export const useTabsStore = defineStore('tabs', {
    state: () => ({
        tabs: [] as TabItem[],
        activeTabId: '' as string,
        isReady: false  // ✅ Flag untuk menandakan tabs siap
    }),

    getters: {
        activeTab: (state) => state.tabs.find(t => t.id === state.activeTabId),
    },

    actions: {
        generateTabId(path: string, query?: Record<string, any>): string {
            // Untuk form edit, ID harus unik per ID
            if (query?.id) {
                return `${path}?id=${query.id}`
            }
            // Untuk form tambah (tanpa ID), selalu sama
            return path
        },

        openTab(tab: Omit<TabItem, 'id' | 'timestamp'>) {
            const id = this.generateTabId(tab.path, tab.query)
            const existingTab = this.tabs.find(t => t.id === id)

            if (existingTab) {
                // Tab sudah ada, tinggal aktifkan
                this.activeTabId = existingTab.id
            } else {
                // Tab baru
                const newTab: TabItem = {
                    ...tab,
                    id,
                    timestamp: Date.now(),
                    closable: tab.closable ?? true
                }
                this.tabs.push(newTab)
                this.activeTabId = newTab.id

                // Batasi jumlah tab (max 10)
                if (this.tabs.length > 10) {
                    const closableTabs = this.tabs.filter(t => t.closable)
                    if (closableTabs.length > 0) {
                        const oldest = closableTabs.sort((a, b) => a.timestamp - b.timestamp)[0]
                        this.closeTab(oldest.id)
                    }
                }
            }

            console.log('📂 Tabs:', this.tabs.map(t => ({ id: t.id, title: t.title, active: t.id === this.activeTabId })))
        },

        closeTab(tabId: string) {
            const index = this.tabs.findIndex(t => t.id === tabId)
            if (index === -1) return

            const tab = this.tabs[index]
            if (!tab.closable) return

            this.tabs.splice(index, 1)

            if (this.activeTabId === tabId) {
                if (this.tabs.length > 0) {
                    const newActiveIndex = Math.min(index, this.tabs.length - 1)
                    this.activeTabId = this.tabs[newActiveIndex].id
                } else {
                    this.activeTabId = ''
                }
            }
        },

        closeAllTabs() {
            this.tabs = this.tabs.filter(t => !t.closable)
            if (this.tabs.length > 0) {
                this.activeTabId = this.tabs[0].id
            } else {
                this.activeTabId = ''
            }
        },

        closeOtherTabs(tabId: string) {
            const activeTab = this.tabs.find(t => t.id === tabId)
            if (!activeTab) return

            this.tabs = this.tabs.filter(t => !t.closable || t.id === tabId)
            this.activeTabId = tabId
        },

        setActiveTab(tabId: string) {
            const tab = this.tabs.find(t => t.id === tabId)
            if (tab) {
                this.activeTabId = tabId
            }
        },

        initDefaultTabs() {
            console.log('📂 Initializing default tabs...')
            this.tabs = []
            this.openTab({
                title: 'Dashboard',
                path: '/dashboard',
                icon: 'pi pi-home',
                closable: false
            })
            this.isReady = true
            console.log('✅ Tabs initialized:', this.tabs.length)
        },

        resetTabs() {
            this.tabs = []
            this.activeTabId = ''
            this.isReady = false
        },

        reorderTabs(newOrder: TabItem[]) {
            const activeId = this.activeTabId

            // Update tabs dengan urutan baru
            this.tabs = newOrder

            // Pertahankan active tab
            if (activeId) {
                this.activeTabId = activeId
            }
        }
    }
})