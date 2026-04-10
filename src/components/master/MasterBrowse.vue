<template>
    <div class="master-browse">
        <!-- Header Card -->
        <div class="browse-header">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="header-icon">
                        <i class="pi pi-database text-2xl"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0">
                            {{ title }} Management
                        </h2>
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
                <div class="flex flex-wrap gap-2">
                    <Button 
                        label="Export" 
                        icon="pi pi-download" 
                        severity="secondary" 
                        size="small" 
                        @click="exportData"
                    />
                    <Button 
                        label="Import" 
                        icon="pi pi-upload" 
                        severity="secondary" 
                        size="small" 
                        @click="importDialog = true"
                    />
                    <Button 
                        label="Tambah" 
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
                        <!-- Bulk Actions -->
                        <Button 
                            label="Hapus" 
                            icon="pi pi-trash" 
                            severity="danger" 
                            size="small" 
                            :disabled="selectedItems.length === 0" 
                            @click="bulkDelete"
                        />
                        
                        <!-- Filter Toggle -->
                        <Button 
                            icon="pi pi-filter" 
                            severity="secondary" 
                            text 
                            size="small" 
                            :class="{ 'active-filter': hasActiveFilters }"
                            @click="showFilters = !showFilters"
                        />
                        
                        <!-- Active Filters Indicator -->
                        <div v-if="hasActiveFilters" class="active-filters">
                            <Tag 
                                v-for="(value, key) in activeFilters" 
                                :key="key"
                                :value="`${key}: ${value}`"
                                severity="info"
                                size="small"
                                removable
                                @remove="removeFilter(key)"
                            />
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <!-- View Toggle -->
                        <SelectButton 
                            v-model="viewMode" 
                            :options="viewOptions" 
                            optionLabel="icon" 
                            optionValue="value"
                            size="small"
                        />
                        
                        <!-- Search -->
                        <IconField iconPosition="left" class="search-field">
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText 
                                v-model="globalSearch" 
                                placeholder="Search..." 
                                @input="onGlobalSearch" 
                                size="small" 
                                class="search-input"
                            />
                        </IconField>
                        
                        <!-- Refresh -->
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

                <!-- Filter Panel -->
                <Transition name="slide-down">
                    <div v-if="showFilters" class="filter-panel">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div v-for="col in filterableColumns" :key="col.field">
                                <label class="text-xs font-medium mb-1 block">{{ col.header }}</label>
                                <InputText 
                                    v-model="filters[col.field]" 
                                    :placeholder="`Filter ${col.header}...`"
                                    size="small"
                                    class="w-full"
                                    @input="onFilterChange"
                                />
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 mt-3">
                            <Button label="Clear All" size="small" text @click="clearAllFilters" />
                            <Button label="Apply" size="small" severity="primary" @click="applyFilters" />
                        </div>
                    </div>
                </Transition>
            </div>
            
            <!-- DataTable -->
            <DataTable 
                :value="items" 
                v-model:selection="selectedItems"
                :loading="loading"
                @sort="onSort"
                stripedRows
                removableSort
                responsiveLayout="scroll"
                size="small"
                :sortField="sortField"
                :sortOrder="sortOrder"
                dataKey="id"
                :rowHover="true"
                class="browse-table"
            >
                <Column selectionMode="multiple" style="width: 3rem" />
                
                <Column 
                    v-for="col in columns" 
                    :key="col.field"
                    :field="col.field"
                    :header="col.header"
                    :sortable="col.sortable !== false"
                    :style="{ minWidth: col.width, maxWidth: col.maxWidth }"
                >
                    <template #body="slotProps">
                        <!-- Currency -->
                        <span v-if="col.type === 'currency'" class="font-medium">
                            {{ formatCurrency(slotProps.data[col.field]) }}
                        </span>
                        
                        <!-- Status Badge -->
                        <Tag 
                            v-else-if="col.type === 'status'"
                            :value="slotProps.data[col.field]"
                            :severity="getStatusSeverity(slotProps.data[col.field])"
                            size="small"
                        />
                        
                        <!-- Date -->
                        <span v-else-if="col.type === 'date'" class="text-sm">
                            {{ formatDate(slotProps.data[col.field]) }}
                        </span>
                        
                        <!-- Default -->
                        <span v-else class="text-sm">
                            {{ slotProps.data[col.field] || '-' }}
                        </span>
                    </template>
                </Column>
                
                <!-- Actions Column -->
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
        
        <!-- Form Dialog -->
        <Dialog 
            v-model:visible="formDialog" 
            :header="dialogTitle"
            :modal="true"
            :style="{ width: '600px', maxWidth: '90vw' }"
            :closable="false"
            class="form-dialog"
        >
            <div class="form-grid">
                <div v-for="field in formFields" :key="field.field" class="form-field" :class="{ 'col-span-2': field.type === 'textarea' }">
                    <label :for="field.field" class="form-label">
                        {{ field.label }}
                        <span v-if="field.required" class="required">*</span>
                    </label>
                    
                    <!-- Text Input -->
                    <InputText 
                        v-if="field.type === 'text'"
                        :id="field.field"
                        v-model="formData[field.field]"
                        :placeholder="field.placeholder"
                        :required="field.required"
                        class="w-full"
                        size="small"
                    />
                    
                    <!-- Textarea -->
                    <Textarea 
                        v-else-if="field.type === 'textarea'"
                        :id="field.field"
                        v-model="formData[field.field]"
                        :rows="3"
                        :placeholder="field.placeholder"
                        class="w-full"
                    />
                    
                    <!-- Number -->
                    <InputNumber 
                        v-else-if="field.type === 'number'"
                        :id="field.field"
                        v-model="formData[field.field]"
                        :placeholder="field.placeholder"
                        class="w-full"
                    />
                    
                    <!-- Currency -->
                    <InputNumber 
                        v-else-if="field.type === 'currency'"
                        :id="field.field"
                        v-model="formData[field.field]"
                        mode="currency"
                        currency="IDR"
                        locale="id-ID"
                        :placeholder="field.placeholder"
                        class="w-full"
                    />
                    
                    <!-- Select -->
                    <Select 
                        v-else-if="field.type === 'select'"
                        :id="field.field"
                        v-model="formData[field.field]"
                        :options="field.options"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="field.placeholder"
                        class="w-full"
                    />
                    
                    <!-- Date -->
                    <Calendar 
                        v-else-if="field.type === 'date'"
                        :id="field.field"
                        v-model="formData[field.field]"
                        dateFormat="yy-mm-dd"
                        :placeholder="field.placeholder"
                        class="w-full"
                        showIcon
                    />
                </div>
            </div>
            
            <template #footer>
                <div class="dialog-footer">
                    <Button label="Cancel" icon="pi pi-times" @click="formDialog = false" text size="small" />
                    <Button label="Save" icon="pi pi-check" @click="saveData" :loading="formLoading" size="small" />
                </div>
            </template>
        </Dialog>
        
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
                        This action cannot be undone. This will permanently delete the selected record(s).
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
import { ref, reactive, computed } from 'vue'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
    endpoint: string
    primaryKey: string
    title: string
    columns: any[]
    formFields: any[]
}>()

const { $api } = useNuxtApp()
const toast = useToast()

// State
const items = ref<any[]>([])
const selectedItems = ref<any[]>([])
const loading = ref(false)
const showFilters = ref(false)
const viewMode = ref('table')
const viewOptions = ref([
    { icon: 'pi pi-list', value: 'table' },
    { icon: 'pi pi-th-large', value: 'grid' }
])

// Search & Filters
const globalSearch = ref('')
const filters = reactive<Record<string, any>>({})
let searchTimeout: NodeJS.Timeout

// Pagination & Sorting
const pagination = reactive({
    page: 1,
    perPage: 15,
    total: 0,
    lastPage: 1
})
const sortField = ref('')
const sortOrder = ref<1 | -1 | null>(null)

// Form
const formDialog = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formData = reactive<Record<string, any>>({})
const formLoading = ref(false)

// Delete
const deleteDialog = ref(false)
const deleteItem = ref<any>(null)
const deleteLoading = ref(false)

// Import
const importDialog = ref(false)

// Computed
const dialogTitle = computed(() => formMode.value === 'add' ? `Add ${props.title}` : `Edit ${props.title}`)

const filterableColumns = computed(() => props.columns.filter(col => col.filterable !== false))

const hasActiveFilters = computed(() => Object.keys(filters).some(key => filters[key]))

const activeFilters = computed(() => {
    const active: Record<string, any> = {}
    Object.keys(filters).forEach(key => {
        if (filters[key]) active[key] = filters[key]
    })
    return active
})

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
    
    Object.keys(filters).forEach(key => {
        if (filters[key]) params[`filter_${key}`] = filters[key]
    })
    
    return params
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = buildQueryParams()
        const response = await $api.get(props.endpoint, { params })
        
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

const onGlobalSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        pagination.page = 1
        fetchData()
    }, 500)
}

const onFilterChange = () => {
    // Debounced filter
}

const applyFilters = () => {
    pagination.page = 1
    fetchData()
    showFilters.value = false
}

const clearAllFilters = () => {
    Object.keys(filters).forEach(key => delete filters[key])
    pagination.page = 1
    fetchData()
    showFilters.value = false
}

const removeFilter = (key: string) => {
    delete filters[key]
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

const resetForm = () => {
    Object.keys(formData).forEach(key => delete formData[key])
    props.formFields.forEach(field => {
        formData[field.field] = field.defaultValue || null
    })
}

const openAddForm = () => {
    formMode.value = 'add'
    resetForm()
    formDialog.value = true
}

const openEditForm = (item: any) => {
    formMode.value = 'edit'
    resetForm()
    props.formFields.forEach(field => {
        formData[field.field] = item[field.field] ?? null
    })
    formDialog.value = true
}

const viewDetail = (item: any) => {
    // Navigate to detail page
    console.log('View detail:', item)
}

const saveData = async () => {
    formLoading.value = true
    try {
        let response
        if (formMode.value === 'add') {
            response = await $api.post(props.endpoint, formData)
        } else {
            const id = formData[props.primaryKey]
            response = await $api.put(`${props.endpoint}/${id}`, formData)
        }
        
        if (response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `Data ${formMode.value === 'add' ? 'added' : 'updated'} successfully`,
                life: 3000
            })
            formDialog.value = false
            fetchData()
        }
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to save data',
            life: 3000
        })
    } finally {
        formLoading.value = false
    }
}

const confirmDelete = (item: any) => {
    deleteItem.value = item
    deleteDialog.value = true
}

const deleteData = async () => {
    if (!deleteItem.value) return
    deleteLoading.value = true
    
    try {
        const id = deleteItem.value[props.primaryKey]
        const response = await $api.delete(`${props.endpoint}/${id}`)
        
        if (response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data deleted successfully',
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
            detail: error.response?.data?.message || 'Failed to delete data',
            life: 3000
        })
    } finally {
        deleteLoading.value = false
    }
}

const bulkDelete = async () => {
    if (selectedItems.value.length === 0) return
    
    const ids = selectedItems.value.map(item => item[props.primaryKey])
    
    try {
        const response = await $api.post(`${props.endpoint}/bulk-delete`, { ids })
        
        if (response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `${ids.length} items deleted successfully`,
                life: 3000
            })
            selectedItems.value = []
            fetchData()
        }
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to delete items',
            life: 3000
        })
    }
}

const exportData = () => {
    // Export functionality
    toast.add({
        severity: 'info',
        summary: 'Export',
        detail: 'Export feature coming soon',
        life: 2000
    })
}

const formatCurrency = (value: number) => {
    if (!value && value !== 0) return '-'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

const formatDate = (value: string) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getStatusSeverity = (status: string) => {
    const statusMap: Record<string, string> = {
        active: 'success',
        inactive: 'danger',
        pending: 'warning',
        draft: 'secondary',
        completed: 'success',
        cancelled: 'danger'
    }
    return statusMap[status?.toLowerCase()] || 'info'
}

// Initial load
fetchData()
</script>

<style lang="scss" scoped>
.master-browse {
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

    .search-field {
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
    }

    .active-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
}

.filter-panel {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--surface-ground);
    border-radius: 0.75rem;
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

    :deep(.p-datatable-row:hover) {
        background: var(--surface-hover) !important;
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

.form-dialog {
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        &.col-span-2 {
            grid-column: span 2;
        }
    }

    .form-label {
        font-size: 0.813rem;
        font-weight: 500;
        color: var(--text-color);

        .required {
            color: var(--red-500);
            margin-left: 0.125rem;
        }
    }
}

.delete-dialog-content {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;

    .delete-icon {
        flex-shrink: 0;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

// Animations
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
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

    .form-grid {
        grid-template-columns: 1fr !important;

        .col-span-2 {
            grid-column: span 1 !important;
        }
    }
}
</style>