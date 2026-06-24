<template>
    <div class="lookup-field">
        <InputText :modelValue="displayValue" readonly :placeholder="placeholder" class="lookup-display" />
        <Button icon="pi pi-search" severity="secondary" @click="openLookup" />
        
        <LookupModal 
            ref="lookupRef"
            title="Pilih Barang"
            :columns="columns"
            :data="lookupData"
            :loading="loading"
            width="800px"
            @select="onSelect"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LookupModal from '~/components/common/LookupModal.vue'

const props = defineProps<{
    modelValue?: string
    displayValue?: string
    placeholder?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'select', item: any): void
}>()

const { $api } = useNuxtApp()
const lookupRef = ref()
const lookupData = ref<any[]>([])
const loading = ref(false)

const columns = [
    { field: 'Kode', header: 'Kode', width: '120px' },
    { field: 'Nama', header: 'Nama Barang', minWidth: '250px' },
    { field: 'Satuan', header: 'Satuan', width: '80px' },
    { field: 'HargaJual', header: 'Harga Jual', width: '150px' },
    { field: 'Stok', header: 'Stok', width: '80px' }
]

const openLookup = async () => {
    loading.value = true
    try {
        const response = await $api.get('/v1/barang', { params: { per_page: 9999 } })
        if (response.data.success) lookupData.value = response.data.data
    } catch (error) {
        console.error('Lookup error:', error)
    } finally {
        loading.value = false
    }
    lookupRef.value?.open()
}

const onSelect = (item: any) => {
    emit('update:modelValue', item.Kode)
    emit('select', item)
}
</script>

<style lang="scss" scoped>
.lookup-field { display: flex; gap: 0.25rem; .lookup-display { flex: 1; background: var(--surface-100); } }
</style>