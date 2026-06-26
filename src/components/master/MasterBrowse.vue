<template>
    <div class="master-browse">
        <!-- Toolbar -->
        <div class="browse-toolbar">
            <div class="toolbar-left">
                <IconField iconPosition="left">
                    <InputIcon class="pi pi-search" />
                    <InputText 
                        v-model="searchKeyword" 
                        placeholder="Cari..." 
                        size="small"
                        class="search-input"
                        @input="onSearchInput"
                    />
                </IconField>
                
                <div v-if="selectedItems.length > 0" class="bulk-info">
                    <span>{{ selectedItems.length }} terpilih</span>
                    <Button icon="pi pi-trash" severity="danger" text size="small" @click="confirmBulkDelete" />
                </div>

                <div v-if="totalActiveFilters > 0" class="active-filters">
                    <i class="pi pi-filter-fill"></i>
                    <span>{{ totalActiveFilters }} filter</span>
                    <Button icon="pi pi-times" text rounded size="small" severity="secondary" @click="clearAllFilters" />
                </div>
            </div>
            
            <div class="toolbar-right">
<Button 
            v-if="canInsert"
            icon="pi pi-plus" 
            label="Tambah" 
            severity="primary" 
            size="small"
            @click="openAddForm" 
        />
                        <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loading" @click="fetchData" />
            </div>
        </div>

        <!-- Table Area -->
        <div class="browse-table-wrapper">
            <DataTable 
                v-model:selection="selectedItems"
                v-model:expandedRows="expandedRows"
                :value="items"
                :dataKey="config.primaryKey"
                :loading="loading"
                :sortField="sortField"
                :sortOrder="sortOrder"
                @sort="onSort"
                @rowExpand="onRowExpand"
                @rowCollapse="onRowCollapse"
                stripedRows
                showGridlines
                resizableColumns
                columnResizeMode="expand"
                responsiveLayout="scroll"
                size="small"
                class="browse-table"
                scrollable
                scrollHeight="flex"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-inbox"></i>
                        <p>Tidak ada data ditemukan</p>
                        <Button v-if="totalActiveFilters > 0 || searchKeyword" label="Reset" text size="small" @click="resetAllFiltersAndSearch" />
                    </div>
                </template>

                <template #loading>
                    <div class="skeleton-loading">
                        <div v-for="i in 8" :key="i" class="skeleton-row">
                            <div class="skeleton-cell" style="width: 30px;"></div>
                            <div class="skeleton-cell" style="width: 100px;"></div>
                            <div class="skeleton-cell" style="width: 180px;"></div>
                            <div class="skeleton-cell" style="width: 60px;"></div>
                            <div class="skeleton-cell" style="width: 80px;"></div>
                            <div class="skeleton-cell" style="width: 120px;"></div>
                            <div class="skeleton-cell" style="width: 60px;"></div>
                        </div>
                    </div>
                </template>

                <Column v-if="config.expansion?.enabled" expander style="width: 2.5rem" />
                <Column selectionMode="multiple" style="width: 2.5rem" />

                <Column 
                    v-for="col in visibleColumns" 
                    :key="col.field" 
                    :field="col.field" 
                    :sortable="col.sortable !== false"
                    :style="{ minWidth: col.minWidth || '120px', textAlign: col.align || 'left' }"
                >
                    <template #header>
                        <div class="col-header">
                            <span class="col-title">{{ col.header }}</span>
                            <div class="col-icons">
                                <button 
                                    class="col-filter-btn" 
                                    :class="{ 'active': hasColumnFilter(col.field) || hasNumericFilter(col.field) }" 
                                    @click.stop="openColumnFilter(col, $event)"
                                >
                                    <i class="pi pi-filter"></i>
                                </button>
                            </div>
                            <OverlayPanel :ref="(el) => setFilterOverlayRef(col.field, el)" @hide="onFilterPanelHide(col.field)">
                                <NumericFilter 
                                    v-if="col.type === 'currency' || col.type === 'number'"
                                    :label="col.header"
                                    :currentFilter="numericFilters[col.field]"
                                    @apply="(f: any) => applyNumericFilter(col.field, f)"
                                    @close="closeFilterPanel(col.field)"
                                />
                                <NumericFilter 
                                    v-else-if="col.type === 'date'"
                                    :label="col.header"
                                    :currentFilter="numericFilters[col.field]"
                                    :isDate="true"
                                    @apply="(f: any) => applyNumericFilter(col.field, f)"
                                    @close="closeFilterPanel(col.field)"
                                />
                                <div v-else class="mini-filter">
                                    <div class="mini-filter-head">
                                        <span>Filter {{ col.header }}</span>
                                        <Button icon="pi pi-times" text rounded size="small" @click="closeFilterPanel(col.field)" />
                                    </div>
                                    <div class="mini-filter-search">
                                        <i class="pi pi-search"></i>
                                        <input v-model="filterSearchTerms[col.field]" placeholder="Cari..." class="mini-filter-input" />
                                    </div>
                                    <div class="mini-filter-actions">
                                        <button @click="selectAllFilterOptions(col.field)">Pilih Semua</button>
                                        <button @click="clearFilterOptions(col.field)">Bersihkan</button>
                                    </div>
                                    <div class="mini-filter-list">
                                        <label v-for="opt in getFilteredOptions(col.field)" :key="opt.value" class="mini-filter-opt">
                                            <input type="checkbox" :value="opt.value" v-model="tempFilters[col.field]" />
                                            <span>{{ opt.label }}</span>
                                            <small>{{ opt.count }}</small>
                                        </label>
                                        <div v-if="getFilteredOptions(col.field).length === 0" class="mini-filter-empty">Tidak ada</div>
                                    </div>
                                    <div class="mini-filter-foot">
                                        <Button label="Terapkan" severity="primary" size="small" class="w-full" @click="applyColumnFilter(col.field)" />
                                    </div>
                                </div>
                            </OverlayPanel>
                        </div>
                    </template>

                    <template #body="slotProps">
                        <Tag v-if="col.type === 'boolean'" :value="slotProps.data[col.field] ? (col.booleanLabels?.true || 'Ya') : (col.booleanLabels?.false || 'Tidak')" :severity="slotProps.data[col.field] ? 'success' : 'secondary'" size="small" />
                        <span v-else-if="col.type === 'currency'" class="currency-text">{{ formatCurrency(slotProps.data[col.field]) }}</span>
                        <span v-else-if="col.type === 'number'" class="number-text">{{ formatNumber(slotProps.data[col.field]) }}</span>
                        <span v-else-if="col.type === 'date'">{{ formatDate(slotProps.data[col.field]) }}</span>
                        <span v-else>{{ slotProps.data[col.field] || '-' }}</span>
                    </template>
                </Column>

                <Column header="Aksi" style="width: 5rem; text-align: center">
                    <template #body="slotProps">
                        <div class="action-buttons">
<Button 
            v-if="canEdit"
            icon="pi pi-pencil" 
            text rounded size="small" severity="info"
            @click="openEditForm(slotProps.data)" />
 <Button 
            v-if="canDelete"
            icon="pi pi-trash" 
            text rounded size="small" severity="danger"
            @click="confirmDelete(slotProps.data)" 
        />                        </div>
                    </template>
                </Column>

                <template v-if="config.expansion?.enabled" #expansion="slotProps">
                    <div class="expansion-content">
                        <div class="expansion-header">
                            <div class="expansion-header-left">
                                <i class="pi pi-info-circle"></i>
                                <span class="expansion-title">{{ config.expansion?.title || 'Detail' }} - {{ slotProps.data[config.primaryKey] }}</span>
                            </div>
                        </div>
                        <DataTable v-if="detailDataCache[slotProps.data[config.primaryKey]]" :value="detailDataCache[slotProps.data[config.primaryKey]]" size="small" class="expansion-table" stripedRows>
                            <template #empty><div class="detail-empty"><i class="pi pi-info-circle"></i><span>Tidak ada data</span></div></template>
                            <Column v-for="col in config.expansion?.columns || []" :key="col.field" :field="col.field" :header="col.header" :style="{ width: col.width || 'auto', minWidth: col.minWidth || '120px', textAlign: col.align || 'left' }">
                                <template v-if="col.type === 'currency'" #body="{ data }">{{ formatCurrency(data[col.field]) }}</template>
                                <template v-else-if="col.type === 'number'" #body="{ data }">{{ formatNumber(data[col.field]) }}</template>
                            </Column>
                        </DataTable>
                        <div v-else class="detail-empty"><i class="pi pi-info-circle"></i><span>Tidak ada data detail</span></div>
                    </div>
                </template>
            </DataTable>
        </div>

        <!-- Paginator -->
        <div class="browse-paginator-fixed">
            <div class="browse-paginator">
                <div class="paginator-left">
                    <Select v-model="pagination.perPage" :options="[10, 25, 50, 100]" size="small" class="perpage-select" @update:modelValue="onPerPageChange" />
                    <span class="paginator-info">per halaman</span>
                </div>
                <div class="paginator-center">
                    <Paginator :key="pagination.total" v-model:first="firstRecord" :rows="pagination.perPage" :totalRecords="pagination.total" :rowsPerPageOptions="[10, 25, 50, 100]" @page="onPageChange" template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" class="custom-paginator" />
                </div>
                <div class="paginator-right">
                    <span class="total-info">{{ pagination.total }} total data</span>
                </div>
            </div>
        </div>

        <!-- Delete Dialog -->
        <DeleteDialog 
            v-model="deleteVisible"
            :loading="deleteLoading"
            @confirm="handleDelete"
            @cancel="deleteVisible = false"
        />

                <PermissionGuard v-model="showPermDialog" :message="permMessage" />

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OverlayPanel from 'primevue/overlaypanel'
import NumericFilter from '~/components/common/NumericFilter.vue'
import { useMasterCrud, type MasterConfig } from '~/composables/useMasterCrud'
import { useToast } from 'primevue/usetoast'
import DeleteDialog from '~/components/common/DeleteDialog.vue'
import PermissionGuard from '~/components/common/PermissionGuard.vue'


const firstRecord = ref(0)

const props = defineProps<{ config: MasterConfig }>()

const router = useRouter()
const toast = useToast()

const {
    items, selectedItems, loading, pagination, searchKeyword,
    tableFilters, numericFilters, filterOptionsCache, detailDataCache,
    sortField, sortOrder, deleteVisible, deleteItem, deleteLoading,
    fetchData, fetchAllData, refreshData, handleDelete, formatCurrency, formatDate,
     canInsert, canEdit, canDelete,
    showPermDialog, permMessage
} = useMasterCrud(props.config)

// UI State
const filterOverlays = ref<Record<string, any>>({})
const tempFilters = ref<Record<string, any[]>>({})
const filterSearchTerms = ref<Record<string, string>>({})
const activeColumnFilters = ref<Record<string, any[]>>({})

// Row Expansion
const expandedRows = ref<Record<string, boolean>>({})

// Computed
const visibleColumns = computed(() => props.config.columns.filter(col => !col.hidden))

const totalActiveFilters = computed(() => {
    let count = 0
    Object.keys(activeColumnFilters.value).forEach(key => {
        if (activeColumnFilters.value[key]?.length > 0) count++
    })
    Object.keys(numericFilters.value).forEach(key => {
        if (numericFilters.value[key]) count++
    })
    return count
})

// Format
const formatNumber = (v: any) => {
    if (!v && v !== 0) return "0"
    return Math.round(parseFloat(v)).toLocaleString("id-ID")
}

// Navigation
const openAddForm = () => { if (props.config.formRoute) router.push(props.config.formRoute) }
const openEditForm = (item: any) => {
    const id = item[props.config.primaryKey]
    if (props.config.formRoute) router.push(`${props.config.formRoute}?id=${id}`)
}

// Filter
const setFilterOverlayRef = (field: string, el: any) => { if (el) filterOverlays.value[field] = el }
const hasNumericFilter = (field: string) => numericFilters.value[field] !== undefined
const hasColumnFilter = (field: string) => activeColumnFilters.value[field]?.length > 0

const openColumnFilter = (col: any, event: Event) => {
    const overlay = filterOverlays.value[col.field]
    if (!overlay) return
    const isNumOrDate = col.type === 'currency' || col.type === 'number' || col.type === 'date'
    if (!isNumOrDate && !tempFilters.value[col.field]) {
        tempFilters.value[col.field] = [...(activeColumnFilters.value[col.field] || [])]
    }
    overlay.toggle(event)
}

const closeFilterPanel = (field: string) => filterOverlays.value[field]?.hide()

const onFilterPanelHide = (field: string) => {
    const col = props.config.columns.find(c => c.field === field)
    if (col && !(col.type === 'currency' || col.type === 'number' || col.type === 'date')) {
        tempFilters.value[field] = [...(activeColumnFilters.value[field] || [])]
        filterSearchTerms.value[field] = ''
    }
}

const getFilteredOptions = (field: string) => {
    const options = filterOptionsCache.value[field] || []
    const searchTerm = filterSearchTerms.value[field]?.toLowerCase() || ''
    return searchTerm ? options.filter(opt => String(opt.label).toLowerCase().includes(searchTerm)) : options
}

const selectAllFilterOptions = (field: string) => { tempFilters.value[field] = (filterOptionsCache.value[field] || []).map(opt => opt.value) }
const clearFilterOptions = (field: string) => { tempFilters.value[field] = [] }

const applyColumnFilter = (field: string) => {
    activeColumnFilters.value[field] = [...(tempFilters.value[field] || [])]
    if (activeColumnFilters.value[field].length > 0) {
        tableFilters.value[field] = activeColumnFilters.value[field]
    } else {
        delete tableFilters.value[field]
    }
    closeFilterPanel(field)
    pagination.page = 1
    firstRecord.value = 0
    refreshData()
}

const applyNumericFilter = (field: string, filter: any) => {
    if (filter) { numericFilters.value[field] = filter }
    else { delete numericFilters.value[field] }
    closeFilterPanel(field)
    pagination.page = 1
    firstRecord.value = 0
    refreshData()
}

const clearAllFilters = () => {
    activeColumnFilters.value = {}
    tempFilters.value = {}
    Object.keys(numericFilters.value).forEach(key => delete numericFilters.value[key])
    Object.keys(tableFilters.value).forEach(key => delete tableFilters.value[key])
    pagination.page = 1
    firstRecord.value = 0
    refreshData()
}

const resetAllFiltersAndSearch = () => { searchKeyword.value = ''; clearAllFilters() }

// Row Expansion
const onRowExpand = (event: any) => {}
const onRowCollapse = (event: any) => {}

// Search & Sort
let searchTimeout: NodeJS.Timeout
const onSearchInput = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => { pagination.page = 1; refreshData() }, 300)
}

const onSort = (event: any) => {
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder
    refreshData()
}

// Pagination
const onPageChange = (event: any) => { pagination.page = event.page + 1; firstRecord.value = event.first; refreshData() }
const onPerPageChange = () => { pagination.page = 1; firstRecord.value = 0; refreshData() }

// Delete
const confirmDelete = (item: any) => { deleteItem.value = item; deleteVisible.value = true }
const confirmBulkDelete = () => { toast.add({ severity: 'warn', summary: 'Info', detail: 'Fitur hapus massal segera hadir', life: 2000 }) }

// Init
onMounted(async () => {
    pagination.perPage = 25
    await fetchAllData()
})
</script>

<style lang="scss" scoped>
.master-browse { display: flex; flex-direction: column; height: 100%; overflow: hidden; background: transparent; }

.browse-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--surface-border); gap: 0.75rem; flex-shrink: 0; .toolbar-left { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0; flex-wrap: wrap; } .search-input { width: 200px; } .bulk-info { display: flex; align-items: center; gap: 0.375rem; padding: 0.125rem 0.5rem; background: var(--primary-50); border-radius: 1rem; font-size: 0.688rem; color: var(--primary-700); font-weight: 500; white-space: nowrap; } .active-filters { display: flex; align-items: center; gap: 0.25rem; padding: 0.125rem 0.5rem; background: var(--surface-100); border-radius: 1rem; font-size: 0.688rem; color: var(--text-color-secondary); white-space: nowrap; i { font-size: 0.625rem; color: var(--primary-500); } } .toolbar-right { display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0; } }

.browse-table-wrapper { flex: 1; overflow: hidden; background: transparent; :deep(.p-datatable) { display: flex; flex-direction: column; height: 100%; } :deep(.p-datatable-table-container) { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--surface-300) transparent; &::-webkit-scrollbar { width: 5px; height: 5px; } &::-webkit-scrollbar-thumb { background: var(--surface-300); border-radius: 2.5px; } } :deep(.p-datatable-thead > tr > th) { position: sticky; top: 0; z-index: 10; background: var(--surface-50); font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-color-secondary); padding: 0.25rem 0.5rem; border-bottom: 2px solid var(--surface-border) !important; border-right: 1px solid var(--surface-200) !important; &:last-child { border-right: none !important; } } :deep(.p-datatable-tbody > tr > td) { padding: 0.1875rem 0.5rem; font-size: 0.688rem; border-bottom: 1px solid var(--surface-border) !important; border-right: 1px solid var(--surface-100) !important; &:last-child { border-right: none !important; } } :deep(.p-datatable-tbody > tr:hover) { background: var(--surface-50); } :deep(.p-datatable-tbody > tr.p-highlight) { background: var(--primary-50) !important; } :deep(.p-checkbox) { width: 1rem !important; height: 1rem !important; } :deep(.p-tag) { font-size: 0.563rem !important; padding: 0.0625rem 0.375rem !important; } :deep(.p-button.p-button-icon-only.p-button-rounded) { width: 1.5rem !important; height: 1.5rem !important; i { font-size: 0.625rem !important; } } }

.col-header { display: flex; align-items: center; width: 100%; .col-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .col-icons { display: flex; align-items: center; gap: 0.15rem; flex-shrink: 0; margin-left: auto; } }
.col-filter-btn { width: 1.25rem; height: 1.25rem; border-radius: 0.2rem; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.12s; color: var(--text-color-secondary); i { font-size: 0.6rem; } &:hover { background: var(--surface-200); } &.active { opacity: 1; background: var(--primary-100); color: var(--primary-700); } }
.col-header:hover .col-filter-btn { opacity: 1; }

.mini-filter { width: 230px; display: flex; flex-direction: column; .mini-filter-head { display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.65rem; border-bottom: 1px solid var(--surface-border); font-weight: 600; font-size: 0.76rem; } .mini-filter-search { position: relative; padding: 0.35rem 0.65rem; border-bottom: 1px solid var(--surface-border); i { position: absolute; left: 1.05rem; top: 50%; transform: translateY(-50%); font-size: 0.65rem; } .mini-filter-input { width: 100%; height: 1.55rem; padding: 0 0.35rem 0 1.5rem; border: 1px solid var(--surface-border); border-radius: 0.25rem; font-size: 0.7rem; outline: none; } } .mini-filter-actions { display: flex; justify-content: space-between; padding: 0.25rem 0.65rem; border-bottom: 1px solid var(--surface-border); button { background: none; border: none; font-size: 0.65rem; color: var(--primary-600); cursor: pointer; font-weight: 500; } } .mini-filter-list { max-height: 160px; overflow-y: auto; padding: 0.15rem 0; } .mini-filter-opt { display: flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.65rem; cursor: pointer; font-size: 0.7rem; &:hover { background: var(--surface-50); } input[type="checkbox"] { width: 0.75rem; height: 0.75rem; accent-color: var(--primary-500); } span { flex: 1; } small { color: var(--text-color-secondary); font-size: 0.62rem; } } .mini-filter-empty { padding: 1.25rem; text-align: center; color: var(--text-color-secondary); font-size: 0.7rem; } .mini-filter-foot { padding: 0.35rem 0.65rem; border-top: 1px solid var(--surface-border); } }

.currency-text { font-weight: 600; color: var(--primary-600); font-size: 0.688rem; }
.number-text { font-weight: 500; font-size: 0.688rem; }
.action-buttons { display: flex; align-items: center; justify-content: center; gap: 0; }

.skeleton-loading { padding: 0.5rem; .skeleton-row { display: flex; gap: 0.5rem; padding: 0.35rem 0; .skeleton-cell { height: 1rem; background: linear-gradient(90deg, var(--surface-100) 25%, var(--surface-200) 50%, var(--surface-100) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 0.25rem; } } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: var(--text-color-secondary); i { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.4; } p { margin: 0 0 0.75rem 0; font-size: 0.813rem; } }

.browse-paginator-fixed { flex-shrink: 0; }
.browse-paginator { display: flex; align-items: center; justify-content: space-between; padding: 0.375rem 0.75rem; border-top: 1px solid var(--surface-border); .paginator-left { display: flex; align-items: center; gap: 0.375rem; } .perpage-select { width: 65px; } .paginator-info { font-size: 0.688rem; color: var(--text-color-secondary); } .paginator-center { flex: 1; display: flex; justify-content: center; } .custom-paginator { :deep(.p-paginator) { background: transparent; border: none; padding: 0; } :deep(.p-paginator-page) { min-width: 1.5rem; height: 1.5rem; font-size: 0.688rem; } :deep(.p-paginator-page.p-highlight) { background: var(--primary-500); color: white; border-radius: 0.25rem; } } .paginator-right { display: flex; align-items: center; } .total-info { font-size: 0.688rem; color: var(--text-color-secondary); } }

.expansion-content { padding: 0.5rem 0.75rem; background: var(--surface-50); .expansion-header { display: flex; align-items: center; margin-bottom: 0.5rem; padding-bottom: 0.375rem; border-bottom: 1px dashed var(--surface-border); .expansion-header-left { display: flex; align-items: center; gap: 0.5rem; i { font-size: 0.75rem; color: var(--primary-500); } .expansion-title { font-size: 0.688rem; font-weight: 600; } } } .expansion-table { background: var(--surface-card); border-radius: 0.375rem; overflow: hidden; border: 1px solid var(--surface-border); } .detail-empty { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; color: var(--text-color-secondary); font-size: 0.688rem; } }

.delete-dialog { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem 0; i { font-size: 2.5rem; color: var(--yellow-500); margin-bottom: 0.75rem; } p { color: var(--text-color-secondary); font-size: 0.813rem; } }

:global(html.app-dark) {
    .browse-table-wrapper :deep(.p-datatable-thead > tr > th) { background: var(--surface-800); }
    .bulk-info { background: var(--primary-900) !important; color: var(--primary-300) !important; }
    .active-filters { background: var(--surface-700) !important; }
    .browse-table-wrapper :deep(.p-datatable-tbody > tr:hover) { background: var(--surface-800); }
    .browse-table-wrapper :deep(.p-datatable-tbody > tr.p-highlight) { background: var(--primary-900) !important; }
    .expansion-content { background: var(--surface-800); }
    .mini-filter-opt:hover { background: var(--surface-800); }
}

@media (max-width: 768px) {
    .browse-toolbar { flex-direction: column; gap: 0.5rem; padding: 0.5rem; .search-input { width: 100%; } .toolbar-right { justify-content: space-between; } }
    .browse-paginator { flex-direction: column; gap: 0.375rem; padding: 0.375rem 0.5rem; }
}
</style>