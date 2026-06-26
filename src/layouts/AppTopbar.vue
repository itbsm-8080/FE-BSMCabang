<template>
    <div class="topbar-clay">
        <!-- Left -->
        <div class="topbar-left">
            <button 
                class="topbar-btn"
                @click="onMenuToggle" 
                v-show="layoutConfig.menuMode !== 'horizontal'"
            >
                <i class="pi pi-bars"></i>
            </button>
            
            <router-link to="/" class="topbar-brand">
                <img src="/logo-bsm.svg" alt="BSM" class="brand-logo" />
                <div class="brand-text">
                    <!-- <span class="brand-name">BSM</span> -->
                    <!-- <span class="brand-sub">Cabang</span> -->
                </div>
            </router-link>
        </div>

        <!-- Center: PrimeVue Menubar -->
        <div class="topbar-center" v-if="layoutConfig.menuMode === 'horizontal'">
            <Menubar :model="menuItems" class="clay-menubar">
                <template #item="{ item, props, hasSubmenu, root }">
                    <router-link 
                        v-if="item.to" 
                        v-slot="{ href, navigate }" 
                        :to="item.to" 
                        custom
                    >
                        <a 
                            :href="href" 
                            v-bind="props.action" 
                            @click="navigate"
                            class="menubar-item-link"
                            :class="{ 'active': isActive(item.to) }"
                        >
                            <i v-if="item.icon" :class="['pi', item.icon]"></i>
                            <span>{{ item.label }}</span>
                            <i v-if="hasSubmenu" class="pi pi-chevron-down submenu-icon"></i>
                        </a>
                    </router-link>
                    
                    <a 
                        v-else-if="item.url" 
                        :href="item.url" 
                        :target="item.target" 
                        v-bind="props.action"
                        class="menubar-item-link"
                    >
                        <i v-if="item.icon" :class="['pi', item.icon]"></i>
                        <span>{{ item.label }}</span>
                        <i v-if="hasSubmenu" class="pi pi-chevron-down submenu-icon"></i>
                    </a>
                    
                    <button 
                        v-else 
                        v-bind="props.action"
                        class="menubar-item-link"
                        :class="{ 'active': isActive(item.to) }"
                    >
                        <i v-if="item.icon" :class="['pi', item.icon]"></i>
                        <span>{{ item.label }}</span>
                        <i v-if="hasSubmenu" class="pi pi-chevron-down submenu-icon"></i>
                    </button>
                </template>
            </Menubar>
        </div>

        <!-- Right -->
        <div class="topbar-right">
            <button class="topbar-btn" @click="toggleDarkMode" title="Toggle theme">
                <i :class="isDarkTheme ? 'pi pi-moon' : 'pi pi-sun'"></i>
            </button>
            
            <div class="relative">
                <button
                    v-styleclass="{ 
                        selector: '@next', 
                        enterFromClass: 'hidden', 
                        enterActiveClass: 'animate-scalein', 
                        leaveToClass: 'hidden', 
                        leaveActiveClass: 'animate-fadeout', 
                        hideOnOutsideClick: true 
                    }"
                    class="topbar-btn"
                >
                    <i class="pi pi-palette"></i>
                </button>
                <AppConfigurator />
            </div>
            
            <div class="topbar-divider"></div>
            
            <!-- User Menu -->
            <div class="relative" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
                <button class="user-btn">
                    <div class="user-avatar">
                        <span>{{ getUserInitials() }}</span>
                    </div>
                    <div class="user-info">
                        <span class="user-name">{{ authStore.user?.nama || 'User' }}</span>
                        <span class="user-role">{{ authStore.user?.cabang_nama || 'Cabang' }}</span>
                    </div>
                    <i class="pi pi-chevron-down user-arrow" :class="{ 'rotate': showUserMenu }"></i>
                </button>
                
                <transition name="fade">
                    <div v-if="showUserMenu" class="user-dropdown">
                        <div class="dropdown-header">
                            <div class="dropdown-avatar">
                                <span>{{ getUserInitials() }}</span>
                            </div>
                            <div>
                                <p class="dropdown-name">{{ authStore.user?.nama || 'User' }}</p>
                                <p class="dropdown-role">{{ authStore.user?.cabang_nama || 'Cabang' }}</p>
                            </div>
                        </div>
                        <div class="dropdown-menu">
                            <button class="dropdown-item">
                                <i class="pi pi-user"></i>
                                <span>Profil</span>
                            </button>
                            <button class="dropdown-item">
                                <i class="pi pi-cog"></i>
                                <span>Pengaturan</span>
                            </button>
                            <div class="dropdown-divider"></div>
                            <button @click="handleLogout" class="dropdown-item logout">
                                <i class="pi pi-sign-out"></i>
                                <span>Keluar</span>
                            </button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useLayout } from "~/layouts/composables/layout.js"
import AppConfigurator from "~/layouts/AppConfigurator.vue"
import { useMenu } from "~/layouts/composables/menu.js"
import { useAuthStore } from "~/stores/auth"
import { useTabsStore } from '~/stores/tabs'
import { useRoute } from 'vue-router'


const route = useRoute()
const { onMenuToggle, toggleDarkMode, isDarkTheme, layoutConfig } = useLayout()
const { model: menuItems, fetchMenu, isLoaded } = useMenu()
const authStore = useAuthStore()
const tabsStore = useTabsStore()
const showUserMenu = ref(false)

function isActive(path) {
    if (!path) return false
    return route.path === path || route.path.startsWith(path)
}

const getUserInitials = () => {
    const name = authStore.user?.nama || 'User'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const handleLogout = async () => {
    await authStore.logout()
    navigateTo('/auth/login')
}

watch(() => authStore.user?.kode || authStore.user?.USER_KODE, (newKode, oldKode) => {
    if (newKode && newKode !== oldKode) {
        console.log('👤 User changed, resetting menu:', oldKode, '→', newKode)
        resetMenu()
        fetchMenu()
    }
})

onMounted(async () => {
    tabsStore.initDefaultTabs()
    
    // 🔥 Hanya fetch kalau belum loaded
    if (!isLoaded.value) {
        await fetchMenu()
    }
})
</script>

<style lang="scss" scoped>
// ==================== TOPBAR ====================
.topbar-clay {
    position: fixed;
    top: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    height: 3.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem;
    z-index: 100;
    gap: 1rem;
    box-shadow: 
        0 4px 24px rgba(0, 0, 0, 0.06),
        0 1px 4px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

// ==================== LEFT ====================
.topbar-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
}

.topbar-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #334155;
    transition: all 0.2s ease, background 0.3s ease, border-color 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    
    i { 
        font-size: 1rem; 
        color: #334155;
        transition: color 0.2s ease;
    }
    
    &:hover {
        background: rgba(255, 255, 255, 0.9);
        border-color: var(--primary-300);
        color: var(--primary-600);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--primary-500-rgb, 16, 185, 129), 0.15);
        
        i { color: var(--primary-600); }
    }
    
    &:active {
        transform: scale(0.95);
    }
}

// Brand
.topbar-brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    text-decoration: none;
    
    .brand-logo {
        height: 2.25rem;
        width: auto;
        background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
        padding: 0.375rem;
        border-radius: 0.625rem;
        box-shadow: 0 2px 8px rgba(var(--primary-500-rgb, 16, 185, 129), 0.3);
    }
    
    .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1;
    }
}

// ==================== CENTER MENU ====================
.topbar-center {
    flex: 1;
    display: flex;
    justify-content: center;
    overflow: visible;
    
    @media (max-width: 991px) {
        display: none;
    }
}

.clay-menubar {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    
    :deep(.p-menubar-root-list) {
        gap: 0.25rem;
        background: transparent !important;
    }
}

.menubar-item-link {
    display: flex !important;
    align-items: center !important;
    gap: 0.5rem !important;
    padding: 0.5rem 0.875rem !important;
    border-radius: 0.75rem !important;
    color: #475569 !important;
    font-size: 0.813rem !important;
    font-weight: 500 !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    border: 1px solid transparent !important;
    background: transparent !important;
    cursor: pointer !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    white-space: nowrap !important;
    
    i {
        font-size: 0.938rem !important;
        color: #64748b !important;
        transition: all 0.2s ease !important;
    }
    
    .submenu-icon {
        font-size: 0.625rem !important;
        margin-left: 0.125rem !important;
        opacity: 0.5 !important;
        color: #94a3b8 !important;
    }
    
    span {
        color: #475569 !important;
        font-weight: 500 !important;
        transition: color 0.2s ease !important;
    }
    
    &:hover {
        background: rgba(255, 255, 255, 0.7) !important;
        border-color: rgba(0, 0, 0, 0.08) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        
        i { color: var(--primary-500) !important; }
        span { color: #1e293b !important; }
        .submenu-icon { color: var(--primary-500) !important; }
    }
    
    &.active {
        background: linear-gradient(135deg, 
            rgba(var(--primary-500-rgb, 16, 185, 129), 0.1), 
            rgba(var(--primary-500-rgb, 16, 185, 129), 0.05)
        ) !important;
        border-color: rgba(var(--primary-500-rgb, 16, 185, 129), 0.2) !important;
        
        i { color: var(--primary-600) !important; }
        span { color: var(--primary-700) !important; font-weight: 600 !important; }
    }
}

.clay-menubar {
    :deep(.p-submenu-list) {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(0, 0, 0, 0.06) !important;
        border-radius: 1rem !important;
        padding: 0.5rem !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08) !important;
        margin-top: 0.5rem !important;
    }
    
    :deep(.p-menuitem) { margin: 0 !important; }
    
    :deep(.p-menuitem-link) {
        border-radius: 0.75rem !important;
        padding: 0.625rem 0.875rem !important;
        font-size: 0.813rem !important;
        
        .p-menuitem-icon { color: #64748b !important; }
        .p-menuitem-text { color: #475569 !important; }
        
        &:hover {
            background: rgba(var(--primary-500-rgb, 16, 185, 129), 0.08) !important;
            .p-menuitem-icon { color: var(--primary-500) !important; }
            .p-menuitem-text { color: var(--primary-700) !important; }
        }
    }
}

// ==================== RIGHT ====================
.topbar-right {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
}

.topbar-divider {
    width: 1px;
    height: 1.75rem;
    background: rgba(0, 0, 0, 0.08);
    margin: 0 0.375rem;
    transition: background 0.3s ease;
}

.user-btn {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.375rem 0.875rem 0.375rem 0.375rem;
    border-radius: 0.875rem;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease, background 0.3s ease, border-color 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    
    &:hover {
        background: rgba(255, 255, 255, 0.9);
        border-color: var(--primary-300);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--primary-500-rgb, 16, 185, 129), 0.15);
    }
}

.user-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.75rem;
    background: var(--surface-200);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.688rem;
    font-weight: 700;
    color: #334155;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.user-info {
    display: flex;
    flex-direction: column;
    text-align: left;
    
    .user-name { 
        font-size: 0.75rem; font-weight: 600; color: #1e293b; line-height: 1.2;
        transition: color 0.3s ease;
    }
    .user-role { 
        font-size: 0.625rem; color: #94a3b8; line-height: 1.2;
        transition: color 0.3s ease;
    }
}

.user-arrow {
    font-size: 0.5rem; color: #64748b; transition: all 0.2s ease;
    &.rotate { transform: rotate(180deg); }
}

.user-dropdown {
    position: absolute; right: 0; top: calc(100% + 0.5rem);
    width: 16rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 1rem;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    overflow: hidden; z-index: 200;
}

.dropdown-header {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    
    .dropdown-avatar {
        width: 2.5rem; height: 2.5rem; border-radius: 0.75rem;
        background: var(--surface-200);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; color: #334155; font-size: 0.813rem;
    }
    
    .dropdown-name { 
        font-size: 0.813rem; font-weight: 600; color: #1e293b; margin: 0;
        transition: color 0.3s ease;
    }
    .dropdown-role { 
        font-size: 0.688rem; color: #94a3b8; margin: 0;
        transition: color 0.3s ease;
    }
}

.dropdown-menu { padding: 0.5rem; }

.dropdown-item {
    display: flex; align-items: center; gap: 0.625rem;
    width: 100%; padding: 0.625rem 0.875rem; border-radius: 0.75rem;
    border: none; background: transparent; cursor: pointer;
    font-size: 0.75rem; font-weight: 500; color: #475569; 
    transition: all 0.15s ease;
    
    i { font-size: 0.875rem; color: #64748b; transition: color 0.15s ease; }
    
    &:hover {
        background: rgba(var(--primary-500-rgb, 16, 185, 129), 0.08);
        color: var(--primary-700);
        i { color: var(--primary-500); }
    }
    
    &.logout { 
        color: #ef4444; 
        i { color: #ef4444; }
        &:hover { background: rgba(239, 68, 68, 0.08); }
    }
}

.dropdown-divider { 
    height: 1px; background: rgba(0, 0, 0, 0.06); margin: 0.25rem 0;
    transition: background 0.3s ease;
}

.fade-enter-active { transition: all 0.2s ease; }
.fade-leave-active { transition: all 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

:global(html.app-dark) {
    .topbar-clay {
        background: rgba(15, 15, 20, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.06) !important;
        box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.4),
            0 1px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
    }
    
    .topbar-btn {
        background: rgba(255, 255, 255, 0.04) !important;
        border-color: rgba(255, 255, 255, 0.06) !important;
        color: #cbd5e1 !important;
        i { color: #cbd5e1 !important; }
        &:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(var(--primary-500-rgb, 16, 185, 129), 0.3) !important;
            color: var(--primary-400) !important;
            i { color: var(--primary-400) !important; }
        }
    }
    
    .user-btn {
        background: rgba(255, 255, 255, 0.04) !important;
        border-color: rgba(255, 255, 255, 0.06) !important;
        &:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(var(--primary-500-rgb, 16, 185, 129), 0.3) !important;
        }
    }
    
    .user-avatar {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #e2e8f0 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
    }
    
    .user-info {
        .user-name { color: #e2e8f0 !important; }
        .user-role { color: #94a3b8 !important; }
    }
    
    .user-arrow { color: #94a3b8 !important; }
    .topbar-divider { background: rgba(255, 255, 255, 0.08) !important; }
    
    .menubar-item-link {
        color: #cbd5e1 !important;
        i { color: #94a3b8 !important; }
        span { color: #cbd5e1 !important; }
        .submenu-icon { color: #94a3b8 !important; }
        &:hover {
            background: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.06) !important;
            i { color: var(--primary-400) !important; }
            span { color: #e2e8f0 !important; }
        }
        &.active {
            background: rgba(var(--primary-500-rgb, 16, 185, 129), 0.15) !important;
            border-color: rgba(var(--primary-500-rgb, 16, 185, 129), 0.3) !important;
            i { color: var(--primary-400) !important; }
            span { color: var(--primary-300) !important; }
        }
    }
    
    .clay-menubar {
        :deep(.p-submenu-list) {
            background: rgba(15, 15, 20, 0.95) !important;
            border-color: rgba(255, 255, 255, 0.06) !important;
        }
        :deep(.p-menuitem-link) {
            .p-menuitem-icon { color: #94a3b8 !important; }
            .p-menuitem-text { color: #cbd5e1 !important; }
            &:hover {
                background: rgba(255, 255, 255, 0.05) !important;
                .p-menuitem-icon { color: var(--primary-400) !important; }
                .p-menuitem-text { color: var(--primary-300) !important; }
            }
        }
    }
    
    .user-dropdown {
        background: rgba(15, 15, 20, 0.95) !important;
        border-color: rgba(255, 255, 255, 0.06) !important;
    }
    
    .dropdown-header {
        background: rgba(255, 255, 255, 0.02) !important;
        border-bottom-color: rgba(255, 255, 255, 0.05) !important;
        .dropdown-name { color: #e2e8f0 !important; }
        .dropdown-role { color: #94a3b8 !important; }
        .dropdown-avatar {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #e2e8f0 !important;
        }
    }
    
    .dropdown-item {
        color: #cbd5e1 !important;
        i { color: #94a3b8 !important; }
        &:hover {
            background: rgba(255, 255, 255, 0.05) !important;
            color: var(--primary-300) !important;
            i { color: var(--primary-400) !important; }
        }
        &.logout {
            color: #f87171 !important;
            i { color: #f87171 !important; }
            &:hover { background: rgba(248, 113, 113, 0.1) !important; }
        }
    }
    
    .dropdown-divider { background: rgba(255, 255, 255, 0.06) !important; }
}

@media (max-width: 991px) {
    .topbar-clay { top: 0.5rem; left: 0.5rem; right: 0.5rem; padding: 0 0.75rem; border-radius: 1rem; }
    .user-info { display: none; }
}
@media (max-width: 640px) {
    .brand-text { display: none; }
}
</style>