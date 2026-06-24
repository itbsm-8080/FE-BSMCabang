// composables/useMasterCrud.ts
import { ref, reactive, computed } from 'vue'
import { useToast } from 'primevue/usetoast'

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
    type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'boolean'
    required?: boolean
    placeholder?: string
    options?: { label: string; value: any }[]
    defaultValue?: any
    icon?: string
    fullWidth?: boolean
    helpText?: string
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

    /**
     * Evaluate numeric/date condition
     */
    const evaluateCondition = (row: any, field: string, operator: string, val1: any, val2: any, isDate: boolean): boolean => {
        const rawVal = row[field]
        if (isDate) {
            const v = String(rawVal || '')
            const v1 = String(val1 || '')
            const v2 = String(val2 || '')
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
            const v = parseFloat(rawVal) || 0
            const v1 = parseFloat(val1) || 0
            const v2 = parseFloat(val2) || 0
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

    /**
     * Generate filter options dari allData
     */
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

    /**
     * Filter all data & paginate
     */
    const applyFiltersAndPaginate = () => {
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
                let valA = a[sortField.value!]
                let valB = b[sortField.value!]
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

        // Paginate
        const start = (pagination.page - 1) * pagination.perPage
        const end = start + pagination.perPage
        items.value = result.slice(start, end)
    }

    /**
     * Fetch all detail data
     */
    const fetchAllDetailData = async () => {
        if (!config.expansion?.enabled || !config.expansion?.endpoint) return
        try {
            const response = await $api.get(config.expansion.endpoint)
            if (response.data.success) {
                const grouped: Record<string, any[]> = {}
                response.data.data.forEach((item: any) => {
                    const key = item[config.primaryKey] || item.Kode
                    if (!grouped[key]) grouped[key] = []
                    grouped[key].push(item)
                })
                detailDataCache.value = grouped
            }
        } catch (error) {
            console.error('Failed to preload detail data:', error)
        }
    }

    /**
     * Fetch ALL data from API
     */
    const fetchAllData = async () => {
        loading.value = true
        try {
            const params: any = { per_page: 9999 }

            const promises: Promise<any>[] = [$api.get(config.endpoint, { params })]
            if (config.expansion?.enabled && config.expansion?.endpoint) {
                promises.push($api.get(config.expansion.endpoint))
            }

            const [headerResponse, detailResponse] = await Promise.all(promises)

            if (headerResponse.data.success) {
                allData.value = headerResponse.data.data
                pagination.total = headerResponse.data.pagination?.total || allData.value.length
            }

            if (detailResponse && detailResponse.data.success) {
                const grouped: Record<string, any[]> = {}
                detailResponse.data.data.forEach((item: any) => {
                    const key = item[config.primaryKey] || item.Kode
                    if (!grouped[key]) grouped[key] = []
                    grouped[key].push(item)
                })
                detailDataCache.value = grouped
            }

            // 🔥 Build filter cache dari data
            buildFilterCache()

            applyFiltersAndPaginate()
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
    const refreshData = () => { applyFiltersAndPaginate() }

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

    const formatCurrency = (value: number) => {
        if (!value && value !== 0) return '-'
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
    }

    const formatDate = (value: string) => {
        if (!value) return '-'
        return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return {
        items,
        allData,
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
        fetchData,
        fetchAllData,
        refreshData,
        handleDelete,
        formatCurrency,
        formatDate
    }
}