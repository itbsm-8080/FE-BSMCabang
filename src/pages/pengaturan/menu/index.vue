<template>
    <div class="menu-crud-page">
        <!-- Tab: Parent / Items -->
        <div class="menu-tabs">
            <button class="menu-tab" :class="{ active: activeTab === 'parent' }" @click="activeTab = 'parent'">
                <i class="pi pi-folder"></i> Menu Parent
            </button>
            <button class="menu-tab" :class="{ active: activeTab === 'items' }" @click="activeTab = 'items'">
                <i class="pi pi-list"></i> Menu Items
            </button>
        </div>

        <!-- ========== PARENT TABLE ========== -->
        <div v-if="activeTab === 'parent'" class="table-section">
            <!-- Toolbar -->
            <div class="browse-toolbar">
                <div class="toolbar-left">
                    <IconField iconPosition="left">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchParent" placeholder="Cari parent..." size="small" class="search-input" />
                    </IconField>
                </div>
                <div class="toolbar-right">
                    <Button icon="pi pi-plus" label="Tambah" severity="primary" size="small" @click="openParentForm()" />
                    <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loadingParent" @click="loadParents" />
                </div>
            </div>

            <DataTable :value="filteredParents" :loading="loadingParent" size="small" stripedRows showGridlines 
                class="crud-table" scrollable scrollHeight="flex"
                :sortField="parentSortField" :sortOrder="parentSortOrder" @sort="onParentSort"
            >
                <Column field="mp_order" header="Order" style="width: 70px" sortable />
                <Column field="mp_nama" header="Nama Parent" sortable />
                <Column field="mp_icon" header="Icon" style="width: 200px" sortable>
                    <template #body="{ data }">
                        <div class="icon-cell">
                            <i :class="['pi', data.mp_icon]"></i>
                            <span>{{ data.mp_icon }}</span>
                        </div>
                    </template>
                </Column>
                <Column header="Aksi" style="width: 100px; text-align: center">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" text rounded size="small" severity="info" @click="openParentForm(data)" />
                        <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete('parent', data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- ========== ITEMS TABLE ========== -->
        <div v-if="activeTab === 'items'" class="table-section">
            <!-- Toolbar -->
            <div class="browse-toolbar">
                <div class="toolbar-left">
                    <IconField iconPosition="left">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchItem" placeholder="Cari item..." size="small" class="search-input" />
                    </IconField>
                </div>
                <div class="toolbar-right">
                    <Button icon="pi pi-plus" label="Tambah" severity="primary" size="small" @click="openItemForm()" />
                    <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loadingItem" @click="loadItems" />
                </div>
            </div>

            <DataTable :value="filteredItems" :loading="loadingItem" size="small" stripedRows showGridlines 
                class="crud-table" scrollable scrollHeight="flex"
                :sortField="itemSortField" :sortOrder="itemSortOrder" @sort="onItemSort"
            >
                <Column field="men_order" header="Order" style="width: 70px" sortable />
                <Column field="MEN_NAMA2" header="Nama Menu" sortable />
                <Column field="men_route" header="Route" style="width: 220px" sortable />
                <Column field="men_icon" header="Icon" style="width: 200px" sortable>
                    <template #body="{ data }">
                        <div class="icon-cell">
                            <i :class="['pi', data.men_icon]"></i>
                            <span>{{ data.men_icon }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="parent_nama" header="Parent" style="width: 150px" sortable />
                <Column header="Aksi" style="width: 100px; text-align: center">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" text rounded size="small" severity="info" @click="openItemForm(data)" />
                        <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete('item', data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- ========== PARENT DIALOG ========== -->
        <Dialog v-model:visible="showParentDialog" :header="parentFormTitle" :modal="true" :style="{ width: '450px' }">
            <div class="form-grid">
                <div class="field">
                    <label>Nama Parent <span class="req">*</span></label>
                    <InputText v-model="parentForm.mp_nama" placeholder="Contoh: Master Data" class="w-full compact-input" />
                </div>
                <div class="field">
                    <label>Icon</label>
                    <Select v-model="parentForm.mp_icon" :options="iconOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih icon" class="w-full compact-input" showClear filter filterPlaceholder="Cari icon...">
                        <template #option="{ option }">
                            <div class="icon-option"><i :class="['pi', option.value]"></i><span>{{ option.label }}</span></div>
                        </template>
                        <template #value="{ value }">
                            <div class="icon-value" v-if="value"><i :class="['pi', value]"></i><span>{{ getIconLabel(value) }}</span></div>
                        </template>
                    </Select>
                </div>
                <div class="field">
                    <label>Urutan</label>
                    <InputNumber v-model="parentForm.mp_order" placeholder="0" class="w-full compact-input" />
                </div>
            </div>
            <template #footer>
                <Button label="Batal" severity="secondary" text size="small" @click="showParentDialog = false" />
                <Button label="Simpan" severity="primary" size="small" :loading="saving" @click="saveParent" />
            </template>
        </Dialog>

        <!-- ========== ITEM DIALOG ========== -->
        <Dialog v-model:visible="showItemDialog" :header="itemFormTitle" :modal="true" :style="{ width: '500px' }">
            <div class="form-grid">
                <div class="field">
                    <label>Nama Menu (Web) <span class="req">*</span></label>
                    <InputText v-model="itemForm.MEN_NAMA2" placeholder="Contoh: Gudang" class="w-full compact-input" />
                </div>
                <div class="field">
                    <label>Route <span class="req">*</span></label>
                    <InputText v-model="itemForm.men_route" placeholder="Contoh: /master/gudang" class="w-full compact-input" />
                </div>
                <div class="field">
                    <label>Icon</label>
                    <Select v-model="itemForm.men_icon" :options="iconOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih icon" class="w-full compact-input" showClear filter filterPlaceholder="Cari icon...">
                        <template #option="{ option }">
                            <div class="icon-option"><i :class="['pi', option.value]"></i><span>{{ option.label }}</span></div>
                        </template>
                        <template #value="{ value }">
                            <div class="icon-value" v-if="value"><i :class="['pi', value]"></i><span>{{ getIconLabel(value) }}</span></div>
                        </template>
                    </Select>
                </div>
                <div class="field">
                    <label>Parent</label>
                    <Select v-model="itemForm.men_parent_id" :options="parents" optionLabel="mp_nama" optionValue="mp_id" 
                        placeholder="Pilih parent" class="w-full compact-input" showClear />
                </div>
                <div class="field">
                    <label>Urutan</label>
                    <InputNumber v-model="itemForm.men_order" placeholder="0" class="w-full compact-input" />
                </div>
            </div>
            <template #footer>
                <Button label="Batal" severity="secondary" text size="small" @click="showItemDialog = false" />
                <Button label="Simpan" severity="primary" size="small" :loading="saving" @click="saveItem" />
            </template>
        </Dialog>

        <!-- Delete Confirm -->
        <DeleteDialog v-model="deleteVisible" :loading="deleting" @confirm="handleDelete" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import DeleteDialog from '~/components/common/DeleteDialog.vue'
import { primeIcons } from '~/config/icons'

definePageMeta({ layout: 'default' })

const { $api } = useNuxtApp()
const toast = useToast()

const activeTab = ref('parent')
const saving = ref(false)
const deleting = ref(false)

// ========== ICONS ==========
const iconOptions = primeIcons
const getIconLabel = (value: string) => iconOptions.find(i => i.value === value)?.label || value

// ========== PARENT ==========
const parents = ref<any[]>([])
const loadingParent = ref(false)
const searchParent = ref('')
const parentSortField = ref('mp_order')
const parentSortOrder = ref<1 | -1>(1)

const filteredParents = computed(() => {
    let result = [...parents.value]
    if (searchParent.value) {
        const q = searchParent.value.toLowerCase()
        result = result.filter(p => 
            p.mp_nama.toLowerCase().includes(q) || 
            (p.mp_icon || '').toLowerCase().includes(q)
        )
    }
    if (parentSortField.value) {
        result.sort((a, b) => {
            let va = a[parentSortField.value], vb = b[parentSortField.value]
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb?.toLowerCase() || '' }
            if (va < vb) return parentSortOrder.value === 1 ? -1 : 1
            if (va > vb) return parentSortOrder.value === 1 ? 1 : -1
            return 0
        })
    }
    return result
})

const showParentDialog = ref(false)
const parentForm = ref({ mp_nama: '', mp_icon: 'pi pi-folder', mp_order: 0 })
const editingParentId = ref<number | null>(null)
const parentFormTitle = computed(() => editingParentId.value ? 'Edit Parent' : 'Tambah Parent')

const loadParents = async () => {
    loadingParent.value = true
    try { const { data } = await $api.get('/menu-parent'); if (data.success) parents.value = data.data } 
    catch (e) { console.error(e) } 
    finally { loadingParent.value = false }
}

const onParentSort = (event: any) => { parentSortField.value = event.sortField; parentSortOrder.value = event.sortOrder }

const openParentForm = (item?: any) => {
    editingParentId.value = item?.mp_id || null
    parentForm.value = item ? { mp_nama: item.mp_nama, mp_icon: item.mp_icon, mp_order: item.mp_order } : { mp_nama: '', mp_icon: 'pi pi-folder', mp_order: 0 }
    showParentDialog.value = true
}

const saveParent = async () => {
    saving.value = true
    try {
        const p = parentForm.value
        editingParentId.value ? await $api.put(`/menu-parent/${editingParentId.value}`, p) : await $api.post('/menu-parent', p)
        showParentDialog.value = false; await loadParents()
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Parent disimpan', life: 2000 })
    } catch (e: any) { toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Error', life: 3000 }) }
    finally { saving.value = false }
}

// ========== ITEMS ==========
const items = ref<any[]>([])
const loadingItem = ref(false)
const searchItem = ref('')
const itemSortField = ref('men_order')
const itemSortOrder = ref<1 | -1>(1)

const filteredItems = computed(() => {
    let result = [...items.value]
    if (searchItem.value) {
        const q = searchItem.value.toLowerCase()
        result = result.filter(i => 
            (i.MEN_NAMA2 || '').toLowerCase().includes(q) || 
            (i.men_route || '').toLowerCase().includes(q) ||
            (i.parent_nama || '').toLowerCase().includes(q)
        )
    }
    if (itemSortField.value) {
        result.sort((a, b) => {
            let va = a[itemSortField.value], vb = b[itemSortField.value]
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb?.toLowerCase() || '' }
            if (va < vb) return itemSortOrder.value === 1 ? -1 : 1
            if (va > vb) return itemSortOrder.value === 1 ? 1 : -1
            return 0
        })
    }
    return result
})

const showItemDialog = ref(false)
const itemForm = ref({ MEN_NAMA2: '', men_route: '', men_icon: 'pi pi-circle', men_parent_id: null, men_order: 0 })
const editingItemId = ref<number | null>(null)
const itemFormTitle = computed(() => editingItemId.value ? 'Edit Item' : 'Tambah Item')

const loadItems = async () => {
    loadingItem.value = true
    try { const { data } = await $api.get('/menu-items'); if (data.success) items.value = data.data } 
    catch (e) { console.error(e) } 
    finally { loadingItem.value = false }
}

const onItemSort = (event: any) => { itemSortField.value = event.sortField; itemSortOrder.value = event.sortOrder }

const openItemForm = (item?: any) => {
    editingItemId.value = item?.MEN_ID || null
    itemForm.value = item ? { MEN_NAMA2: item.MEN_NAMA2 || '', men_route: item.men_route || '', men_icon: item.men_icon || 'pi pi-circle', men_parent_id: item.men_parent_id || null, men_order: item.men_order || 0 } 
        : { MEN_NAMA2: '', men_route: '', men_icon: 'pi pi-circle', men_parent_id: null, men_order: 0 }
    showItemDialog.value = true
}

const saveItem = async () => {
    saving.value = true
    try {
        const p = itemForm.value
        editingItemId.value ? await $api.put(`/menu-items/${editingItemId.value}`, p) : await $api.post('/menu-items', p)
        showItemDialog.value = false; await loadItems()
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Item disimpan', life: 2000 })
    } catch (e: any) { toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Error', life: 3000 }) }
    finally { saving.value = false }
}

// ========== DELETE ==========
const deleteVisible = ref(false)
const deleteTarget = ref<any>(null)
const deleteType = ref<'parent' | 'item'>('item')

const confirmDelete = (type: 'parent' | 'item', item: any) => { deleteType.value = type; deleteTarget.value = item; deleteVisible.value = true }

const handleDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        const id = deleteType.value === 'parent' ? deleteTarget.value.mp_id : deleteTarget.value.MEN_ID
        const url = deleteType.value === 'parent' ? `/menu-parent/${id}` : `/menu-items/${id}`
        await $api.delete(url); deleteVisible.value = false
        deleteType.value === 'parent' ? await loadParents() : await loadItems()
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data dihapus', life: 2000 })
    } catch (e: any) { toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Error', life: 3000 }) }
    finally { deleting.value = false }
}

onMounted(async () => { await Promise.all([loadParents(), loadItems()]) })
</script>

<style lang="scss" scoped>
.menu-crud-page { height: 100%; display: flex; flex-direction: column; overflow: hidden; padding: 0.75rem; gap: 0.75rem; }

.menu-tabs { display: flex; gap: 0.5rem; flex-shrink: 0; }
.menu-tab {
    padding: 0.5rem 1.25rem; border-radius: 0.5rem; border: 1px solid var(--surface-border);
    background: var(--surface-card); cursor: pointer; font-size: 0.813rem; font-weight: 500;
    color: var(--text-color-secondary); display: flex; align-items: center; gap: 0.5rem; transition: all 0.15s;
    i { font-size: 0.875rem; }
    &:hover { background: var(--surface-100); color: var(--text-color); }
    &.active { background: var(--primary-50); border-color: var(--primary-300); color: var(--primary-700); i { color: var(--primary-600); } }
}

.table-section { flex: 1; overflow: hidden; display: flex; flex-direction: column; background: var(--surface-card); border-radius: 0.75rem; border: 1px solid var(--surface-border); }

.browse-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--surface-border); gap: 0.5rem; flex-shrink: 0;
    .toolbar-left { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
    .search-input { width: 220px; }
    .toolbar-right { display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0; }
}

.crud-table {
    flex: 1;
    
    // 🔥 SORT ICON - RATA KANAN
    :deep(.p-datatable-column-header-content) {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100% !important;
    }
    
    :deep(.p-datatable-column-title) {
        flex: 1;
    }
    
    :deep(.p-datatable-sort-icon) {
        flex-shrink: 0;
        margin-left: 0.25rem;
        width: 0.75rem !important;
        height: 0.75rem !important;
    }
    
    // Header
    :deep(.p-datatable-thead > tr > th) { 
        font-size: 0.688rem; padding: 0.375rem 0.625rem; font-weight: 700; 
        text-transform: uppercase; letter-spacing: 0.025em; color: var(--text-color-secondary); 
        background: var(--surface-50); border-bottom: 2px solid var(--surface-border); 
    }
    :deep(.p-datatable-tbody > tr > td) { font-size: 0.75rem; padding: 0.25rem 0.625rem; border-bottom: 1px solid var(--surface-border); }
    :deep(.p-datatable-tbody > tr:hover) { background: var(--surface-50); }
    :deep(.p-datatable-tbody > tr > td i) { font-size: 0.938rem; }
}

.icon-cell { display: flex; align-items: center; gap: 0.5rem; i { font-size: 1rem !important; } span { font-size: 0.688rem; color: var(--text-color-secondary); } }

.form-grid { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.375rem;
    label { font-size: 0.75rem; font-weight: 600; color: var(--text-color-secondary); text-transform: uppercase; letter-spacing: 0.025em; .req { color: #dc2626; } }
}

.icon-option { display: flex; align-items: center; gap: 0.5rem; i { font-size: 1.125rem; width: 1.75rem; text-align: center; color: var(--text-color-secondary); } span { font-size: 0.813rem; } }
.icon-value { display: flex; align-items: center; gap: 0.5rem; i { font-size: 1.125rem; color: var(--primary-500); } span { font-size: 0.813rem; font-weight: 500; } }

:deep(.compact-input.p-inputtext), :deep(.compact-input .p-inputtext) { font-size: 0.813rem !important; padding: 0.375rem 0.625rem !important; height: 2rem !important; border-radius: 0.375rem !important; }
:deep(.compact-input.p-inputnumber .p-inputnumber-input) { font-size: 0.813rem !important; padding: 0.375rem 0.625rem !important; height: 2rem !important; border-radius: 0.375rem !important; }
:deep(.compact-input.p-select) { font-size: 0.813rem !important; height: 2rem !important; border-radius: 0.375rem !important; .p-select-label { font-size: 0.813rem !important; padding: 0.375rem 0.625rem !important; } .p-select-dropdown { width: 1.75rem !important; } }

:deep(.p-select-option) { font-size: 0.813rem !important; padding: 0.375rem 0.625rem !important; }
:deep(.p-select-list) { padding: 0.25rem !important; }
:deep(.p-button.p-button-icon-only.p-button-rounded) { width: 2rem !important; height: 2rem !important; i { font-size: 0.813rem !important; } }

:global(.app-dark) {
    .crud-table :deep(.p-datatable-thead > tr > th) { background: var(--surface-800); border-bottom-color: var(--surface-700); }
    .crud-table :deep(.p-datatable-tbody > tr > td) { border-bottom-color: var(--surface-700); }
    .crud-table :deep(.p-datatable-tbody > tr:hover) { background: var(--surface-800); }
    .menu-tab.active { background: var(--primary-900); border-color: var(--primary-700); color: var(--primary-300); i { color: var(--primary-400); } }
}

@media (max-width: 768px) {
    .menu-crud-page { padding: 0.5rem; }
    .menu-tab { padding: 0.375rem 0.875rem; font-size: 0.75rem; i { font-size: 0.813rem; } }
    .browse-toolbar { flex-direction: column; align-items: stretch; .search-input { width: 100%; } }
    .crud-table { :deep(.p-datatable-thead > tr > th) { font-size: 0.625rem; padding: 0.25rem 0.5rem; } :deep(.p-datatable-tbody > tr > td) { font-size: 0.688rem; padding: 0.2rem 0.5rem; } }
}
</style>