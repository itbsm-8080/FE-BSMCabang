<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useLayout } from "~/layouts/composables/layout.js";

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const router = useRouter();

// 🔥 Dummy data untuk products (ganti dengan API call real)
const products = ref([
    { id: 1, code: 'BRG001', name: 'Laptop Asus', category: 'Elektronik', price: 8500000, inventoryStatus: 'INSTOCK', image: 'laptop.png' },
    { id: 2, code: 'BRG002', name: 'Mouse Logitech', category: 'Aksesoris', price: 350000, inventoryStatus: 'INSTOCK', image: 'mouse.png' },
    { id: 3, code: 'BRG003', name: 'Keyboard Mechanical', category: 'Aksesoris', price: 1250000, inventoryStatus: 'LOWSTOCK', image: 'keyboard.png' },
    { id: 4, code: 'BRG004', name: 'Monitor 24"', category: 'Elektronik', price: 2200000, inventoryStatus: 'OUTOFSTOCK', image: 'monitor.png' },
    { id: 5, code: 'BRG005', name: 'Printer Epson', category: 'Elektronik', price: 1800000, inventoryStatus: 'INSTOCK', image: 'printer.png' }
]);

const chartData = ref(null);
const chartOptions = ref(null);
const salesChartData = ref(null);
const salesChartOptions = ref(null);
const chartPeriod = ref('1M');

// 🔥 Stats cards data
const statsCards = ref([
    {
        title: 'Total Revenue',
        value: 'Rp 847.5M',
        change: '+12.5%',
        trend: 'up',
        icon: 'pi pi-dollar',
        color: 'emerald',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconColor: 'text-emerald-500'
    },
    {
        title: 'Total Orders',
        value: '2,847',
        change: '+8.2%',
        trend: 'up',
        icon: 'pi pi-shopping-cart',
        color: 'blue',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-500'
    },
    {
        title: 'Active Customers',
        value: '1,234',
        change: '+5.1%',
        trend: 'up',
        icon: 'pi pi-users',
        color: 'purple',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-500'
    },
    {
        title: 'Pending DO',
        value: '42',
        change: '-3.2%',
        trend: 'down',
        icon: 'pi pi-clock',
        color: 'orange',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        iconColor: 'text-orange-500'
    }
]);

// 🔥 Quick actions
const quickActions = ref([
    { label: 'New DO', icon: 'pi pi-plus', command: () => navigateTo('/penjualan/do/form') },
    { label: 'New SO', icon: 'pi pi-file', command: () => navigateTo('/penjualan/so/form') },
    { label: 'Add Customer', icon: 'pi pi-user-plus', command: () => navigateTo('/master/customer') },
    { label: 'Add Product', icon: 'pi pi-box', command: () => navigateTo('/master/barang') }
]);

// 🔥 Recent activities
const recentActivities = ref([
    { user: 'John Doe', action: 'created new DO', target: 'DO-2024-001', time: '5 min ago', avatar: 'JD' },
    { user: 'Jane Smith', action: 'approved', target: 'SO-2024-089', time: '15 min ago', avatar: 'JS' },
    { user: 'Mike Johnson', action: 'completed delivery', target: 'DO-2024-045', time: '1 hour ago', avatar: 'MJ' },
    { user: 'Sarah Wilson', action: 'added new customer', target: 'PT Maju Jaya', time: '2 hours ago', avatar: 'SW' },
    { user: 'David Brown', action: 'updated stock', target: 'Barang A', time: '3 hours ago', avatar: 'DB' }
]);

const quickMenu = ref();

onMounted(() => {
    // Double check auth
    authStore.restoreSession()
    
    if (!authStore.isLoggedIn) {
        router.push('/auth/login')
        return
    }
    
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
    salesChartData.value = setSalesChartData();
    salesChartOptions.value = setSalesChartOptions();
});

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Revenue 2024',
                data: [65, 59, 80, 81, 56, 55, 72, 68, 75, 82, 78, 90],
                fill: true,
                borderColor: documentStyle.getPropertyValue('--primary-color'),
                backgroundColor: `color-mix(in srgb, ${documentStyle.getPropertyValue('--primary-color')}, transparent 90%)`,
                tension: 0.4,
                pointBackgroundColor: documentStyle.getPropertyValue('--primary-color'),
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: documentStyle.getPropertyValue('--surface-card'),
                titleColor: textColor,
                bodyColor: textColorSecondary,
                borderColor: surfaceBorder,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: textColorSecondary }
            },
            y: {
                grid: { color: surfaceBorder },
                ticks: { color: textColorSecondary }
            }
        }
    };
}

function setSalesChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Sales',
                data: [120, 150, 180, 220, 190, 250, 280],
                backgroundColor: documentStyle.getPropertyValue('--primary-color'),
                borderRadius: 8,
                barPercentage: 0.6
            }
        ]
    };
}

function setSalesChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: documentStyle.getPropertyValue('--surface-card'),
                titleColor: documentStyle.getPropertyValue('--text-color'),
                bodyColor: textColorSecondary,
                borderColor: surfaceBorder,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: textColorSecondary }
            },
            y: {
                grid: { color: surfaceBorder },
                ticks: { color: textColorSecondary }
            }
        }
    };
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
    salesChartData.value = setSalesChartData();
    salesChartOptions.value = setSalesChartOptions();
});
</script>

<template>
    <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-section mb-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                        Welcome back, {{ authStore.user?.name || 'User' }}! 👋
                    </h1>
                    <p class="text-muted-color mt-1">
                        Here's what's happening with your business today.
                    </p>
                </div>
                <div class="flex gap-2">
                    <Button 
                        v-for="action in quickActions.slice(0, 3)" 
                        :key="action.label"
                        :label="action.label"
                        :icon="action.icon"
                        size="small"
                        severity="secondary"
                        @click="action.command"
                    />
                    <Button 
                        icon="pi pi-ellipsis-v" 
                        severity="secondary" 
                        text 
                        rounded 
                        size="small"
                        @click="quickMenu.toggle($event)"
                    />
                    <Menu ref="quickMenu" :model="quickActions" :popup="true" />
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div 
                v-for="stat in statsCards" 
                :key="stat.title"
                class="stat-card"
            >
                <div class="flex items-start justify-between">
                    <div>
                        <p class="stat-title">{{ stat.title }}</p>
                        <h3 class="stat-value">{{ stat.value }}</h3>
                        <div class="stat-change" :class="stat.trend">
                            <i :class="stat.trend === 'up' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                            <span>{{ stat.change }}</span>
                            <span class="text-muted-color ml-1">vs last month</span>
                        </div>
                    </div>
                    <div :class="['stat-icon-wrapper', stat.bgColor]">
                        <i :class="[stat.icon, stat.iconColor, 'text-xl']"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <!-- Main Chart -->
            <div class="lg:col-span-2">
                <div class="card h-full">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">Revenue Overview</h3>
                            <p class="text-sm text-muted-color">Monthly revenue performance</p>
                        </div>
                        <SelectButton 
                            v-model="chartPeriod" 
                            :options="['1M', '6M', '1Y']" 
                            size="small"
                        />
                    </div>
                    <Chart type="line" :data="chartData" :options="chartOptions" class="h-72" />
                </div>
            </div>

            <!-- Sales Chart -->
            <div class="lg:col-span-1">
                <div class="card h-full">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">Weekly Sales</h3>
                            <p class="text-sm text-muted-color">This week's performance</p>
                        </div>
                        <Button icon="pi pi-download" text rounded size="small" />
                    </div>
                    <Chart type="bar" :data="salesChartData" :options="salesChartOptions" class="h-72" />
                </div>
            </div>
        </div>

        <!-- Bottom Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Recent Products -->
            <div class="lg:col-span-2">
                <div class="card">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">Recent Products</h3>
                            <p class="text-sm text-muted-color">Latest added products</p>
                        </div>
                        <Button label="View All" text size="small" @click="navigateTo('/master/barang')" />
                    </div>
                    <DataTable :value="products" :rows="5" :paginator="false" size="small" class="compact-table">
                        <Column field="code" header="Code" style="width: 100px"></Column>
                        <Column field="name" header="Name">
                            <template #body="slotProps">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded bg-primary-100 flex items-center justify-center">
                                        <i class="pi pi-box text-primary"></i>
                                    </div>
                                    <span>{{ slotProps.data.name }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column field="category" header="Category" style="width: 120px"></Column>
                        <Column field="price" header="Price" style="width: 120px">
                            <template #body="slotProps">
                                {{ formatCurrency(slotProps.data.price) }}
                            </template>
                        </Column>
                        <Column field="inventoryStatus" header="Status" style="width: 100px">
                            <template #body="slotProps">
                                <Tag 
                                    :value="slotProps.data.inventoryStatus" 
                                    :severity="slotProps.data.inventoryStatus === 'INSTOCK' ? 'success' : slotProps.data.inventoryStatus === 'LOWSTOCK' ? 'warning' : 'danger'"
                                    size="small"
                                />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <!-- Recent Activities -->
            <div class="lg:col-span-1">
                <div class="card h-full">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">Recent Activities</h3>
                            <p class="text-sm text-muted-color">Latest user actions</p>
                        </div>
                        <Button icon="pi pi-refresh" text rounded size="small" />
                    </div>
                    <div class="activity-list">
                        <div 
                            v-for="(activity, index) in recentActivities" 
                            :key="index"
                            class="activity-item"
                        >
                            <div class="activity-avatar">
                                {{ activity.avatar }}
                            </div>
                            <div class="activity-content">
                                <p class="activity-text">
                                    <span class="font-medium">{{ activity.user }}</span>
                                    {{ activity.action }}
                                    <span class="font-medium text-primary">{{ activity.target }}</span>
                                </p>
                                <span class="activity-time">{{ activity.time }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
    padding: 0.5rem;
}

.welcome-section {
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-50) 0%, var(--surface-card) 100%);
    border-radius: 1rem;
    border: 1px solid var(--surface-border);
}

.stat-card {
    padding: 1.25rem;
    background: var(--surface-card);
    border-radius: 1rem;
    border: 1px solid var(--surface-border);
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .stat-title {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-color-secondary);
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 0.5rem;
    }

    .stat-change {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;

        &.up {
            color: var(--green-500);
        }

        &.down {
            color: var(--red-500);
        }
    }

    .stat-icon-wrapper {
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem 0;

    &:not(:last-child) {
        border-bottom: 1px solid var(--surface-border);
    }

    .activity-avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 9999px;
        background: var(--primary-100);
        color: var(--primary-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        flex-shrink: 0;
    }

    .activity-content {
        flex: 1;
    }

    .activity-text {
        font-size: 0.813rem;
        color: var(--text-color);
        margin-bottom: 0.25rem;
    }

    .activity-time {
        font-size: 0.688rem;
        color: var(--text-color-secondary);
    }
}

.compact-table {
    :deep(.p-datatable-tbody > tr > td) {
        padding: 0.5rem 0.75rem !important;
    }
}

// Dark mode
:global(.app-dark) {
    .welcome-section {
        background: linear-gradient(135deg, var(--primary-900) 0%, var(--surface-card) 100%);
    }

    .activity-avatar {
        background: var(--primary-900) !important;
        color: var(--primary-300) !important;
    }
}
</style>