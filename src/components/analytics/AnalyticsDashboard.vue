<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useReportsStore } from '@/stores/reports';
import { useToast } from 'primevue/usetoast';

export default {
    name: 'AnalyticsDashboard',
    setup() {
        const reportsStore = useReportsStore();
        const toast = useToast();

        // Reactive data
        const loading = ref(false);
        const showReportDialog = ref(false);
        const showExportDialog = ref(false);
        const generatingReport = ref(false);
        const selectedTrendPeriod = ref('daily');

        // Filters
        const filters = ref({
            dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
            period: 'daily',
            location: 'all',
            staff: 'all',
            category: 'all'
        });

        // Report configuration
        const reportConfig = ref({
            title: '',
            type: 'sales',
            format: 'csv',
            dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
            metrics: ['revenue', 'orders']
        });

        // Options for dropdowns
        const periodOptions = [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' }
        ];

        const locationOptions = [
            { label: 'All Locations', value: 'all' },
            { label: 'Main Branch', value: 'main' }
        ];

        const staffOptions = [
            { label: 'All Staff', value: 'all' },
            { label: 'John Doe', value: 'STF001' },
            { label: 'Jane Smith', value: 'STF002' }
        ];

        const categoryOptions = [
            { label: 'All Categories', value: 'all' },
            { label: 'Appetizers', value: 'appetizers' },
            { label: 'Main Courses', value: 'mains' },
            { label: 'Desserts', value: 'desserts' },
            { label: 'Beverages', value: 'beverages' }
        ];

        const reportTypes = [
            { label: 'Sales Report', value: 'sales' },
            { label: 'Financial Report', value: 'financial' },
            { label: 'Staff Performance', value: 'staff' },
            { label: 'Inventory Report', value: 'inventory' }
        ];

        const exportFormats = [
            { label: 'CSV', value: 'csv' },
            { label: 'JSON', value: 'json' },
            { label: 'PDF', value: 'pdf' }
        ];

        const availableMetrics = [
            { label: 'Revenue', value: 'revenue' },
            { label: 'Orders', value: 'orders' },
            { label: 'Average Order Value', value: 'avgOrderValue' },
            { label: 'Profit Margin', value: 'profitMargin' }
        ];

        const trendPeriods = [
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' }
        ];

        // Computed properties
        const dashboardWidgets = computed(() => reportsStore.dashboardWidgets);
        const chartData = computed(() => reportsStore.chartData);
        const kpis = computed(() => reportsStore.kpis);

        // Mock data for top performers
        const topProducts = ref([
            { rank: 1, name: 'Grilled Salmon', sales: 2450, quantity: 89 },
            { rank: 2, name: 'Chicken Burger', sales: 2180, quantity: 145 },
            { rank: 3, name: 'Caesar Salad', sales: 1890, quantity: 126 },
            { rank: 4, name: 'Ribeye Steak', sales: 1650, quantity: 45 },
            { rank: 5, name: 'Margherita Pizza', sales: 1420, quantity: 78 }
        ]);

        const topStaff = ref([
            { rank: 1, name: 'John Doe', orders: 156, revenue: 8450 },
            { rank: 2, name: 'Jane Smith', orders: 142, revenue: 7890 },
            { rank: 3, name: 'Mike Johnson', orders: 128, revenue: 6780 },
            { rank: 4, name: 'Sarah Wilson', orders: 115, revenue: 6234 },
            { rank: 5, name: 'Tom Brown', orders: 98, revenue: 5456 }
        ]);

        // Chart options
        const chartOptions = {
            line: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Revenue ($)'
                        }
                    }
                }
            },
            doughnut: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            },
            bar: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Hour'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Orders'
                        }
                    }
                }
            },
            trends: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: {
                        display: true
                    },
                    y: {
                        display: true
                    }
                }
            }
        };

        // Methods
        const refreshData = async () => {
            loading.value = true;
            try {
                await reportsStore.initializeReports();
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Data refreshed successfully',
                    life: 3000
                });
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to refresh data',
                    life: 3000
                });
            } finally {
                loading.value = false;
            }
        };

        const applyFilters = () => {
            const filterObj = {
                dateRange: {
                    start: filters.value.dateRange[0],
                    end: filters.value.dateRange[1]
                },
                period: filters.value.period,
                location: filters.value.location,
                staff: filters.value.staff,
                category: filters.value.category
            };

            reportsStore.updateReportFilters(filterObj);
        };

        const resetFilters = () => {
            filters.value = {
                dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
                period: 'daily',
                location: 'all',
                staff: 'all',
                category: 'all'
            };
            applyFilters();
        };

        const formatMetricValue = (widget) => {
            switch (widget.id) {
                case 'revenue-today':
                case 'avg-order-value':
                    return `$${widget.value.toLocaleString()}`;
                case 'orders-today':
                    return widget.value.toLocaleString();
                case 'customer-satisfaction':
                    return `${widget.value.toFixed(1)}/5.0`;
                default:
                    return widget.value.toString();
            }
        };

        const getBadgeSeverity = (rank) => {
            switch (rank) {
                case 1:
                    return 'success';
                case 2:
                    return 'info';
                case 3:
                    return 'warning';
                default:
                    return 'secondary';
            }
        };

        const updateTrendChart = () => {
            const trendData = reportsStore.trends[selectedTrendPeriod.value];

            reportsStore.chartData.trends = {
                labels: trendData.map((t) => t.period),
                datasets: [
                    {
                        label: 'Revenue',
                        data: trendData.map((t) => t.revenue),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Orders',
                        data: trendData.map((t) => t.orders),
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            };
        };

        const generateCustomReport = async () => {
            generatingReport.value = true;
            try {
                const result = await reportsStore.generateCustomReport(reportConfig.value);
                if (result.success) {
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Report generated successfully',
                        life: 3000
                    });
                    showReportDialog.value = false;

                    // Auto-export the report
                    await reportsStore.exportReport(result.report.id, reportConfig.value.format);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            } finally {
                generatingReport.value = false;
            }
        };

        const exportData = () => {
            showExportDialog.value = true;

            // Simulate export process
            setTimeout(() => {
                showExportDialog.value = false;
                toast.add({
                    severity: 'success',
                    summary: 'Export Complete',
                    detail: 'Your data has been exported successfully',
                    life: 3000
                });
            }, 2000);
        };

        // Initialize data on component mount
        onMounted(async () => {
            await refreshData();
            updateTrendChart();
        });

        // Watch for trend period changes
        watch(selectedTrendPeriod, updateTrendChart);

        return {
            // Reactive data
            loading,
            showReportDialog,
            showExportDialog,
            generatingReport,
            selectedTrendPeriod,
            filters,
            reportConfig,

            // Options
            periodOptions,
            locationOptions,
            staffOptions,
            categoryOptions,
            reportTypes,
            exportFormats,
            availableMetrics,
            trendPeriods,

            // Computed
            dashboardWidgets,
            chartData,
            kpis,
            topProducts,
            topStaff,
            chartOptions,

            // Methods
            refreshData,
            applyFilters,
            resetFilters,
            formatMetricValue,
            getBadgeSeverity,
            updateTrendChart,
            generateCustomReport,
            exportData
        };
    }
};
</script>

<template>
    <div class="analytics-dashboard">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex justify-content-between align-items-center">
                <div>
                    <h2 class="text-3xl font-semibold text-900 mb-2">Analytics & Reports</h2>
                    <p class="text-600">Comprehensive insights into your restaurant performance</p>
                </div>
                <div class="flex gap-2">
                    <Button label="Generate Report" icon="pi pi-file" @click="showReportDialog = true" class="p-button-outlined" />
                    <Button label="Export Data" icon="pi pi-download" @click="exportData" class="p-button-outlined" />
                    <Button label="Refresh" icon="pi pi-refresh" @click="refreshData" :loading="loading" />
                </div>
            </div>
        </div>

        <!-- Filters -->
        <Card class="mb-6">
            <template #content>
                <div class="grid">
                    <div class="col-12 md:col-3">
                        <label class="block text-900 font-medium mb-2">Date Range</label>
                        <Calendar v-model="filters.dateRange" selection-mode="range" :show-button-bar="true" date-format="mm/dd/yy" class="w-full" @date-select="applyFilters" />
                    </div>
                    <div class="col-12 md:col-2">
                        <label class="block text-900 font-medium mb-2">Period</label>
                        <Dropdown v-model="filters.period" :options="periodOptions" option-label="label" option-value="value" class="w-full" @change="applyFilters" />
                    </div>
                    <div class="col-12 md:col-2">
                        <label class="block text-900 font-medium mb-2">Location</label>
                        <Dropdown v-model="filters.location" :options="locationOptions" option-label="label" option-value="value" class="w-full" @change="applyFilters" />
                    </div>
                    <div class="col-12 md:col-2">
                        <label class="block text-900 font-medium mb-2">Staff</label>
                        <Dropdown v-model="filters.staff" :options="staffOptions" option-label="label" option-value="value" class="w-full" @change="applyFilters" />
                    </div>
                    <div class="col-12 md:col-2">
                        <label class="block text-900 font-medium mb-2">Category</label>
                        <Dropdown v-model="filters.category" :options="categoryOptions" option-label="label" option-value="value" class="w-full" @change="applyFilters" />
                    </div>
                    <div class="col-12 md:col-1">
                        <label class="block text-900 font-medium mb-2">&nbsp;</label>
                        <Button label="Reset" icon="pi pi-times" class="p-button-outlined w-full" @click="resetFilters" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- KPI Dashboard Widgets -->
        <div class="grid mb-6">
            <div v-for="widget in dashboardWidgets" :key="widget.id" class="col-12 lg:col-3 md:col-6">
                <Card class="mb-4">
                    <template #content>
                        <div class="flex justify-content-between align-items-start">
                            <div>
                                <span class="block text-500 font-medium mb-3">{{ widget.title }}</span>
                                <div class="text-900 font-medium text-xl">
                                    {{ formatMetricValue(widget) }}
                                </div>
                            </div>
                            <div class="flex align-items-center justify-content-center border-round" :style="`background-color: ${widget.color}20; color: ${widget.color}; width: 2.5rem; height: 2.5rem`">
                                <i :class="widget.icon"></i>
                            </div>
                        </div>
                        <span class="text-500 font-medium">
                            <span :class="widget.change >= 0 ? 'text-green-500' : 'text-red-500'">
                                <i :class="widget.change >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                                {{ Math.abs(widget.change).toFixed(1) }}%
                            </span>
                            <span class="ml-2">since yesterday</span>
                        </span>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid mb-6">
            <!-- Revenue Chart -->
            <div class="col-12 lg:col-8">
                <Card>
                    <template #title>Revenue Trend</template>
                    <template #content>
                        <Chart type="line" :data="chartData.revenue" :options="chartOptions.line" class="h-20rem" />
                    </template>
                </Card>
            </div>

            <!-- Category Performance -->
            <div class="col-12 lg:col-4">
                <Card>
                    <template #title>Category Performance</template>
                    <template #content>
                        <Chart type="doughnut" :data="chartData.categories" :options="chartOptions.doughnut" class="h-20rem" />
                    </template>
                </Card>
            </div>
        </div>

        <!-- Detailed Analytics Tabs -->
        <TabView>
            <!-- Financial Analysis -->
            <TabPanel header="Financial Analysis" left-icon="pi pi-dollar">
                <div class="grid">
                    <div class="col-12 lg:col-6">
                        <Card>
                            <template #title>Profit Analysis</template>
                            <template #content>
                                <div class="grid">
                                    <div class="col-6">
                                        <div class="text-center">
                                            <span class="block text-500 font-medium mb-2">Total Revenue</span>
                                            <span class="text-2xl font-bold text-green-500"> ${{ kpis.financial.totalRevenue.toLocaleString() }} </span>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-center">
                                            <span class="block text-500 font-medium mb-2">Gross Profit</span>
                                            <span class="text-2xl font-bold text-blue-500"> ${{ kpis.financial.grossProfit.toLocaleString() }} </span>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-center">
                                            <span class="block text-500 font-medium mb-2">Profit Margin</span>
                                            <span class="text-2xl font-bold text-purple-500"> {{ kpis.financial.profitMargin.toFixed(1) }}% </span>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-center">
                                            <span class="block text-500 font-medium mb-2">Avg Order Value</span>
                                            <span class="text-2xl font-bold text-orange-500"> ${{ kpis.financial.avgOrderValue.toFixed(2) }} </span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>

                    <div class="col-12 lg:col-6">
                        <Card>
                            <template #title>Cost Breakdown</template>
                            <template #content>
                                <div class="mb-4">
                                    <div class="flex justify-content-between align-items-center mb-2">
                                        <span>Food Costs</span>
                                        <span class="font-semibold">70%</span>
                                    </div>
                                    <ProgressBar :value="70" class="mb-3" />
                                </div>
                                <div class="mb-4">
                                    <div class="flex justify-content-between align-items-center mb-2">
                                        <span>Labor Costs</span>
                                        <span class="font-semibold">20%</span>
                                    </div>
                                    <ProgressBar :value="20" class="mb-3" />
                                </div>
                                <div class="mb-4">
                                    <div class="flex justify-content-between align-items-center mb-2">
                                        <span>Overhead</span>
                                        <span class="font-semibold">10%</span>
                                    </div>
                                    <ProgressBar :value="10" />
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </TabPanel>

            <!-- Operational Metrics -->
            <TabPanel header="Operations" left-icon="pi pi-cog">
                <div class="grid">
                    <div class="col-12 lg:col-4">
                        <Card>
                            <template #title>Order Statistics</template>
                            <template #content>
                                <div class="grid">
                                    <div class="col-12">
                                        <div class="flex justify-content-between align-items-center mb-3">
                                            <span>Total Orders</span>
                                            <Chip :label="kpis.operational.totalOrders" class="bg-blue-100 text-blue-700" />
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="flex justify-content-between align-items-center mb-3">
                                            <span>Completed</span>
                                            <Chip :label="kpis.operational.completedOrders" class="bg-green-100 text-green-700" />
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="flex justify-content-between align-items-center">
                                            <span>Cancelled</span>
                                            <Chip :label="kpis.operational.cancelledOrders" class="bg-red-100 text-red-700" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>

                    <div class="col-12 lg:col-4">
                        <Card>
                            <template #title>Performance Metrics</template>
                            <template #content>
                                <div class="grid">
                                    <div class="col-12 text-center mb-3">
                                        <span class="block text-500 font-medium mb-2">Avg Prep Time</span>
                                        <span class="text-2xl font-bold">{{ kpis.operational.avgPrepTime }} min</span>
                                    </div>
                                    <div class="col-12 text-center mb-3">
                                        <span class="block text-500 font-medium mb-2">Tables Turned</span>
                                        <span class="text-2xl font-bold">{{ kpis.operational.tablesTurned }}</span>
                                    </div>
                                    <div class="col-12 text-center">
                                        <span class="block text-500 font-medium mb-2">Staff Utilization</span>
                                        <span class="text-2xl font-bold">{{ kpis.operational.staffUtilization }}%</span>
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>

                    <div class="col-12 lg:col-4">
                        <Card>
                            <template #title>Customer Satisfaction</template>
                            <template #content>
                                <div class="text-center">
                                    <div class="mb-4">
                                        <span class="text-6xl font-bold text-yellow-500">
                                            {{ kpis.operational.customerSatisfaction }}
                                        </span>
                                        <span class="text-2xl text-500">/5.0</span>
                                    </div>
                                    <Rating :model-value="kpis.operational.customerSatisfaction" readonly :cancel="false" />
                                    <p class="text-500 mt-3">Based on customer reviews</p>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>

                <!-- Hourly Trends -->
                <Card class="mt-4">
                    <template #title>Hourly Order Trends</template>
                    <template #content>
                        <Chart type="bar" :data="chartData.hourly" :options="chartOptions.bar" class="h-20rem" />
                    </template>
                </Card>
            </TabPanel>

            <!-- Top Performers -->
            <TabPanel header="Top Performers" left-icon="pi pi-star">
                <div class="grid">
                    <div class="col-12 lg:col-6">
                        <Card>
                            <template #title>Best Selling Items</template>
                            <template #content>
                                <DataTable :value="topProducts" class="p-datatable-sm">
                                    <Column field="rank" header="Rank" style="width: 60px">
                                        <template #body="slotProps">
                                            <Badge :value="slotProps.data.rank" :severity="getBadgeSeverity(slotProps.data.rank)" />
                                        </template>
                                    </Column>
                                    <Column field="name" header="Item" />
                                    <Column field="sales" header="Sales">
                                        <template #body="slotProps"> ${{ slotProps.data.sales.toLocaleString() }} </template>
                                    </Column>
                                    <Column field="quantity" header="Qty" />
                                </DataTable>
                            </template>
                        </Card>
                    </div>

                    <div class="col-12 lg:col-6">
                        <Card>
                            <template #title>Top Staff Performance</template>
                            <template #content>
                                <DataTable :value="topStaff" class="p-datatable-sm">
                                    <Column field="rank" header="Rank" style="width: 60px">
                                        <template #body="slotProps">
                                            <Badge :value="slotProps.data.rank" :severity="getBadgeSeverity(slotProps.data.rank)" />
                                        </template>
                                    </Column>
                                    <Column field="name" header="Staff Member" />
                                    <Column field="orders" header="Orders" />
                                    <Column field="revenue" header="Revenue">
                                        <template #body="slotProps"> ${{ slotProps.data.revenue.toLocaleString() }} </template>
                                    </Column>
                                </DataTable>
                            </template>
                        </Card>
                    </div>
                </div>
            </TabPanel>

            <!-- Sales Trends -->
            <TabPanel header="Trends" left-icon="pi pi-chart-line">
                <div class="grid">
                    <div class="col-12">
                        <Card>
                            <template #title>
                                <div class="flex justify-content-between align-items-center">
                                    <span>Sales Trends</span>
                                    <SelectButton v-model="selectedTrendPeriod" :options="trendPeriods" option-label="label" option-value="value" @change="updateTrendChart" />
                                </div>
                            </template>
                            <template #content>
                                <Chart type="line" :data="chartData.trends" :options="chartOptions.trends" class="h-25rem" />
                            </template>
                        </Card>
                    </div>
                </div>
            </TabPanel>
        </TabView>

        <!-- Custom Report Dialog -->
        <Dialog v-model:visible="showReportDialog" modal header="Generate Custom Report" :style="{ width: '50rem' }">
            <div class="grid">
                <div class="col-12">
                    <label class="block text-900 font-medium mb-2">Report Title</label>
                    <InputText v-model="reportConfig.title" class="w-full" />
                </div>

                <div class="col-12 md:col-6">
                    <label class="block text-900 font-medium mb-2">Report Type</label>
                    <Dropdown v-model="reportConfig.type" :options="reportTypes" option-label="label" option-value="value" class="w-full" />
                </div>

                <div class="col-12 md:col-6">
                    <label class="block text-900 font-medium mb-2">Export Format</label>
                    <Dropdown v-model="reportConfig.format" :options="exportFormats" option-label="label" option-value="value" class="w-full" />
                </div>

                <div class="col-12">
                    <label class="block text-900 font-medium mb-2">Date Range</label>
                    <Calendar v-model="reportConfig.dateRange" selection-mode="range" :show-button-bar="true" date-format="mm/dd/yy" class="w-full" />
                </div>

                <div class="col-12">
                    <label class="block text-900 font-medium mb-2">Include Metrics</label>
                    <div class="grid">
                        <div class="col-6" v-for="metric in availableMetrics" :key="metric.value">
                            <Checkbox v-model="reportConfig.metrics" :input-id="metric.value" :value="metric.value" />
                            <label :for="metric.value" class="ml-2">{{ metric.label }}</label>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="showReportDialog = false" class="p-button-text" />
                <Button label="Generate Report" icon="pi pi-file" @click="generateCustomReport" :loading="generatingReport" />
            </template>
        </Dialog>

        <!-- Export Progress Dialog -->
        <Dialog v-model:visible="showExportDialog" modal header="Exporting Data" :closable="false" :style="{ width: '30rem' }">
            <div class="text-center">
                <ProgressSpinner />
                <p class="mt-3">Preparing your data export...</p>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.analytics-dashboard {
    padding: 1rem;
}

.p-card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.p-tabview .p-tabview-panels {
    padding: 1rem 0;
}

.p-datatable .p-datatable-thead > tr > th {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.p-progressbar {
    height: 8px;
}
</style>
