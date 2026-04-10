<template>
    <div class="do-browse">
        <!-- Header -->
        <div class="browse-header">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="header-icon">
                        <i class="pi pi-truck text-2xl"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold">Delivery Order Management</h2>
                        <div class="flex items-center gap-3 mt-1">
                            <span class="text-sm text-muted-color">
                                Total: <strong>{{ pagination.total }}</strong> records
                            </span>
                            <span class="w-1 h-1 bg-surface-400 rounded-full"></span>
                            <span class="text-sm text-muted-color">
                                Page {{ pagination.page }} of {{ pagination.lastPage }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <Button 
                        label="Export" 
                        icon="pi pi-download" 
                        severity="secondary" 
                        size="small" 
                    />
                    <Button 
                        label="Create DO" 
                        icon="pi pi-plus" 
                        severity="primary" 
                        size="small" 
                        @click="openAddForm"
                    />
                </div>
            </div>
        </div>

        <!-- Main Card -->
        <div class="browse-card">
            <!-- Toolbar -->
            <div class="browse-toolbar">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2">
                        <Button 
                            label="Delete" 
                            icon="pi pi-trash" 
                            severity="danger" 
                            size="small" 
                            :disabled="selectedItems.length === 0" 
                            @click="bulkDelete"
                        />
                        <Button 
                            icon="pi pi-filter" 
                            severity="secondary" 
                            text 
                            size="small" 
                            :class="{ 'active-filter': hasActiveFilter }"
                            @click="showDateFilter = !showDateFilter"
                        />
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <!-- Date Filter -->
                        <div v-if="showDateFilter" class="date-filter">
                            <Calendar 
                                v-model="dateRange" 
                                selectionMode="range" 
                                :manualInput="false"
                                placeholder="Select date range"
                                size="small"
                                class="w-64"
                                @date-select="onDateChange"
                            />
                        </div>
                        
                        <IconField iconPosition="left">
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText 
                                v-model="globalSearch" 
                                placeholder="Search..." 
                                @input="onGlobalSearch" 
                                size="small" 
                                class="search-input"
                            />
                        </IconField>
                        
                        <Button 
                            icon="pi pi-refresh" 
                            severity="secondary" 
                            text 
                            rounded 
                            size="small" 
                            @click="fetchData"
                            v-tooltip="'Refresh'"
                        />
                    </div>
                </div>
            </div>
            
            <!-- DataTable -->
            <DataTable 
                :value="items" 
                v-model:selection="selectedItems"
                v-model:expandedRows="expandedRows"
                :loading="loading"
                @sort="onSort"
                stripedRows
                removableSort
                responsiveLayout="scroll"
                size="small"
                :sortField="sortField"
                :sortOrder="sortOrder"
                dataKey="Nomor"
                class="browse-table"
            >
                <Column expander style="width: 3rem" />
                <Column selectionMode="multiple" style="width: 3rem" />
                
                <Column field="Nomor" header="DO Number" sortable style="min-width: 150px">
                    <template #body="slotProps">
                        <span class="font-medium text-primary">{{ slotProps.data.Nomor }}</span>
                    </template>
                </Column>
                
                <Column field="Tanggal" header="Date" sortable style="min-width: 120px"></Column>
                <Column field="Nomor_SO" header="SO Number" sortable style="min-width: 150px"></Column>
                <Column field="Salesman" header="Salesman" sortable style="min-width: 150px"></Column>
                <Column field="Customer" header="Customer" sortable style="min-width: 200px"></Column>
                
                <Column field="Status" header="Status" sortable style="min-width: 100px">
                    <template #body="slotProps">
                        <Tag 
                            :value="slotProps.data.Status || 'Draft'" 
                            :severity="getStatusSeverity(slotProps.data.Status)"
                            size="small"
                        />
                    </template>
                </Column>
                
                <Column field="Invoiced" header="Invoiced" sortable style="min-width: 100px">
                    <template #body="slotProps">
                        <i 
                            :class="slotProps.data.Invoiced ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-gray-400'"
                        ></i>
                    </template>
                </Column>
                
                <Column header="Actions" style="width: 6rem">
                    <template #body="slotProps">
                        <div class="flex gap-1">
                            <Button 
                                icon="pi pi-eye" 
                                severity="secondary" 
                                text 
                                rounded 
                                size="small" 
                                @click="viewDetail(slotProps.data)"
                                v-tooltip="'View'"
                            />
                            <Button 
                                icon="pi pi-pencil" 
                                severity="success" 
                                text 
                                rounded 
                                size="small" 
                                @click="openEditForm(slotProps.data)"
                                v-tooltip="'Edit'"
                            />
                            <Button 
                                icon="pi pi-trash" 
                                severity="danger" 
                                text 
                                rounded 
                                size="small" 
                                @click="confirmDelete(slotProps.data)"
                                v-tooltip="'Delete'"
                            />
                        </div>
                    </template>
                </Column>
                
                <!-- Expansion Template -->
                <template #expansion="slotProps">
                    <div class="expansion-content">
                        <div class="expansion-header">
                            <i class="pi pi-box mr-2"></i>
                            <span class="font-semibold">Items Detail - {{ slotProps.data.Nomor }}</span>
                        </div>
                        <DataTable 
                            :value="slotProps.data.details" 
                            size="small" 
                            class="expansion-table"
                        >
                            <Column field="Kode" header="SKU" style="width: 120px"></Column>
                            <Column field="Nama" header="Item Name"></Column>
                            <Column field="Satuan" header="Unit" style="width: 80px"></Column>
                            <Column field="Jumlah" header="QTY" style="width: 100px"></Column>
                            <Column field="Jumlah_Invoiced" header="Invoiced" style="width: 100px"></Column>
                            <Column field="Expired" header="Expired" style="width: 120px"></Column>
                        </DataTable>
                    </div>
                </template>
            </DataTable>
            
            <!-- Paginator -->
            <div class="browse-paginator">
                <div class="paginator-info">
                    Showing {{ ((pagination.page - 1) * pagination.perPage) + 1 }} 
                    to {{ Math.min(pagination.page * pagination.perPage, pagination.total) }} 
                    of {{ pagination.total }} entries
                </div>
                
                <div class="paginator-controls">
                    <Button 
                        icon="pi pi-angle-double-left" 
                        severity="secondary" 
                        text 
                        rounded 
                        size="small"
                        :disabled="pagination.page === 1"
                        @click="goToPage(1)"
                    />
                    <Button 
                        icon="pi pi-angle-left" 
                        severity="secondary" 
                        text 
                        rounded 
                        size="small"
                        :disabled="pagination.page === 1"
                        @click="goToPage(pagination.page - 1)"
                    />
                    
                    <div class="paginator-pages">
                        <Button 
                            v-for="page in visiblePages"
                            :key="page"
                            :label="page === -1 || page === -2 ? '...' : page.toString()"
                            :severity="pagination.page === page ? 'primary' : 'secondary'"
                            :text="pagination.page !== page && page !== -1 && page !== -2"
                            rounded
                            size="small"
                            :disabled="page === -1 || page === -2"
                            @click="goToPage(page)"
                        />
                    </div>
                    
                    <Button 
                        icon="pi pi-angle-right" 
                        severity="secondary" 
                        text 
                        rounded 
                        size="small"
                        :disabled="pagination.page === pagination.lastPage"
                        @click="goToPage(pagination.page + 1)"
                    />
                    <Button 
                        icon="pi pi-angle-double-right" 
                        severity="secondary" 
                        text 
                        rounded 
                        size="small"
                        :disabled="pagination.page === pagination.lastPage"
                        @click="goToPage(pagination.lastPage)"
                    />
                </div>
                
                <div class="paginator-perpage">
                    <Select 
                        v-model="pagination.perPage"
                        :options="[10, 15, 25, 50, 100]"
                        size="small"
                        @update:modelValue="() => { pagination.page = 1; fetchData() }"
                    />
                    <span class="text-sm text-muted-color">per page</span>
                </div>
            </div>
        </div>
        
        <!-- Delete Dialog -->
        <Dialog 
            v-model:visible="deleteDialog" 
            header="Confirm Delete" 
            :modal="true"
            :style="{ width: '400px' }"
        >
            <div class="delete-dialog-content">
                <div class="delete-icon">
                    <i class="pi pi-exclamation-triangle text-3xl text-yellow-500"></i>
                </div>
                <div class="delete-text">
                    <h4 class="text-lg font-semibold mb-1">Are you sure?</h4>
                    <p class="text-sm text-muted-color">
                        This will permanently delete DO <strong>{{ deleteItem?.Nomor }}</strong>.
                    </p>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="deleteDialog = false" text size="small" />
                <Button label="Delete" icon="pi pi-trash" severity="danger" @click="deleteData" :loading="deleteLoading" size="small" />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

const { $api } = useNuxtApp()
const toast = useToast()

// State
const items = ref<any[]>([])
const selectedItems = ref<any[]>([])
const loading = ref(false)
const expandedRows = ref({})
const showDateFilter = ref(false)

// Date filter
const dateRange = ref<any>([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date()
])

// Pagination & Sorting
const pagination = reactive({
    page: 1,
    perPage: 15,
    total: 0,
    lastPage: 1
})
const sortField = ref('Tanggal')
const sortOrder = ref<1 | -1 | null>(-1)

// Search
const globalSearch = ref('')
let searchTimeout: NodeJS.Timeout

// Delete
const deleteDialog = ref(false)
const deleteItem = ref<any>(null)
const deleteLoading = ref(false)

// Computed
const hasActiveFilter = computed(() => showDateFilter.value)

const visiblePages = computed(() => {
    const current = pagination.page
    const last = pagination.lastPage
    const delta = 2
    
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
    
    const range: number[] = []
    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
        range.push(i)
    }
    
    if (current - delta > 2) range.unshift(-1)
    if (current + delta < last - 1) range.push(-2)
    
    return [1, ...range, last]
})

// Methods
const buildQueryParams = () => {
    const params: any = {
        page: pagination.page,
        per_page: pagination.perPage
    }
    
    if (sortField.value && sortOrder.value) {
        params.sort_by = sortField.value
        params.sort_order = sortOrder.value === 1 ? 'asc' : 'desc'
    }
    
    if (globalSearch.value) params.search = globalSearch.value
    
    if (dateRange.value?.[0]) params.start_date = formatDate(dateRange.value[0])
    if (dateRange.value?.[1]) params.end_date = formatDate(dateRange.value[1])
    
    return params
}

const formatDate = (date: Date) => date.toISOString().split('T')[0]

const fetchData = async () => {
    loading.value = true
    try {
        const params = buildQueryParams()
        const response = await $api.get('/do', { params })
        
        if (response.data.success) {
            items.value = response.data.data
            pagination.total = response.data.pagination.total
            pagination.lastPage = response.data.pagination.last_page
            pagination.perPage = response.data.pagination.per_page
        }
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to fetch data',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

const fetchDetail = async (nomor: string) => {
    try {
        const response = await $api.get(`/do/${nomor}/detail`)
        if (response.data.success) return response.data.data
        return []
    } catch (error) {
        console.error('Failed to fetch detail:', error)
        return []
    }
}

watch(expandedRows, (newVal, oldVal) => {
    const expandedNomor = Object.keys(newVal).find(key => !oldVal?.[key])
    if (expandedNomor) {
        const expandedRow = items.value.find(item => item.Nomor === expandedNomor)
        if (expandedRow && !expandedRow.details) {
            fetchDetail(expandedRow.Nomor).then(details => {
                expandedRow.details = details
            })
        }
    }
}, { deep: true })

const onGlobalSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        pagination.page = 1
        fetchData()
    }, 500)
}

const onDateChange = () => {
    pagination.page = 1
    fetchData()
}

const onSort = (event: any) => {
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder === 1 ? 1 : -1
    pagination.page = 1
    fetchData()
}

const goToPage = (page: number) => {
    if (page < 1 || page > pagination.lastPage) return
    pagination.page = page
    fetchData()
}

const openAddForm = () => navigateTo('/penjualan/do/form')
const openEditForm = (item: any) => navigateTo(`/penjualan/do/form?id=${item.Nomor}`)
const viewDetail = (item: any) => console.log('View:', item)

const confirmDelete = (item: any) => {
    deleteItem.value = item
    deleteDialog.value = true
}

const deleteData = async () => {
    if (!deleteItem.value) return
    deleteLoading.value = true
    
    try {
        const response = await $api.delete(`/do/${deleteItem.value.Nomor}`)
        if (response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'DO deleted successfully',
                life: 3000
            })
            deleteDialog.value = false
            deleteItem.value = null
            fetchData()
        }
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to delete',
            life: 3000
        })
    } finally {
        deleteLoading.value = false
    }
}

const bulkDelete = () => {
    console.log('Bulk delete:', selectedItems.value)
    toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Bulk delete feature coming soon',
        life: 2000
    })
}

const getStatusSeverity = (status: string) => {
    const map: Record<string, string> = {
        Draft: 'secondary',
        Submitted: 'info',
        Approved: 'success',
        Shipped: 'warning',
        Delivered: 'success',
        Cancelled: 'danger'
    }
    return map[status] || 'info'
}

// Initial load
fetchData()
</script>

<style lang="scss" scoped>
.do-browse {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.browse-header {
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, var(--primary-50) 0%, var(--surface-card) 100%);
    border-radius: 1rem;
    border: 1px solid var(--surface-border);

    .header-icon {
        width: 3rem;
        height: 3rem;
        background: var(--primary-100);
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-600);
    }
}

.browse-card {
    background: var(--surface-card);
    border-radius: 1rem;
    border: 1px solid var(--surface-border);
    overflow: hidden;
}

.browse-toolbar {
    padding: 1rem;
    border-bottom: 1px solid var(--surface-border);

    .active-filter {
        background: var(--primary-100) !important;
        color: var(--primary-600) !important;
    }

    .search-input {
        width: 200px;
        border-radius: 2rem;
        background: var(--surface-ground);
        border: 1px solid var(--surface-border);
        
        &:focus {
            width: 260px;
            transition: width 0.2s ease;
        }
    }

    .date-filter {
        animation: slideIn 0.2s ease;
    }
}

.browse-table {
    :deep(.p-datatable-tbody > tr > td) {
        padding: 0.5rem 0.75rem !important;
        font-size: 0.813rem !important;
    }

    :deep(.p-datatable-thead > tr > th) {
        padding: 0.625rem 0.75rem !important;
        font-size: 0.75rem !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        background: var(--surface-ground);
        color: var(--text-color-secondary);
        border-bottom: 2px solid var(--surface-border);
    }
}

.expansion-content {
    padding: 1rem;
    background: var(--surface-ground);

    .expansion-header {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
        color: var(--text-color);
    }

    .expansion-table {
        :deep(.p-datatable-tbody > tr > td) {
            padding: 0.375rem 0.75rem !important;
            font-size: 0.75rem !important;
        }
    }
}

.browse-paginator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
    border-top: 1px solid var(--surface-border);

    .paginator-info {
        font-size: 0.813rem;
        color: var(--text-color-secondary);
    }

    .paginator-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .paginator-pages {
        display: flex;
        gap: 0.125rem;
    }

    .paginator-perpage {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}

.delete-dialog-content {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
}

// Dark mode
:global(.app-dark) {
    .browse-header {
        background: linear-gradient(135deg, var(--primary-900) 0%, var(--surface-card) 100%);

        .header-icon {
            background: var(--primary-900);
            color: var(--primary-300);
        }
    }

    .browse-table :deep(.p-datatable-thead > tr > th) {
        background: var(--surface-800);
    }

    .expansion-content {
        background: var(--surface-800);
    }
}

// Animations
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

// Responsive
@media (max-width: 640px) {
    .browse-paginator {
        flex-direction: column;
        align-items: stretch;

        .paginator-controls {
            justify-content: center;
        }

        .paginator-perpage {
            justify-content: center;
        }
    }
}
</style>