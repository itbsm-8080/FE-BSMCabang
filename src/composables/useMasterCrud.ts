// composables/useMasterCrud.ts
import { ref, reactive, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { usePermission } from '~/composables/usePermission'

export interface ColumnConfig {
    field: string
    header: string
    type?: 'text' | 'currency' | 'date' | 'number' | 'status' | 'boolean'
    sortable?: boolean
    width?: string
    minWidth?: string
    maxWidth?: string
    hidden?: boolean
    hideOnMobile?: boolean
    filterable?: boolean
    filterType?: 'text' | 'select' | 'date' | 'numeric'
    filterOptions?: any[]
    filterOptionsFrom?: string
    icon?: string
    description?: string
    booleanLabels?: { true: string; false: string }
    booleanSeverity?: { true: string; false: string }
    align?: 'left' | 'center' | 'right'
}

export interface FormFieldConfig {
    field: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'boolean' | 'lookup'
    required?: boolean
    placeholder?: string
    options?: { label: string; value: any }[]
    defaultValue?: any
    icon?: string
    fullWidth?: boolean
    helpText?: string
    disabled?: boolean
    colSpan?: number
    lookupConfig?: any
    min?: number
    max?: number
}

export interface ExpansionConfig {
    enabled: boolean
    endpoint: string
    title?: string
    columns?: ExpansionColumn[]
}

export interface ExpansionColumn {
    field: string
    header: string
    width?: string
    minWidth?: string
    align?: 'left' | 'center' | 'right'
    type?: 'text' | 'currency' | 'date' | 'number'
}

export interface MasterConfig {
    endpoint: string
    primaryKey: string
    columns: ColumnConfig[]
    formFields: FormFieldConfig[]
    expansion?: ExpansionConfig
    formRoute?: string
    showPeriod?: boolean
    formTitle?: string
    formIcon?: string
    optionsEndpoint?: string
    gridConfig?: any
}

export const useMasterCrud = (config: MasterConfig) => {
    const { $api } = useNuxtApp()
    const toast = useToast()

    // State
    const items = ref<any[]>([])
    const allData = ref<any[]>([])
    const selectedItems = ref<any[]>([])
    const loading = ref(false)

    // Search & Filters
    const searchKeyword = ref('')
    const tableFilters = ref<Record<string, any>>({})
    const numericFilters = ref<Record<string, any>>({})
    const filterOptionsCache = ref<Record<string, any[]>>({})

    // Detail Cache
    const detailDataCache = ref<Record<string, any[]>>({})

    // Pagination
    const pagination = reactive({
        page: 1,
        perPage: 25,
        total: 0,
        lastPage: 1
    })

    // Sorting
    const sortField = ref('')
    const sortOrder = ref<1 | -1 | null>(null)

    // Delete Dialog
    const deleteVisible = ref(false)
    const deleteItem = ref<any>(null)
    const deleteLoading = ref(false)

    // 🔥 PERMISSION
    const { checkAccess, getMenuIdByRoute } = usePermission()
    const canInsert = ref(false)
    const canEdit = ref(false)
    const canDelete = ref(false)

    // ==================== PERMISSION INIT ====================
    const initPermission = () => {
        const baseRoute = config.formRoute?.replace('/form', '') || config.endpoint.replace('/v1', '')
        const menuId = getMenuIdByRoute(baseRoute)

        if (menuId) {
            const hak = checkAccess(menuId)
            canInsert.value = hak.insert
            canEdit.value = hak.edit
            canDelete.value = hak.delete
        }
    }

    // ==================== EVALUATE CONDITION ====================
    const evaluateCondition = (row: any, field: string, operator: string, val1: any, val2: any, isDate: boolean): boolean => {
        const rawVal = row[field]
        if (isDate) {
            const v = String(rawVal || ''), v1 = String(val1 || ''), v2 = String(val2 || '')
            switch (operator) {
                case "eq": return v === v1
                case "neq": return v !== v1
                case "gt": return v > v1
                case "gte": return v >= v1
                case "lt": return v < v1
                case "lte": return v <= v1
                case "between": return v >= v1 && v <= v2
                default: return true
            }
        } else {
            const v = parseFloat(rawVal) || 0, v1 = parseFloat(val1) || 0, v2 = parseFloat(val2) || 0
            switch (operator) {
                case "eq": return v === v1
                case "neq": return v !== v1
                case "gt": return v > v1
                case "gte": return v >= v1
                case "lt": return v < v1
                case "lte": return v <= v1
                case "between": return v >= v1 && v <= v2
                default: return true
            }
        }
    }

    // ==================== BUILD FILTER CACHE ====================
    const buildFilterCache = () => {
        const cache: Record<string, any[]> = {}

        config.columns.forEach(col => {
            if (col.type === 'currency' || col.type === 'number' || col.type === 'date') return

            const valueMap = new Map<string, number>()
            allData.value.forEach(row => {
                const val = row[col.field]
                if (val !== null && val !== undefined && val !== '') {
                    const key = String(val)
                    valueMap.set(key, (valueMap.get(key) || 0) + 1)
                }
            })

            cache[col.field] = Array.from(valueMap.entries())
                .map(([value, count]) => ({ value, label: value, count }))
                .sort((a, b) => a.label.localeCompare(b.label))
        })

        filterOptionsCache.value = cache
    }

    // ==================== FILTERED DATA ====================
    const filteredData = computed(() => {
        let result = [...allData.value]

        // Global search
        if (searchKeyword.value) {
            const kw = searchKeyword.value.toLowerCase()
            result = result.filter(row =>
                Object.values(row).some(v => String(v).toLowerCase().includes(kw))
            )
        }

        // Multi-select text filters
        Object.keys(tableFilters.value).forEach(field => {
            const values = tableFilters.value[field]
            if (Array.isArray(values) && values.length > 0) {
                result = result.filter(row => values.includes(String(row[field])))
            }
        })

        // Numeric & Date filters
        Object.keys(numericFilters.value).forEach(field => {
            const filter = numericFilters.value[field]
            if (!filter) return
            const col = config.columns.find(c => c.field === field)
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

        // Sorting
        if (sortField.value && sortOrder.value) {
            const col = config.columns.find(c => c.field === sortField.value)
            const isDate = col?.type === 'date'
            const isNum = col?.type === 'number' || col?.type === 'currency'
            result.sort((a, b) => {
                let valA = a[sortField.value!], valB = b[sortField.value!]
                if (isDate) {
                    valA = valA ? new Date(valA).getTime() : 0
                    valB = valB ? new Date(valB).getTime() : 0
                } else if (isNum) {
                    valA = parseFloat(valA) || 0
                    valB = parseFloat(valB) || 0
                } else {
                    valA = String(valA || '').toLowerCase()
                    valB = String(valB || '').toLowerCase()
                }
                if (valA < valB) return sortOrder.value === 1 ? -1 : 1
                if (valA > valB) return sortOrder.value === 1 ? 1 : -1
                return 0
            })
        }

        // Update pagination
        pagination.total = result.length
        pagination.lastPage = Math.ceil(result.length / pagination.perPage) || 1
        if (pagination.page > pagination.lastPage) pagination.page = pagination.lastPage
        if (pagination.page < 1) pagination.page = 1

        return result
    })

    // ==================== PAGINATED ITEMS ====================
    const applyPagination = () => {
        const start = (pagination.page - 1) * pagination.perPage
        const end = start + pagination.perPage
        items.value = filteredData.value.slice(start, end)
    }

    // ==================== FETCH ALL DETAIL ====================
    const fetchAllDetailData = async () => {
        if (!config.expansion?.enabled || !config.expansion?.endpoint) return
        try {
            // Endpoint: /v1/so/{id}/detail → kita butuh endpoint tanpa {id}
            // Untuk SO: /v1/so/all-detail (atau kita fetch satu per satu)
            // 🔥 Fetch detail untuk semua item di allData
            const ids = allData.value.map(d => d[config.primaryKey])

            // Batch fetch (max 10 paralel)
            const batchSize = 10
            for (let i = 0; i < ids.length; i += batchSize) {
                const batch = ids.slice(i, i + batchSize)
                await Promise.all(batch.map(async (id) => {
                    if (detailDataCache.value[id]) return
                    try {
                        const endpoint = config.expansion!.endpoint.replace('{id}', id)
                        const res = await $api.get(endpoint)
                        if (res.data.success) {
                            detailDataCache.value[id] = res.data.data
                        }
                    } catch (e) { console.error(`Detail error for ${id}:`, e) }
                }))
            }
            console.log('✅ Detail preloaded:', Object.keys(detailDataCache.value).length, 'items')
        } catch (error) {
            console.error('Failed to preload detail:', error)
        }
    }

    // ==================== FETCH ALL DATA ====================
    const fetchAllData = async () => {
        loading.value = true
        try {
            const params: any = { per_page: 9999 }

            const response = await $api.get(config.endpoint, { params })

            if (response.data.success) {
                allData.value = response.data.data
                pagination.total = response.data.pagination?.total || allData.value.length

                // Build filter cache
                buildFilterCache()

                // Apply filter + pagination
                applyPagination()

                // Preload detail (background)
                fetchAllDetailData()
            }
        } catch (error: any) {
            console.error('Fetch error:', error)
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.response?.data?.message || 'Gagal mengambil data',
                life: 3000
            })
        } finally {
            loading.value = false
        }
    }

    const fetchData = async () => { await fetchAllData() }

    const refreshData = () => {
        applyPagination()
    }

    // ==================== DELETE ====================
    const handleDelete = async () => {
        if (!deleteItem.value) return
        deleteLoading.value = true
        try {
            const id = deleteItem.value[config.primaryKey]
            const res = await $api.delete(`${config.endpoint}/${id}`)
            if (res.data.success) {
                toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil dihapus', life: 3000 })
                deleteVisible.value = false
                fetchAllData()
            }
        } catch (error: any) {
            toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal menghapus data', life: 3000 })
        } finally {
            deleteLoading.value = false
        }
    }

    // ==================== HELPERS ====================
    const formatCurrency = (value: number) => {
        if (!value && value !== 0) return '-'
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
    }

    const formatDate = (value: string) => {
        if (!value) return '-'
        return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    // Init
    initPermission()

    return {
        items,
        allData,
        filteredData,
        selectedItems,
        loading,
        pagination,
        searchKeyword,
        tableFilters,
        numericFilters,
        filterOptionsCache,
        detailDataCache,
        sortField,
        sortOrder,
        deleteVisible,
        deleteItem,
        deleteLoading,
        canInsert,
        canEdit,
        canDelete,
        fetchAllData,
        fetchData,
        refreshData,
        handleDelete,
        formatCurrency,
        formatDate,
        applyPagination,
    }
}