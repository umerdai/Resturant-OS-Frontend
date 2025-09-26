<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAnalyticsStore } from '@/stores/analytics';
import { useToast } from 'primevue/usetoast';
import Chart from 'primevue/chart';

const analyticsStore = useAnalyticsStore();
const toast = useToast();

// Component state
const loading = ref(false);
const activeTab = ref('overview');
const chartOptions = ref({});

// Date range options
const dateRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Custom Range', value: 'custom' }
];

// Chart data
const revenueChartData = computed(() => {
    const dailyData = analyticsStore.historicalData.daily.slice(-7);
    return {
        labels: dailyData.map((d) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [
            {
                label: 'Revenue',
                data: dailyData.map((d) => d.revenue),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Orders',
                data: dailyData.map((d) => d.orders * 50), // Scale for visibility
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }
        ]
    };
});

const categoryChartData = computed(() => {
    const categories = analyticsStore.categoryAnalytics.slice(0, 6);
    return {
        labels: categories.map((c) => c.name),
        datasets: [
            {
                data: categories.map((c) => c.revenue),
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
            }
        ]
    };
});

const hourlyChartData = computed(() => {
    const hourlyData = analyticsStore.hourlyAnalytics;
    return {
        labels: hourlyData.map((h) => `${h.hour}:00`),
        datasets: [
            {
                label: 'Orders',
                data: hourlyData.map((h) => h.orders),
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
});

// Methods
const refreshData = async () => {
    loading.value = true;
    try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.add({
            severity: 'success',
            summary: 'Data Refreshed',
            detail: 'Analytics data has been updated',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to refresh data',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

const exportReport = (type) => {
    try {
        analyticsStore.exportReport(type, 'csv');
        toast.add({
            severity: 'success',
            summary: 'Export Complete',
            detail: `${type} report has been downloaded`,
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Export Failed',
            detail: 'Unable to export report',
            life: 5000
        });
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
};

// Lifecycle
onMounted(() => {
    chartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false
                }
            }
        }
    };
});
</script>

<template>
    <div class="analytics-dashboard">
        <!-- Header Section -->
        <div class="dashboard-header">
            <div>
                <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Reports & Analytics</h1>
                <p class="text-surface-600 dark:text-surface-400">Comprehensive business insights and performance metrics</p>
            </div>
            <div class="flex gap-3">
                <Dropdown v-model="analyticsStore.selectedDateRange" :options="dateRangeOptions" optionLabel="label" optionValue="value" placeholder="Select Period" class="w-48" />
                <Button label="Refresh" icon="pi pi-refresh" :loading="loading" @click="refreshData" outlined />
                <SplitButton
                    label="Export Report"
                    icon="pi pi-download"
                    @click="exportReport('sales')"
                    :model="[
                        { label: 'Sales Report', command: () => exportReport('sales') },
                        { label: 'Performance Report', command: () => exportReport('performance') },
                        { label: 'Inventory Report', command: () => exportReport('inventory') }
                    ]"
                />
            </div>
        </div>

        <!-- Custom Date Range -->
        <Card v-if="analyticsStore.selectedDateRange === 'custom'" class="mb-6">
            <template #content>
                <div class="flex gap-4 items-center">
                    <div>
                        <label class="block text-sm font-medium mb-2">Start Date</label>
                        <Calendar v-model="analyticsStore.customDateRange.start" dateFormat="yy-mm-dd" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">End Date</label>
                        <Calendar v-model="analyticsStore.customDateRange.end" dateFormat="yy-mm-dd" />
                    </div>
                    <Button label="Apply" icon="pi pi-check" class="mt-6" />
                </div>
            </template>
        </Card>

        <!-- Tab Navigation -->
        <TabView v-model:activeIndex="activeTab" class="analytics-tabs">
            <!-- Overview Tab -->
            <TabPanel header="Overview">
                <!-- Key Metrics Row -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Revenue -->
                    <Card class="metric-card revenue-card">
                        <template #content>
                            <div class="metric-content">
                                <div class="metric-icon-container bg-green-100 dark:bg-green-900/30">
                                    <i class="pi pi-dollar text-2xl text-green-600"></i>
                                </div>
                                <div class="metric-details">
                                    <div class="metric-value text-green-600">
                                        {{ formatCurrency(analyticsStore.revenueAnalytics.total) }}
                                    </div>
                                    <div class="metric-label">Total Revenue</div>
                                    <div class="metric-change">
                                        <i :class="analyticsStore.revenueAnalytics.revenueChange >= 0 ? 'pi pi-arrow-up text-green-500' : 'pi pi-arrow-down text-red-500'"></i>
                                        <span :class="analyticsStore.revenueAnalytics.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'"> {{ formatPercentage(Math.abs(analyticsStore.revenueAnalytics.revenueChange)) }} vs previous period </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Orders -->
                    <Card class="metric-card orders-card">
                        <template #content>
                            <div class="metric-content">
                                <div class="metric-icon-container bg-blue-100 dark:bg-blue-900/30">
                                    <i class="pi pi-shopping-cart text-2xl text-blue-600"></i>
                                </div>
                                <div class="metric-details">
                                    <div class="metric-value text-blue-600">{{ analyticsStore.revenueAnalytics.orderCount }}</div>
                                    <div class="metric-label">Total Orders</div>
                                    <div class="metric-subtitle">{{ formatCurrency(analyticsStore.revenueAnalytics.avgOrderValue) }} avg order value</div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Table Performance -->
                    <Card class="metric-card tables-card">
                        <template #content>
                            <div class="metric-content">
                                <div class="metric-icon-container bg-orange-100 dark:bg-orange-900/30">
                                    <i class="pi pi-th-large text-2xl text-orange-600"></i>
                                </div>
                                <div class="metric-details">
                                    <div class="metric-value text-orange-600">{{ analyticsStore.performanceMetrics.serviceMetrics.tablesTurnover }}</div>
                                    <div class="metric-label">Avg Table Turnover</div>
                                    <div class="metric-subtitle">{{ analyticsStore.performanceMetrics.serviceMetrics.avgServiceTime }}min avg service time</div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Customer Satisfaction -->
                    <Card class="metric-card satisfaction-card">
                        <template #content>
                            <div class="metric-content">
                                <div class="metric-icon-container bg-purple-100 dark:bg-purple-900/30">
                                    <i class="pi pi-star text-2xl text-purple-600"></i>
                                </div>
                                <div class="metric-details">
                                    <div class="metric-value text-purple-600">{{ analyticsStore.performanceMetrics.serviceMetrics.customerSatisfaction }}/5</div>
                                    <div class="metric-label">Customer Rating</div>
                                    <div class="metric-subtitle">{{ formatPercentage(analyticsStore.performanceMetrics.serviceMetrics.orderAccuracy) }} order accuracy</div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Revenue Trend -->
                    <Card>
                        <template #title>Revenue & Orders Trend</template>
                        <template #content>
                            <Chart type="line" :data="revenueChartData" :options="chartOptions" class="h-80" />
                        </template>
                    </Card>

                    <!-- Category Performance -->
                    <Card>
                        <template #title>Revenue by Category</template>
                        <template #content>
                            <Chart type="doughnut" :data="categoryChartData" class="h-80" />
                        </template>
                    </Card>
                </div>

                <!-- Performance Summary -->
                <Card>
                    <template #title>Performance Summary</template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Kitchen Performance -->
                            <div class="performance-section">
                                <h4 class="font-semibold mb-3 flex items-center gap-2">
                                    <i class="pi pi-home text-blue-600"></i>
                                    Kitchen Performance
                                </h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">Avg Prep Time</span>
                                        <span class="font-medium">{{ analyticsStore.performanceMetrics.kitchenPerformance.avgPrepTime }}min</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">On-time Orders</span>
                                        <span class="font-medium text-green-600">{{ formatPercentage(analyticsStore.performanceMetrics.kitchenPerformance.onTimeOrders) }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">Orders/Hour</span>
                                        <span class="font-medium">{{ analyticsStore.performanceMetrics.kitchenPerformance.avgOrdersPerHour }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Service Metrics -->
                            <div class="performance-section">
                                <h4 class="font-semibold mb-3 flex items-center gap-2">
                                    <i class="pi pi-users text-orange-600"></i>
                                    Service Metrics
                                </h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">Avg Wait Time</span>
                                        <span class="font-medium">{{ analyticsStore.performanceMetrics.serviceMetrics.waitTime }}min</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">Customer Rating</span>
                                        <span class="font-medium text-purple-600">{{ analyticsStore.performanceMetrics.serviceMetrics.customerSatisfaction }}/5</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">Response Time</span>
                                        <span class="font-medium">{{ analyticsStore.performanceMetrics.staffProductivity.avgResponseTime }}min</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Staff Productivity -->
                            <div class="performance-section">
                                <h4 class="font-semibold mb-3 flex items-center gap-2">
                                    <i class="pi pi-user text-green-600"></i>
                                    Staff Productivity
                                </h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">Orders/Waiter</span>
                                        <span class="font-medium">{{ analyticsStore.performanceMetrics.staffProductivity.ordersPerWaiter }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">Upsell Rate</span>
                                        <span class="font-medium text-blue-600">{{ formatPercentage(analyticsStore.performanceMetrics.staffProductivity.upsellRate) }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-surface-600">Staff Rating</span>
                                        <span class="font-medium">{{ analyticsStore.performanceMetrics.staffProductivity.customerFeedback }}/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </TabPanel>

            <!-- Sales Analytics Tab -->
            <TabPanel header="Sales Analytics">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Top Selling Items -->
                    <Card>
                        <template #title>Top Selling Items</template>
                        <template #content>
                            <DataTable :value="analyticsStore.topSellingItems" :rows="10" class="sales-table">
                                <Column field="name" header="Item" class="min-w-[150px]">
                                    <template #body="{ data }">
                                        <div>
                                            <div class="font-semibold">{{ data.name }}</div>
                                            <div class="text-sm text-surface-600">{{ data.category }}</div>
                                        </div>
                                    </template>
                                </Column>
                                <Column field="quantitySold" header="Sold" sortable>
                                    <template #body="{ data }">
                                        <span class="font-medium">{{ data.quantitySold }}</span>
                                    </template>
                                </Column>
                                <Column field="revenue" header="Revenue" sortable>
                                    <template #body="{ data }">
                                        <span class="font-semibold">{{ formatCurrency(data.revenue) }}</span>
                                    </template>
                                </Column>
                                <Column field="trend" header="Trend">
                                    <template #body="{ data }">
                                        <div class="flex items-center gap-2">
                                            <i
                                                :class="{
                                                    'pi pi-arrow-up text-green-500': data.trend === 'up',
                                                    'pi pi-arrow-down text-red-500': data.trend === 'down',
                                                    'pi pi-minus text-gray-500': data.trend === 'stable'
                                                }"
                                            ></i>
                                            <span
                                                :class="{
                                                    'text-green-500': data.trend === 'up',
                                                    'text-red-500': data.trend === 'down',
                                                    'text-gray-500': data.trend === 'stable'
                                                }"
                                            >
                                                {{ formatPercentage(Math.abs(data.trendPercent)) }}
                                            </span>
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </template>
                    </Card>

                    <!-- Hourly Sales -->
                    <Card>
                        <template #title>Hourly Sales Pattern</template>
                        <template #content>
                            <Chart type="line" :data="hourlyChartData" :options="chartOptions" class="h-80" />
                        </template>
                    </Card>
                </div>

                <!-- Category Analysis -->
                <Card class="mt-6">
                    <template #title>Category Performance Analysis</template>
                    <template #content>
                        <DataTable :value="analyticsStore.categoryAnalytics" :rows="10" class="category-table">
                            <Column field="name" header="Category" sortable />
                            <Column field="quantity" header="Items Sold" sortable />
                            <Column field="revenue" header="Revenue" sortable>
                                <template #body="{ data }">
                                    {{ formatCurrency(data.revenue) }}
                                </template>
                            </Column>
                            <Column field="orderCount" header="Orders" sortable />
                            <Column field="avgOrderValue" header="Avg Order Value" sortable>
                                <template #body="{ data }">
                                    {{ formatCurrency(data.avgOrderValue) }}
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>
            </TabPanel>

            <!-- Performance Tab -->
            <TabPanel header="Performance">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Table Performance -->
                    <Card>
                        <template #title>Table Performance</template>
                        <template #content>
                            <DataTable :value="analyticsStore.tablePerformance" :rows="10" class="performance-table">
                                <Column field="number" header="Table" sortable />
                                <Column field="orders" header="Orders" sortable />
                                <Column field="revenue" header="Revenue" sortable>
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.revenue) }}
                                    </template>
                                </Column>
                                <Column field="capacity" header="Capacity" sortable />
                            </DataTable>
                        </template>
                    </Card>

                    <!-- Waiter Performance -->
                    <Card>
                        <template #title>Staff Performance</template>
                        <template #content>
                            <DataTable :value="analyticsStore.waiterPerformance" :rows="10" class="staff-table">
                                <Column field="name" header="Staff Member" />
                                <Column field="orders" header="Orders" sortable />
                                <Column field="revenue" header="Revenue" sortable>
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.revenue) }}
                                    </template>
                                </Column>
                                <Column field="avgOrderValue" header="Avg Order" sortable>
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.avgOrderValue) }}
                                    </template>
                                </Column>
                                <Column field="tips" header="Tips" sortable>
                                    <template #body="{ data }">
                                        {{ formatCurrency(data.tips) }}
                                    </template>
                                </Column>
                            </DataTable>
                        </template>
                    </Card>
                </div>
            </TabPanel>

            <!-- Customer Analytics Tab -->
            <TabPanel header="Customer Analytics">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Customer Demographics -->
                    <Card>
                        <template #title>Customer Demographics</template>
                        <template #content>
                            <div class="space-y-6">
                                <!-- Age Groups -->
                                <div>
                                    <h4 class="font-semibold mb-3">Age Distribution</h4>
                                    <div class="space-y-2">
                                        <div v-for="group in analyticsStore.customerAnalytics.demographics.ageGroups" :key="group.range" class="flex items-center justify-between">
                                            <span class="text-sm">{{ group.range }}</span>
                                            <div class="flex items-center gap-2">
                                                <ProgressBar :value="group.percentage" class="w-24" style="height: 6px" />
                                                <span class="text-sm font-medium w-12">{{ formatPercentage(group.percentage) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Visit Frequency -->
                                <div>
                                    <h4 class="font-semibold mb-3">Visit Frequency</h4>
                                    <div class="space-y-2">
                                        <div v-for="freq in analyticsStore.customerAnalytics.demographics.visitFrequency" :key="freq.type" class="flex items-center justify-between">
                                            <span class="text-sm">{{ freq.type }}</span>
                                            <div class="flex items-center gap-2">
                                                <ProgressBar :value="freq.percentage" class="w-24" style="height: 6px" />
                                                <span class="text-sm font-medium w-12">{{ formatPercentage(freq.percentage) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Loyalty Metrics -->
                    <Card>
                        <template #title>Customer Loyalty</template>
                        <template #content>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div class="text-2xl font-bold text-blue-600">{{ analyticsStore.customerAnalytics.loyalty.totalCustomers }}</div>
                                    <div class="text-sm text-blue-600">Total Customers</div>
                                </div>
                                <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div class="text-2xl font-bold text-green-600">{{ analyticsStore.customerAnalytics.loyalty.newCustomers }}</div>
                                    <div class="text-sm text-green-600">New This Period</div>
                                </div>
                                <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div class="text-2xl font-bold text-purple-600">{{ formatCurrency(analyticsStore.customerAnalytics.loyalty.avgLifetimeValue) }}</div>
                                    <div class="text-sm text-purple-600">Avg Lifetime Value</div>
                                </div>
                                <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div class="text-2xl font-bold text-orange-600">{{ formatPercentage(analyticsStore.customerAnalytics.loyalty.churnRate) }}</div>
                                    <div class="text-sm text-orange-600">Churn Rate</div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>

<style scoped>
.analytics-dashboard {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.analytics-tabs {
    margin-top: 1rem;
}

.metric-card {
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.metric-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.metric-icon-container {
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.metric-details {
    flex: 1;
}

.metric-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.25rem;
}

.metric-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-bottom: 0.25rem;
}

.metric-change,
.metric-subtitle {
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.performance-section {
    padding: 1.5rem;
    border: 1px solid var(--surface-border);
    border-radius: 0.75rem;
    background: var(--surface-50);
}

.dark .performance-section {
    background: var(--surface-800);
}

.sales-table,
.category-table,
.performance-table,
.staff-table {
    margin: -1rem;
}

/* Chart containers */
:deep(.p-chart) {
    position: relative;
}

/* Tab styling */
:deep(.p-tabview-nav-link) {
    font-weight: 600;
}

:deep(.p-tabview-nav-link:focus) {
    box-shadow: none;
}

/* Progress bar styling */
:deep(.p-progressbar) {
    background: var(--surface-300);
}

:deep(.p-progressbar-value) {
    background: var(--primary-color);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .analytics-dashboard {
        padding: 1rem;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: stretch;
    }

    .metric-value {
        font-size: 1.5rem;
    }

    .metric-content {
        flex-direction: column;
        text-align: center;
    }

    .performance-section {
        padding: 1rem;
    }
}
</style>
