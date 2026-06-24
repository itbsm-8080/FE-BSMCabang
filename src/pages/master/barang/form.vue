<template>
    <div class="barang-form-page">
        <!-- Form Body -->
        <div class="form-body">
            <!-- Section: Informasi Barang -->
            <FormSection :title="isEdit ? `Edit Barang - ${form.Kode}` : 'Tambah Barang'" icon="pi-box">
                <div class="form-row cols-3">
                    <FormField label="Kode">
                        <InputText v-model="form.Kode" disabled class="compact-input" />
                    </FormField>
                    <FormField label="Nama Barang" required>
                        <InputText v-model="form.Nama" placeholder="Masukkan nama lengkap barang" class="compact-input" :class="{ 'p-invalid': !form.Nama && showValidation }" />
                    </FormField>
                    <div class="status-row">
                        <span class="status-label">Status</span>
                        <div class="status-checks">
                            <label class="check-item"><input type="checkbox" v-model="form.status.IsAktif" /> Aktif</label>
                            <label class="check-item"><input type="checkbox" v-model="form.status.IsStok" /> Stok</label>
                            <label class="check-item"><input type="checkbox" v-model="form.status.IsExpired" /> Expired</label>
                            <label class="check-item"><input type="checkbox" v-model="form.status.ProductFocus" /> Focus</label>
                        </div>
                    </div>
                </div>

                <div class="form-row cols-3">
                    <FormField label="Satuan" required>
                        <InputText v-model="form.Satuan" placeholder="PCS, UNIT" class="compact-input" :class="{ 'p-invalid': !form.Satuan && showValidation }" />
                    </FormField>
                    <FormField label="Tipe" required>
                        <Select v-model="form.Tipe" :options="tipeOptions" optionLabel="nama" optionValue="kode" placeholder="Pilih tipe" class="compact-input" :class="{ 'p-invalid': !form.Tipe && showValidation }" />
                    </FormField>
                    <FormField label="Merk">
                        <InputText v-model="form.Merk" placeholder="Merk" class="compact-input" />
                    </FormField>
                </div>

                <div class="form-row cols-3">
                    <FormField label="Kategori">
                        <Select v-model="form.Kategori" :options="kategoriOptions" optionLabel="nama" optionValue="kode" placeholder="Pilih" class="compact-input" showClear filter />
                    </FormField>
                    <FormField label="Gudang">
                        <Select v-model="form.Gudang" :options="gudangOptions" optionLabel="nama" optionValue="kode" placeholder="Pilih" class="compact-input" showClear />
                    </FormField>
<FormField label="Pemasok">
    <LookupSupplier 
        v-model="form.PemasokKode"
        v-model:displayName="form.PemasokNama"
    />
</FormField>
                </div>

                <div class="form-row cols-3">
                    <FormField label="Harga Beli">
                        <InputNumber v-model="form.HargaBeli" mode="currency" currency="IDR" locale="id-ID" placeholder="0" class="compact-input" />
                    </FormField>
                    <FormField label="Harga Jual" required>
                        <InputNumber v-model="form.HargaJual" mode="currency" currency="IDR" locale="id-ID" placeholder="0" class="compact-input" :class="{ 'p-invalid': !form.HargaJual && showValidation }" />
                    </FormField>
                    <FormField label="HET">
                        <InputNumber v-model="form.HET" mode="currency" currency="IDR" locale="id-ID" placeholder="0" class="compact-input" />
                    </FormField>
                </div>

                <div class="form-row cols-3">
                    <FormField label="Disc (%)">
                        <InputNumber v-model="form.DiscSalesman" mode="decimal" :min="0" :max="100" placeholder="0" class="compact-input" />
                    </FormField>
                    <FormField label="Min Stok">
                        <InputNumber v-model="form.MinStok" placeholder="0" class="compact-input" />
                    </FormField>
                    <FormField label="Max Stok">
                        <InputNumber v-model="form.MaxStok" placeholder="0" class="compact-input" />
                    </FormField>
                </div>

                <!-- Margin Info -->
                <!-- <div v-if="form.HargaBeli > 0 && form.HargaJual > 0" class="margin-info" :class="marginClass">
                    <i :class="marginIcon"></i>
                    <span>Margin: {{ formatCurrency(form.HargaJual - form.HargaBeli) }} ({{ marginPercent }}%)</span>
                </div> -->
            </FormSection>

            <!-- Section: Harga Khusus -->
            <FormSection title="Harga per Jenis Customer" icon="pi-users">
                <DataTable :value="hargaKhususGrid" size="small" class="harga-grid" stripedRows sortField="kode" :sortOrder="1">
                    <Column header="#" style="width: 40px; text-align: center">
                        <template #body="{ index }">{{ index + 1 }}</template>
                    </Column>
                    <Column field="kode" header="Kode" style="width: 60px" sortable />
                    <Column field="nama" header="Jenis Customer" />
                    <Column field="hargajual" header="Harga Khusus" style="width: 200px">
                        <template #body="{ data, index }">
                            <InputNumber v-model="hargaKhususGrid[index].hargajual" mode="currency" currency="IDR" locale="id-ID" placeholder="0" size="small" class="w-full" />
                        </template>
                    </Column>
                </DataTable>
            </FormSection>
        </div>

        <!-- Bottom Bar -->
        <div class="form-bottom-bar">
            <div class="validation-error" v-if="!isFormValid && showValidation">
                <i class="pi pi-exclamation-circle"></i>
                <span>Lengkapi field wajib</span>
            </div>
            <div v-else></div>
            <div class="bottom-actions">
                <Button label="Batal" severity="secondary" text size="small" @click="navigateTo('/master/barang')" />
                <Button label="Simpan & Baru" severity="secondary" size="small" :loading="saving" @click="saveAndNew" />
                <Button :label="isEdit ? 'Update' : 'Simpan'" severity="primary" size="small" :loading="saving" @click="saveAndClose" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import FormSection from '~/components/common/FormSection.vue'
import FormField from '~/components/common/FormField.vue'
import LookupSupplier from '~/components/common/LookupSupplier.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $api } = useNuxtApp()

const isEdit = ref(false)
const saving = ref(false)
const showValidation = ref(false)
const formId = ref<string | null>(null)

const form = reactive({
    Kode: '', Nama: '', Tipe: '', Satuan: '', Kategori: '', Merk: '',
    Gudang: '', PemasokKode: '', PemasokNama: '',
    HargaBeli: 0, HargaJual: 0, HET: 0, MinStok: 0, MaxStok: 0, DiscSalesman: 0,
    status: { IsAktif: true, IsStok: true, IsExpired: false, ProductFocus: false }
})

const tipeOptions = ref<any[]>([])
const kategoriOptions = ref<any[]>([])
const gudangOptions = ref<any[]>([])
const hargaKhususGrid = ref<any[]>([])

const isFormValid = computed(() => form.Tipe && form.Nama && form.Satuan && form.HargaJual > 0)

const marginPercent = computed(() => {
    if (!form.HargaBeli || !form.HargaJual) return '0'
    return (((form.HargaJual - form.HargaBeli) / form.HargaBeli) * 100).toFixed(1)
})
const marginClass = computed(() => { const m = parseFloat(marginPercent.value); if (m < 10) return 'danger'; if (m < 25) return 'warning'; return 'success' })
const marginIcon = computed(() => { const m = parseFloat(marginPercent.value); if (m < 10) return 'pi pi-exclamation-triangle'; if (m < 25) return 'pi pi-info-circle'; return 'pi pi-check-circle' })
const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

// Loaders
const loadOptions = async () => { try { const { data } = await $api.get('/v1/barang/form-options'); if (data.success) { tipeOptions.value = data.data.tipe; kategoriOptions.value = data.data.kategori; gudangOptions.value = data.data.gudang } } catch (e) { console.error(e) } }
const loadHargaKhusus = async (kode?: string) => { try { const t = kode || form.Kode; if (!t && !isEdit.value) { const { data } = await $api.get('/jenis-customer'); if (data.success) hargaKhususGrid.value = data.data.map((i: any) => ({ kode: i.kode, nama: i.nama, hargajual: 0 })); return }; const { data } = await $api.get(`/v1/barang/${t}/harga-khusus`); if (data.success) hargaKhususGrid.value = data.data.map((i: any) => ({ kode: i.kode, nama: i.nama, hargajual: parseFloat(i.hargajual) || 0 })) } catch (e) { console.error(e) } }
const loadFormData = async (kode: string) => { try { const { data } = await $api.get(`/v1/barang/${kode}`); if (data.success) { const d = data.data; Object.assign(form, { Kode: d.Kode || '', Nama: d.Nama || '', Tipe: d.Tipe || '', Satuan: d.Satuan || '', Kategori: d.Kategori || '', Merk: d.Merk || '', Gudang: d.Gudang || '', PemasokKode: d.Pemasok || '', PemasokNama: '', HargaBeli: d.HargaBeli || 0, HargaJual: d.HargaJual || 0, HET: d.HET || 0, MinStok: d.MinStok || 0, MaxStok: d.MaxStok || 0, DiscSalesman: d.DiscSalesman || 0, status: { IsAktif: d.IsAktif == 1, IsStok: d.IsStok == 1, IsExpired: d.IsExpired == 1, ProductFocus: d.Product_Focus == 1 } }) } } catch (e: any) { toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 }) } }
const generateKode = async () => { try { const { data } = await $api.get('/v1/barang/max-kode'); if (data.success) form.Kode = data.kode } catch (e) { console.error(e) } }

// Save
const saveData = async () => {
    if (!isFormValid.value) { showValidation.value = true; toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Lengkapi field wajib', life: 2000 }); return false }
    saving.value = true
    try {
        const p: any = { Kode: form.Kode, Nama: form.Nama, Tipe: form.Tipe, Satuan: form.Satuan, Kategori: form.Kategori, Merk: form.Merk, Gudang: form.Gudang, Pemasok: form.PemasokKode, IsAktif: form.status.IsAktif ? 1 : 0, IsStok: form.status.IsStok ? 1 : 0, IsExpired: form.status.IsExpired ? 1 : 0, Product_Focus: form.status.ProductFocus ? 1 : 0, HargaBeli: form.HargaBeli, HargaJual: form.HargaJual, HET: form.HET, MinStok: form.MinStok, MaxStok: form.MaxStok, DiscSalesman: form.DiscSalesman, HargaKhusus: hargaKhususGrid.value }
        const res = isEdit.value ? await $api.put(`/v1/barang/${formId.value}`, p) : await $api.post('/v1/barang', p)
        if (res.data.success) { toast.add({ severity: 'success', summary: 'Berhasil', detail: isEdit.value ? 'Diupdate' : 'Disimpan', life: 2000 }); return true }
        return false
    } catch (e: any) { toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Error', life: 3000 }); return false }
    finally { saving.value = false }
}

const saveAndClose = async () => { if (await saveData()) navigateTo('/master/barang') }
const saveAndNew = async () => { if (!await saveData()) return; isEdit.value = false; formId.value = null; showValidation.value = false; Object.assign(form, { Kode: '', Nama: '', Tipe: '', Satuan: '', Kategori: '', Merk: '', Gudang: '', PemasokKode: '', PemasokNama: '', HargaBeli: 0, HargaJual: 0, HET: 0, MinStok: 0, MaxStok: 0, DiscSalesman: 0, status: { IsAktif: true, IsStok: true, IsExpired: false, ProductFocus: false } }); await generateKode(); await loadHargaKhusus() }

onMounted(async () => { await loadOptions(); const id = route.query.id as string; if (id) { isEdit.value = true; formId.value = id; await loadFormData(id); await loadHargaKhusus(id) } else { await generateKode(); await loadHargaKhusus() } })
</script>

<style lang="scss" scoped>
.barang-form-page { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.form-body { flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; }

.form-row { display: grid; gap: 0.5rem; margin-bottom: 0.125rem;
    &.cols-1 { grid-template-columns: 1fr; }
    &.cols-2 { grid-template-columns: repeat(2, 1fr); }
    &.cols-3 { grid-template-columns: repeat(3, 1fr); }
    &.cols-4 { grid-template-columns: repeat(4, 1fr); }
    @media (max-width: 900px) { &.cols-4, &.cols-3 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { &.cols-2, &.cols-3, &.cols-4 { grid-template-columns: 1fr; } }
}

.margin-info { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.688rem; font-weight: 500;
    &.danger { background: #fef2f2; color: #dc2626; }
    &.warning { background: #fffbeb; color: #d97706; }
    &.success { background: #ecfdf5; color: #059669; }
}

.status-row { display: flex; flex-direction: column; gap: 0.25rem; }
.status-label { font-size: 0.688rem; font-weight: 600; color: var(--text-color-secondary); text-transform: uppercase; letter-spacing: 0.025em; }
.status-checks { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.check-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; cursor: pointer; color: var(--text-color);
    input[type="checkbox"] { width: 0.875rem; height: 0.875rem; accent-color: var(--primary-500); cursor: pointer; }
}

.harga-grid {
    :deep(.p-datatable-thead > tr > th) { font-size: 0.688rem; padding: 0.375rem 0.5rem; }
    :deep(.p-datatable-tbody > tr > td) { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
    :deep(.p-inputnumber-input) { font-size: 0.75rem !important; padding: 0.25rem 0.5rem !important; height: 1.75rem !important; }
}

.form-bottom-bar {
    background: var(--surface-card); border-top: 1px solid var(--surface-border);
    padding: 0.5rem 0.75rem; flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between;
    .validation-error { display: flex; align-items: center; gap: 0.25rem; color: #dc2626; font-size: 0.688rem; flex-shrink: 0; }
    .bottom-actions { display: flex; gap: 0.375rem; flex-shrink: 0; margin-left: auto; }
}

:deep(.compact-input.p-inputtext),
:deep(.compact-input .p-inputtext),
:deep(.compact-input .p-inputnumber-input) { 
    font-size: 0.75rem !important; padding: 0.25rem 0.5rem !important; height: 1.875rem !important; 
}

:deep(.compact-input.p-select) {
    font-size: 0.75rem !important; height: 1.875rem !important;
    .p-select-label { font-size: 0.75rem !important; padding: 0.25rem 0.5rem !important; display: flex !important; align-items: center !important; }
    .p-select-dropdown { width: 1.5rem !important; }
}

:deep(.form-field) { min-width: 0; }
</style>