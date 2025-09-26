<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useKitchenStore } from '@/stores/kitchen.js';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import Chip from 'primevue/chip';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import ProgressBar from 'primevue/progressbar';
import Timeline from 'primevue/timeline';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import OverlayPanel from 'primevue/overlaypanel';
import Divider from 'primevue/divider';

const kitchenStore = useKitchenStore();
const toast = useToast();

// Reactive data
const selectedView = ref('stations');
const selectedStation = ref('all');
const showOrderDetails = ref(false);
const selectedOrder = ref(null);
const autoRefresh = ref(null);

// View options
const viewOptions = [
    { label: 'Station View', value: 'stations' },
    { label: 'Timeline View', value: 'timeline' },
    { label: 'Priority View', value: 'priority' }
];

const stationOptions = computed(() => [
    { label: 'All Stations', value: 'all' },
    ...Object.entries(kitchenStore.stations).map(([key, station]) => ({
        label: station.name,
        value: key
    }))
]);

// Computed properties
const filteredOrders = computed(() => {
    let orders = kitchenStore.pendingOrders;

    if (selectedStation.value !== 'all') {
        orders = orders.filter((order) => order.items.some((item) => item.station === selectedStation.value));
    }

    if (selectedView.value === 'priority') {
        orders = kitchenStore.ordersByPriority.filter((order) => !['completed', 'cancelled', 'served'].includes(order.status));
    }

    return orders;
});

const stationWorkload = computed(() => kitchenStore.stationWorkload);
const kitchenStats = computed(() => kitchenStore.kitchenStats);
const overdueOrders = computed(() => kitchenStore.overdueOrders);

// Methods
const openOrderDetails = (order) => {
    selectedOrder.value = order;
    showOrderDetails.value = true;
};

const updateOrderStatus = async (orderId, status, itemId = null) => {
    const result = await kitchenStore.updateOrderStatus(orderId, status, itemId);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: `Order status updated to ${status}`,
            life: 2000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message,
            life: 3000
        });
    }
};

const getOrderStatusColor = (status) => {
    const colors = {
        received: 'secondary',
        preparing: 'warning',
        cooking: 'info',
        ready: 'success',
        completed: 'success',
        served: 'success'
    };
    return colors[status] || 'secondary';
};

const getPriorityColor = (priority) => {
    const colors = {
        urgent: 'danger',
        high: 'warning',
        normal: 'info',
        low: 'secondary'
    };
    return colors[priority] || 'info';
};

const getStationColor = (stationKey) => {
    return kitchenStore.stations[stationKey]?.color || '#6b7280';
};

const formatElapsedTime = (startTime) => {
    const elapsed = Date.now() - new Date(startTime).getTime();
    const minutes = Math.floor(elapsed / 60000);
    return minutes > 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
};

const getOrderProgress = (order) => {
    if (!order.actualStartTime) return 0;

    const elapsed = Date.now() - new Date(order.actualStartTime).getTime();
    const estimated = order.estimatedPrepTime * 60000;
    return Math.min((elapsed / estimated) * 100, 100);
};

const getProgressColor = (progress) => {
    if (progress < 70) return 'success';
    if (progress < 90) return 'warning';
    return 'danger';
};

const isOrderOverdue = (order) => {
    if (!order.actualStartTime) return false;
    const elapsed = Date.now() - new Date(order.actualStartTime).getTime();
    const estimated = order.estimatedPrepTime * 60000;
    return elapsed > estimated;
};

const startAutoRefresh = () => {
    autoRefresh.value = setInterval(() => {
        kitchenStore.fetchKitchenOrders();
    }, 30000); // Refresh every 30 seconds
};

const stopAutoRefresh = () => {
    if (autoRefresh.value) {
        clearInterval(autoRefresh.value);
        autoRefresh.value = null;
    }
};

// Lifecycle hooks
onMounted(() => {
    kitchenStore.initializeKitchen();
    startAutoRefresh();
});

onUnmounted(() => {
    stopAutoRefresh();
});

// Timeline events for timeline view
const timelineEvents = computed(() => {
    return filteredOrders.value.map((order) => ({
        status: order.status,
        date: order.orderTime,
        icon: 'pi pi-shopping-cart',
        color: getOrderStatusColor(order.status),
        order: order
    }));
});
</script>

<template>
    <div class="kitchen-display p-6 min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Kitchen Display System</h1>
                <p class="text-gray-600">Real-time order management and kitchen operations</p>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <Dropdown v-model="selectedView" :options="viewOptions" option-label="label" option-value="value" class="w-40" />
                    <Dropdown v-model="selectedStation" :options="stationOptions" option-label="label" option-value="value" class="w-40" />
                </div>

                <Button icon="pi pi-refresh" severity="secondary" @click="kitchenStore.fetchKitchenOrders" v-tooltip="'Refresh Orders'" />

                <Button icon="pi pi-exclamation-triangle" severity="danger" @click="kitchenStore.activateEmergencyMode" v-tooltip="'Emergency Mode'" />
            </div>
        </div>

        <!-- Stats Dashboard -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-blue-600">{{ kitchenStats.pendingOrders }}</div>
                    <div class="text-sm text-gray-600">Pending Orders</div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-green-600">{{ kitchenStats.completedToday }}</div>
                    <div class="text-sm text-gray-600">Completed Today</div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-orange-600">{{ overdueOrders.length }}</div>
                    <div class="text-sm text-gray-600">Overdue Orders</div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-purple-600">{{ kitchenStats.avgPrepTime }}m</div>
                    <div class="text-sm text-gray-600">Avg Prep Time</div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-indigo-600">{{ kitchenStats.onTimePercentage }}%</div>
                    <div class="text-sm text-gray-600">On-Time Delivery</div>
                </template>
            </Card>
        </div>

        <!-- Station View -->
        <div v-if="selectedView === 'stations'" class="space-y-6">
            <div v-for="(station, stationKey) in stationWorkload" :key="stationKey" v-show="selectedStation === 'all' || selectedStation === stationKey" class="station-section">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: station.color }"></div>
                        <h3 class="text-xl font-semibold">{{ station.name }}</h3>
                        <Badge :value="station.currentOrders" severity="info" />
                        <span class="text-sm text-gray-600">{{ station.queuedItems }} items in queue</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <Chip v-for="staff in station.staff" :key="staff.id" :label="staff.name" class="text-xs" />
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Card
                        v-for="order in kitchenStore.ordersByStation(stationKey)"
                        :key="order.id"
                        class="order-card cursor-pointer hover:shadow-lg transition-shadow"
                        :class="{
                            'border-red-500 border-2': isOrderOverdue(order),
                            'border-yellow-500 border-2': order.priority === 'high',
                            'border-red-600 border-2': order.priority === 'urgent'
                        }"
                        @click="openOrderDetails(order)"
                    >
                        <template #header>
                            <div class="flex justify-between items-start p-4 pb-0">
                                <div class="flex items-center gap-2">
                                    <Badge :value="order.orderNumber" severity="info" />
                                    <Badge :value="order.tableNumber" severity="secondary" />
                                </div>
                                <div class="flex gap-1">
                                    <Tag :value="order.priority.toUpperCase()" :severity="getPriorityColor(order.priority)" class="text-xs" />
                                    <Tag :value="order.status.toUpperCase()" :severity="getOrderStatusColor(order.status)" class="text-xs" />
                                </div>
                            </div>
                        </template>

                        <template #content>
                            <div class="space-y-3">
                                <div class="text-sm text-gray-600">
                                    <div class="font-medium">{{ order.customerName }}</div>
                                    <div>Ordered: {{ formatElapsedTime(order.orderTime) }} ago</div>
                                    <div v-if="order.actualStartTime">Cooking: {{ formatElapsedTime(order.actualStartTime) }}</div>
                                </div>

                                <div v-if="order.actualStartTime">
                                    <ProgressBar :value="getOrderProgress(order)" :show-value="false" :severity="getProgressColor(getOrderProgress(order))" class="mb-2" />
                                    <div class="text-xs text-gray-500">{{ Math.round(getOrderProgress(order)) }}% complete</div>
                                </div>

                                <div class="space-y-2">
                                    <div v-for="item in order.items.filter((i) => i.station === stationKey)" :key="item.id" class="flex justify-between items-center text-sm">
                                        <div class="flex-1">
                                            <div class="font-medium">{{ item.name }} × {{ item.quantity }}</div>
                                            <div class="text-xs text-gray-500">
                                                {{ item.modifiers?.join(', ') }}
                                            </div>
                                        </div>
                                        <Button
                                            :severity="item.status === 'completed' ? 'success' : 'secondary'"
                                            :icon="item.status === 'completed' ? 'pi pi-check' : 'pi pi-clock'"
                                            size="small"
                                            @click.stop="updateOrderStatus(order.id, item.status === 'completed' ? 'preparing' : 'completed', item.id)"
                                        />
                                    </div>
                                </div>

                                <div v-if="order.specialInstructions" class="text-xs bg-yellow-50 p-2 rounded"><strong>Special Instructions:</strong> {{ order.specialInstructions }}</div>
                            </div>
                        </template>

                        <template #footer>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500"> Est: {{ order.estimatedPrepTime }}min </span>
                                <div class="flex gap-1">
                                    <Button label="Start" size="small" severity="info" :disabled="order.status === 'preparing' || order.status === 'cooking'" @click.stop="updateOrderStatus(order.id, 'preparing')" />
                                    <Button label="Ready" size="small" severity="success" :disabled="order.status !== 'cooking'" @click.stop="updateOrderStatus(order.id, 'ready')" />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>

        <!-- Timeline View -->
        <div v-if="selectedView === 'timeline'" class="timeline-view">
            <Card>
                <template #title>Order Timeline</template>
                <template #content>
                    <Timeline :value="timelineEvents" layout="vertical" class="customized-timeline">
                        <template #marker="slotProps">
                            <span class="flex w-8 h-8 items-center justify-center text-white border-circle z-1 shadow-1" :style="{ backgroundColor: slotProps.item.color }">
                                <i :class="slotProps.item.icon"></i>
                            </span>
                        </template>

                        <template #content="slotProps">
                            <Card class="mt-3">
                                <template #title>
                                    <div class="flex items-center gap-2">
                                        <span>{{ slotProps.item.order.orderNumber }}</span>
                                        <Badge :value="slotProps.item.order.tableNumber" />
                                    </div>
                                </template>
                                <template #subtitle>
                                    {{ slotProps.item.order.customerName }}
                                </template>
                                <template #content>
                                    <div class="text-sm">
                                        <div>{{ slotProps.item.order.items.length }} items</div>
                                        <div>{{ formatElapsedTime(slotProps.item.order.orderTime) }} ago</div>
                                    </div>
                                </template>
                            </Card>
                        </template>
                    </Timeline>
                </template>
            </Card>
        </div>

        <!-- Priority View -->
        <div v-if="selectedView === 'priority'" class="priority-view">
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="priority in ['urgent', 'high', 'normal', 'low']" :key="priority" class="priority-column">
                    <h3 class="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                        <Tag :value="priority.toUpperCase()" :severity="getPriorityColor(priority)" />
                        <Badge :value="filteredOrders.filter((o) => o.priority === priority).length" severity="secondary" />
                    </h3>

                    <div class="space-y-3">
                        <Card v-for="order in filteredOrders.filter((o) => o.priority === priority)" :key="order.id" class="order-card cursor-pointer hover:shadow-lg transition-shadow" @click="openOrderDetails(order)">
                            <template #content>
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center">
                                        <Badge :value="order.orderNumber" />
                                        <Badge :value="order.tableNumber" severity="secondary" />
                                    </div>

                                    <div class="text-sm">
                                        <div class="font-medium">{{ order.customerName }}</div>
                                        <div class="text-gray-500">{{ order.items.length }} items</div>
                                        <div class="text-gray-500">{{ formatElapsedTime(order.orderTime) }} ago</div>
                                    </div>

                                    <Tag :value="order.status.toUpperCase()" :severity="getOrderStatusColor(order.status)" class="text-xs" />
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Details Dialog -->
        <Dialog :visible="showOrderDetails" @update:visible="showOrderDetails = $event" :header="`Order Details - ${selectedOrder?.orderNumber}`" :modal="true" :style="{ width: '600px' }">
            <div v-if="selectedOrder" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm font-medium text-gray-600">Customer</label>
                        <div class="font-medium">{{ selectedOrder.customerName }}</div>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Table</label>
                        <div class="font-medium">{{ selectedOrder.tableNumber }}</div>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Order Time</label>
                        <div class="font-medium">{{ new Date(selectedOrder.orderTime).toLocaleString() }}</div>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Status</label>
                        <Tag :value="selectedOrder.status.toUpperCase()" :severity="getOrderStatusColor(selectedOrder.status)" />
                    </div>
                </div>

                <Divider />

                <div>
                    <h4 class="font-medium mb-3">Order Items</h4>
                    <div class="space-y-3">
                        <div v-for="item in selectedOrder.items" :key="item.id" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div class="flex-1">
                                <div class="font-medium">{{ item.name }} × {{ item.quantity }}</div>
                                <div class="text-sm text-gray-600">Station: {{ kitchenStore.stations[item.station]?.name || item.station }}</div>
                                <div v-if="item.modifiers?.length" class="text-xs text-gray-500">
                                    {{ item.modifiers.join(', ') }}
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <Tag :value="item.status" :severity="getOrderStatusColor(item.status)" class="text-xs" />
                                <Button size="small" :severity="item.status === 'completed' ? 'success' : 'secondary'" :label="item.status === 'completed' ? 'Done' : 'Mark Done'" @click="updateOrderStatus(selectedOrder.id, 'completed', item.id)" />
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="selectedOrder.specialInstructions">
                    <h4 class="font-medium mb-2">Special Instructions</h4>
                    <div class="p-3 bg-yellow-50 rounded-lg text-sm">
                        {{ selectedOrder.specialInstructions }}
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.order-card {
    transition: all 0.2s ease-in-out;
}

.order-card:hover {
    transform: translateY(-2px);
}

.station-section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.priority-column {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.customized-timeline .p-timeline-event-content) {
    line-height: 1;
}

:deep(.p-card-content) {
    padding: 1rem;
}

:deep(.p-progressbar) {
    height: 6px;
}
</style>
