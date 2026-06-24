<template>
    <div class="numeric-filter">
        <div class="filter-header">
            <span>Filter {{ label }}</span>
            <Button icon="pi pi-times" text rounded size="small" @click="$emit('close')" />
        </div>
        
        <div class="filter-body">
            <!-- Condition 1 -->
            <div class="condition-row">
                <label class="condition-label">Kondisi 1</label>
                <div class="condition-inputs">
                    <Select 
                        v-model="operator1" 
                        :options="operators" 
                        optionLabel="label" 
                        optionValue="value" 
                        size="small" 
                        class="operator-select"
                    />
                    <!-- Date input -->
                    <DatePicker 
                        v-if="isDate"
                        v-model="value1" 
                        dateFormat="yy-mm-dd" 
                        showIcon 
                        size="small" 
                        class="value-input"
                        placeholder="YYYY-MM-DD"
                    />
                    <!-- Number/Currency input -->
                    <InputNumber 
                        v-else
                        v-model="value1" 
                        mode="currency" 
                        currency="IDR" 
                        locale="id-ID" 
                        size="small" 
                        class="value-input"
                        placeholder="0"
                    />
                </div>
                <!-- Value 2 untuk between -->
                <div v-if="operator1 === 'between'" class="condition-inputs" style="margin-top: 0.35rem;">
                    <span class="between-label">sampai</span>
                    <DatePicker 
                        v-if="isDate"
                        v-model="value1b" 
                        dateFormat="yy-mm-dd" 
                        showIcon 
                        size="small" 
                        class="value-input"
                        placeholder="YYYY-MM-DD"
                    />
                    <InputNumber 
                        v-else
                        v-model="value1b" 
                        mode="currency" 
                        currency="IDR" 
                        locale="id-ID" 
                        size="small" 
                        class="value-input"
                        placeholder="0"
                    />
                </div>
            </div>
            
            <!-- AND/OR Toggle -->
            <div class="logic-toggle">
                <button 
                    class="logic-btn" 
                    :class="{ 'active': logicOperator === 'and' }" 
                    @click="logicOperator = 'and'"
                >DAN</button>
                <button 
                    class="logic-btn" 
                    :class="{ 'active': logicOperator === 'or' }" 
                    @click="logicOperator = 'or'"
                >ATAU</button>
            </div>
            
            <!-- Condition 2 (opsional) -->
            <div class="condition-row" v-if="showCondition2">
                <label class="condition-label">Kondisi 2</label>
                <div class="condition-inputs">
                    <Select 
                        v-model="operator2" 
                        :options="operators" 
                        optionLabel="label" 
                        optionValue="value" 
                        size="small" 
                        class="operator-select"
                    />
                    <DatePicker 
                        v-if="isDate"
                        v-model="value2" 
                        dateFormat="yy-mm-dd" 
                        showIcon 
                        size="small" 
                        class="value-input"
                        placeholder="YYYY-MM-DD"
                    />
                    <InputNumber 
                        v-else
                        v-model="value2" 
                        mode="currency" 
                        currency="IDR" 
                        locale="id-ID" 
                        size="small" 
                        class="value-input"
                        placeholder="0"
                    />
                </div>
                <div v-if="operator2 === 'between'" class="condition-inputs" style="margin-top: 0.35rem;">
                    <span class="between-label">sampai</span>
                    <DatePicker 
                        v-if="isDate"
                        v-model="value2b" 
                        dateFormat="yy-mm-dd" 
                        showIcon 
                        size="small" 
                        class="value-input"
                        placeholder="YYYY-MM-DD"
                    />
                    <InputNumber 
                        v-else
                        v-model="value2b" 
                        mode="currency" 
                        currency="IDR" 
                        locale="id-ID" 
                        size="small" 
                        class="value-input"
                        placeholder="0"
                    />
                </div>
            </div>
            
            <!-- Add/Remove condition 2 -->
            <div class="add-condition">
                <button 
                    v-if="!showCondition2" 
                    class="add-btn" 
                    @click="showCondition2 = true"
                >
                    <i class="pi pi-plus"></i> Tambah Kondisi
                </button>
                <button 
                    v-else 
                    class="remove-btn" 
                    @click="showCondition2 = false; operator2 = 'eq'; value2 = null; value2b = null;"
                >
                    <i class="pi pi-minus"></i> Hapus Kondisi 2
                </button>
            </div>
        </div>
        
        <div class="filter-footer">
            <Button label="Clear" text size="small" @click="clear" />
            <Button label="Apply" severity="primary" size="small" @click="apply" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
    label: string
    currentFilter?: any
    isDate?: boolean
}>()

const emit = defineEmits<{
    (e: 'apply', filter: any): void
    (e: 'close'): void
}>()

const operators = [
    { label: 'Sama dengan (=)', value: 'eq' },
    { label: 'Tidak sama (≠)', value: 'neq' },
    { label: 'Lebih besar (>)', value: 'gt' },
    { label: 'Lebih besar/sama (≥)', value: 'gte' },
    { label: 'Lebih kecil (<)', value: 'lt' },
    { label: 'Lebih kecil/sama (≤)', value: 'lte' },
    { label: 'Antara (between)', value: 'between' },
]

// Condition 1
const operator1 = ref('eq')
const value1 = ref<any>(null)
const value1b = ref<any>(null)

// Logic
const logicOperator = ref<'and' | 'or'>('and')

// Condition 2
const showCondition2 = ref(false)
const operator2 = ref('eq')
const value2 = ref<any>(null)
const value2b = ref<any>(null)

// Init from currentFilter
onMounted(() => {
    if (props.currentFilter) {
        operator1.value = props.currentFilter.operator1 || 'eq'
        value1.value = parseValue(props.currentFilter.value1)
        value1b.value = parseValue(props.currentFilter.value1b)
        
        logicOperator.value = props.currentFilter.logic || 'and'
        
        if (props.currentFilter.operator2) {
            showCondition2.value = true
            operator2.value = props.currentFilter.operator2 || 'eq'
            value2.value = parseValue(props.currentFilter.value2)
            value2b.value = parseValue(props.currentFilter.value2b)
        }
    }
})

const parseValue = (val: any) => {
    if (val === null || val === undefined || val === '') return null
    if (props.isDate && typeof val === 'string') {
        // Parse YYYY-MM-DD ke Date object (tanpa timezone issue)
        const parts = val.split('-')
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        }
    }
    return val
}

const clear = () => {
    emit('apply', null)
    emit('close')
}

const apply = () => {
    // Format date values ke string YYYY-MM-DD
    const formatVal = (val: any) => {
        if (!val) return null
        if (props.isDate && val instanceof Date) {
            // ✅ Pakai local date, bukan ISO
            const y = val.getFullYear()
            const m = String(val.getMonth() + 1).padStart(2, '0')
            const d = String(val.getDate()).padStart(2, '0')
            return `${y}-${m}-${d}`
        }
        if (props.isDate && typeof val === 'string') {
            return val
        }
        return val
    }
    
    const filter: any = {
        operator1: operator1.value,
        value1: formatVal(value1.value),
        field: props.label,
        type: props.isDate ? 'date' : 'numeric',
        logic: logicOperator.value
    }
    
    if (operator1.value === 'between') {
        filter.value1b = formatVal(value1b.value) || 0
    }
    
    if (showCondition2.value) {
        filter.operator2 = operator2.value
        filter.value2 = formatVal(value2.value)
        if (operator2.value === 'between') {
            filter.value2b = formatVal(value2b.value) || 0
        }
    }
    
    emit('apply', filter)
    emit('close')
}
</script>

<style lang="scss" scoped>
.numeric-filter {
    width: 300px;
    display: flex;
    flex-direction: column;
    
    .filter-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem 0.75rem;
        border-bottom: 1px solid var(--surface-border);
        font-weight: 600;
        font-size: 0.8rem;
    }
    
    .filter-body {
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
    }
    
    .condition-row {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        
        .condition-label {
            font-size: 0.65rem;
            font-weight: 600;
            color: var(--text-color-secondary);
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
    }
    
    .condition-inputs {
        display: flex;
        gap: 0.35rem;
        align-items: center;
        
        .operator-select {
            width: 110px;
            flex-shrink: 0;
            :deep(.p-select) { height: 1.75rem; .p-select-label { font-size: 0.7rem; } }
        }
        
        .value-input {
            flex: 1;
            :deep(.p-inputtext), :deep(.p-datepicker-input) { height: 1.75rem; font-size: 0.72rem; }
            :deep(.p-inputnumber-input) { height: 1.75rem; font-size: 0.72rem; }
        }
        
        .between-label {
            font-size: 0.68rem;
            color: var(--text-color-secondary);
            flex-shrink: 0;
            width: 50px;
            text-align: center;
        }
    }
    
    .logic-toggle {
        display: flex;
        gap: 0.25rem;
        justify-content: center;
        padding: 0.25rem 0;
        
        .logic-btn {
            padding: 0.25rem 1rem;
            border: 1.5px solid var(--surface-border);
            border-radius: 1rem;
            background: var(--surface-0);
            cursor: pointer;
            font-size: 0.68rem;
            font-weight: 600;
            color: var(--text-color-secondary);
            transition: all 0.15s;
            
            &:hover {
                border-color: var(--primary-300);
                color: var(--primary-600);
            }
            
            &.active {
                background: var(--primary-50);
                border-color: var(--primary-500);
                color: var(--primary-700);
            }
        }
    }
    
    .add-condition {
        display: flex;
        justify-content: center;
        
        .add-btn, .remove-btn {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.25rem 0.75rem;
            border: 1px dashed var(--surface-border);
            border-radius: 0.5rem;
            background: transparent;
            cursor: pointer;
            font-size: 0.68rem;
            color: var(--text-color-secondary);
            transition: all 0.15s;
            
            i { font-size: 0.6rem; }
            
            &:hover {
                border-color: var(--primary-400);
                color: var(--primary-600);
                background: var(--primary-50);
            }
        }
        
        .remove-btn {
            border-color: #fecaca;
            color: #dc2626;
            
            &:hover {
                border-color: #dc2626;
                background: #fef2f2;
            }
        }
    }
    
    .filter-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem 0.75rem;
        border-top: 1px solid var(--surface-border);
    }
}
</style>