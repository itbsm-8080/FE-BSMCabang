<template>
    <div class="hak-user-page">
        <!-- Toolbar -->
        <div class="page-toolbar">
            <div class="toolbar-left">
                <h3>Pengaturan Hak User</h3>
            </div>
            <div class="toolbar-right">
                <Button 
                    v-if="selectedUser"
                    label="Simpan Hak" 
                    severity="primary" 
                    size="small" 
                    :loading="saving" 
                    @click="saveHak" 
                    icon="pi pi-check"
                />
            </div>
        </div>

        <!-- Content -->
        <div class="hak-content">
            <!-- Pilih User -->
            <div class="user-select-card">
                <div class="user-select-header">
                    <i class="pi pi-user"></i>
                    <span>Pilih User</span>
                </div>
                <div class="user-select-body">
                    <Select 
                        v-model="selectedUser" 
                        :options="users" 
                        optionLabel="USER_NAMA" 
                        optionValue="USER_KODE" 
                        placeholder="Pilih user untuk diatur hak-nya..." 
                        class="w-full compact-input" 
                        @change="loadHak"
                        showClear
                        filter
                        filterPlaceholder="Cari user..."
                    >
                        <template #option="{ option }">
                            <div class="user-option">
                                <div class="user-avatar-small">
                                    {{ getInitials(option.USER_NAMA) }}
                                </div>
                                <div class="user-info-small">
                                    <span class="user-name-small">{{ option.USER_NAMA }}</span>
                                    <span class="user-code-small">{{ option.USER_KODE }}</span>
                                </div>
                            </div>
                        </template>
                        <template #value="{ value }">
                            <div class="user-value" v-if="value">
                                <div class="user-avatar-tiny">
                                    {{ getInitials(getUserName(value)) }}
                                </div>
                                <span>{{ getUserName(value) }}</span>
                            </div>
                        </template>
                    </Select>
                </div>
            </div>

            <!-- Tabel Hak (Scrollable) -->
            <div v-if="selectedUser" class="hak-table-card">
                <div class="hak-table-header">
                    <i class="pi pi-shield"></i>
                    <span>Hak Akses Menu</span>
                    <span class="user-badge">
                        {{ getUserName(selectedUser) }}
                    </span>
                </div>
                <div class="hak-table-body">
                    <DataTable :value="menuList" size="small" stripedRows showGridlines class="hak-table" scrollable scrollHeight="flex">
    <Column field="MEN_NAMA2" header="Menu">
        <template #body="{ data }">
            <div class="menu-cell">
                <i :class="['pi', data.men_icon || 'pi-circle']"></i>
                <span>{{ data.MEN_NAMA2 || data.MEN_NAMA }}</span>
            </div>
        </template>
    </Column>
    <Column header="Akses" style="width: 70px; text-align: center">
        <template #body="{ data }">
            <input type="checkbox" v-model="hakMap[data.MEN_ID].akses" @change="onAksesChange(data.MEN_ID)" />
        </template>
    </Column>
    <Column header="Insert" style="width: 70px; text-align: center">
        <template #body="{ data }">
            <input type="checkbox" v-model="hakMap[data.MEN_ID].insert" :disabled="!hakMap[data.MEN_ID].akses" />
        </template>
    </Column>
    <Column header="Edit" style="width: 70px; text-align: center">
        <template #body="{ data }">
            <input type="checkbox" v-model="hakMap[data.MEN_ID].edit" :disabled="!hakMap[data.MEN_ID].akses" />
        </template>
    </Column>
    <Column header="Delete" style="width: 70px; text-align: center">
        <template #body="{ data }">
            <input type="checkbox" v-model="hakMap[data.MEN_ID].delete" :disabled="!hakMap[data.MEN_ID].akses" />
        </template>
    </Column>
</DataTable>
                </div>
            </div>

            <!-- Empty state -->
            <div v-else class="empty-state-card">
                <div class="empty-icon">
                    <i class="pi pi-users"></i>
                </div>
                <h3>Pilih User</h3>
                <p>Pilih user dari dropdown di atas untuk mengatur hak akses menu.</p>
            </div>
        </div>

        <!-- Success Dialog -->
        <SuccessDialog 
            v-model="showSuccess"
            message="Hak user berhasil disimpan."
            @stay="showSuccess = false"
            @close="showSuccess = false"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import SuccessDialog from '~/components/common/SuccessDialog.vue'

definePageMeta({ layout: 'default' })

const { $api } = useNuxtApp()
const toast = useToast()

const users = ref<any[]>([])
const menuList = ref<any[]>([])
const selectedUser = ref<string | null>(null)
const hakMap = reactive<Record<number, any>>({})
const saving = ref(false)
const showSuccess = ref(false)

const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getUserName = (kode: string) => {
    const user = users.value.find(u => u.USER_KODE === kode)
    return user?.USER_NAMA || kode
}

const loadUsers = async () => {
    try {
        const { data } = await $api.get('/hak-user/all')
        if (data.success) {
            users.value = data.data.users
            menuList.value = data.data.menus
        }
    } catch (e) { console.error(e) }
}

const loadHak = async () => {
    if (!selectedUser.value) return
    
    // Reset
    menuList.value.forEach(m => {
        hakMap[m.MEN_ID] = { akses: false, insert: false, edit: false, delete: false }
    })
    
    try {
        const { data } = await $api.get(`/hak-user/${selectedUser.value}`)
        if (data.success) {
            data.data.forEach((h: any) => {
                hakMap[h.HAK_MEN_ID] = {
                    akses: true,
                    insert: h.hak_men_insert === 'Y',
                    edit: h.hak_men_edit === 'Y',
                    delete: h.hak_men_delete === 'Y',
                }
            })
        }
    } catch (e) { console.error(e) }
}

const onAksesChange = (menuId: number) => {
    if (!hakMap[menuId].akses) {
        hakMap[menuId].insert = false
        hakMap[menuId].edit = false
        hakMap[menuId].delete = false
    }
}

const saveHak = async () => {
    if (!selectedUser.value) return
    
    saving.value = true
    try {
        const items = Object.entries(hakMap)
            .filter(([_, v]) => v.akses)
            .map(([menuId, v]) => ({
                HAK_MEN_ID: parseInt(menuId),
                hak_men_insert: v.insert ? 'Y' : 'N',
                hak_men_edit: v.edit ? 'Y' : 'N',
                hak_men_delete: v.delete ? 'Y' : 'N',
            }))
        
        await $api.post('/hak-user', {
            HAK_USER_KODE: selectedUser.value,
            items
        })
        
        showSuccess.value = true
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Error', life: 3000 })
    } finally { saving.value = false }
}

onMounted(async () => { await loadUsers() })
</script>

<style lang="scss" scoped>
.hak-user-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 1rem;
    gap: 0.75rem;
}

// ==================== TOOLBAR ====================
.page-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    
    h3 { margin: 0; font-size: 1.125rem; font-weight: 700; }
}

// ==================== CONTENT ====================
.hak-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

// ==================== USER SELECT CARD ====================
.user-select-card {
    background: var(--surface-card);
    border-radius: 0.75rem;
    border: 1px solid var(--surface-border);
    overflow: hidden;
    flex-shrink: 0;
}

.user-select-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-border);
    font-weight: 600;
    font-size: 0.75rem;
    
    i { color: var(--primary-500); font-size: 0.875rem; }
}

.user-select-body {
    padding: 0.5rem 0.75rem;
}

// ==================== USER OPTION ====================
.user-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.125rem 0;
}

.user-avatar-small {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.688rem;
    font-weight: 700;
    flex-shrink: 0;
}

.user-info-small {
    display: flex;
    flex-direction: column;
    
    .user-name-small { font-size: 0.75rem; font-weight: 500; }
    .user-code-small { font-size: 0.625rem; color: var(--text-color-secondary); }
}

.user-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.user-avatar-tiny {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.375rem;
    background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.563rem;
    font-weight: 700;
    flex-shrink: 0;
}

// ==================== HAK TABLE CARD ====================
// ==================== CHECKBOX STYLE ====================
.hak-table {
    :deep(.p-datatable-thead > tr > th) {
        font-size: 0.688rem;
        padding: 0.375rem 0.5rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        background: var(--surface-50);
        position: sticky;
        top: 0;
        z-index: 2;
    }
    :deep(.p-datatable-tbody > tr > td) {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
    }
    :deep(.p-datatable-tbody > tr:hover) {
        background: var(--surface-50);
    }
    
    // 🔥 CHECKBOX
    input[type="checkbox"] {
        width: 1rem;
        height: 1rem;
        accent-color: var(--primary-500);
        cursor: pointer;
        border-radius: 0.25rem;
        
        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            accent-color: var(--surface-400);
        }
    }
}

.hak-table-card {
    flex: 1;
    background: var(--surface-card);
    border-radius: 0.75rem;
    border: 1px solid var(--surface-border);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.hak-table-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-border);
    font-weight: 600;
    font-size: 0.75rem;
    flex-shrink: 0;
    
    i { color: var(--primary-500); font-size: 0.875rem; }
    
    .user-badge {
        margin-left: auto;
        font-size: 0.625rem;
        padding: 0.125rem 0.5rem;
        background: var(--primary-100);
        color: var(--primary-700);
        border-radius: 0.75rem;
        font-weight: 500;
    }
}

.hak-table-body {
    flex: 1;
    overflow: hidden;
}

.hak-table {
    :deep(.p-datatable-thead > tr > th) {
        font-size: 0.688rem;
        padding: 0.375rem 0.5rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        background: var(--surface-50);
        position: sticky;
        top: 0;
        z-index: 2;
    }
    :deep(.p-datatable-tbody > tr > td) {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
    }
    :deep(.p-datatable-tbody > tr:hover) {
        background: var(--surface-50);
    }
}

// ==================== MENU CELL ====================
.menu-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    i { font-size: 0.875rem; color: var(--text-color-secondary); }
    span { font-size: 0.75rem; }
}

// ==================== PERM CHECK ====================
.perm-check {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    
    input[type="checkbox"] {
        width: 0.875rem;
        height: 0.875rem;
        accent-color: var(--primary-500);
        cursor: pointer;
    }
    
    &.disabled {
        opacity: 0.3;
        input { cursor: not-allowed; }
    }
    
    i {
        font-size: 0.625rem;
        
        &.pi-check { color: var(--green-500); }
        &.pi-times { color: var(--text-color-secondary); opacity: 0.3; }
    }
}

// ==================== MINI TOGGLE ====================
:deep(.mini-switch) {
    .p-toggleswitch-slider {
        width: 2.25rem !important;
        height: 1.25rem !important;
    }
    .p-toggleswitch-handle {
        width: 0.875rem !important;
        height: 0.875rem !important;
    }
}

// ==================== EMPTY STATE ====================
.empty-state-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--surface-card);
    border-radius: 0.75rem;
    border: 1px solid var(--surface-border);
    padding: 3rem;
    text-align: center;
    
    .empty-icon {
        width: 4rem;
        height: 4rem;
        border-radius: 1rem;
        background: var(--surface-100);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        
        i { font-size: 2rem; color: var(--text-color-secondary); opacity: 0.5; }
    }
    
    h3 { font-size: 1rem; margin: 0 0 0.5rem; }
    p { font-size: 0.813rem; color: var(--text-color-secondary); margin: 0; }
}

// ==================== COMPACT INPUT ====================
:deep(.compact-input.p-select) {
    font-size: 0.813rem !important;
    height: 2rem !important;
    border-radius: 0.375rem !important;
    
    .p-select-label { font-size: 0.813rem !important; padding: 0.375rem 0.625rem !important; }
}

// ==================== DARK MODE ====================
:global(.app-dark) {
    .user-select-header,
    .hak-table-header { background: var(--surface-800); }
    .hak-table :deep(.p-datatable-thead > tr > th) { background: var(--surface-800); }
    .user-badge { background: var(--primary-900); color: var(--primary-300); }
}
</style>