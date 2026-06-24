<template>
    <Dialog 
        v-model:visible="visible" 
        :header="title" 
        :modal="true"
        :style="{ width: width }"
        @hide="onHide"
    >
        <div class="lookup-container">
            <!-- Search Bar -->
            <div class="lookup-search">
                <IconField iconPosition="left">
                    <InputIcon class="pi pi-search" />
                    <InputText 
                        v-model="searchKeyword" 
                        placeholder="Cari..." 
                        class="w-full"
                        @input="onSearch"
                    />
                </IconField>
            </div>
            
            <!-- DataTable -->
            <DataTable 
                :value="filteredData" 
                :loading="loading"
                selectionMode="single"
                @row-dblclick="onSelect"
                class="lookup-table"
                stripedRows
                size="small"
            >
                <template #empty>
                    <div class="lookup-empty">
                        <i class="pi pi-search"></i>
                        <span>Tidak ada data</span>
                    </div>
                </template>
                
                <Column 
                    v-for="col in columns" 
                    :key="col.field"
                    :field="col.field"
                    :header="col.header"
                    :style="{ width: col.width || 'auto', minWidth: col.minWidth || '100px' }"
                />
            </DataTable>
            
            <!-- Info -->
            <div class="lookup-info">
                <span>{{ filteredData.length }} data ditemukan</span>
                <small>Double-click untuk memilih</small>
            </div>
        </div>
        
        <template #footer>
            <Button label="Tutup" icon="pi pi-times" text @click="visible = false" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface LookupColumn {
    field: string
    header: string
    width?: string
    minWidth?: string
}

const props = defineProps<{
    title?: string
    width?: string
    columns: LookupColumn[]
    data: any[]
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'select', item: any): void
    (e: 'close'): void
}>()

const visible = ref(false)
const searchKeyword = ref('')

const filteredData = computed(() => {
    if (!searchKeyword.value) return props.data
    
    const keyword = searchKeyword.value.toLowerCase()
    return props.data.filter(item => {
        return props.columns.some(col => {
            const value = item[col.field]
            return value && String(value).toLowerCase().includes(keyword)
        })
    })
})

const open = () => {
    visible.value = true
    searchKeyword.value = ''
}

const close = () => {
    visible.value = false
}

const onSearch = () => {
    // Debounce bisa ditambahkan
}

const onSelect = (event: any) => {
    emit('select', event.data)
    visible.value = false
}

const onHide = () => {
    emit('close')
}

defineExpose({
    open,
    close
})

// Watch loading
watch(() => props.loading, (val) => {
    // Bisa tambahkan indikator
})
</script>

<style lang="scss" scoped>
.lookup-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.lookup-search {
    :deep(.p-inputtext) {
        width: 100%;
    }
}

.lookup-table {
    :deep(.p-datatable-tbody > tr) {
        cursor: pointer;
        
        &:hover {
            background: var(--primary-50);
        }
    }
}

.lookup-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--text-color-secondary);
    
    i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
}

.lookup-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-color-secondary);
}
</style>