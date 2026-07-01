<template>
    <div class="master-browse">
        <!-- ==================== TOOLBAR ==================== -->
        <div class="browse-toolbar">
            <div class="toolbar-left">
                <!-- Search (WAJIB) -->
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
                
                <!-- Periode (OPSIONAL) -->
                <template v-if="config.showPeriod !== false">
                    <div class="filter-item">
                        <span class="filter-label">Dari</span>
                        <DatePicker v-model="startDate" dateFormat="yy-mm-dd" showIcon size="small" />
                    </div>
                    <div class="filter-item">
                        <span class="filter-label">Sampai</span>
                        <DatePicker v-model="endDate" dateFormat="yy-mm-dd" showIcon size="small" />
                    </div>
                </template>
                
                <!-- Custom Filters (SLOT) -->
                <slot name="custom-filters" />
                
                <!-- Load Button -->
                <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loading" @click="loadWithPeriod" />
                
                <!-- Filter indicators -->
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
                <!-- Permission: Tambah -->
                <Button v-if="canInsert" icon="pi pi-plus" label="Tambah" severity="primary" size="small" @click="openAddForm" />
                
                <!-- Export -->
                <Button icon="pi pi-file-excel" severity="secondary" text rounded size="small" @click="showExportDialog('excel')" v-tooltip="'Excel'" />
                <Button icon="pi pi-print" severity="secondary" text rounded size="small" @click="showExportDialog('pdf')" v-tooltip="'Print'" />
            </div>
        </div>

        <!-- ==================== TABLE ==================== -->
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
                            <div class="skeleton-cell" v-for="j in 6" :key="j" :style="{ width: `${80 + j * 20}px` }"></div>
                        </div>
                    </div>
                </template>

                <Column v-if="config.expansion?.enabled" expander style="width: 2.5rem" />
                <Column selectionMode="multiple" style="width: 2.5rem" />

                <Column v-for="col in visibleColumns" :key="col.field" :field="col.field" 
                    :sortable="col.sortable !== false"
                    :style="{ minWidth: col.minWidth || '100px', textAlign: col.align || 'left' }"
                >
                    <template #header>
                        <div class="col-header">
                            <span class="col-title">{{ col.header }}</span>
                            <div class="col-icons">
                                <button class="col-filter-btn" :class="{ 'active': hasColumnFilter(col.field) || hasNumericFilter(col.field) }" @click.stop="openColumnFilter(col, $event)">
                                    <i class="pi pi-filter"></i>
                                </button>
                            </div>
                            <OverlayPanel :ref="(el) => setFilterOverlayRef(col.field, el)" @hide="onFilterPanelHide(col.field)">
                                <NumericFilter v-if="col.type === 'currency' || col.type === 'number'" :label="col.header" :currentFilter="numericFilters[col.field]" @apply="(f: any) => applyNumericFilter(col.field, f)" @close="closeFilterPanel(col.field)" />
                                <NumericFilter v-else-if="col.type === 'date'" :label="col.header" :currentFilter="numericFilters[col.field]" :isDate="true" @apply="(f: any) => applyNumericFilter(col.field, f)" @close="closeFilterPanel(col.field)" />
                                <div v-else class="mini-filter">
                                    <div class="mini-filter-head"><span>Filter {{ col.header }}</span><Button icon="pi pi-times" text rounded size="small" @click="closeFilterPanel(col.field)" /></div>
                                    <div class="mini-filter-search"><i class="pi pi-search"></i><input v-model="filterSearchTerms[col.field]" placeholder="Cari..." class="mini-filter-input" /></div>
                                    <div class="mini-filter-actions"><button @click="selectAllFilterOptions(col.field)">Pilih Semua</button><button @click="clearFilterOptions(col.field)">Bersihkan</button></div>
                                    <div class="mini-filter-list">
                                        <label v-for="opt in getFilteredOptions(col.field)" :key="opt.value" class="mini-filter-opt"><input type="checkbox" :value="opt.value" v-model="tempFilters[col.field]" /><span>{{ opt.label }}</span><small>{{ opt.count }}</small></label>
                                        <div v-if="getFilteredOptions(col.field).length === 0" class="mini-filter-empty">Tidak ada</div>
                                    </div>
                                    <div class="mini-filter-foot"><Button label="Terapkan" severity="primary" size="small" class="w-full" @click="applyColumnFilter(col.field)" /></div>
                                </div>
                            </OverlayPanel>
                        </div>
                    </template>
                    <template v-if="col.type === 'boolean'" #body="{ data }">
                        <Tag :value="data[col.field] ? (col.booleanLabels?.true || 'Ya') : (col.booleanLabels?.false || 'Tidak')" :severity="data[col.field] ? 'success' : 'secondary'" size="small" />
                    </template>
                    <template v-else-if="col.type === 'currency'" #body="{ data }">
                        <span class="currency-text">{{ formatCurrency(data[col.field]) }}</span>
                    </template>
                    <template v-else-if="col.type === 'number'" #body="{ data }">
                        <span class="number-text">{{ formatNumber(data[col.field]) }}</span>
                    </template>
                    <template v-else-if="col.type === 'date'" #body="{ data }">
                        {{ formatDate(data[col.field]) }}
                    </template>
                    
                    <!-- 🔥 FOOTER TOTAL -->
                    <template v-if="col.type === 'currency' || col.type === 'number'" #footer>
                        <span class="footer-total">{{ formatNumber(footerTotals[col.field] || 0) }}</span>
                    </template>
                    <template v-else-if="col.field === visibleColumns[0]?.field" #footer>
                        <span class="footer-label">TOTAL</span>
                    </template>
                </Column>

                <Column header="Aksi" style="width: 5rem; text-align: center">
                    <template #body="slotProps">
                        <div class="action-buttons">
                            <Button v-if="canEdit" icon="pi pi-pencil" text rounded size="small" severity="info" @click="openEditForm(slotProps.data)" />
                            <Button v-if="canDelete" icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(slotProps.data)" />
                        </div>
                    </template>
                </Column>

                <!-- Expansion -->
                <template v-if="config.expansion?.enabled" #expansion="slotProps">
                    <div class="expansion-content">
                        <div class="expansion-header">
                            <i class="pi pi-list"></i>
                            <span>{{ config.expansion?.title || 'Detail' }} - {{ slotProps.data[config.primaryKey] }}</span>
                        </div>
                        <div v-if="detailLoading[slotProps.data[config.primaryKey]]" class="detail-loading">
                            <i class="pi pi-spinner pi-spin"></i><span>Memuat...</span>
                        </div>
                        <DataTable v-else :value="detailData[slotProps.data[config.primaryKey]] || []" size="small" class="expansion-table" stripedRows>
                            <template #empty><div class="detail-empty"><i class="pi pi-info-circle"></i><span>Tidak ada data</span></div></template>
                            <Column v-for="col in config.expansion?.columns || []" :key="col.field" :field="col.field" :header="col.header" :style="{ width: col.width || 'auto', minWidth: col.minWidth || '100px', textAlign: col.align || 'left' }">
                                <template v-if="col.type === 'currency'" #body="{ data }">{{ formatCurrency(data[col.field]) }}</template>
                                <template v-else-if="col.type === 'number'" #body="{ data }">{{ formatNumber(data[col.field]) }}</template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </DataTable>
        </div>

        <!-- ==================== PAGINATOR ==================== -->
        <div class="browse-paginator-fixed">
            <div class="browse-paginator">
                <div class="paginator-left">
                    <Select v-model="pagination.perPage" :options="[10, 25, 50, 100]" size="small" class="perpage-select" @update:modelValue="onPerPageChange" />
                    <span class="paginator-info">per halaman</span>
                </div>
                <div class="paginator-center">
                    <Paginator :rows="pagination.perPage" :totalRecords="pagination.total" :rowsPerPageOptions="[10, 25, 50, 100]" @page="onPageChange" template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" class="custom-paginator" />
                </div>
                <div class="paginator-right">
                    <span class="total-info">{{ pagination.total }} total data</span>
                </div>
            </div>
        </div>

        <!-- Delete Dialog -->
        <DeleteDialog v-model="deleteVisible" :loading="deleteLoading" @confirm="handleDelete" />

        <!-- Export Dialog -->
        <Dialog v-model:visible="exportDialog" header="Export Data" :modal="true" :style="{ width: '400px' }">
            <div class="export-dialog-content">
                <p class="export-dialog-text">Pilih tipe export:</p>
                <div class="export-option-card" :class="{ 'active': !exportWithDetail }" @click="exportWithDetail = false">
    <div class="export-option-icon"><i class="pi pi-file"></i></div>
    <div class="export-option-info">
        <strong>Header</strong>  <!-- 🔥 GANTI -->
        <small>Hanya data header</small>
    </div>
    <i class="pi pi-check-circle check-icon" v-if="!exportWithDetail"></i>
</div>
                <div v-if="config.expansion?.enabled" class="export-option-card" :class="{ 'active': exportWithDetail }" @click="exportWithDetail = true">
                    <div class="export-option-icon"><i class="pi pi-list"></i></div>
                    <div class="export-option-info"><strong>Dengan Detail</strong><small>Header + detail per item</small></div>
                    <i class="pi pi-check-circle check-icon" v-if="exportWithDetail"></i>
                </div>
            </div>
            <template #footer>
                <Button label="Batal" text size="small" @click="exportDialog = false" />
                <Button label="Export" severity="primary" size="small" @click="proceedExport" />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OverlayPanel from 'primevue/overlaypanel'
import NumericFilter from '~/components/common/NumericFilter.vue'
import DeleteDialog from '~/components/common/DeleteDialog.vue'
import { useMasterCrud, type MasterConfig } from '~/composables/useMasterCrud'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{ config: MasterConfig }>()
const router = useRouter()
const toast = useToast()

const {
    items, selectedItems, loading, pagination, searchKeyword,
    tableFilters, numericFilters, filterOptionsCache,
    sortField, sortOrder, deleteVisible, deleteItem, deleteLoading,
    fetchAllData, fetchData, refreshData, handleDelete,
    formatCurrency, formatDate,
    canInsert, canEdit, canDelete,
    filteredData, 
    detailDataCache,
} = useMasterCrud(props.config)

// Periode
const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const endDate = ref(new Date())

// Filter
const filterOverlays = ref<Record<string, any>>({})
const tempFilters = ref<Record<string, any[]>>({})
const filterSearchTerms = ref<Record<string, string>>({})
const activeColumnFilters = ref<Record<string, any[]>>({})

// Expansion
const expandedRows = ref<Record<string, boolean>>({})
const detailData = ref<Record<string, any[]>>({})
const detailLoading = ref<Record<string, boolean>>({})

// Export
const exportDialog = ref(false)
const exportWithDetail = ref(false)
const exportType = ref<'excel' | 'pdf'>('excel')

const visibleColumns = computed(() => props.config.columns.filter(col => !col.hidden))

const totalActiveFilters = computed(() => {
    let count = 0
    Object.keys(activeColumnFilters.value).forEach(k => { if (activeColumnFilters.value[k]?.length > 0) count++ })
    Object.keys(numericFilters.value).forEach(k => { if (numericFilters.value[k]) count++ })
    return count
})

const footerTotals = computed(() => {
    const totals: Record<string, number> = {}
    props.config.columns.forEach(col => {
        if (col.type === 'currency' || col.type === 'number') {
            totals[col.field] = items.value.reduce((sum, row) => sum + (parseFloat(row[col.field]) || 0), 0)
        }
    })
    return totals
})

const formatNumber = (v: any) => v !== null && v !== undefined ? parseFloat(v).toLocaleString('id-ID') : '0'

// Load dengan periode
const loadWithPeriod = () => {
    fetchData()
}

// Filter methods
const setFilterOverlayRef = (f: string, el: any) => { if (el) filterOverlays.value[f] = el }
const hasNumericFilter = (f: string) => !!numericFilters.value[f]
const hasColumnFilter = (f: string) => activeColumnFilters.value[f]?.length > 0

const openColumnFilter = (col: any, e: Event) => {
    const o = filterOverlays.value[col.field]; if (!o) return
    if (!['currency', 'number', 'date'].includes(col.type) && !tempFilters.value[col.field]) {
        tempFilters.value[col.field] = [...(activeColumnFilters.value[col.field] || [])]
    }
    o.toggle(e)
}
const closeFilterPanel = (f: string) => filterOverlays.value[f]?.hide()
const onFilterPanelHide = (f: string) => { tempFilters.value[f] = [...(activeColumnFilters.value[f] || [])]; filterSearchTerms.value[f] = '' }
const getFilteredOptions = (f: string) => { const o = filterOptionsCache.value[f] || [], t = filterSearchTerms.value[f]?.toLowerCase() || ''; return t ? o.filter(opt => String(opt.label).toLowerCase().includes(t)) : o }
const selectAllFilterOptions = (f: string) => { tempFilters.value[f] = (filterOptionsCache.value[f] || []).map(o => o.value) }
const clearFilterOptions = (f: string) => { tempFilters.value[f] = [] }
const applyColumnFilter = (f: string) => { activeColumnFilters.value[f] = [...(tempFilters.value[f] || [])]; tableFilters.value[f] = activeColumnFilters.value[f]; closeFilterPanel(f); pagination.page = 1; refreshData() }
const applyNumericFilter = (f: string, filter: any) => { if (filter) numericFilters.value[f] = filter; else delete numericFilters.value[f]; closeFilterPanel(f); pagination.page = 1; refreshData() }
const clearAllFilters = () => { activeColumnFilters.value = {}; tempFilters.value = {}; Object.keys(numericFilters.value).forEach(k => delete numericFilters.value[k]); Object.keys(tableFilters.value).forEach(k => delete tableFilters.value[k]); pagination.page = 1; refreshData() }
const resetAllFiltersAndSearch = () => { searchKeyword.value = ''; clearAllFilters() }

// Search
let searchTimeout: any
const onSearchInput = () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { pagination.page = 1; refreshData() }, 300) }

// Sort
const onSort = (e: any) => { sortField.value = e.sortField; sortOrder.value = e.sortOrder; refreshData() }

// Pagination
const onPageChange = (e: any) => { pagination.page = e.page + 1; refreshData() }
const onPerPageChange = () => { pagination.page = 1; refreshData() }

// Row expansion
const onRowExpand = async (e: any) => {
    if (!props.config.expansion?.enabled) return
    const id = e.data[props.config.primaryKey]
    
    // 🔥 Cek cache dulu
    if (detailDataCache.value[id]) {
        detailData.value[id] = detailDataCache.value[id]
        return
    }
    
    // 🔥 Fetch on-demand
    detailLoading.value[id] = true
    try {
        const { $api } = useNuxtApp()
        const endpoint = props.config.expansion.endpoint.replace('{id}', id)
        const res = await $api.get(endpoint)
        if (res.data.success) {
            detailData.value[id] = res.data.data
            detailDataCache.value[id] = res.data.data  // Simpan cache
        } else {
            detailData.value[id] = []
        }
    } catch (err) {
        console.error(`Detail error for ${id}:`, err)
        detailData.value[id] = []
    } finally {
        detailLoading.value[id] = false
    }
}
const onRowCollapse = (e: any) => {}

// Navigation
const openAddForm = () => { if (props.config.formRoute) router.push(props.config.formRoute) }
const openEditForm = (item: any) => { if (props.config.formRoute) router.push(`${props.config.formRoute}?id=${item[props.config.primaryKey]}`) }
const confirmDelete = (item: any) => { deleteItem.value = item; deleteVisible.value = true }
const confirmBulkDelete = () => { toast.add({ severity: 'warn', summary: 'Info', detail: 'Fitur hapus massal segera hadir', life: 2000 }) }

// Export
const showExportDialog = (type: 'excel' | 'pdf') => { exportType.value = type; exportDialog.value = true }
const proceedExport = () => { exportDialog.value = false; exportType.value === 'excel' ? exportExcel() : exportPDF() }

const exportExcel = async () => {
    const data = filteredData.value
    
    const ExcelJS = await import('exceljs')
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Data')
    const hs: any = { font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }, alignment: { horizontal: 'center' } }
    const ds: any = { font: { size: 9 } }, ns: any = { ...ds, alignment: { horizontal: 'right' }, numFmt: '#,##0' }
    
    ws.getRow(1).height = 22
    visibleColumns.value.forEach((c, i) => { const cell = ws.getRow(1).getCell(i + 1); cell.value = c.header; cell.style = hs })
    
    data.forEach((r: any, ri: number) => { 
        const dr = ws.getRow(2 + ri)
        visibleColumns.value.forEach((c, ci) => { 
            const cell = dr.getCell(ci + 1)
            cell.value = r[c.field] ?? ''
            cell.style = (c.type === 'currency' || c.type === 'number') ? ns : ds 
        }) 
    })
    
    const buf = await wb.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `Data_${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(url)
    toast.add({ severity: 'success', summary: 'Excel', detail: 'Berhasil', life: 2000 })
}

const exportPDF = () => {
    const data = filteredData.value
    
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial;padding:12px;font-size:8px}table{width:100%;border-collapse:collapse}th{background:#10b981;color:#fff;padding:3px;border:1px solid #059669;font-size:7px}td{padding:2px 3px;border:1px solid #e5e7eb;font-size:7px}.r{text-align:right}</style></head><body><h1 style="font-size:13px;text-align:center;color:#059669">Data</h1><table><thead><tr>${visibleColumns.value.map(c => `<th>${c.header}</th>`).join('')}</tr></thead><tbody>`
    data.forEach((r: any) => { html += '<tr>' + visibleColumns.value.map(c => `<td class="${c.align==='right'?'r':''}">${r[c.field]||''}</td>`).join('') + '</tr>' })
    html += '</tbody></table></body></html>'
    const win = window.open('', '_blank', 'width=1000,height=700')
    if (win) { win.document.write(html); win.document.close() }
}

onMounted(() => { pagination.perPage = 25; fetchAllData() })
</script>

<style lang="scss" scoped>
.master-browse { display: flex; flex-direction: column; height: 100%; overflow: hidden; background: transparent; }

.browse-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--surface-border); gap: 0.75rem; flex-shrink: 0; flex-wrap: wrap; }
.toolbar-left { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0; }

.search-input { width: 200px; }
.filter-item { display: flex; align-items: center; gap: 0.25rem; .filter-label { font-size: 0.688rem; font-weight: 600; color: var(--text-color-secondary); white-space: nowrap; } }
.bulk-info { display: flex; align-items: center; gap: 0.25rem; padding: 0.125rem 0.5rem; background: var(--primary-50); border-radius: 1rem; font-size: 0.688rem; color: var(--primary-700); }
.active-filters { display: flex; align-items: center; gap: 0.25rem; padding: 0.125rem 0.5rem; background: var(--surface-100); border-radius: 1rem; font-size: 0.688rem; color: var(--text-color-secondary); }

// Table
.browse-table-wrapper { flex: 1; overflow: hidden; }
.browse-table { flex: 1;
    :deep(.p-datatable-thead > tr > th) { font-size: 0.625rem; padding: 0.25rem 0.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; background: var(--surface-50); border-bottom: 2px solid var(--surface-border); position: sticky; top: 0; z-index: 3; }
    :deep(.p-datatable-tbody > tr > td) { font-size: 0.688rem; padding: 0.1875rem 0.5rem; border-bottom: 1px solid var(--surface-border); }
    :deep(.p-datatable-tbody > tr:hover) { background: var(--surface-50); }
    :deep(.p-datatable-tfoot > tr > td) { font-size: 0.688rem; font-weight: 700; background: var(--surface-100); border-top: 2px solid var(--primary-300); color: var(--primary-700); padding: 0.25rem 0.5rem; position: sticky; bottom: 0; z-index: 3; }
}

.col-header { display: flex; align-items: center; width: 100%; .col-title { flex: 1; overflow: hidden; text-overflow: ellipsis; } .col-icons { display: flex; margin-left: auto; } }
.col-filter-btn { width: 1.25rem; height: 1.25rem; border: none; background: transparent; cursor: pointer; opacity: 0; transition: all 0.12s; color: var(--text-color-secondary); i { font-size: 0.6rem; } &:hover { background: var(--surface-200); } &.active { opacity: 1; background: var(--primary-100); color: var(--primary-700); } }
.col-header:hover .col-filter-btn { opacity: 1; }

.currency-text { font-weight: 600; color: var(--primary-600); font-size: 0.688rem; }
.number-text { font-weight: 500; font-size: 0.688rem; }
.footer-label { font-weight: 700; color: var(--primary-700); }
.footer-total { font-weight: 700; color: var(--primary-700); }
.action-buttons { display: flex; align-items: center; justify-content: center; gap: 0; }

// Paginator
.browse-paginator-fixed { flex-shrink: 0; }
.browse-paginator { display: flex; align-items: center; justify-content: space-between; padding: 0.375rem 0.75rem; border-top: 1px solid var(--surface-border); .perpage-select { width: 65px; } .paginator-info { font-size: 0.688rem; color: var(--text-color-secondary); } .total-info { font-size: 0.688rem; color: var(--text-color-secondary); } }

// Skeleton
.skeleton-loading { padding: 0.5rem; .skeleton-row { display: flex; gap: 0.5rem; padding: 0.35rem 0; .skeleton-cell { height: 1rem; background: linear-gradient(90deg, var(--surface-100) 25%, var(--surface-200) 50%, var(--surface-100) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 0.25rem; } } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

// Empty
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: var(--text-color-secondary); i { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.4; } p { margin: 0 0 0.75rem 0; font-size: 0.813rem; } }

// Expansion
.expansion-content { padding: 0.5rem 0.75rem; background: var(--surface-50); }
.expansion-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.75rem; i { color: var(--primary-500); } }
.detail-loading { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; color: var(--text-color-secondary); font-size: 0.688rem; }
.detail-empty { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; color: var(--text-color-secondary); font-size: 0.688rem; }

// ==================== MINI FILTER ====================
.mini-filter {
    width: 230px;
    display: flex;
    flex-direction: column;
    
    .mini-filter-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.45rem 0.65rem;
        border-bottom: 1px solid var(--surface-border);
        font-weight: 600;
        font-size: 0.76rem;
    }
    
    .mini-filter-search {
        position: relative;
        padding: 0.35rem 0.65rem;
        border-bottom: 1px solid var(--surface-border);
        
        i {
            position: absolute;
            left: 1.05rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.65rem;
            color: var(--text-color-secondary);
        }
        
        .mini-filter-input {
            width: 100%;
            height: 1.55rem;
            padding: 0 0.35rem 0 1.5rem;
            border: 1px solid var(--surface-border);
            border-radius: 0.25rem;
            font-size: 0.7rem;
            outline: none;
            background: var(--surface-0);
            color: var(--text-color);
        }
    }
    
    .mini-filter-actions {
        display: flex;
        justify-content: space-between;
        padding: 0.25rem 0.65rem;
        border-bottom: 1px solid var(--surface-border);
        
        button {
            background: none;
            border: none;
            font-size: 0.65rem;
            color: var(--primary-600);
            cursor: pointer;
            font-weight: 500;
            padding: 0;
            
            &:hover { text-decoration: underline; }
        }
    }
    
    .mini-filter-list {
        max-height: 160px;
        overflow-y: auto;
        padding: 0.15rem 0;
    }
    
    .mini-filter-opt {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.25rem 0.65rem;
        cursor: pointer;
        font-size: 0.7rem;
        
        &:hover { background: var(--surface-50); }
        
        input[type="checkbox"] {
            width: 0.75rem;
            height: 0.75rem;
            accent-color: var(--primary-500);
            flex-shrink: 0;
        }
        
        span { flex: 1; }
        
        small {
            color: var(--text-color-secondary);
            font-size: 0.62rem;
            flex-shrink: 0;
        }
    }
    
    .mini-filter-empty {
        padding: 1.25rem;
        text-align: center;
        color: var(--text-color-secondary);
        font-size: 0.7rem;
    }
    
    .mini-filter-foot {
        padding: 0.35rem 0.65rem;
        border-top: 1px solid var(--surface-border);
    }
}


// Export dialog
.export-dialog-content { display: flex; flex-direction: column; gap: 0.5rem; }
.export-dialog-text { font-size: 0.813rem; color: var(--text-color-secondary); margin: 0; }
.export-option-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border: 2px solid var(--surface-border); border-radius: 0.625rem; cursor: pointer; transition: all 0.15s;
    .export-option-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; background: var(--surface-100); i { font-size: 1.2rem; } }
    .export-option-info { flex: 1; strong { display: block; font-size: 0.85rem; } small { font-size: 0.7rem; color: var(--text-color-secondary); } }
    .check-icon { font-size: 1.2rem; color: var(--primary-500); opacity: 0; }
    &:hover { border-color: var(--primary-300); background: var(--primary-50); }
    &.active { border-color: var(--primary-500); background: var(--primary-50); .check-icon { opacity: 1; } }
}

// Dark mode
:global(.app-dark) {
    .browse-table :deep(.p-datatable-thead > tr > th) { background: var(--surface-800); }
    .browse-table :deep(.p-datatable-tbody > tr:hover) { background: var(--surface-800); }
    .browse-table :deep(.p-datatable-tfoot > tr > td) { background: var(--surface-800); }
    .expansion-content { background: var(--surface-800); }
}

@media (max-width: 768px) {
    .browse-toolbar { flex-direction: column; align-items: stretch; .search-input { width: 100%; } }
    .browse-paginator { flex-direction: column; gap: 0.375rem; }
}
</style>