<script setup>
import { useAuthStore } from '@/stores/auth';
import { useOrderStore } from '@/stores/order';
import { useTableStore } from '@/stores/table';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const tableStore = useTableStore();
const toast = useToast();

// Component state
const isRealTimeEnabled = ref(true);
const loadingOrders = ref(false);
const branches = ref([]);
const loadingBranches = ref(false);
// Real-time update interval
let updateInterval = null;

// Computed properties
const todaysMetrics = computed(() => {
    const today = new Date().toDateString();
    const todaysOrders = orderStore.orders.filter((order) => new Date(order.createdAt).toDateString() === today);

    const completedOrders = todaysOrders.filter((order) => order.status === 'completed');
    const revenue = completedOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);

    return {
        revenue,
        revenueChange: 12.5, // Mock data - would come from backend
        activeOrders: orderStore.orders.filter((order) => ['pending', 'preparing', 'ready'].includes(order.status)).length,
        totalOrdersToday: todaysOrders.length,
        occupiedTables: tableStore.tables.filter((table) => table.status === 'occupied').length,
        totalTables: tableStore.tables.length,
        averageOrderValue: completedOrders.length > 0 ? revenue / completedOrders.length : 0,
        aovChange: 8.3 // Mock data
    };
});

const tableOccupancyPercentage = computed(() => {
    if (todaysMetrics.value.totalTables === 0) return 0;
    return Math.round((todaysMetrics.value.occupiedTables / todaysMetrics.value.totalTables) * 100);
});

const recentOrders = computed(() => {
    return [...orderStore.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
});

const tableStats = computed(() => {
    const stats = { free: 0, occupied: 0, reserved: 0, cleaning: 0, outOfOrder: 0 };
    const tables = tableStore.tables;
    tables.forEach((table) => {
        stats[table.status] = (stats[table.status] || 0) + 1;
    });
    return stats;
});

const currentUserName = computed(() => {
    return authStore.userName || authStore.user?.full_name || authStore.user?.name || 'User';
});

// Methods
const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
};

const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => {
        let itemTotal = item.price * item.quantity;
        if (item.modifiers) {
            itemTotal += item.modifiers.reduce((modTotal, mod) => modTotal + (mod.price || 0), 0) * item.quantity;
        }
        return total + itemTotal;
    }, 0);
};

const getTableNumber = (tableId) => {
    const table = tableStore.tables.find((t) => t.id === tableId);
    return table ? table.number : tableId;
};

const getOrderStatusSeverity = (status) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'preparing':
            return 'info';
        case 'ready':
            return 'success';
        case 'served':
            return 'secondary';
        case 'completed':
            return 'success';
        default:
            return 'secondary';
    }
};

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const toggleRealTime = () => {
    isRealTimeEnabled.value = !isRealTimeEnabled.value;

    if (isRealTimeEnabled.value) {
        startRealTimeUpdates();
        toast.add({
            severity: 'success',
            summary: 'Real-time Updates Enabled',
            detail: 'Dashboard will auto-refresh every 30 seconds',
            life: 3000
        });
    } else {
        stopRealTimeUpdates();
        toast.add({
            severity: 'warn',
            summary: 'Real-time Updates Paused',
            detail: 'Use refresh button for manual updates',
            life: 3000
        });
    }
};

const startRealTimeUpdates = () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    updateInterval = setInterval(refreshDashboard, 30000); // 30 seconds
};

const stopRealTimeUpdates = () => {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
};

const refreshDashboard = async () => {
    try {
        loadingOrders.value = true;
        await Promise.all([orderStore.fetchOrders(), tableStore.loadTables()]);

        toast.add({
            severity: 'success',
            summary: 'Dashboard Updated',
            detail: 'All data refreshed successfully',
            life: 2000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Refresh Failed',
            detail: 'Unable to update dashboard data',
            life: 5000
        });
    } finally {
        loadingOrders.value = false;
    }
};

const fetchBranches = async () => {
    loadingBranches.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        let url = 'http://localhost:8000/branches/';
        if (restaurantId) {
            url += `?restaurant_id=${restaurantId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            branches.value = data.results || data;
        } else {
            throw new Error('Failed to fetch branches');
        }
    } catch (error) {
        console.error('Error fetching branches:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch branches',
            life: 3000
        });
    } finally {
        loadingBranches.value = false;
    }
};

// Lifecycle
onMounted(async () => {
    // Initialize auth store to load user from localStorage
    authStore.initializeAuth();
    await refreshDashboard();
    await fetchBranches();
    if (isRealTimeEnabled.value) {
        startRealTimeUpdates();
    }
});
onUnmounted(() => {
    stopRealTimeUpdates();
});
</script>

<template>
    <div class="dashboard">
        <div class="dashboard-header">
            <div>
                <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Good {{ getTimeGreeting() }}, {{ currentUserName }}!</h1>
                <div class="flex flex-wrap gap-2 justify-center items-center">
                    <!-- Static button -->
                    <button class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">All Branches</button>

                    <!-- Dynamic buttons from API -->
                    <button v-for="(branch, index) in branches" :key="index" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                        {{ branch.branch_name }}
                    </button>
                </div>
            </div>
            <div class="flex gap-3">
                <Button :label="isRealTimeEnabled ? 'Pause Updates' : 'Enable Real-time'" :icon="isRealTimeEnabled ? 'pi pi-pause' : 'pi pi-play'" :severity="isRealTimeEnabled ? 'warning' : 'success'" outlined @click="toggleRealTime" />
                <Button label="Refresh All" icon="pi pi-refresh" @click="refreshDashboard" />
            </div>
        </div>

        <!-- Key Metrics Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Today's Revenue -->
            <Card class="metric-card revenue-card">
                <template #content>
                    <div class="metric-content">
                        <div class="metric-icon-container bg-green-100 dark:bg-green-900/30">
                            <i class="pi pi-dollar text-2xl text-green-600"></i>
                        </div>
                        <div class="metric-details">
                            <div class="metric-value text-green-600">${{ todaysMetrics.revenue.toFixed(2) }}</div>
                            <div class="metric-label">Today's Revenue</div>
                            <div class="metric-change">
                                <i :class="todaysMetrics.revenueChange >= 0 ? 'pi pi-arrow-up text-green-500' : 'pi pi-arrow-down text-red-500'"></i>
                                <span :class="todaysMetrics.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'"> {{ Math.abs(todaysMetrics.revenueChange).toFixed(1) }}% from yesterday </span>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Active Orders -->
            <Card class="metric-card orders-card">
                <template #content>
                    <div class="metric-content">
                        <div class="metric-icon-container bg-blue-100 dark:bg-blue-900/30">
                            <i class="pi pi-shopping-cart text-2xl text-blue-600"></i>
                        </div>
                        <div class="metric-details">
                            <div class="metric-value text-blue-600">{{ todaysMetrics.activeOrders }}</div>
                            <div class="metric-label">Active Orders</div>
                            <div class="metric-subtitle">{{ todaysMetrics.totalOrdersToday }} total today</div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Table Occupancy -->
            <Card class="metric-card tables-card">
                <template #content>
                    <div class="metric-content">
                        <div class="metric-icon-container bg-orange-100 dark:bg-orange-900/30">
                            <i class="pi pi-users text-2xl text-orange-600"></i>
                        </div>
                        <div class="metric-details">
                            <div class="metric-value text-orange-600">{{ tableOccupancyPercentage }}%</div>
                            <div class="metric-label">Table Occupancy</div>
                            <div class="metric-subtitle">{{ todaysMetrics.occupiedTables }}/{{ todaysMetrics.totalTables }} occupied</div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Average Order Value -->
            <Card class="metric-card aov-card">
                <template #content>
                    <div class="metric-content">
                        <div class="metric-icon-container bg-purple-100 dark:bg-purple-900/30">
                            <i class="pi pi-chart-line text-2xl text-purple-600"></i>
                        </div>
                        <div class="metric-details">
                            <div class="metric-value text-purple-600">${{ todaysMetrics.averageOrderValue.toFixed(2) }}</div>
                            <div class="metric-label">Avg Order Value</div>
                            <div class="metric-change">
                                <i :class="todaysMetrics.aovChange >= 0 ? 'pi pi-arrow-up text-green-500' : 'pi pi-arrow-down text-red-500'"></i>
                                <span :class="todaysMetrics.aovChange >= 0 ? 'text-green-500' : 'text-red-500'"> {{ Math.abs(todaysMetrics.aovChange).toFixed(1) }}% vs yesterday </span>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Orders -->
            <div class="lg:col-span-2">
                <Card>
                    <template #title>
                        <div class="flex justify-between items-center">
                            <span>Recent Orders</span>
                            <router-link to="/orders/management">
                                <Button label="View All" size="small" outlined />
                            </router-link>
                        </div>
                    </template>
                    <template #content>
                        <DataTable :value="recentOrders" :rows="5" :loading="loadingOrders" class="dashboard-table">
                            <Column field="id" header="Order #" sortable>
                                <template #body="{ data }">
                                    <router-link :to="`/orders/${data.id}`" class="text-primary font-medium"> #{{ data.id }} </router-link>
                                </template>
                            </Column>
                            <Column field="tableNumber" header="Table" sortable>
                                <template #body="{ data }">
                                    <Tag :value="`Table ${getTableNumber(data.tableId)}`" />
                                </template>
                            </Column>
                            <Column field="status" header="Status" sortable>
                                <template #body="{ data }">
                                    <Tag :value="data.status" :severity="getOrderStatusSeverity(data.status)" class="capitalize" />
                                </template>
                            </Column>
                            <Column field="total" header="Total" sortable>
                                <template #body="{ data }">
                                    <span class="font-semibold">${{ calculateOrderTotal(data).toFixed(2) }}</span>
                                </template>
                            </Column>
                            <Column field="createdAt" header="Time" sortable>
                                <template #body="{ data }">
                                    {{ formatTime(data.createdAt) }}
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>
            </div>

            <!-- Quick Actions & Alerts -->
            <div class="space-y-6">
                <!-- Quick Actions -->
                <Card>
                    <template #title>Quick Actions</template>
                    <template #content>
                        <div class="space-y-3">
                            <router-link to="/orders/new" class="block">
                                <Button label="New Order" icon="pi pi-plus" class="w-full justify-start" severity="success" />
                            </router-link>
                            <router-link to="/tables" class="block">
                                <Button label="Manage Tables" icon="pi pi-th-large" class="w-full justify-start" outlined />
                            </router-link>
                            <router-link to="/billing" class="block">
                                <Button label="Process Payment" icon="pi pi-credit-card" class="w-full justify-start" outlined />
                            </router-link>
                            <router-link to="/kitchen" class="block" v-if="authStore.hasPermission('view_kitchen')">
                                <Button label="Kitchen Display" icon="pi pi-home" class="w-full justify-start" outlined />
                            </router-link>
                        </div>
                    </template>
                </Card>

                <!-- Table Status Overview -->
                <Card>
                    <template #title>Table Status</template>
                    <template #content>
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-3 text-center">
                                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div class="text-2xl font-bold text-green-600">{{ tableStats.free }}</div>
                                    <div class="text-sm text-green-600">Free</div>
                                </div>
                                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div class="text-2xl font-bold text-blue-600">{{ tableStats.occupied }}</div>
                                    <div class="text-sm text-blue-600">Occupied</div>
                                </div>
                                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div class="text-2xl font-bold text-orange-600">{{ tableStats.reserved }}</div>
                                    <div class="text-sm text-orange-600">Reserved</div>
                                </div>
                                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div class="text-2xl font-bold text-yellow-600">{{ tableStats.cleaning }}</div>
                                    <div class="text-sm text-yellow-600">Cleaning</div>
                                </div>
                            </div>
                            <router-link to="/tables">
                                <Button label="View Floor Layout" class="w-full" outlined />
                            </router-link>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard {
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

.dashboard-table {
    margin: -1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .dashboard {
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
}
</style>
