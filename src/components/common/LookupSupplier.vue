<template>
    <div class="lookup-supplier">
        <div class="lookup-input-group">
            <!-- Field Kode (readonly) -->
            <InputText 
                :modelValue="modelValue" 
                readonly 
                :placeholder="placeholderKode" 
                class="lookup-kode compact-input"
                @click="openLookup"
            />
            
            <!-- Field Nama (bisa diketik) -->
            <InputText 
                :modelValue="displayName" 
                :placeholder="placeholderNama" 
                class="lookup-nama compact-input"
                @update:modelValue="onNameInput"
                @focus="onNameFocus"
                @keydown.enter="openLookupWithSearch"
            />
            
            <!-- Tombol Search -->
            <Button 
                icon="pi pi-search" 
                severity="secondary" 
                size="small" 
                @click="openLookupWithSearch"
            />
            
            <!-- Tombol Clear -->
            <Button 
                v-if="modelValue"
                icon="pi pi-times" 
                severity="secondary" 
                text 
                size="small" 
                @click="clear"
            />
        </div>

        <!-- Dialog Lookup -->
        <Dialog 
            v-model:visible="showDialog" 
            :header="title" 
            :modal="true"
            :style="{ width: width }"
        >
            <div class="lookup-dialog">
                <!-- Search -->
                <div class="lookup-search">
                    <div class="search-input-wrapper">
                        <i class="pi pi-search search-icon"></i>
                        <input 
                            v-model="searchQuery" 
                            placeholder="Cari supplier..." 
                            class="search-input"
                        />
                    </div>
                </div>

                <!-- Table -->
                <DataTable 
                    :value="filteredData" 
                    :loading="loading"
                    selectionMode="single"
                    @row-dblclick="onSelect"
                    class="lookup-table"
                    stripedRows
                    size="small"
                    scrollable
                    scrollHeight="350px"
                >
                    <template #empty>
                        <div class="lookup-empty">
                            <i class="pi pi-inbox"></i>
                            <span>Tidak ada data</span>
                        </div>
                    </template>

                    <Column field="kode" header="Kode" style="width: 100px" />
                    <Column field="nama" header="Nama Supplier" />
                </DataTable>

                <div class="lookup-info">
                    <span>{{ filteredData.length }} data</span>
                    <small>Double-click untuk memilih</small>
                </div>
            </div>

            <template #footer>
                <Button label="Tutup" icon="pi pi-times" text size="small" @click="showDialog = false" />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
    modelValue?: string
    displayName?: string
    placeholderKode?: string
    placeholderNama?: string
    title?: string
    width?: string
}>(), {
    placeholderKode: 'Kode',
    placeholderNama: 'Cari nama supplier...',
    title: 'Pilih Supplier',
    width: '600px'
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'update:displayName', value: string): void
    (e: 'select', item: any): void
    (e: 'clear'): void
}>()

const { $api } = useNuxtApp()

const showDialog = ref(false)
const loading = ref(false)
const data = ref<any[]>([])
const searchQuery = ref('')
const nameSearchTemp = ref('')

const onNameInput = (value: string) => { nameSearchTemp.value = value }
const onNameFocus = () => { if (data.value.length === 0) fetchData() }

const openLookupWithSearch = () => {
    if (data.value.length === 0) fetchData()
    searchQuery.value = nameSearchTemp.value || props.displayName || ''
    showDialog.value = true
}

const openLookup = () => {
    if (data.value.length === 0) fetchData()
    searchQuery.value = nameSearchTemp.value || props.displayName || ''
    showDialog.value = true
}

const fetchData = async () => {
    if (data.value.length > 0) return
    loading.value = true
    try {
        const response = await $api.get('/v1/barang/form-options')
        if (response.data.success) data.value = response.data.data.supplier || []
    } catch (error) { console.error('Lookup supplier error:', error) }
    finally { loading.value = false }
}

const filteredData = computed(() => {
    if (!searchQuery.value) return data.value
    const q = searchQuery.value.toLowerCase()
    return data.value.filter(item => 
        String(item.kode).toLowerCase().includes(q) ||
        String(item.nama).toLowerCase().includes(q)
    )
})

const onSelect = (event: any) => {
    const item = event.data
    emit('update:modelValue', item.kode)
    emit('update:displayName', item.nama)
    emit('select', item)
    nameSearchTemp.value = ''
    showDialog.value = false
}

const clear = () => {
    emit('update:modelValue', '')
    emit('update:displayName', '')
    nameSearchTemp.value = ''
    emit('clear')
}
</script>

<style lang="scss" scoped>
.lookup-supplier { width: 100%; }

.lookup-input-group {
    display: flex; gap: 0.25rem; align-items: center;
}

.lookup-kode {
    width: 80px; flex-shrink: 0;
}

.lookup-nama {
    flex: 1; min-width: 0;
}

.lookup-dialog { display: flex; flex-direction: column; gap: 0.75rem; }

.lookup-search {
    .search-input-wrapper {
        position: relative;
        display: flex; align-items: center;
        
        .search-icon {
            position: absolute;
            left: 0.5rem;
            font-size: 0.75rem;
            color: var(--text-color-secondary);
            z-index: 1;
        }
        
        .search-input {
            width: 100%;
            height: 1.75rem;
            padding: 0.25rem 0.5rem 0.25rem 2rem;
            border: 1px solid var(--surface-border);
            border-radius: 0.375rem;
            font-size: 0.688rem;
            font-family: 'Plus Jakarta Sans', sans-serif;
            outline: none;
            background: var(--surface-0);
            color: var(--text-color);
            
            &:focus {
                border-color: var(--primary-500);
                box-shadow: 0 0 0 2px rgba(var(--primary-500-rgb, 16, 185, 129), 0.1);
            }
            
            &::placeholder { color: var(--text-color-secondary); }
        }
    }
}

.lookup-table {
    :deep(.p-datatable-tbody > tr) { cursor: pointer; &:hover { background: var(--surface-50); } }
    :deep(.p-datatable-thead > tr > th) { font-size: 0.625rem; padding: 0.25rem 0.5rem; }
    :deep(.p-datatable-tbody > tr > td) { font-size: 0.688rem; padding: 0.2rem 0.5rem; }
}

.lookup-empty { display: flex; flex-direction: column; align-items: center; padding: 2rem; color: var(--text-color-secondary); gap: 0.5rem; i { font-size: 2rem; opacity: 0.4; } span { font-size: 0.75rem; } }
.lookup-info { display: flex; align-items: center; justify-content: space-between; font-size: 0.688rem; color: var(--text-color-secondary); }

// 🔥 COMPACT OVERRIDE (dari form.vue)
:deep(.compact-input.p-inputtext),
:deep(.compact-input .p-inputtext) {
    font-size: 0.688rem !important;
    padding: 0.25rem 0.5rem !important;
    height: 1.875rem !important;
}
</style>