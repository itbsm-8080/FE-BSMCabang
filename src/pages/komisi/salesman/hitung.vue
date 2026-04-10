<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { ref, computed, onMounted } from 'vue';

// ─── Period & Year ───
const bulanOptions = [
    { label: 'Januari', value: 1 },
    { label: 'Februari', value: 2 },
    { label: 'Maret', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Mei', value: 5 },
    { label: 'Juni', value: 6 },
    { label: 'Juli', value: 7 },
    { label: 'Agustus', value: 8 },
    { label: 'September', value: 9 },
    { label: 'Oktober', value: 10 },
    { label: 'November', value: 11 },
    { label: 'Desember', value: 12 }
];

const selectedBulan = ref(1);
const selectedTahun = ref(new Date().getFullYear());
const loading = ref(false);

// ─── Salesman filter ───
const selectedSalesmanPenjualan = ref([]);
const selectedSalesmanKomisi = ref([]);

// ─── DataTable refs ───
const dtPenjualan = ref();
const dtKomisi = ref();

// ─── Format helpers ───
function formatRupiah(value) {
    if (value == null) return '0';
    return Number(value).toLocaleString('id-ID');
}

function formatPersen(value) {
    if (value == null) return '0.00';
    return Number(value).toFixed(2);
}

// ─── Dummy Data: Penjualan & Piutang (Table 1) ───
const dataPenjualan = ref([]);
const dummyPenjualan = [
    {
        salesman: 'AGUNG',
        penjualan_target: 0, penjualan_realisasi: 0, penjualan_persen: 0,
        others_target: 0, others_realisasi: 0, others_persen: 0,
        pf_realisasi: 0, pf_persen: 0,
        piutang_target: 0, piutang_realisasi_tempo: 0, piutang_persen: 0, piutang_realisasi_all: 0, piutang_persen_all: 0
    },
    {
        salesman: 'AGUS_SBY',
        penjualan_target: 140000000, penjualan_realisasi: 143203372, penjualan_persen: 102.29,
        others_target: 47988828, others_realisasi: 27153183, others_persen: 56.58,
        pf_realisasi: 208380418, pf_persen: 148.84,
        piutang_target: 202452, piutang_realisasi_tempo: 154850, piutang_persen: 76.39, piutang_realisasi_all: 157207, piutang_persen_all: 77.65
    },
    {
        salesman: 'ARIEF_SBY',
        penjualan_target: 100000000, penjualan_realisasi: 72319741, penjualan_persen: 72.32,
        others_target: 20102681, others_realisasi: 21099261, others_persen: 104.96,
        pf_realisasi: 87710133, pf_persen: 87.71,
        piutang_target: 66597, piutang_realisasi_tempo: 46713, piutang_persen: 70.14, piutang_realisasi_all: 46713, piutang_persen_all: 70.14
    },
    {
        salesman: 'BENTANG',
        penjualan_target: 110000000, penjualan_realisasi: 117382915, penjualan_persen: 106.71,
        others_target: 37015006, others_realisasi: 67873444, others_persen: 183.37,
        pf_realisasi: 205782734, pf_persen: 187.08,
        piutang_target: 322295, piutang_realisasi_tempo: 206474, piutang_persen: 64.06, piutang_realisasi_all: 235139, piutang_persen_all: 72.96
    },
    {
        salesman: 'CHAMIM',
        penjualan_target: 100000000, penjualan_realisasi: 29075941, penjualan_persen: 29.08,
        others_target: 27619642, others_realisasi: 25465393, others_persen: 92.20,
        pf_realisasi: 51254436, pf_persen: 51.25,
        piutang_target: 102683, piutang_realisasi_tempo: 72157, piutang_persen: 70.27, piutang_realisasi_all: 73895, piutang_persen_all: 71.96
    },
    {
        salesman: 'SEPTIAN',
        penjualan_target: 50000000, penjualan_realisasi: 2387946, penjualan_persen: 4.78,
        others_target: 0, others_realisasi: 0, others_persen: 0,
        pf_realisasi: 1070620, pf_persen: 2.14,
        piutang_target: 63175, piutang_realisasi_tempo: 26853, piutang_persen: 42.51, piutang_realisasi_all: 26853, piutang_persen_all: 42.00
    },
    {
        salesman: 'VACANT',
        penjualan_target: 0, penjualan_realisasi: 0, penjualan_persen: 0,
        others_target: 0, others_realisasi: 0, others_persen: 0,
        pf_realisasi: 0, pf_persen: 0,
        piutang_target: 0, piutang_realisasi_tempo: 0, piutang_persen: 0, piutang_realisasi_all: 0, piutang_persen_all: 0
    }
];

// ─── Dummy Data: Komisi (Table 2) ───
const dataKomisi = ref([]);
const dummyKomisi = [
    {
        salesman: 'SEPTIAN',
        inkaso_riil: 24192108, giro_bulan_lalu: 0,
        biaya_promosi: 0, fee_marketing: 0, kontrak: 0, dasar_tagihan: 0, cash: 0,
        pengali_7_40: 0, pengali_40_60: 0, pengali_60: 0,
        komisi_penjualan: 1513514,
        komisi_inkaso_7_40_persen: 0, komisi_inkaso_7_40_nilai: 0,
        komisi_inkaso_40_60_persen: 0, komisi_inkaso_40_60_nilai: 0,
        komisi_60_persen: 0, komisi_60_nilai: 0,
        komisi_7_persen: 0, komisi_7_nilai: 18529609,
        komisi_pf: 0, komisi_others: 0, total_komisi: 20043123
    },
    {
        salesman: 'ARIEF_SBY',
        inkaso_riil: 42083960, giro_bulan_lalu: 0,
        biaya_promosi: 1137398, fee_marketing: 0, kontrak: 0, dasar_tagihan: 0, cash: 0,
        pengali_7_40: 17169937, pengali_40_60: 7038050, pengali_60: 3113944,
        komisi_penjualan: 0,
        komisi_inkaso_7_40_persen: 1, komisi_inkaso_7_40_nilai: 171699,
        komisi_inkaso_40_60_persen: 0.5, komisi_inkaso_40_60_nilai: 35190,
        komisi_60_persen: 0, komisi_60_nilai: 0,
        komisi_7_persen: 0.90, komisi_7_nilai: 132582,
        komisi_pf: 0, komisi_others: 0, total_komisi: 339471
    },
    {
        salesman: 'CHAMIM',
        inkaso_riil: 66572427, giro_bulan_lalu: 0,
        biaya_promosi: 207816, fee_marketing: 0, kontrak: 0, dasar_tagihan: 198198, cash: 0,
        pengali_7_40: 39039536, pengali_40_60: 18064695, pengali_60: 0,
        komisi_penjualan: 0,
        komisi_inkaso_7_40_persen: 0, komisi_inkaso_7_40_nilai: 0,
        komisi_inkaso_40_60_persen: 0, komisi_inkaso_40_60_nilai: 0,
        komisi_60_persen: 0, komisi_60_nilai: 0,
        komisi_7_persen: 0, komisi_7_nilai: 0,
        komisi_pf: 0, komisi_others: 0, total_komisi: 0
    },
    {
        salesman: 'AGUS_SBY',
        inkaso_riil: 141628254, giro_bulan_lalu: 0,
        biaya_promosi: 1363795, fee_marketing: 0, kontrak: 0, dasar_tagihan: 0, cash: 1763048,
        pengali_7_40: 40198361, pengali_40_60: 33124637, pengali_60: 15087776,
        komisi_penjualan: 1100000,
        komisi_inkaso_7_40_persen: 0.90, komisi_inkaso_7_40_nilai: 361785,
        komisi_inkaso_40_60_persen: 0.45, komisi_inkaso_40_60_nilai: 149061,
        komisi_60_persen: 0, komisi_60_nilai: 0,
        komisi_7_persen: 0.90, komisi_7_nilai: 443493,
        komisi_pf: 50000, komisi_others: 30000, total_komisi: 2134339
    },
    {
        salesman: 'BENTANG',
        inkaso_riil: 211836778, giro_bulan_lalu: 0,
        biaya_promosi: 8152, fee_marketing: 0, kontrak: 0, dasar_tagihan: 18721171, cash: 0,
        pengali_7_40: 68804814, pengali_40_60: 44708895, pengali_60: 31755497,
        komisi_penjualan: 1100000,
        komisi_inkaso_7_40_persen: 0.45, komisi_inkaso_7_40_nilai: 309622,
        komisi_inkaso_40_60_persen: 0.25, komisi_inkaso_40_60_nilai: 111772,
        komisi_60_persen: 0, komisi_60_nilai: 0,
        komisi_7_persen: 0.45, komisi_7_nilai: 351774,
        komisi_pf: 75000, komisi_others: 45000, total_komisi: 1993168
    }
];

// ─── Salesman options (derived from loaded data) ───
const salesmanOptionsPenjualan = computed(() => {
    return dataPenjualan.value.map(d => d.salesman);
});
const salesmanOptionsKomisi = computed(() => {
    return dataKomisi.value.map(d => d.salesman);
});

// ─── Filtered data (drives both table display AND summaries) ───
const filteredPenjualan = computed(() => {
    const sel = selectedSalesmanPenjualan.value;
    if (!sel || sel.length === 0) return dataPenjualan.value;
    return dataPenjualan.value.filter(row => sel.includes(row.salesman));
});

const filteredKomisi = computed(() => {
    const sel = selectedSalesmanKomisi.value;
    if (!sel || sel.length === 0) return dataKomisi.value;
    return dataKomisi.value.filter(row => sel.includes(row.salesman));
});

// ─── Summary computations (from FILTERED data) ───
const summaryPenjualan = computed(() => {
    const data = filteredPenjualan.value;
    if (!data || data.length === 0) return {};
    const sum = (key) => data.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
    const totalTarget = sum('penjualan_target');
    const totalRealisasi = sum('penjualan_realisasi');
    const totalOthersTarget = sum('others_target');
    const totalOthersRealisasi = sum('others_realisasi');
    const totalPiutangTarget = sum('piutang_target');
    const totalPiutangRealisasiTempo = sum('piutang_realisasi_tempo');
    const totalPiutangRealisasiAll = sum('piutang_realisasi_all');
    return {
        penjualan_target: totalTarget,
        penjualan_realisasi: totalRealisasi,
        penjualan_persen: totalTarget ? ((totalRealisasi / totalTarget) * 100) : 0,
        others_target: totalOthersTarget,
        others_realisasi: totalOthersRealisasi,
        others_persen: totalOthersTarget ? ((totalOthersRealisasi / totalOthersTarget) * 100) : 0,
        pf_realisasi: sum('pf_realisasi'),
        pf_persen: totalTarget ? ((sum('pf_realisasi') / (totalTarget + totalOthersTarget)) * 100) : 0,
        piutang_target: totalPiutangTarget,
        piutang_realisasi_tempo: totalPiutangRealisasiTempo,
        piutang_persen: totalPiutangTarget ? ((totalPiutangRealisasiTempo / totalPiutangTarget) * 100) : 0,
        piutang_realisasi_all: totalPiutangRealisasiAll,
        piutang_persen_all: totalPiutangTarget ? ((totalPiutangRealisasiAll / totalPiutangTarget) * 100) : 0
    };
});

const summaryKomisi = computed(() => {
    const data = filteredKomisi.value;
    if (!data || data.length === 0) return {};
    const sum = (key) => data.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
    return {
        inkaso_riil: sum('inkaso_riil'),
        giro_bulan_lalu: sum('giro_bulan_lalu'),
        biaya_promosi: sum('biaya_promosi'),
        fee_marketing: sum('fee_marketing'),
        kontrak: sum('kontrak'),
        dasar_tagihan: sum('dasar_tagihan'),
        cash: sum('cash'),
        pengali_7_40: sum('pengali_7_40'),
        pengali_40_60: sum('pengali_40_60'),
        pengali_60: sum('pengali_60'),
        komisi_penjualan: sum('komisi_penjualan'),
        komisi_inkaso_7_40_nilai: sum('komisi_inkaso_7_40_nilai'),
        komisi_inkaso_40_60_nilai: sum('komisi_inkaso_40_60_nilai'),
        komisi_60_nilai: sum('komisi_60_nilai'),
        komisi_7_nilai: sum('komisi_7_nilai'),
        komisi_pf: sum('komisi_pf'),
        komisi_others: sum('komisi_others'),
        total_komisi: sum('total_komisi')
    };
});

// ─── Actions ───
function loadData() {
    loading.value = true;
    selectedSalesmanPenjualan.value = [];
    selectedSalesmanKomisi.value = [];
    setTimeout(() => {
        dataPenjualan.value = [...dummyPenjualan];
        dataKomisi.value = [...dummyKomisi];
        loading.value = false;
    }, 600);
}

function exportPenjualan() {
    dtPenjualan.value.exportCSV();
}

function exportKomisi() {
    dtKomisi.value.exportCSV();
}

function cetakKomisi() {
    window.print();
}

function clearFilterPenjualan() {
    selectedSalesmanPenjualan.value = [];
}

function clearFilterKomisi() {
    selectedSalesmanKomisi.value = [];
}

function penjualanRowClass(data) {
    if (data.penjualan_persen >= 100) return 'row-good';
    if (data.penjualan_persen >= 70) return 'row-average';
    return '';
}

onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="komisi-salesman-page">
        <!-- Page Header -->
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-surface-800 dark:text-surface-100 m-0">
                <i class="pi pi-calculator mr-2 text-primary"></i>Komisi Salesman
            </h2>
        </div>

        <!-- Filter Toolbar -->
        <div class="card mb-4">
            <div class="flex flex-wrap items-end gap-4">
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-surface-600 dark:text-surface-300">Periode</label>
                    <Select
                        v-model="selectedBulan"
                        :options="bulanOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Pilih Bulan"
                        class="w-48"
                    />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-surface-600 dark:text-surface-300">Tahun</label>
                    <InputNumber
                        v-model="selectedTahun"
                        :useGrouping="false"
                        :min="2000"
                        :max="2100"
                        class="w-32"
                        placeholder="Tahun"
                    />
                </div>
                <Button
                    label="Load Data"
                    icon="pi pi-sync"
                    :loading="loading"
                    @click="loadData"
                    class="h-[42px]"
                />
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- DataTable 1: Penjualan & Piutang               -->
        <!-- ═══════════════════════════════════════════════ -->
        <div class="card mb-4">
            <div class="flex flex-wrap items-center justify-between mb-3 gap-3">
                <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 m-0">
                    <i class="pi pi-chart-bar mr-2 text-blue-500"></i>Rekapitulasi Penjualan &amp; Piutang
                </h3>
                <div class="flex flex-wrap items-center gap-2">
                    <MultiSelect
                        v-model="selectedSalesmanPenjualan"
                        :options="salesmanOptionsPenjualan"
                        placeholder="Filter Salesman"
                        :maxSelectedLabels="2"
                        selectedItemsLabel="{0} salesman dipilih"
                        class="w-72"
                        filter
                        filterPlaceholder="Cari salesman..."
                    />
                    <Button
                        v-if="selectedSalesmanPenjualan.length > 0"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        text
                        rounded
                        @click="clearFilterPenjualan"
                        v-tooltip.top="'Hapus filter'"
                    />
                </div>
            </div>

            <!-- Filter info badge -->
            <div v-if="selectedSalesmanPenjualan.length > 0" class="mb-2">
                <Tag severity="info" class="text-sm">
                    <i class="pi pi-filter mr-1"></i>
                    Menampilkan {{ filteredPenjualan.length }} dari {{ dataPenjualan.length }} salesman
                </Tag>
            </div>

            <DataTable
                ref="dtPenjualan"
                :value="filteredPenjualan"
                :loading="loading"
                :rowClass="penjualanRowClass"
                scrollable
                scrollHeight="420px"
                showGridlines
                stripedRows
                :rowHover="true"
                tableStyle="min-width: 90rem"
                size="small"
            >
                <template #empty>
                    <div class="text-center py-6 text-surface-400">
                        <i class="pi pi-inbox text-3xl mb-2 block"></i>
                        Tidak ada data. Klik <b>Load Data</b> untuk memuat.
                    </div>
                </template>

                <!-- Multi-level header -->
                <ColumnGroup type="header">
                    <Row>
                        <Column header="Salesman" :rowspan="2" frozen style="min-width: 140px" />
                        <Column header="Penjualan" :colspan="3" headerClass="bg-blue-50 dark:bg-blue-900/30 text-center" />
                        <Column header="Penjualan Others" :colspan="3" headerClass="bg-indigo-50 dark:bg-indigo-900/30 text-center" />
                        <Column header="Product Focus" :colspan="2" headerClass="bg-cyan-50 dark:bg-cyan-900/30 text-center" />
                        <Column header="Piutang" :colspan="5" headerClass="bg-green-50 dark:bg-green-900/30 text-center" />
                    </Row>
                    <Row>
                        <Column header="Target" headerClass="bg-blue-50 dark:bg-blue-900/30" />
                        <Column header="Realisasi" headerClass="bg-blue-50 dark:bg-blue-900/30" />
                        <Column header="%" headerClass="bg-blue-50 dark:bg-blue-900/30" />
                        <Column header="Target" headerClass="bg-indigo-50 dark:bg-indigo-900/30" />
                        <Column header="Realisasi" headerClass="bg-indigo-50 dark:bg-indigo-900/30" />
                        <Column header="%" headerClass="bg-indigo-50 dark:bg-indigo-900/30" />
                        <Column header="Realisasi" headerClass="bg-cyan-50 dark:bg-cyan-900/30" />
                        <Column header="%" headerClass="bg-cyan-50 dark:bg-cyan-900/30" />
                        <Column header="Target" headerClass="bg-green-50 dark:bg-green-900/30" />
                        <Column header="Realisasi Tempo" headerClass="bg-green-50 dark:bg-green-900/30" />
                        <Column header="%" headerClass="bg-green-50 dark:bg-green-900/30" />
                        <Column header="Realisasi All" headerClass="bg-green-50 dark:bg-green-900/30" />
                        <Column header="%" headerClass="bg-green-50 dark:bg-green-900/30" />
                    </Row>
                </ColumnGroup>

                <!-- Footer totals (dynamic) -->
                <ColumnGroup type="footer">
                    <Row>
                        <Column footer="TOTAL" footerClass="font-bold" frozen />
                        <Column :footer="formatRupiah(summaryPenjualan.penjualan_target)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryPenjualan.penjualan_realisasi)" footerClass="font-bold text-right" />
                        <Column :footer="formatPersen(summaryPenjualan.penjualan_persen)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryPenjualan.others_target)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryPenjualan.others_realisasi)" footerClass="font-bold text-right" />
                        <Column :footer="formatPersen(summaryPenjualan.others_persen)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryPenjualan.pf_realisasi)" footerClass="font-bold text-right" />
                        <Column :footer="formatPersen(summaryPenjualan.pf_persen)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryPenjualan.piutang_target)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryPenjualan.piutang_realisasi_tempo)" footerClass="font-bold text-right" />
                        <Column :footer="formatPersen(summaryPenjualan.piutang_persen)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryPenjualan.piutang_realisasi_all)" footerClass="font-bold text-right" />
                        <Column :footer="formatPersen(summaryPenjualan.piutang_persen_all)" footerClass="font-bold text-right" />
                    </Row>
                </ColumnGroup>

                <!-- Data columns -->
                <Column field="salesman" frozen style="min-width: 140px; z-index: 1" bodyClass="font-semibold bg-surface-0 dark:bg-surface-900" />

                <Column field="penjualan_target" style="min-width: 120px; text-align: right">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.penjualan_target) }}</div></template>
                </Column>
                <Column field="penjualan_realisasi" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.penjualan_realisasi) }}</div></template>
                </Column>
                <Column field="penjualan_persen" style="min-width: 80px">
                    <template #body="{ data }">
                        <div class="text-right" :class="{ 'text-green-600 font-semibold': data.penjualan_persen >= 100, 'text-red-500': data.penjualan_persen > 0 && data.penjualan_persen < 50 }">
                            {{ formatPersen(data.penjualan_persen) }}
                        </div>
                    </template>
                </Column>
                <Column field="others_target" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.others_target) }}</div></template>
                </Column>
                <Column field="others_realisasi" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.others_realisasi) }}</div></template>
                </Column>
                <Column field="others_persen" style="min-width: 80px">
                    <template #body="{ data }"><div class="text-right">{{ formatPersen(data.others_persen) }}</div></template>
                </Column>
                <Column field="pf_realisasi" style="min-width: 130px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.pf_realisasi) }}</div></template>
                </Column>
                <Column field="pf_persen" style="min-width: 80px">
                    <template #body="{ data }"><div class="text-right">{{ formatPersen(data.pf_persen) }}</div></template>
                </Column>
                <Column field="piutang_target" style="min-width: 110px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.piutang_target) }}</div></template>
                </Column>
                <Column field="piutang_realisasi_tempo" style="min-width: 130px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.piutang_realisasi_tempo) }}</div></template>
                </Column>
                <Column field="piutang_persen" style="min-width: 80px">
                    <template #body="{ data }"><div class="text-right">{{ formatPersen(data.piutang_persen) }}</div></template>
                </Column>
                <Column field="piutang_realisasi_all" style="min-width: 130px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.piutang_realisasi_all) }}</div></template>
                </Column>
                <Column field="piutang_persen_all" style="min-width: 80px">
                    <template #body="{ data }">
                        <div class="text-right" :class="{ 'text-green-600 font-semibold': data.piutang_persen_all >= 70 }">
                            {{ formatPersen(data.piutang_persen_all) }}
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- DataTable 2: Inkaso & Komisi                    -->
        <!-- ═══════════════════════════════════════════════ -->
        <div class="card mb-4">
            <div class="flex flex-wrap items-center justify-between mb-3 gap-3">
                <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 m-0">
                    <i class="pi pi-wallet mr-2 text-green-500"></i>Inkaso &amp; Perhitungan Komisi
                </h3>
                <div class="flex flex-wrap items-center gap-2">
                    <MultiSelect
                        v-model="selectedSalesmanKomisi"
                        :options="salesmanOptionsKomisi"
                        placeholder="Filter Salesman"
                        :maxSelectedLabels="2"
                        selectedItemsLabel="{0} salesman dipilih"
                        class="w-72"
                        filter
                        filterPlaceholder="Cari salesman..."
                    />
                    <Button
                        v-if="selectedSalesmanKomisi.length > 0"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        text
                        rounded
                        @click="clearFilterKomisi"
                        v-tooltip.top="'Hapus filter'"
                    />
                </div>
            </div>

            <!-- Filter info badge -->
            <div v-if="selectedSalesmanKomisi.length > 0" class="mb-2">
                <Tag severity="info" class="text-sm">
                    <i class="pi pi-filter mr-1"></i>
                    Menampilkan {{ filteredKomisi.length }} dari {{ dataKomisi.length }} salesman
                </Tag>
            </div>

            <DataTable
                ref="dtKomisi"
                :value="filteredKomisi"
                :loading="loading"
                scrollable
                scrollHeight="420px"
                showGridlines
                stripedRows
                :rowHover="true"
                tableStyle="min-width: 180rem"
                size="small"
            >
                <template #empty>
                    <div class="text-center py-6 text-surface-400">
                        <i class="pi pi-inbox text-3xl mb-2 block"></i>
                        Tidak ada data.
                    </div>
                </template>

                <!-- Multi-level header -->
                <ColumnGroup type="header">
                    <Row>
                        <Column header="Salesman" :rowspan="2" frozen style="min-width: 140px" />
                        <Column header="Inkaso Riil" :rowspan="2" />
                        <Column header="Giro Bulan Lalu" :rowspan="2" />
                        <Column header="Pengurang" :colspan="5" headerClass="bg-red-50 dark:bg-red-900/30 text-center" />
                        <Column header="Pengali" :colspan="3" headerClass="bg-amber-50 dark:bg-amber-900/30 text-center" />
                        <Column header="Komisi Penjualan" :rowspan="2" headerClass="bg-emerald-50 dark:bg-emerald-900/30 text-center" />
                        <Column header="Komisi Inkaso 7-40 Hari" :colspan="2" headerClass="bg-teal-50 dark:bg-teal-900/30 text-center" />
                        <Column header="Komisi Inkaso 40-60 Hari" :colspan="2" headerClass="bg-cyan-50 dark:bg-cyan-900/30 text-center" />
                        <Column header="Komisi > 60 Hari" :colspan="2" headerClass="bg-sky-50 dark:bg-sky-900/30 text-center" />
                        <Column header="Komisi ≤ 7 Hari" :colspan="2" headerClass="bg-indigo-50 dark:bg-indigo-900/30 text-center" />
                        <Column header="Komisi PF" :rowspan="2" headerClass="bg-purple-50 dark:bg-purple-900/30 text-center" />
                        <Column header="Komisi Others" :rowspan="2" headerClass="bg-pink-50 dark:bg-pink-900/30 text-center" />
                        <Column header="Total Komisi" :rowspan="2" headerClass="bg-emerald-100 dark:bg-emerald-900/40 text-center font-bold" />
                    </Row>
                    <Row>
                        <!-- Pengurang sub-headers -->
                        <Column header="Biaya Promosi" headerClass="bg-red-50 dark:bg-red-900/30" />
                        <Column header="Fee Marketing" headerClass="bg-red-50 dark:bg-red-900/30" />
                        <Column header="Kontrak" headerClass="bg-red-50 dark:bg-red-900/30" />
                        <Column header="Dasar Tagihan" headerClass="bg-red-50 dark:bg-red-900/30" />
                        <Column header="Cash" headerClass="bg-red-50 dark:bg-red-900/30" />
                        <!-- Pengali sub-headers -->
                        <Column header="7-40 Hari" headerClass="bg-amber-50 dark:bg-amber-900/30" />
                        <Column header="40-60 Hari" headerClass="bg-amber-50 dark:bg-amber-900/30" />
                        <Column header="> 60 Hari" headerClass="bg-amber-50 dark:bg-amber-900/30" />
                        <!-- Komisi Inkaso 7-40 -->
                        <Column header="%" headerClass="bg-teal-50 dark:bg-teal-900/30" />
                        <Column header="Nilai" headerClass="bg-teal-50 dark:bg-teal-900/30" />
                        <!-- Komisi Inkaso 40-60 -->
                        <Column header="%" headerClass="bg-cyan-50 dark:bg-cyan-900/30" />
                        <Column header="Nilai" headerClass="bg-cyan-50 dark:bg-cyan-900/30" />
                        <!-- Komisi > 60 -->
                        <Column header="%" headerClass="bg-sky-50 dark:bg-sky-900/30" />
                        <Column header="Nilai" headerClass="bg-sky-50 dark:bg-sky-900/30" />
                        <!-- Komisi <= 7 -->
                        <Column header="%" headerClass="bg-indigo-50 dark:bg-indigo-900/30" />
                        <Column header="Nilai" headerClass="bg-indigo-50 dark:bg-indigo-900/30" />
                    </Row>
                </ColumnGroup>

                <!-- Footer totals (dynamic) -->
                <ColumnGroup type="footer">
                    <Row>
                        <Column footer="TOTAL" footerClass="font-bold" frozen />
                        <Column :footer="formatRupiah(summaryKomisi.inkaso_riil)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.giro_bulan_lalu)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.biaya_promosi)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.fee_marketing)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.kontrak)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.dasar_tagihan)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.cash)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.pengali_7_40)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.pengali_40_60)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.pengali_60)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.komisi_penjualan)" footerClass="font-bold text-right text-emerald-700" />
                        <Column footer="" />
                        <Column :footer="formatRupiah(summaryKomisi.komisi_inkaso_7_40_nilai)" footerClass="font-bold text-right" />
                        <Column footer="" />
                        <Column :footer="formatRupiah(summaryKomisi.komisi_inkaso_40_60_nilai)" footerClass="font-bold text-right" />
                        <Column footer="" />
                        <Column :footer="formatRupiah(summaryKomisi.komisi_60_nilai)" footerClass="font-bold text-right" />
                        <Column footer="" />
                        <Column :footer="formatRupiah(summaryKomisi.komisi_7_nilai)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.komisi_pf)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.komisi_others)" footerClass="font-bold text-right" />
                        <Column :footer="formatRupiah(summaryKomisi.total_komisi)" footerClass="font-extrabold text-right text-emerald-800 dark:text-emerald-300" />
                    </Row>
                </ColumnGroup>

                <!-- Data columns -->
                <Column field="salesman" frozen style="min-width: 140px; z-index: 1" bodyClass="font-semibold bg-surface-0 dark:bg-surface-900" />

                <Column field="inkaso_riil" style="min-width: 130px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.inkaso_riil) }}</div></template>
                </Column>
                <Column field="giro_bulan_lalu" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.giro_bulan_lalu) }}</div></template>
                </Column>

                <!-- Pengurang -->
                <Column field="biaya_promosi" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.biaya_promosi) }}</div></template>
                </Column>
                <Column field="fee_marketing" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.fee_marketing) }}</div></template>
                </Column>
                <Column field="kontrak" style="min-width: 100px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.kontrak) }}</div></template>
                </Column>
                <Column field="dasar_tagihan" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.dasar_tagihan) }}</div></template>
                </Column>
                <Column field="cash" style="min-width: 100px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.cash) }}</div></template>
                </Column>

                <!-- Pengali -->
                <Column field="pengali_7_40" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.pengali_7_40) }}</div></template>
                </Column>
                <Column field="pengali_40_60" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.pengali_40_60) }}</div></template>
                </Column>
                <Column field="pengali_60" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.pengali_60) }}</div></template>
                </Column>

                <!-- Komisi Penjualan -->
                <Column field="komisi_penjualan" style="min-width: 130px">
                    <template #body="{ data }">
                        <div class="text-right font-semibold text-emerald-600">{{ formatRupiah(data.komisi_penjualan) }}</div>
                    </template>
                </Column>

                <!-- Komisi Inkaso 7-40 -->
                <Column field="komisi_inkaso_7_40_persen" style="min-width: 70px">
                    <template #body="{ data }"><div class="text-right">{{ formatPersen(data.komisi_inkaso_7_40_persen) }}</div></template>
                </Column>
                <Column field="komisi_inkaso_7_40_nilai" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.komisi_inkaso_7_40_nilai) }}</div></template>
                </Column>

                <!-- Komisi Inkaso 40-60 -->
                <Column field="komisi_inkaso_40_60_persen" style="min-width: 70px">
                    <template #body="{ data }"><div class="text-right">{{ formatPersen(data.komisi_inkaso_40_60_persen) }}</div></template>
                </Column>
                <Column field="komisi_inkaso_40_60_nilai" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.komisi_inkaso_40_60_nilai) }}</div></template>
                </Column>

                <!-- Komisi > 60 -->
                <Column field="komisi_60_persen" style="min-width: 70px">
                    <template #body="{ data }"><div class="text-right">{{ formatPersen(data.komisi_60_persen) }}</div></template>
                </Column>
                <Column field="komisi_60_nilai" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.komisi_60_nilai) }}</div></template>
                </Column>

                <!-- Komisi <= 7 -->
                <Column field="komisi_7_persen" style="min-width: 70px">
                    <template #body="{ data }"><div class="text-right">{{ formatPersen(data.komisi_7_persen) }}</div></template>
                </Column>
                <Column field="komisi_7_nilai" style="min-width: 120px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.komisi_7_nilai) }}</div></template>
                </Column>

                <!-- Komisi PF -->
                <Column field="komisi_pf" style="min-width: 100px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.komisi_pf) }}</div></template>
                </Column>

                <!-- Komisi Others -->
                <Column field="komisi_others" style="min-width: 110px">
                    <template #body="{ data }"><div class="text-right">{{ formatRupiah(data.komisi_others) }}</div></template>
                </Column>

                <!-- Total Komisi -->
                <Column field="total_komisi" style="min-width: 130px">
                    <template #body="{ data }">
                        <div class="text-right font-bold text-emerald-700 dark:text-emerald-400">{{ formatRupiah(data.total_komisi) }}</div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Action Buttons -->
        <div class="card">
            <div class="flex flex-wrap gap-3">
                <Button
                    label="Export"
                    icon="pi pi-file-excel"
                    severity="success"
                    outlined
                    @click="exportPenjualan"
                    v-tooltip.top="'Export DataTable Penjualan ke CSV'"
                />
                <Button
                    label="Export Komisi"
                    icon="pi pi-file-excel"
                    severity="info"
                    outlined
                    @click="exportKomisi"
                    v-tooltip.top="'Export DataTable Komisi ke CSV'"
                />
                <Button
                    label="Cetak Komisi"
                    icon="pi pi-print"
                    severity="warn"
                    outlined
                    @click="cetakKomisi"
                    v-tooltip.top="'Print / Simpan sebagai PDF'"
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.komisi-salesman-page {
    :deep(.row-good) {
        background-color: rgba(34, 197, 94, 0.06) !important;
    }

    :deep(.row-average) {
        background-color: rgba(234, 179, 8, 0.04) !important;
    }

    :deep(.p-datatable) {
        .p-datatable-thead > tr > th {
            font-size: 0.8rem;
            padding: 0.5rem 0.65rem;
            white-space: nowrap;
        }

        .p-datatable-tbody > tr > td {
            font-size: 0.8rem;
            padding: 0.4rem 0.65rem;
        }

        .p-datatable-tfoot > tr > td {
            font-size: 0.8rem;
            padding: 0.5rem 0.65rem;
            background-color: var(--p-surface-100);
        }
    }

    :deep(.p-datatable-frozen-column) {
        border-right: 2px solid var(--p-surface-300) !important;
    }
}

@media print {
    .komisi-salesman-page {
        :deep(.p-datatable) {
            .p-datatable-wrapper {
                overflow: visible !important;
            }
        }
    }
}
</style>