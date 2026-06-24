<template>
    <div class="master-form-page">
        <!-- Header -->
        <div class="form-header">
            <div class="form-header-left">
                <Button icon="pi pi-arrow-left" text rounded size="large" @click="goBack" class="back-btn" />
                <div class="form-header-icon">
                    <i :class="['pi', config.formIcon || 'pi-file']"></i>
                </div>
                <div class="form-header-text">
                    <h1>{{ isEdit ? (config.formTitleEdit || `Edit ${config.formTitle || 'Data'}`) : (config.formTitleAdd || `Tambah ${config.formTitle || 'Data'}`) }}</h1>
                    <span v-if="isEdit" class="form-header-badge">{{ formData[config.primaryKey] }}</span>
                </div>
            </div>
        </div>

        <!-- Form Content -->
        <div class="form-content">
            <div class="form-grid">
                <template v-for="field in visibleFields" :key="field.field">
                    <div class="form-field" :class="{ 'full-width': field.fullWidth }" :style="{ gridColumn: field.colSpan ? `span ${field.colSpan}` : 'span 1' }">
                        <label>
                            {{ field.label }}
                            <span v-if="field.required" class="required">*</span>
                        </label>

                        <!-- TEXT -->
                        <InputText v-if="field.type === 'text'" v-model="formData[field.field]" :placeholder="field.placeholder" :disabled="field.disabled" :class="{ 'p-invalid': field.required && !formData[field.field] && showValidation }" />

                        <!-- TEXTAREA -->
                        <Textarea v-else-if="field.type === 'textarea'" v-model="formData[field.field]" :placeholder="field.placeholder" :disabled="field.disabled" rows="2" />

                        <!-- NUMBER -->
                        <InputNumber v-else-if="field.type === 'number'" v-model="formData[field.field]" :placeholder="field.placeholder" :min="field.min" :max="field.max" :disabled="field.disabled" class="w-full" />

                        <!-- CURRENCY -->
                        <InputNumber v-else-if="field.type === 'currency'" v-model="formData[field.field]" mode="currency" currency="IDR" locale="id-ID" :placeholder="field.placeholder" :disabled="field.disabled" class="w-full" />

                        <!-- DATE -->
                        <DatePicker v-else-if="field.type === 'date'" v-model="formData[field.field]" dateFormat="yy-mm-dd" showIcon :disabled="field.disabled" class="w-full" />

                        <!-- SELECT -->
                        <Select v-else-if="field.type === 'select'" v-model="formData[field.field]" :options="selectOptions[field.field] || field.options || []" optionLabel="label" optionValue="value" :placeholder="field.placeholder" :disabled="field.disabled" showClear filter class="w-full" />

                        <!-- BOOLEAN -->
                        <ToggleSwitch v-else-if="field.type === 'boolean'" v-model="formData[field.field]" />

                        <!-- LOOKUP -->
                        <div v-else-if="field.type === 'lookup'" class="lookup-input-group">
                            <InputText :value="formData[field.lookupConfig?.displayField || field.field + '_display']" readonly :placeholder="field.placeholder" class="lookup-display" />
                            <Button icon="pi pi-search" severity="secondary" @click="openLookup(field)" />
                        </div>

                        <!-- HELP TEXT -->
                        <small v-if="field.helpText" class="field-help">{{ field.helpText }}</small>
                    </div>
                </template>
            </div>

            <!-- Grid Section (harga khusus, dll) -->
            <div v-if="config.gridConfig" class="form-section">
                <div class="section-header">
                    <i :class="['pi', config.gridConfig.icon || 'pi-list']"></i>
                    <span>{{ config.gridConfig.title }}</span>
                </div>
                <DataTable :value="gridData" size="small" class="form-grid-table" stripedRows>
                    <Column v-for="col in config.gridConfig.columns" :key="col.field" :field="col.field" :header="col.header" :style="{ width: col.width || 'auto' }">
                        <template #body="{ data, index }">
                            <InputText v-if="col.editable && col.type !== 'currency'" v-model="gridData[index][col.field]" size="small" class="w-full" />
                            <InputNumber v-else-if="col.editable && col.type === 'currency'" v-model="gridData[index][col.field]" mode="currency" currency="IDR" locale="id-ID" size="small" class="w-full" />
                            <span v-else>{{ data[col.field] }}</span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- Bottom Bar -->
        <div class="form-bottom-bar">
            <div class="bottom-bar-inner">
                <div class="validation-error" v-if="!isFormValid && showValidation">
                    <i class="pi pi-exclamation-circle"></i>
                    <span>Lengkapi field yang wajib diisi</span>
                </div>
                <div class="bottom-actions">
                    <Button label="Batal" severity="secondary" text @click="goBack" />
                    <Button label="Simpan & Baru" severity="secondary" :loading="saving" @click="saveAndNew" />
                    <Button :label="isEdit ? 'Update' : 'Simpan'" severity="primary" :loading="saving" @click="saveAndClose" />
                </div>
            </div>
        </div>

        <!-- Lookup Modal -->
        <LookupModal ref="lookupModalRef" :title="currentLookupTitle" :columns="currentLookupColumns" :data="lookupData" :loading="lookupLoading" :width="currentLookupWidth" @select="onLookupSelect" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '~/stores/auth'
import LookupModal from '~/components/common/LookupModal.vue'
import type { MasterConfig, FormFieldConfig, LookupConfig } from '~/composables/useMasterCrud'

const props = defineProps<{ config: MasterConfig }>()

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

// Form Data
const formData = reactive<Record<string, any>>({})

// Select Options
const selectOptions = ref<Record<string, any[]>>({})

// Grid Data
const gridData = ref<any[]>([])

// Lookup
const lookupModalRef = ref()
const lookupData = ref<any[]>([])
const lookupLoading = ref(false)
const currentLookupTitle = ref('')
const currentLookupColumns = ref<any[]>([])
const currentLookupWidth = ref('700px')
const currentLookupField = ref<FormFieldConfig | null>(null)

// Computed
const visibleFields = computed(() => props.config.formFields.filter(f => !f.hidden))

const isFormValid = computed(() => {
    return props.config.formFields
        .filter(f => f.required)
        .every(f => {
            const val = formData[f.field]
            return val !== null && val !== undefined && val !== '' && val !== 0
        })
})

// ========== LOOKUP ==========
const openLookup = async (field: FormFieldConfig) => {
    if (!field.lookupConfig) return
    
    currentLookupField.value = field
    currentLookupTitle.value = field.lookupConfig.title || `Pilih ${field.label}`
    currentLookupColumns.value = field.lookupConfig.columns
    currentLookupWidth.value = field.lookupConfig.width || '700px'
    
    lookupLoading.value = true
    try {
        const response = await $api.get(field.lookupConfig.endpoint)
        if (response.data.success) {
            lookupData.value = response.data.data
        }
    } catch (error) {
        console.error('Lookup error:', error)
    } finally {
        lookupLoading.value = false
    }
    
    lookupModalRef.value?.open()
}

const onLookupSelect = (item: any) => {
    if (!currentLookupField.value?.lookupConfig) return
    
    const config = currentLookupField.value.lookupConfig
    formData[config.field] = item[config.field]
    
    if (config.displayField) {
        formData[config.displayField] = item[config.displayField] || item[config.field]
    }
}

// ========== LOAD DATA ==========
const loadOptions = async () => {
    if (!props.config.optionsEndpoint) return
    
    try {
        const response = await $api.get(props.config.optionsEndpoint)
        if (response.data.success) {
            selectOptions.value = response.data.data
        }
    } catch (error) {
        console.error('Failed to load options:', error)
    }
}

const loadGridData = async (kode?: string) => {
    if (!props.config.gridConfig) return
    
    const targetKode = kode || formData[props.config.primaryKey]
    if (!targetKode) {
        // Fetch all (untuk tambah baru)
        try {
            const response = await $api.get(props.config.gridConfig.endpoint)
            if (response.data.success) {
                gridData.value = response.data.data
            }
        } catch (error) {
            console.error('Failed to load grid data:', error)
        }
    } else {
        try {
            const endpoint = props.config.gridConfig.endpoint.replace('{id}', targetKode)
            const response = await $api.get(endpoint)
            if (response.data.success) {
                gridData.value = response.data.data
            }
        } catch (error) {
            console.error('Failed to load grid data:', error)
        }
    }
}

const loadFormData = async (id: string) => {
    try {
        const response = await $api.get(`${props.config.endpoint}/${id}`)
        if (response.data.success) {
            const data = response.data.data
            props.config.formFields.forEach(field => {
                formData[field.field] = data[field.field] ?? field.defaultValue ?? null
            })
            await loadGridData(id)
        }
    } catch (error) {
        console.error('Failed to load data:', error)
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 })
    }
}

const generateKode = async () => {
    try {
        const response = await $api.get(`${props.config.endpoint}/max-kode`)
        if (response.data.success) {
            formData[props.config.primaryKey] = response.data.kode
        }
    } catch (error) {
        console.error('Failed to generate kode:', error)
    }
}

// ========== SAVE ==========
const saveData = async () => {
    if (!isFormValid.value) {
        showValidation.value = true
        toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Lengkapi field wajib', life: 3000 })
        return false
    }
    
    saving.value = true
    try {
        const payload = { ...formData }
        if (props.config.gridConfig) {
            payload.gridData = gridData.value
        }
        
        let response
        if (isEdit.value) {
            response = await $api.put(`${props.config.endpoint}/${formId.value}`, payload)
        } else {
            response = await $api.post(props.config.endpoint, payload)
        }
        
        if (response.data.success) {
            toast.add({ severity: 'success', summary: 'Berhasil', detail: response.data.message, life: 3000 })
            return true
        }
        return false
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal menyimpan', life: 3000 })
        return false
    } finally {
        saving.value = false
    }
}

const saveAndClose = async () => {
    const success = await saveData()
    if (success) goBack()
}

const saveAndNew = async () => {
    const success = await saveData()
    if (success) {
        isEdit.value = false
        formId.value = null
        showValidation.value = false
        Object.keys(formData).forEach(key => delete formData[key])
        props.config.formFields.forEach(field => {
            formData[field.field] = field.defaultValue ?? null
        })
        await generateKode()
        await loadGridData()
    }
}

const goBack = () => {
    const baseRoute = props.config.formRoute?.replace('/form', '')
    if (baseRoute) router.push(baseRoute)
}

// ========== INIT ==========
onMounted(async () => {
    // Init form data dengan default
    props.config.formFields.forEach(field => {
        formData[field.field] = field.defaultValue ?? null
    })
    
    await loadOptions()
    
    const id = route.query.id as string
    if (id) {
        isEdit.value = true
        formId.value = id
        await loadFormData(id)
    } else {
        await generateKode()
        await loadGridData()
    }
})
</script>

<style lang="scss" scoped>
.master-form-page { display: flex; flex-direction: column; height: 100%; overflow: hidden; background: var(--surface-ground); }

.form-header { display: flex; align-items: center; padding: 0.75rem 1.25rem; background: var(--surface-card); border-bottom: 1px solid var(--surface-border); gap: 1rem; flex-shrink: 0; }
.form-header-left { display: flex; align-items: center; gap: 0.75rem; }
.form-header-icon { width: 2.25rem; height: 2.25rem; background: var(--primary-50); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: var(--primary-600); font-size: 1rem; }
.form-header-text { display: flex; align-items: center; gap: 0.5rem; h1 { font-size: 1.125rem; font-weight: 700; margin: 0; } .form-header-badge { font-size: 0.688rem; padding: 0.125rem 0.5rem; background: var(--primary-100); border-radius: 0.75rem; color: var(--primary-700); font-weight: 600; } }

.form-content { flex: 1; overflow-y: auto; padding: 1.25rem; max-width: 1200px; margin: 0 auto; width: 100%; }
.form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; @media (max-width: 1000px) { grid-template-columns: repeat(3, 1fr); } @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 480px) { grid-template-columns: 1fr; } }
.form-field { display: flex; flex-direction: column; gap: 0.25rem; label { font-size: 0.688rem; font-weight: 600; color: var(--text-color-secondary); text-transform: uppercase; .required { color: #dc2626; } } .field-help { font-size: 0.625rem; color: var(--text-color-secondary); } &.full-width { grid-column: 1 / -1; } }
.lookup-input-group { display: flex; gap: 0.25rem; .lookup-display { flex: 1; } }

.form-section { background: var(--surface-card); border-radius: 0.5rem; border: 1px solid var(--surface-border); padding: 1rem; margin-top: 1rem; .section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; i { color: var(--primary-500); } span { font-weight: 600; font-size: 0.813rem; } } }

.form-bottom-bar { background: var(--surface-card); border-top: 1px solid var(--surface-border); padding: 0.75rem 1.25rem; flex-shrink: 0; .bottom-bar-inner { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; } .validation-error { display: flex; align-items: center; gap: 0.375rem; color: #dc2626; font-size: 0.75rem; } .bottom-actions { display: flex; gap: 0.5rem; } }

:deep(.p-inputtext), :deep(.p-select), :deep(.p-datepicker-input), :deep(.p-inputnumber-input) { font-size: 0.75rem; padding: 0.375rem 0.5rem; }
</style>