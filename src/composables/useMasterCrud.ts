// composables/useMasterCrud.ts
import { ref, reactive, computed } from 'vue'
import { useToast } from 'primevue/usetoast'

export interface ColumnConfig {
    field: string
    header: string
    type?: 'text' | 'currency' | 'date' | 'number'
    sortable?: boolean
    width?: string
}

export interface FormFieldConfig {
    field: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select'
    required?: boolean
    placeholder?: string
    options?: { label: string; value: any }[]
    defaultValue?: any
}

export interface MasterConfig {
    endpoint: string
    primaryKey: string
    title: string
    columns: ColumnConfig[]
    formFields: FormFieldConfig[]
}

export const useMasterCrud = (config: MasterConfig) => {
    const { $api } = useNuxtApp()
    const toast = useToast()

    // State
    const items = ref<any[]>([])
    const selectedItems = ref<any[]>([])
    const loading = ref(false)
    const searchKeyword = ref('')

    // Pagination
    const pagination = reactive({
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1
    })

    // Form Dialog
    const formDialog = ref(false)
    const formMode = ref<'add' | 'edit'>('add')
    const formData = reactive<Record<string, any>>({})
    const formLoading = ref(false)

    // Delete Dialog
    const deleteDialog = ref(false)
    const deleteItem = ref<any>(null)
    const deleteLoading = ref(false)

    // Computed
    const isAddMode = computed(() => formMode.value === 'add')
    const dialogTitle = computed(() => isAddMode.value ? `Tambah ${config.title}` : `Edit ${config.title}`)

    // Search with debounce
    let searchTimeout: NodeJS.Timeout
    const onSearch = () => {
        if (searchTimeout) clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            pagination.page = 1
            fetchData()
        }, 500)
    }

    // Fetch data
    const fetchData = async () => {
        loading.value = true
        try {
            const response = await $api.get(config.endpoint, {
                params: {
                    page: pagination.page,
                    per_page: pagination.perPage,
                    search: searchKeyword.value || undefined
                }
            })

            if (response.data.success) {
                items.value = response.data.data
                pagination.total = response.data.pagination.total
                pagination.lastPage = response.data.pagination.last_page
            }
        } catch (error: any) {
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

    // Page change
    const onPageChange = (event: any) => {
        pagination.page = event.page + 1
        fetchData()
    }

    // Reset form
    const resetForm = () => {
        Object.keys(formData).forEach(key => {
            delete formData[key]
        })
        config.formFields.forEach(field => {
            formData[field.field] = field.defaultValue || null
        })
    }

    // Open add form
    const openAddForm = () => {
        formMode.value = 'add'
        resetForm()
        formDialog.value = true
    }

    // Open edit form
    const openEditForm = (item: any) => {
        formMode.value = 'edit'
        resetForm()
        config.formFields.forEach(field => {
            formData[field.field] = item[field.field] ?? null
        })
        formDialog.value = true
    }

    // Save data
    const saveData = async () => {
        formLoading.value = true
        try {
            let response
            if (isAddMode.value) {
                response = await $api.post(config.endpoint, formData)
            } else {
                const id = formData[config.primaryKey]
                response = await $api.put(`${config.endpoint}/${id}`, formData)
            }

            if (response.data.success) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: isAddMode.value ? `Data ${config.title} berhasil ditambahkan` : `Data ${config.title} berhasil diupdate`,
                    life: 3000
                })
                formDialog.value = false
                fetchData()
            }
        } catch (error: any) {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.response?.data?.message || 'Gagal menyimpan data',
                life: 3000
            })
        } finally {
            formLoading.value = false
        }
    }

    // Confirm delete
    const confirmDelete = (item: any) => {
        deleteItem.value = item
        deleteDialog.value = true
    }

    // Delete data
    const deleteData = async () => {
        if (!deleteItem.value) return
        deleteLoading.value = true

        try {
            const id = deleteItem.value[config.primaryKey]
            const response = await $api.delete(`${config.endpoint}/${id}`)

            if (response.data.success) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: `Data ${config.title} berhasil dihapus`,
                    life: 3000
                })
                deleteDialog.value = false
                deleteItem.value = null
                fetchData()
            }
        } catch (error: any) {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.response?.data?.message || 'Gagal menghapus data',
                life: 3000
            })
        } finally {
            deleteLoading.value = false
        }
    }

    // Format helpers
    const formatCurrency = (value: number) => {
        if (!value) return 'Rp 0'
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
    }

    const formatDate = (value: string) => {
        if (!value) return '-'
        return new Date(value).toLocaleDateString('id-ID')
    }

    // Load initial data
    fetchData()

    return {
        // State
        items,
        selectedItems,
        loading,
        searchKeyword,
        pagination,
        // Form
        formDialog,
        formMode,
        formData,
        formLoading,
        dialogTitle,
        isAddMode,
        // Delete
        deleteDialog,
        deleteItem,
        deleteLoading,
        // Methods
        fetchData,
        onSearch,
        onPageChange,
        openAddForm,
        openEditForm,
        saveData,
        confirmDelete,
        deleteData,
        // Helpers
        formatCurrency,
        formatDate
    }
}