<template>
    <ReportLayout 
        endpoint="/report/list-jurnal"
        startLabel="Dari"
        endLabel="Sampai"
        :columns="jurnalColumns"
        :showGrid="true"
        :showPivot="true"
        :showChart="true"
        :showTabs="true"
        :showExport="true"
        :pivotConfig="{ rows: ['AccountName'], columns: ['Bulan'], measures: ['Debet', 'Kredit'] }"
        :chartConfig="{ type: 'bar', labelField: 'AccountName', valueField: 'Debet' }"
        @data-loaded="onDataLoaded"
    >
        <!-- <template #custom-filters>
            <div class="filter-item">
                <span class="filter-label">Account</span>
                <Select v-model="filterAccount" :options="accountOptions" optionLabel="label" optionValue="value" placeholder="Pilih" size="small" class="filter-select" showClear />
            </div>
            <div class="filter-item">
                <span class="filter-label">Kelompok</span>
                <Select v-model="filterKelompok" :options="kelompokOptions" optionLabel="label" optionValue="value" placeholder="Pilih" size="small" class="filter-select" showClear />
            </div>
        </template> -->
    </ReportLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ReportLayout from '~/components/report/ReportLayout.vue'

definePageMeta({ layout: 'default' })

const { $api } = useNuxtApp()

const filterAccount = ref(null)
const filterKelompok = ref(null)
const accountOptions = ref<any[]>([])
const kelompokOptions = ref<any[]>([])

const jurnalColumns = [
    { field: 'Tanggal', header: 'Tanggal', width: '100px', type: 'date' },
    { field: 'Nomor', header: 'Nomor', width: '120px' },
    { field: 'Referensi', header: 'Referensi', width: '100px' },
    { field: 'Account', header: 'Account', width: '80px' },
    { field: 'AccountName', header: 'Nama Account', minWidth: '180px' },
    { field: 'Keterangan', header: 'Keterangan', minWidth: '200px' },
    { field: 'Debet', header: 'Debet', width: '120px', align: 'right', type: 'number' },
    { field: 'Kredit', header: 'Kredit', width: '120px', align: 'right', type: 'number' },
    { field: 'Kelompok', header: 'Kelompok', width: '100px' },
    { field: 'CostCenter', header: 'Cost Center', width: '100px' },
    { field: 'Customer', header: 'Customer', width: '150px' },
]

const onDataLoaded = (response: any) => {
    console.log('Data loaded:', response)
}

// Load filters
onMounted(async () => {
    try {
        const res = await $api.get('/report/list-jurnal/filters')
        if (res.data.success) {
            accountOptions.value = res.data.data.accounts
            kelompokOptions.value = res.data.data.kelompok
        }
    } catch (e) { console.error(e) }
})
</script>

<style lang="scss" scoped>
.filter-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    .filter-label {
        font-size: 0.688rem;
        font-weight: 600;
        color: var(--text-color-secondary);
        white-space: nowrap;
    }
    
    .filter-select {
        width: 150px;
    }
}
</style>