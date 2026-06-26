<template>
    <div class="customer-form-page">
        <!-- Header -->
        <div class="form-header">
            <div class="header-left">
                <Button 
                    icon="pi pi-arrow-left" 
                    text 
                    rounded
                    @click="navigateTo('/master/customer')"
                />
                <div class="header-icon">
                    <i class="pi pi-users"></i>
                </div>
                <div class="header-text">
                    <h1>{{ isEdit ? 'Edit Customer' : 'Tambah Customer' }}</h1>
                    <span v-if="isEdit" class="header-badge">{{ formData.Kode }}</span>
                </div>
            </div>
            <div class="header-actions">
                <Button label="Batal" severity="secondary" text @click="navigateTo('/master/customer')" />
                <Button label="Simpan & Baru" severity="secondary" :loading="saving" @click="saveAndNew" />
                <Button :label="isEdit ? 'Update' : 'Simpan'" severity="primary" :loading="saving" @click="saveAndClose" />
            </div>
        </div>

        <!-- Form Content -->
        <div class="form-content">
            
            <!-- SECTION 1: DATA CUSTOMER -->
            <div class="form-section">
                <div class="section-header">
                    <i class="pi pi-user"></i>
                    <h2>Data Customer</h2>
                </div>
                
                <div class="form-grid">
                    <!-- Row 1: Kode, Nama -->
                    <div class="field-group" style="grid-column: span 1;">
                        <label>Kode Customer</label>
                        <InputText v-model="formData.Kode" placeholder="Otomatis" disabled class="disabled-input" />
                    </div>
                    <div class="field-group" style="grid-column: span 2;">
                        <label>Nama Customer <span class="required">*</span></label>
                        <InputText v-model="formData.Nama" placeholder="Masukkan nama customer" :class="{ 'p-invalid': !formData.Nama && showValidation }" />
                    </div>

                    <!-- Row 2: Alamat -->
                    <div class="field-group full-width">
                        <label>Alamat</label>
                        <Textarea v-model="formData.Alamat" placeholder="Masukkan alamat lengkap" rows="2" />
                    </div>

                    <!-- Row 3: Kota, Telp, Fax -->
                    <div class="field-group">
                        <label>Kota</label>
                        <InputText v-model="formData.Kota" placeholder="Kota" />
                    </div>
                    <div class="field-group">
                        <label>Telepon</label>
                        <InputText v-model="formData.Telp" placeholder="Nomor telepon" />
                    </div>
                    <div class="field-group">
                        <label>Fax</label>
                        <InputText v-model="formData.Fax" placeholder="Nomor fax" />
                    </div>

                    <!-- Row 4: Email, TOP, Jenis Customer -->
                    <div class="field-group">
                        <label>Email</label>
                        <InputText v-model="formData.Email" placeholder="Alamat email" />
                    </div>
                    <div class="field-group">
                        <label>TOP (Hari)</label>
                        <InputNumber v-model="formData.Top" placeholder="0" :disabled="!canEditTOP" />
                        <small v-if="!canEditTOP" class="field-hint">Hanya Finance</small>
                    </div>
                    <div class="field-group">
                        <label>Jenis Customer</label>
                        <Select 
                            v-model="formData.JenisCustomer" 
                            :options="jenisCustomerOptions" 
                            optionLabel="nama" 
                            optionValue="kode"
                            placeholder="Pilih jenis customer"
                            showClear
                        />
                    </div>

                    <!-- Row 5: Contact Person, Ship Address -->
                    <div class="field-group">
                        <label>Contact Person</label>
                        <InputText v-model="formData.Contact" placeholder="Nama contact" />
                    </div>
                    <div class="field-group full-width">
                        <label>Alamat Pengiriman</label>
                        <Textarea v-model="formData.ShipAddress" placeholder="Alamat pengiriman (jika berbeda)" rows="2" />
                    </div>

                    <!-- Row 6: Golongan, Marketing -->
                    <div class="field-group">
                        <label>Golongan Customer <span class="required">*</span></label>
                        <Select 
                            v-model="formData.Golongan" 
                            :options="golonganOptions" 
                            optionLabel="nama" 
                            optionValue="kode"
                            placeholder="Pilih golongan"
                            :class="{ 'p-invalid': !formData.Golongan && showValidation }"
                        />
                    </div>
                    <div class="field-group marketing-group">
                        <label>Marketing</label>
                        <div class="marketing-input">
                            <InputText v-model="formData.MarketingKode" placeholder="Kode" readonly class="marketing-kode" />
                            <Button icon="pi pi-search" severity="secondary" @click="openMarketingLookup" />
                            <InputText v-model="formData.MarketingNama" placeholder="Nama Marketing" readonly class="marketing-nama" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION 2: DATA PAJAK -->
            <div class="form-section">
                <div class="section-header">
                    <i class="pi pi-file"></i>
                    <h2>Data Pajak</h2>
                    <div class="section-action">
                        <Checkbox v-model="copyFromCustomer" inputId="copyData" :binary="true" />
                        <label for="copyData">Sama dengan data Customer</label>
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="field-group full-width">
                        <label>NPWP</label>
                        <InputText v-model="formData.NPWP" placeholder="Nomor NPWP" />
                    </div>
                    <div class="field-group full-width">
                        <label>Nama NPWP</label>
                        <InputText v-model="formData.NamaNPWP" placeholder="Nama terdaftar NPWP" />
                    </div>
                    <div class="field-group full-width">
                        <label>Alamat NPWP</label>
                        <Textarea v-model="formData.AlamatNPWP" placeholder="Alamat sesuai NPWP" rows="2" />
                    </div>
                    <div class="field-group">
                        <label>Kota NPWP</label>
                        <InputText v-model="formData.KotaNPWP" placeholder="Kota sesuai NPWP" />
                    </div>
                </div>
            </div>

        </div>

        <!-- Lookup Modal -->
        <LookupModal 
            ref="marketingLookupRef"
            title="Pilih Marketing"
            :columns="marketingColumns"
            :data="marketingData"
            :loading="marketingLoading"
            @select="onMarketingSelect"
            width="700px"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '~/stores/auth'
import LookupModal from '~/components/common/LookupModal.vue'

definePageMeta({
    layout: 'default'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const { $api } = useNuxtApp()

// State
const isEdit = ref(false)
const saving = ref(false)
const showValidation = ref(false)
const formId = ref<string | null>(null)
const copyFromCustomer = ref(false)

// Form Data
const formData = reactive({
    Kode: '',
    Nama: '',
    Alamat: '',
    Kota: '',
    Telp: '',
    Fax: '',
    Email: '',
    Top: 0,
    JenisCustomer: null,
    Contact: '',
    ShipAddress: '',
    Golongan: null,
    MarketingKode: '',
    MarketingNama: '',
    NPWP: '',
    NamaNPWP: '',
    AlamatNPWP: '',
    KotaNPWP: ''
})

// Options
const jenisCustomerOptions = ref<any[]>([])
const golonganOptions = ref<any[]>([])

// Marketing Lookup
const marketingLookupRef = ref<InstanceType<typeof LookupModal> | null>(null)
const marketingData = ref<any[]>([])
const marketingLoading = ref(false)
const marketingColumns = [
    { field: 'sls_kode', header: 'Kode', width: '100px' },
    { field: 'sls_nama', header: 'Nama Salesman', minWidth: '200px' },
    { field: 'sls_alamat', header: 'Alamat', minWidth: '250px' }
]

// Computed
const canEditTOP = computed(() => {
    return authStore.user?.kode === 'FINANCE'
})

// Watch copyFromCustomer
watch(copyFromCustomer, (val) => {
    if (val) {
        formData.NamaNPWP = formData.Nama
        formData.AlamatNPWP = formData.Alamat
        formData.KotaNPWP = formData.Kota
    }
})

// Methods
const generateKode = async () => {
    try {
        const response = await $api.get('/v1/customer/max-kode')
        if (response.data.success) {
            formData.Kode = response.data.kode
        }
    } catch (error) {
        console.error('Failed to generate kode:', error)
    }
}

const loadOptions = async () => {
    try {
        const [jenis, golongan] = await Promise.all([
            $api.get('/jenis-customer'),
            $api.get('/golongan-customer')
        ])
        
        jenisCustomerOptions.value = jenis.data.data || []
        golonganOptions.value = golongan.data.data || []
    } catch (error) {
        console.error('Failed to load options:', error)
    }
}

const loadMarketingData = async () => {
    marketingLoading.value = true
    try {
        const response = await $api.get('/salesman')
        if (response.data.success) {
            marketingData.value = response.data.data
        }
    } catch (error) {
        console.error('Failed to load marketing:', error)
    } finally {
        marketingLoading.value = false
    }
}

const openMarketingLookup = () => {
    marketingLookupRef.value?.open()
}

const onMarketingSelect = (item: any) => {
    formData.MarketingKode = item.sls_kode
    formData.MarketingNama = item.sls_nama
}

const loadData = async (kode: string) => {
    try {
        const response = await $api.get(`/v1/customer/${kode}`)
        if (response.data.success) {
            const data = response.data.data
            Object.assign(formData, {
                Kode: data.Kode,
                Nama: data.Nama,
                Alamat: data.Alamat,
                Kota: data.Kota,
                Telp: data.Telp,
                Fax: data.Fax,
                Email: data.Email,
                Top: data.Top,
                JenisCustomer: data.JenisCustomer,
                Contact: data.Contact,
                ShipAddress: data.ShipAddress,
                Golongan: data.Golongan,
                MarketingKode: data.MarketingKode || '',
                MarketingNama: data.MarketingNama || '',
                NPWP: data.NPWP || '',
                NamaNPWP: data.NamaNPWP || '',
                AlamatNPWP: data.AlamatNPWP || '',
                KotaNPWP: data.KotaNPWP || ''
            })
        }
    } catch (error) {
        console.error('Failed to load data:', error)
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 })
    }
}

const saveData = async () => {
    if (!formData.Nama || !formData.Golongan) {
        showValidation.value = true
        toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Lengkapi field wajib', life: 3000 })
        return false
    }
    
    saving.value = true
    try {
        const payload = { ...formData }
        
        let response
        if (isEdit.value) {
            response = await $api.put(`/v1/customer/${formId.value}`, payload)
        } else {
            response = await $api.post('/v1/customer', payload)
        }
        
        if (response.data.success) {
            toast.add({ 
                severity: 'success', 
                summary: 'Berhasil', 
                detail: isEdit.value ? 'Customer diupdate' : 'Customer disimpan', 
                life: 3000 
            })
            return true
        }
        return false
    } catch (error: any) {
        toast.add({ 
            severity: 'error', 
            summary: 'Gagal', 
            detail: error.response?.data?.message || 'Gagal menyimpan', 
            life: 3000 
        })
        return false
    } finally {
        saving.value = false
    }
}

const saveAndClose = async () => {
    const success = await saveData()
    if (success) navigateTo('/master/customer')
}

const saveAndNew = async () => {
    const success = await saveData()
    if (success) {
        isEdit.value = false
        formId.value = null
        showValidation.value = false
        copyFromCustomer.value = false
        Object.assign(formData, {
            Kode: '', Nama: '', Alamat: '', Kota: '', Telp: '', Fax: '', Email: '',
            Top: 0, JenisCustomer: null, Contact: '', ShipAddress: '', Golongan: null,
            MarketingKode: '', MarketingNama: '', NPWP: '', NamaNPWP: '', AlamatNPWP: '', KotaNPWP: ''
        })
        await generateKode()
    }
}

// Lifecycle
onMounted(async () => {
    await Promise.all([loadOptions(), loadMarketingData()])
    
    const id = route.query.id as string
    if (id) {
        isEdit.value = true
        formId.value = id
        await loadData(id)
    } else {
        await generateKode()
    }
})
</script>

<style lang="scss" scoped>
.customer-form-page {
    min-height: 100vh;
    background: #f8fafc;
    padding-bottom: 2rem;
}

// Header
.form-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding: 0.75rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .header-icon {
            width: 2.5rem;
            height: 2.5rem;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            border-radius: 0.625rem;
            display: flex;
            align-items: center;
            justify-content: center;
            
            i { font-size: 1.25rem; color: white; }
        }
        
        h1 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
        }
        
        .header-badge {
            padding: 0.25rem 0.625rem;
            background: #dbeafe;
            border-radius: 1rem;
            color: #1e40af;
            font-size: 0.75rem;
            font-weight: 600;
        }
    }
    
    .header-actions {
        display: flex;
        gap: 0.625rem;
    }
}

// Form Content
.form-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

// Section
.form-section {
    background: white;
    border-radius: 0.875rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    border: 1px solid #f1f5f9;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    
    i { color: #3b82f6; font-size: 1.1rem; }
    
    h2 {
        font-size: 1rem;
        font-weight: 600;
        color: #0f172a;
        margin: 0;
    }
    
    .section-action {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        label {
            font-size: 0.8rem;
            color: #475569;
            cursor: pointer;
        }
    }
}

// Form Grid
.form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem 1.25rem;
    
    .full-width {
        grid-column: span 3;
    }
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    
    label {
        font-size: 0.7rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        
        .required { color: #dc2626; }
    }
    
    .field-hint {
        font-size: 0.6rem;
        color: #94a3b8;
    }
    
    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-inputnumber-input),
    :deep(.p-textarea) {
        border-radius: 0.4rem;
        border: 1.5px solid #e2e8f0;
        font-size: 0.8rem;
        
        &:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        &.p-invalid {
            border-color: #dc2626;
        }
    }
    
    :deep(.p-inputtext),
    :deep(.p-select) {
        height: 2.35rem;
    }
    
    .disabled-input {
        background: #f1f5f9;
        color: #64748b;
    }
}

// Marketing Input
.marketing-group {
    grid-column: span 2;
}

.marketing-input {
    display: flex;
    gap: 0.5rem;
    
    .marketing-kode {
        width: 100px;
    }
    
    .marketing-nama {
        flex: 1;
    }
}

// Responsive
@media (max-width: 768px) {
    .form-header {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        
        .header-actions {
            width: 100%;
            
            button { flex: 1; }
        }
    }
    
    .form-content {
        padding: 1rem;
    }
    
    .form-grid {
        grid-template-columns: 1fr;
        
        .full-width {
            grid-column: span 1;
        }
    }
    
    .marketing-input {
        flex-wrap: wrap;
        
        .marketing-kode {
            width: 100%;
        }
    }
}
</style>