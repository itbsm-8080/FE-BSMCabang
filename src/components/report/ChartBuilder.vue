<template>
    <div class="chart-builder">
        <!-- ==================== CHART TYPE TABS ==================== -->
        <div class="chart-type-tabs">
            <button 
                v-for="type in chartTypes" 
                :key="type.value"
                class="chart-type-btn"
                :class="{ active: chartType === type.value }"
                @click="chartType = type.value"
                :title="type.label"
            >
                <i :class="type.icon"></i>
                <span>{{ type.label }}</span>
            </button>
        </div>
        
        <div class="chart-body">
            <!-- ==================== LEFT: FIELDS ==================== -->
            <div class="chart-fields-panel">
                <!-- Dimensions -->
                <div class="field-group">
                    <div class="field-group-header">
                        <i class="pi pi-list"></i>
                        <span>Dimensions</span>
                    </div>
                    <div class="field-list">
                        <div 
                            v-for="col in dimensionFields" 
                            :key="col.field"
                            class="field-item"
                            :class="{ 'used': isFieldUsed(col.field, 'x') }"
                        >
                            <i class="pi pi-bars field-type-icon"></i>
                            <span>{{ col.header }}</span>
                            <button 
                                class="field-add-btn"
                                @click="toggleField(col.field, 'x')"
                                :title="isFieldUsed(col.field, 'x') ? 'Remove' : 'Add to X-Axis'"
                            >
                                <i :class="isFieldUsed(col.field, 'x') ? 'pi pi-times' : 'pi pi-plus'"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Measures -->
                <div class="field-group">
                    <div class="field-group-header">
                        <i class="pi pi-hashtag"></i>
                        <span>Measures</span>
                    </div>
                    <div class="field-list">
                        <div 
                            v-for="col in measureFields" 
                            :key="col.field"
                            class="field-item"
                            :class="{ 'used': isFieldUsed(col.field, 'y') }"
                        >
                            <i class="pi pi-dollar field-type-icon"></i>
                            <span>{{ col.header }}</span>
                            <button 
                                class="field-add-btn"
                                @click="toggleField(col.field, 'y')"
                                :title="isFieldUsed(col.field, 'y') ? 'Remove' : 'Add to Y-Axis'"
                            >
                                <i :class="isFieldUsed(col.field, 'y') ? 'pi pi-times' : 'pi pi-plus'"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ==================== RIGHT: CHART PREVIEW ==================== -->
            <div class="chart-preview-panel">
                <!-- Axis Chips -->
                <div class="axis-config">
                    <div class="axis-row">
                        <span class="axis-label">🎛️ X-Axis</span>
                        <div class="axis-chips">
                            <span 
                                v-for="field in xFields" 
                                :key="field"
                                class="axis-chip x-chip"
                            >
                                {{ getFieldLabel(field) }}
                                <i class="pi pi-times" @click="removeXField(field)"></i>
                            </span>
                            <span v-if="xFields.length === 0" class="axis-placeholder">Click + on a field</span>
                        </div>
                    </div>
                    <div class="axis-row">
                        <span class="axis-label">📏 Y-Axis</span>
                        <div class="axis-chips">
                            <span 
                                v-for="field in yFields" 
                                :key="field"
                                class="axis-chip y-chip"
                            >
                                {{ getFieldLabel(field) }}
                                <i class="pi pi-times" @click="removeYField(field)"></i>
                            </span>
                            <span v-if="yFields.length === 0" class="axis-placeholder">Click + on a measure</span>
                        </div>
                    </div>
                    <div class="axis-row" v-if="needsGroupBy">
                        <span class="axis-label">📐 Group By</span>
                        <Select v-model="groupField" :options="dimensionFields" optionLabel="header" optionValue="field" size="small" placeholder="None" class="compact-input" showClear />
                    </div>
                </div>
                
                <!-- Chart -->
                <div class="chart-canvas-area">
    <VChart 
        v-if="hasValidConfig"
        :option="chartOption" 
        :autoresize="true"
        style="width: 100%; height: 100%;"
    />
    <div v-else class="chart-placeholder">
        <i class="pi pi-chart-line"></i>
        <span>Select dimensions & measures to build chart</span>
    </div>
</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

use([CanvasRenderer, BarChart, LineChart, PieChart, ScatterChart, RadarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const props = defineProps<{
    data: any[]
    columns: any[]
    showFields?: boolean  // 🔥 Toggle fields panel
}>()

const chartType = ref('bar')
const xFields = ref<string[]>([])
const yFields = ref<string[]>([])
const groupField = ref('')

const chartTypes = [
    { label: 'Bar', value: 'bar', icon: 'pi pi-chart-bar' },
    { label: 'Stacked', value: 'stacked-bar', icon: 'pi pi-bars' },
    { label: 'Line', value: 'line', icon: 'pi pi-chart-line' },
    { label: 'Area', value: 'area', icon: 'pi pi-wave' },
    { label: 'Pie', value: 'pie', icon: 'pi pi-chart-pie' },
    { label: 'Donut', value: 'donut', icon: 'pi pi-circle' },
    { label: 'Scatter', value: 'scatter', icon: 'pi pi-ellipsis-h' },
    { label: 'Radar', value: 'radar', icon: 'pi pi-compass' },
]

const dimensionFields = computed(() => props.columns.filter(c => c.type !== 'number'))
const measureFields = computed(() => props.columns.filter(c => c.type === 'number'))
const needsGroupBy = computed(() => ['stacked-bar', 'line', 'area', 'radar'].includes(chartType.value))
const hasValidConfig = computed(() => xFields.value.length > 0 && yFields.value.length > 0)

const getFieldLabel = (field: string) => props.columns.find(c => c.field === field)?.header || field

const isFieldUsed = (field: string, axis: 'x' | 'y') => {
    return axis === 'x' ? xFields.value.includes(field) : yFields.value.includes(field)
}

const toggleField = (field: string, axis: 'x' | 'y') => {
    if (axis === 'x') {
        if (xFields.value.includes(field)) {
            xFields.value = xFields.value.filter(f => f !== field)
        } else {
            xFields.value.push(field)
        }
    } else {
        if (yFields.value.includes(field)) {
            yFields.value = yFields.value.filter(f => f !== field)
        } else {
            yFields.value.push(field)
        }
    }
}

const removeXField = (field: string) => { xFields.value = xFields.value.filter(f => f !== field) }
const removeYField = (field: string) => { yFields.value = yFields.value.filter(f => f !== field) }

const chartOption = computed(() => {
    if (!hasValidConfig.value) return null
    
    const data = props.data
    const mainX = xFields.value[0]
    const labels = [...new Set(data.map(d => d[mainX]))]
    const mainY = yFields.value[0]
    
    // Pie / Donut
    if (chartType.value === 'pie' || chartType.value === 'donut') {
        const pieData = labels.map(label => ({
            name: label,
            value: data.filter(d => d[mainX] === label).reduce((sum, d) => sum + (parseFloat(d[mainY]) || 0), 0)
        }))
        return {
            tooltip: { trigger: 'item' },
            legend: { bottom: 0, type: 'scroll' },
            series: [{ type: 'pie', radius: chartType.value === 'donut' ? ['40%', '70%'] : '70%', data: pieData }]
        }
    }
    
    // Scatter
    if (chartType.value === 'scatter') {
        const scatterData = data.map(d => [parseFloat(d[xFields.value[0]]) || 0, parseFloat(d[yFields.value[0]]) || 0])
        return {
            tooltip: { trigger: 'item' },
            xAxis: { type: 'value', name: getFieldLabel(xFields.value[0]) },
            yAxis: { type: 'value', name: getFieldLabel(yFields.value[0]) },
            series: [{ type: 'scatter', data: scatterData }]
        }
    }
    
    // Radar
    if (chartType.value === 'radar') {
        const maxVal = Math.max(...data.map(d => parseFloat(d[mainY]) || 0)) * 1.2
        const indicator = labels.map(l => ({ name: String(l), max: maxVal }))
        const radarData = { name: getFieldLabel(mainY), value: labels.map(l => data.filter(d => d[mainX] === l).reduce((sum, d) => sum + (parseFloat(d[mainY]) || 0), 0)) }
        return {
            tooltip: {},
            radar: { indicator },
            series: [{ type: 'radar', data: [radarData] }]
        }
    }
    
    // Bar, Line, Area, Stacked Bar
    let series: any[] = []
    
    if (groupField.value && needsGroupBy.value) {
        const groups = [...new Set(data.map(d => d[groupField.value]))]
        yFields.value.forEach(yf => {
            groups.forEach(g => {
                series.push({
                    name: `${getFieldLabel(yf)} - ${g}`,
                    type: chartType.value === 'area' ? 'line' : 'bar',
                    stack: chartType.value === 'stacked-bar' ? 'total' : undefined,
                    areaStyle: chartType.value === 'area' ? {} : undefined,
                    data: labels.map(l => data.filter(d => d[mainX] === l && d[groupField.value] === g).reduce((sum, d) => sum + (parseFloat(d[yf]) || 0), 0))
                })
            })
        })
    } else {
        yFields.value.forEach(yf => {
            series.push({
                name: getFieldLabel(yf),
                type: chartType.value === 'area' ? 'line' : chartType.value === 'line' ? 'line' : 'bar',
                data: labels.map(l => data.filter(d => d[mainX] === l).reduce((sum, d) => sum + (parseFloat(d[yf]) || 0), 0)),
                areaStyle: chartType.value === 'area' ? {} : undefined,
            })
        })
    }
    
    return {
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, type: 'scroll' },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', data: labels },
        yAxis: { type: 'value' },
        series
    }
})
</script>

<style lang="scss" scoped>
.chart-builder {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

// ==================== CHART TYPE TABS ====================
.chart-type-tabs {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem;
    background: var(--surface-card);
    border-bottom: 1px solid var(--surface-border);
    overflow-x: auto;
    flex-shrink: 0;
    flex-wrap: wrap;
}

.chart-type-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--surface-border);
    background: transparent;
    cursor: pointer;
    font-size: 0.688rem;
    font-weight: 500;
    color: var(--text-color-secondary);
    transition: all 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
    
    i { font-size: 0.875rem; }
    
    &:hover { background: var(--surface-100); color: var(--text-color); }
    
    &.active {
        background: var(--primary-500);
        border-color: var(--primary-500);
        color: white;
    }
}

// ==================== BODY ====================
.chart-body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

// ==================== FIELDS PANEL ====================
.chart-fields-panel {
    width: 220px;
    border-right: 1px solid var(--surface-border);
    background: var(--surface-card);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex-shrink: 0;
}

.field-group {
    border-bottom: 1px solid var(--surface-border);
    
    &:last-child { border-bottom: none; }
}

.field-group-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--surface-50);
    font-size: 0.688rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: var(--text-color-secondary);
    
    i { font-size: 0.75rem; color: var(--primary-500); }
}

.field-list {
    padding: 0.25rem;
}

.field-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.5rem;
    border-radius: 0.375rem;
    cursor: default;
    font-size: 0.688rem;
    transition: all 0.1s;
    
    .field-type-icon {
        font-size: 0.625rem;
        color: var(--text-color-secondary);
        width: 1rem;
    }
    
    span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    .field-add-btn {
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 0.25rem;
        border: none;
        background: var(--surface-100);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-500);
        transition: all 0.1s;
        flex-shrink: 0;
        
        i { font-size: 0.563rem; }
        
        &:hover { background: var(--primary-100); }
    }
    
    &:hover { background: var(--surface-50); }
    
    &.used {
        background: var(--primary-50);
        .field-type-icon { color: var(--primary-500); }
        .field-add-btn { background: var(--red-100); color: var(--red-500); }
    }
}

// ==================== CHART PREVIEW ====================
.chart-preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface-0);
}

.axis-config {
    padding: 0.5rem;
    border-bottom: 1px solid var(--surface-border);
    background: var(--surface-50);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.axis-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.axis-label {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-color-secondary);
    width: 70px;
    flex-shrink: 0;
}

.axis-chips {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    flex: 1;
}

.axis-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.1875rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.625rem;
    font-weight: 600;
    
    &.x-chip {
        background: var(--blue-100);
        color: var(--blue-700);
    }
    
    &.y-chip {
        background: var(--green-100);
        color: var(--green-700);
    }
    
    i {
        font-size: 0.5rem;
        cursor: pointer;
        opacity: 0.6;
        &:hover { opacity: 1; }
    }
}

.axis-placeholder {
    font-size: 0.625rem;
    color: var(--text-color-secondary);
    font-style: italic;
}

.chart-canvas-area {
    flex: 1;
    overflow: hidden;
    padding: 0 !important;
}

.chart-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-color-secondary);
    gap: 0.75rem;
    
    i { font-size: 3rem; opacity: 0.2; }
    span { font-size: 0.813rem; }
}

:deep(.compact-input) {
    font-size: 0.688rem !important;
    height: 1.75rem !important;
    width: 150px;
}

:deep(.echarts) {
    width: 100% !important;
    height: 100% !important;
}
</style>