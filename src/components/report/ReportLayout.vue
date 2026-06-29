<template>
    <div class="report-layout">
        <!-- ==================== TOOLBAR ==================== -->
        <div class="report-toolbar">
            <div class="toolbar-left">
                <!-- Periode -->
                <div class="filter-item">
                    <span class="filter-label">{{ startLabel || 'Dari' }}</span>
                    <DatePicker v-model="startDate" dateFormat="yy-mm-dd" showIcon size="small" />
                </div>
                <div class="filter-item">
                    <span class="filter-label">{{ endLabel || 'Sampai' }}</span>
                    <DatePicker v-model="endDate" dateFormat="yy-mm-dd" showIcon size="small" />
                </div>
                
                <!-- Custom Filters (slot) -->
                <slot name="custom-filters" />
                
                <!-- Load Button -->
                <Button icon="pi pi-refresh" label="Load" severity="primary" size="small" :loading="loading" @click="loadData" />
            </div>
            
            <div class="toolbar-right">
                <!-- View Tabs -->
                <div class="report-tabs" v-if="showTabs">
                    <button v-if="showGrid" class="report-tab" :class="{ active: activeView === 'grid' }" @click="switchView('grid')">
                        <i class="pi pi-table"></i> <span>Grid</span>
                    </button>
                    <button v-if="showPivot" class="report-tab" :class="{ active: activeView === 'pivot' }" @click="switchView('pivot')">
                        <i class="pi pi-chart-bar"></i> <span>Pivot</span>
                    </button>
                    <button v-if="showChart" class="report-tab" :class="{ active: activeView === 'chart' }" @click="switchView('chart')">
                        <i class="pi pi-chart-line"></i> <span>Chart</span>
                    </button>
                </div>
                
                <!-- Export -->
                <Button v-if="showExport" icon="pi pi-file-excel" text rounded size="small" severity="success" @click="exportExcel" v-tooltip="'Excel'" />
                <Button v-if="showExport" icon="pi pi-print" text rounded size="small" @click="exportPDF" v-tooltip="'Print'" />
            </div>
        </div>
        
        <!-- ==================== VIEW: GRID ==================== -->
        <div v-if="activeView === 'grid' && showGrid" class="report-table-area">
            <DataTable 
                :value="paginatedData" 
                :loading="loading" 
                size="small" 
                stripedRows 
                showGridlines
                resizableColumns
                columnResizeMode="expand"
                scrollable 
                scrollHeight="flex"
                :sortField="sortField" 
                :sortOrder="sortOrder" 
                @sort="onSort"
                class="report-table"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-inbox"></i>
                        <span>{{ loading ? 'Memuat...' : 'Tidak ada data' }}</span>
                    </div>
                </template>
                
                <!-- Dynamic Columns -->
                <Column v-for="col in columns" :key="col.field" :field="col.field" 
                    :sortable="col.sortable !== false"
                    :style="{ minWidth: col.minWidth || '100px', textAlign: col.align || 'left' }"
                >
                    <!-- ==================== HEADER ==================== -->
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
                                <!-- NUMERIC FILTER -->
                                <NumericFilter 
                                    v-if="col.type === 'number'"
                                    :label="col.header"
                                    :currentFilter="numericFilters[col.field]"
                                    @apply="(f: any) => applyNumericFilter(col.field, f)"
                                    @close="closeFilterPanel(col.field)"
                                />
                                <!-- DATE FILTER -->
                                <NumericFilter 
                                    v-else-if="col.type === 'date'"
                                    :label="col.header"
                                    :currentFilter="numericFilters[col.field]"
                                    :isDate="true"
                                    @apply="(f: any) => applyNumericFilter(col.field, f)"
                                    @close="closeFilterPanel(col.field)"
                                />
                                <!-- TEXT MULTI-SELECT -->
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
                                        <button @click="selectAll(col.field)">Pilih Semua</button>
                                        <button @click="clearFilter(col.field)">Bersihkan</button>
                                    </div>
                                    <div class="mini-filter-list">
                                        <label v-for="opt in getFilteredOptions(col.field)" :key="opt.value" class="mini-filter-opt">
                                            <input type="checkbox" :value="opt.value" v-model="tempColumnFilters[col.field]" />
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
                    
                    <!-- ==================== BODY ==================== -->
                    <template v-if="col.type === 'number'" #body="{ data }">
                        {{ formatNumber(data[col.field]) }}
                    </template>
                    <template v-else-if="col.type === 'date'" #body="{ data }">
                        {{ formatDate(data[col.field]) }}
                    </template>
                    
                    <!-- ==================== FOOTER (TOTAL) ==================== -->
                    <template v-if="col.type === 'number' || col.field === columns[0]?.field" #footer>
                        <span v-if="col.field === columns[0]?.field" class="footer-label">TOTAL</span>
                        <span v-else class="footer-value">{{ formatNumber(footerTotals[col.field] || 0) }}</span>
                    </template>
                </Column>
                
                <!-- 🔥 TOTAL ROW (FOOTER) -->
                <template #footer>
                    <tr class="footer-row" v-if="footerTotals.length > 0">
                        <td v-for="(col, i) in columns" :key="col.field" 
                            :style="{ textAlign: col.align || 'left' }"
                            class="footer-cell"
                        >
                            <template v-if="i === 0">TOTAL</template>
                            <template v-else-if="col.type === 'number'">
                                {{ formatNumber(footerTotals[col.field] || 0) }}
                            </template>
                        </td>
                    </tr>
                </template>
            </DataTable>
            
            <!-- 🔥 PAGINATOR -->
            <div class="report-paginator">
                <div class="paginator-left">
                    <Select v-model="perPage" :options="[10, 25, 50, 100]" size="small" class="perpage-select" @change="currentPage = 1" />
                    <span class="paginator-info">per halaman</span>
                </div>
                <div class="paginator-center">
                    <Paginator 
                        v-model:first="firstRecord"
                        :rows="perPage" 
                        :totalRecords="filteredData.length"
                        :rowsPerPageOptions="[10, 25, 50, 100]"
                        @page="onPage"
                        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    />
                </div>
                <div class="paginator-right">
                    <span class="total-info">{{ filteredData.length }} total data</span>
                </div>
            </div>
        </div>
        
        <!-- ==================== VIEW: PIVOT ==================== -->
        <div v-if="activeView === 'pivot' && showPivot" class="report-pivot-area">
            <div id="wdr-pivot" style="height: 100%;"></div>
        </div>
        
        <!-- ==================== VIEW: CHART ==================== -->
        <div v-if="activeView === 'chart' && showChart" class="report-chart-area">
            <div class="chart-wrapper">
                <canvas ref="chartCanvas"></canvas>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import Chart from 'chart.js/auto'
import OverlayPanel from 'primevue/overlaypanel'
import NumericFilter from '~/components/common/NumericFilter.vue'

const props = withDefaults(defineProps<{
    endpoint: string
    startLabel?: string
    endLabel?: string
    columns: any[]
    showGrid?: boolean
    showPivot?: boolean
    showChart?: boolean
    showTabs?: boolean
    showExport?: boolean
    pivotConfig?: any
    chartConfig?: any
    defaultStartDate?: Date
    defaultEndDate?: Date
}>(), {
    startLabel: 'Dari',
    endLabel: 'Sampai',
    showGrid: true,
    showPivot: false,
    showChart: false,
    showTabs: true,
    showExport: true,
    columns: () => [],
})

const emit = defineEmits<{
    (e: 'data-loaded', response: any): void
}>()

const { $api } = useNuxtApp()
const toast = useToast()

// View
const activeView = ref('grid')
const loading = ref(false)
const allData = ref<any[]>([])

// Periode
const startDate = ref(props.defaultStartDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const endDate = ref(props.defaultEndDate || new Date())

// Sort
const sortField = ref('')
const sortOrder = ref<1 | -1 | null>(null)

// Pagination
const perPage = ref(25)
const currentPage = ref(1)
const firstRecord = ref(0)

// Filter state
const filterOverlays = ref<Record<string, any>>({})
const tempColumnFilters = ref<Record<string, any[]>>({})
const activeColumnFilters = ref<Record<string, any[]>>({})
const filterSearchTerms = ref<Record<string, string>>({})
const filterOptionsCache = ref<Record<string, any[]>>({})
const numericFilters = ref<Record<string, any>>({})

// Chart
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null
let pivotInstance: any = null

// ==================== COMPUTED ====================
const filteredData = computed(() => {
    let result = [...allData.value]
    
    // Text filters
    Object.keys(activeColumnFilters.value).forEach(field => {
        const values = activeColumnFilters.value[field]
        if (values && values.length > 0) {
            result = result.filter(row => values.includes(String(row[field])))
        }
    })
    
    // Numeric/Date filters
    Object.keys(numericFilters.value).forEach(field => {
        const filter = numericFilters.value[field]
        if (!filter) return
        const col = props.columns.find(c => c.field === field)
        const isDate = col?.type === 'date'
        
        result = result.filter(row => {
            const cond1 = evaluateCondition(row, field, filter.operator1, filter.value1, filter.value1b, isDate)
            if (!filter.operator2 || filter.value2 === null || filter.value2 === undefined || filter.value2 === '') {
                return cond1
            }
            const cond2 = evaluateCondition(row, field, filter.operator2, filter.value2, filter.value2b, isDate)
            return filter.logic === 'or' ? (cond1 || cond2) : (cond1 && cond2)
        })
    })
    
    // Sort
    if (sortField.value && sortOrder.value) {
        const col = props.columns.find(c => c.field === sortField.value)
        result.sort((a, b) => {
            let va = a[sortField.value!], vb = b[sortField.value!]
            if (col?.type === 'number') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0 }
            else if (col?.type === 'date') { va = va ? new Date(va).getTime() : 0; vb = vb ? new Date(vb).getTime() : 0 }
            else { va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase() }
            if (va < vb) return sortOrder.value === 1 ? -1 : 1
            if (va > vb) return sortOrder.value === 1 ? 1 : -1
            return 0
        })
    }
    
    return result
})

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredData.value.slice(start, start + perPage.value)
})

const footerTotals = computed(() => {
    const totals: Record<string, number> = {}
    props.columns.forEach(col => {
        if (col.type === 'number') {
            totals[col.field] = filteredData.value.reduce((sum, row) => sum + (parseFloat(row[col.field]) || 0), 0)
        }
    })
    return totals
})

// ==================== EVALUATE CONDITION ====================
const evaluateCondition = (row: any, field: string, operator: string, val1: any, val2: any, isDate: boolean): boolean => {
    const rawVal = row[field]
    if (isDate) {
        const v = String(rawVal || ''), v1 = String(val1 || ''), v2 = String(val2 || '')
        switch (operator) { case "eq": return v === v1; case "neq": return v !== v1; case "gt": return v > v1; case "gte": return v >= v1; case "lt": return v < v1; case "lte": return v <= v1; case "between": return v >= v1 && v <= v2; default: return true }
    } else {
        const v = parseFloat(rawVal) || 0, v1 = parseFloat(val1) || 0, v2 = parseFloat(val2) || 0
        switch (operator) { case "eq": return v === v1; case "neq": return v !== v1; case "gt": return v > v1; case "gte": return v >= v1; case "lt": return v < v1; case "lte": return v <= v1; case "between": return v >= v1 && v <= v2; default: return true }
    }
}

// ==================== FILTER METHODS ====================
const setFilterOverlayRef = (f: string, el: any) => { if (el) filterOverlays.value[f] = el }
const hasNumericFilter = (f: string) => !!numericFilters.value[f]
const hasColumnFilter = (f: string) => activeColumnFilters.value[f]?.length > 0

const openColumnFilter = (col: any, e: Event) => {
    const o = filterOverlays.value[col.field]; if (!o) return
    const isNumOrDate = col.type === 'number' || col.type === 'date'
    if (!isNumOrDate && !tempColumnFilters.value[col.field]) {
        tempColumnFilters.value[col.field] = [...(activeColumnFilters.value[col.field] || [])]
    }
    if (!isNumOrDate && !filterOptionsCache.value[col.field]) {
        buildFilterOptions(col.field)
    }
    o.toggle(e)
}

const closeFilterPanel = (f: string) => filterOverlays.value[f]?.hide()
const onFilterPanelHide = (f: string) => { tempColumnFilters.value[f] = [...(activeColumnFilters.value[f] || [])]; filterSearchTerms.value[f] = '' }
const getFilteredOptions = (f: string) => { const o = filterOptionsCache.value[f] || [], t = filterSearchTerms.value[f]?.toLowerCase() || ''; return t ? o.filter(opt => String(opt.label).toLowerCase().includes(t)) : o }
const selectAll = (f: string) => { tempColumnFilters.value[f] = (filterOptionsCache.value[f] || []).map(o => o.value) }
const clearFilter = (f: string) => { tempColumnFilters.value[f] = [] }
const applyColumnFilter = (f: string) => { activeColumnFilters.value[f] = [...(tempColumnFilters.value[f] || [])]; currentPage.value = 1; closeFilterPanel(f) }
const applyNumericFilter = (field: string, filter: any) => { if (filter) numericFilters.value[field] = filter; else delete numericFilters.value[field]; currentPage.value = 1; closeFilterPanel(field) }

const buildFilterOptions = (field: string) => {
    const m = new Map<string, number>()
    allData.value.forEach(r => { const v = String(r[field] || ''); if (v) m.set(v, (m.get(v) || 0) + 1) })
    filterOptionsCache.value[field] = Array.from(m.entries()).map(([v, c]) => ({ value: v, label: v, count: c })).sort((a, b) => a.label.localeCompare(b.label))
}

// ==================== LOAD DATA ====================
const loadData = async () => {
    loading.value = true
    try {
        const params: any = {
            start_date: formatDateParam(startDate.value),
            end_date: formatDateParam(endDate.value),
        }
        const res = await $api.get(props.endpoint, { params })
        if (res.data.success) {
            allData.value = res.data.data
            currentPage.value = 1
            emit('data-loaded', res.data)
            nextTick(() => {
                if (activeView.value === 'pivot') initPivot()
                if (activeView.value === 'chart') initChart()
            })
        }
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Error', life: 3000 })
    } finally { loading.value = false }
}

// ==================== PIVOT ====================
const initPivot = async () => {
    if (typeof window === 'undefined' || allData.value.length === 0) return
    try {
        const WebDataRocks = (await import('@webdatarocks/webdatarocks')).default
        const pivotContainer = document.getElementById('wdr-pivot')
        if (!pivotContainer) return
        if (pivotInstance) pivotInstance.dispose()
        
        pivotInstance = new WebDataRocks({
            container: '#wdr-pivot',
            toolbar: true,
            report: {
                dataSource: { data: allData.value },
                slice: {
                    rows: props.pivotConfig?.rows?.map((r: string) => ({ uniqueName: r })) || [],
                    columns: props.pivotConfig?.columns?.map((c: string) => ({ uniqueName: c })) || [],
                    measures: props.pivotConfig?.measures?.map((m: string) => ({ uniqueName: m, aggregation: 'sum' })) || [],
                }
            }
        })
    } catch (e) { console.warn('Pivot error:', e) }
}

// ==================== CHART ====================
const initChart = () => {
    if (!chartCanvas.value || allData.value.length === 0) return
    if (chartInstance) chartInstance.destroy()
    const cfg = props.chartConfig; if (!cfg) return
    
    const labels = allData.value.map(d => d[cfg.labelField])
    const values = allData.value.map(d => parseFloat(d[cfg.valueField]) || 0)
    
    chartInstance = new Chart(chartCanvas.value, {
        type: cfg.type || 'bar',
        data: { labels, datasets: [{ label: cfg.valueField, data: values, backgroundColor: 'rgba(16, 185, 129, 0.5)', borderColor: '#10b981', borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    })
}

// ==================== SWITCH VIEW ====================
const switchView = (view: string) => { 
    activeView.value = view
    nextTick(() => { if (view === 'pivot') initPivot(); if (view === 'chart') initChart() })
}

// ==================== PAGINATION ====================
const onPage = (e: any) => { currentPage.value = e.page + 1; firstRecord.value = e.first }

// ==================== SORT ====================
const onSort = (e: any) => { sortField.value = e.sortField; sortOrder.value = e.sortOrder }

// ==================== EXPORT ====================
const exportExcel = async () => {
    if (allData.value.length === 0) return
    const ExcelJS = await import('exceljs')
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Report')
    const hs: any = { font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }, alignment: { horizontal: 'center' } }
    const ds: any = { font: { size: 9 } }, ns: any = { ...ds, alignment: { horizontal: 'right' }, numFmt: '#,##0' }
    ws.getRow(1).height = 22
    props.columns.forEach((c, i) => { const cell = ws.getRow(1).getCell(i + 1); cell.value = c.header; cell.style = hs })
    filteredData.value.forEach((r, ri) => { const dr = ws.getRow(2 + ri); props.columns.forEach((c, ci) => { const cell = dr.getCell(ci + 1); cell.value = r[c.field]; cell.style = c.type === 'number' ? ns : ds }) })
    const buf = await wb.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Report_${formatDateParam(new Date())}.xlsx`; a.click(); URL.revokeObjectURL(url)
    toast.add({ severity: 'success', summary: 'Excel', detail: 'Berhasil', life: 2000 })
}

const exportPDF = () => {
    if (allData.value.length === 0) return
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial;padding:12px;font-size:8px}table{width:100%;border-collapse:collapse}th{background:#10b981;color:#fff;padding:3px;border:1px solid #059669;font-size:7px}td{padding:2px 3px;border:1px solid #e5e7eb;font-size:7px}.r{text-align:right}</style></head><body><h1 style="font-size:13px;text-align:center;color:#059669">Report</h1><table><thead><tr>${props.columns.map(c => `<th>${c.header}</th>`).join('')}</tr></thead><tbody>`
    filteredData.value.forEach(row => { html += '<tr>' + props.columns.map(c => `<td class="${c.type==='number'?'r':''}">${row[c.field]||''}</td>`).join('') + '</tr>' })
    html += '</tbody></table></body></html>'
    const win = window.open('', '_blank', 'width=1000,height=700'); if (win) { win.document.write(html); win.document.close() }
}

// ==================== HELPERS ====================
const formatDateParam = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const formatNumber = (v: any) => v !== null && v !== undefined ? parseFloat(v).toLocaleString('id-ID') : '0'
const formatDate = (v: string) => v ? new Date(v).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) : '-'

onMounted(() => loadData())
onUnmounted(() => { if (chartInstance) chartInstance.destroy(); if (pivotInstance) pivotInstance.dispose() })
</script>

<style lang="scss">
@import '@webdatarocks/webdatarocks/webdatarocks.min.css';
</style>

<style lang="scss" scoped>
.report-layout { height: 100%; display: flex; flex-direction: column; overflow: hidden; }

// ==================== TOOLBAR ====================
.report-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: var(--surface-card); border-bottom: 1px solid var(--surface-border); gap: 0.5rem; flex-shrink: 0; flex-wrap: wrap; }
.toolbar-left { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
.filter-item { display: flex; align-items: center; gap: 0.25rem; .filter-label { font-size: 0.688rem; font-weight: 600; color: var(--text-color-secondary); white-space: nowrap; } :deep(.p-datepicker) { width: 140px; .p-datepicker-input { font-size: 0.688rem; height: 1.75rem; } } }

.report-tabs { display: flex; gap: 0.25rem; }
.report-tab { padding: 0.375rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--surface-border); background: transparent; cursor: pointer; font-size: 0.688rem; font-weight: 500; display: flex; align-items: center; gap: 0.375rem; color: var(--text-color-secondary); transition: all 0.15s; i { font-size: 0.75rem; } span { display: inline; } &:hover { background: var(--surface-100); color: var(--text-color); } &.active { background: var(--primary-50); border-color: var(--primary-300); color: var(--primary-700); i { color: var(--primary-600); } } }

// ==================== TABLE ====================
.report-table {
    flex: 1;
    
    // 🔥 HEADER STICKY
    :deep(.p-datatable-thead > tr > th) {
        font-size: 0.688rem;
        padding: 0.375rem 0.5rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        background: var(--surface-50);
        border-bottom: 2px solid var(--surface-border);
        position: sticky;
        top: 0;
        z-index: 3;
    }
    
    :deep(.p-datatable-tbody > tr > td) {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-bottom: 1px solid var(--surface-border);
    }
    
    :deep(.p-datatable-tbody > tr:hover) {
        background: var(--surface-50);
    }
    
    // 🔥 FOOTER STICKY (TOTAL)
    :deep(.p-datatable-tfoot > tr > td) {
        font-size: 0.75rem;
        font-weight: 700;
        background: var(--surface-100);
        border-top: 2px solid var(--primary-300);
        color: var(--primary-700);
        padding: 0.25rem 0.5rem;
        position: sticky;
        bottom: 0;
        z-index: 3;
    }
}
.report-table { flex: 1;
    :deep(.p-datatable-thead > tr > th) { font-size: 0.688rem; padding: 0.375rem 0.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; background: var(--surface-50); border-bottom: 2px solid var(--surface-border); position: sticky; top: 0; z-index: 2; }
    :deep(.p-datatable-tbody > tr > td) { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-bottom: 1px solid var(--surface-border); }
    :deep(.p-datatable-tbody > tr:hover) { background: var(--surface-50); }
}

.footer-row { background: var(--surface-100) !important; border-top: 2px solid var(--surface-border) !important; }
.footer-cell { padding: 0.25rem 0.5rem !important; font-size: 0.75rem; font-weight: 700 !important; color: var(--primary-700); background: var(--surface-100) !important; }

.col-header { display: flex; align-items: center; width: 100%; .col-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .col-icons { display: flex; align-items: center; gap: 0.15rem; flex-shrink: 0; margin-left: auto; } }
.col-filter-btn { width: 1.25rem; height: 1.25rem; border-radius: 0.2rem; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.12s; color: var(--text-color-secondary); i { font-size: 0.6rem; } &:hover { background: var(--surface-200); } &.active { opacity: 1; background: var(--primary-100); color: var(--primary-700); } }
.col-header:hover .col-filter-btn { opacity: 1; }

.mini-filter { width: 230px; display: flex; flex-direction: column; .mini-filter-head { display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.65rem; border-bottom: 1px solid var(--surface-border); font-weight: 600; font-size: 0.76rem; } .mini-filter-search { position: relative; padding: 0.35rem 0.65rem; border-bottom: 1px solid var(--surface-border); i { position: absolute; left: 1.05rem; top: 50%; transform: translateY(-50%); font-size: 0.65rem; } .mini-filter-input { width: 100%; height: 1.55rem; padding: 0 0.35rem 0 1.5rem; border: 1px solid var(--surface-border); border-radius: 0.25rem; font-size: 0.7rem; outline: none; } } .mini-filter-actions { display: flex; justify-content: space-between; padding: 0.25rem 0.65rem; border-bottom: 1px solid var(--surface-border); button { background: none; border: none; font-size: 0.65rem; color: var(--primary-600); cursor: pointer; font-weight: 500; } } .mini-filter-list { max-height: 160px; overflow-y: auto; padding: 0.15rem 0; } .mini-filter-opt { display: flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.65rem; cursor: pointer; font-size: 0.7rem; &:hover { background: var(--surface-50); } input[type="checkbox"] { width: 0.75rem; height: 0.75rem; accent-color: var(--primary-500); } span { flex: 1; } small { color: var(--text-color-secondary); font-size: 0.62rem; } } .mini-filter-empty { padding: 1.25rem; text-align: center; color: var(--text-color-secondary); font-size: 0.7rem; } .mini-filter-foot { padding: 0.35rem 0.65rem; border-top: 1px solid var(--surface-border); } }

// ==================== PAGINATOR ====================
.report-paginator { display: flex; align-items: center; justify-content: space-between; padding: 0.375rem 0.75rem; border-top: 1px solid var(--surface-border); background: var(--surface-card); flex-shrink: 0; .paginator-left { display: flex; align-items: center; gap: 0.375rem; } .perpage-select { width: 65px; } .paginator-info { font-size: 0.688rem; color: var(--text-color-secondary); } .total-info { font-size: 0.688rem; color: var(--text-color-secondary); } }

// ==================== PIVOT & CHART ====================
.report-pivot-area { flex: 1; overflow: hidden; }
.report-chart-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 1rem; overflow: hidden; }
.chart-wrapper { width: 100%; height: 100%; max-width: 800px; max-height: 500px; }

// ==================== EMPTY STATE ====================
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: var(--text-color-secondary); gap: 0.5rem; i { font-size: 2.5rem; opacity: 0.4; } span { font-size: 0.813rem; } }

.footer-label {
    font-weight: 700;
    color: var(--primary-700);
}

.footer-value {
    font-weight: 700;
    color: var(--primary-700);
}

// ==================== DARK MODE ====================
:global(.app-dark) {
    .report-toolbar { background: var(--surface-900); }
    .report-tab.active { background: var(--primary-900); border-color: var(--primary-700); color: var(--primary-300); }
    .report-table :deep(.p-datatable-thead > tr > th) { background: var(--surface-800); }
    .report-table :deep(.p-datatable-tbody > tr:hover) { background: var(--surface-800); }
    .footer-row, .footer-cell { background: var(--surface-800) !important; }
}

// ==================== RESPONSIVE ====================
@media (max-width: 768px) {
    .report-toolbar { flex-direction: column; align-items: stretch; }
    .toolbar-left { flex-direction: column; align-items: stretch; }
    .toolbar-right { justify-content: space-between; }
    .report-tab span { display: none; }
    .report-paginator { flex-direction: column; gap: 0.375rem; }
}
</style>