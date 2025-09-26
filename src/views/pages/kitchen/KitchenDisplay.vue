<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useOrderStore } from '@/stores/order';
import { useTableStore } from '@/stores/table';
import { useWebSocketService } from '@/services/websocket';

const toast = useToast();
const orderStore = useOrderStore();
const tableStore = useTableStore();
const websocketService = useWebSocketService();

// Component state
const isAutoRefresh = ref(true);
const showOnlyDelayed = ref(false);
const selectedStatusFilter = ref(null);
const selectedPriorityFilter = ref(null);
const showOrderDetailsDialog = ref(false);
const selectedOrder = ref(null);
const orderActionsMenu = ref(null);
const notificationSound = ref(null);

// Refresh interval
let refreshInterval = null;

// Static data
const statusFilterOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Ready', value: 'ready' }
];

const priorityFilterOptions = [
    { label: 'All Priorities', value: null },
    { label: 'High Priority', value: 'high' },
    { label: 'Normal Priority', value: 'normal' }
];

const orderActionItems = computed(() => [
    {
        label: 'View Details',
        icon: 'pi pi-eye',
        command: () => viewOrderDetails(selectedOrder.value)
    },
    {
        label: 'Print Ticket',
        icon: 'pi pi-print',
        command: () => printOrderTicket(selectedOrder.value)
    },
    {
        separator: true
    },
    {
        label: 'Mark as Priority',
        icon: 'pi pi-exclamation-triangle',
        command: () => toggleOrderPriority(selectedOrder.value)
    },
    {
        label: 'Add Kitchen Note',
        icon: 'pi pi-comment',
        command: () => addKitchenNote(selectedOrder.value)
    }
]);

// Computed properties
const filteredOrders = computed(() => {
    let orders = orderStore.orders.filter((order) => ['pending', 'preparing', 'ready'].includes(order.status));

    // Filter by status
    if (selectedStatusFilter.value && selectedStatusFilter.value.value) {
        orders = orders.filter((order) => order.status === selectedStatusFilter.value.value);
    }

    // Filter by priority
    if (selectedPriorityFilter.value && selectedPriorityFilter.value.value) {
        orders = orders.filter((order) => order.priority === selectedPriorityFilter.value.value);
    }

    // Filter delayed orders
    if (showOnlyDelayed.value) {
        orders = orders.filter((order) => isOrderDelayed(order));
    }

    // Sort by creation time (oldest first)
    return orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
});

const activeOrdersCount = computed(() => {
    return orderStore.orders.filter((order) => ['pending', 'preparing', 'ready'].includes(order.status)).length;
});

const pendingOrdersCount = computed(() => {
    return orderStore.orders.filter((order) => order.status === 'pending').length;
});

const preparingOrdersCount = computed(() => {
    return orderStore.orders.filter((order) => order.status === 'preparing').length;
});

const readyOrdersCount = computed(() => {
    return orderStore.orders.filter((order) => order.status === 'ready').length;
});

const averagePrepTime = computed(() => {
    const completedOrders = orderStore.orders.filter((order) => ['ready', 'served', 'completed'].includes(order.status) && order.preparedAt);

    if (completedOrders.length === 0) return 0;

    const totalTime = completedOrders.reduce((sum, order) => {
        const prepTime = new Date(order.preparedAt) - new Date(order.createdAt);
        return sum + prepTime / (1000 * 60); // Convert to minutes
    }, 0);

    return Math.round(totalTime / completedOrders.length);
});

// Methods
const refreshOrders = async () => {
    await orderStore.fetchOrders();
    toast.add({
        severity: 'info',
        summary: 'Orders Refreshed',
        detail: 'Kitchen display updated',
        life: 2000
    });
};

const toggleAutoRefresh = () => {
    isAutoRefresh.value = !isAutoRefresh.value;

    if (isAutoRefresh.value) {
        startAutoRefresh();
        toast.add({
            severity: 'success',
            summary: 'Auto-refresh Enabled',
            detail: 'Orders will refresh every 30 seconds',
            life: 3000
        });
    } else {
        stopAutoRefresh();
        toast.add({
            severity: 'warn',
            summary: 'Auto-refresh Disabled',
            detail: 'Manual refresh required',
            life: 3000
        });
    }
};

const startAutoRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(refreshOrders, 30000); // 30 seconds
};

const stopAutoRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};

const getTableNumber = (tableId) => {
    const table = tableStore.tables.find((t) => t.id === tableId);
    return table ? table.number : tableId;
};

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getOrderDuration = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
        return `${diffMins} min`;
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
};

const isOrderDelayed = (order) => {
    const now = new Date();
    const created = new Date(order.createdAt);
    const diffMins = (now - created) / (1000 * 60);

    // Consider order delayed if it's been more than 20 minutes for preparing status
    // or more than 10 minutes for pending status
    if (order.status === 'pending' && diffMins > 10) return true;
    if (order.status === 'preparing' && diffMins > 20) return true;

    return false;
};

const getOrderCardClass = (order) => {
    const baseClasses = 'border-l-4';

    if (isOrderDelayed(order)) {
        return `${baseClasses} border-l-red-500 bg-red-50 dark:bg-red-900/10`;
    }

    switch (order.status) {
        case 'pending':
            return `${baseClasses} border-l-orange-500 bg-orange-50 dark:bg-orange-900/10`;
        case 'preparing':
            return `${baseClasses} border-l-blue-500 bg-blue-50 dark:bg-blue-900/10`;
        case 'ready':
            return `${baseClasses} border-l-green-500 bg-green-50 dark:bg-green-900/10`;
        default:
            return `${baseClasses} border-l-surface-300`;
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'preparing':
            return 'info';
        case 'ready':
            return 'success';
        default:
            return 'secondary';
    }
};

const getCompletedItemsCount = (order) => {
    return order.items.filter((item) => item.status === 'ready').length;
};

const areAllItemsReady = (order) => {
    return order.items.every((item) => item.status === 'ready');
};

const updateOrderStatus = async (orderId, status) => {
    try {
        await orderStore.updateOrderStatus(orderId, status);

        // Play notification sound for completed orders
        if (status === 'ready' && notificationSound.value) {
            notificationSound.value.play().catch(() => {
                // Ignore audio play errors
            });
        }

        toast.add({
            severity: 'success',
            summary: 'Order Updated',
            detail: `Order #${orderId} marked as ${status}`,
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: error.message || 'Failed to update order status',
            life: 5000
        });
    }
};

const updateItemStatus = async (orderId, itemId, status) => {
    try {
        await orderStore.updateOrderItemStatus(orderId, itemId, status);
        toast.add({
            severity: 'success',
            summary: 'Item Updated',
            detail: `Item status updated to ${status}`,
            life: 2000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: error.message || 'Failed to update item status',
            life: 5000
        });
    }
};

const showOrderActions = (event, order) => {
    selectedOrder.value = order;
    orderActionsMenu.value.show(event);
};

const viewOrderDetails = (order) => {
    selectedOrder.value = order;
    showOrderDetailsDialog.value = true;
};

const printOrderTicket = (order) => {
    // TODO: Implement order ticket printing
    toast.add({
        severity: 'info',
        summary: 'Print Feature',
        detail: `Printing ticket for Order #${order.id}`,
        life: 3000
    });
};

const toggleOrderPriority = async (order) => {
    try {
        const newPriority = order.priority === 'high' ? 'normal' : 'high';
        await orderStore.updateOrder(order.id, { priority: newPriority });
        toast.add({
            severity: 'success',
            summary: 'Priority Updated',
            detail: `Order #${order.id} priority set to ${newPriority}`,
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: error.message || 'Failed to update order priority',
            life: 5000
        });
    }
};

const addKitchenNote = () => {
    // TODO: Implement kitchen note dialog
    toast.add({
        severity: 'info',
        summary: 'Feature Coming Soon',
        detail: 'Kitchen notes will be available soon',
        life: 3000
    });
};

// WebSocket event handlers
const handleNewOrder = (order) => {
    // Play notification sound
    if (notificationSound.value) {
        notificationSound.value.play().catch(() => {
            // Ignore audio play errors
        });
    }

    toast.add({
        severity: 'info',
        summary: 'New Order',
        detail: `Order #${order.id} received for Table ${getTableNumber(order.tableId)}`,
        life: 5000
    });
};

const handleOrderUpdate = (order) => {
    toast.add({
        severity: 'info',
        summary: 'Order Updated',
        detail: `Order #${order.id} status changed to ${order.status}`,
        life: 3000
    });
};

// Watch for order changes to trigger notifications
watch(
    () => orderStore.orders.length,
    (newCount, oldCount) => {
        if (oldCount && newCount > oldCount) {
            // New order added
            const newOrder = orderStore.orders[orderStore.orders.length - 1];
            if (['pending', 'preparing'].includes(newOrder.status)) {
                handleNewOrder(newOrder);
            }
        }
    }
);

// Lifecycle
onMounted(async () => {
    await Promise.all([orderStore.fetchOrders(), tableStore.loadTables()]);

    if (isAutoRefresh.value) {
        startAutoRefresh();
    }

    // Set up WebSocket listeners
    websocketService.on('order:new', handleNewOrder);
    websocketService.on('order:updated', handleOrderUpdate);
});

onUnmounted(() => {
    stopAutoRefresh();

    // Clean up WebSocket listeners
    websocketService.off('order:new', handleNewOrder);
    websocketService.off('order:updated', handleOrderUpdate);
});
</script>

<template>
    <div class="kitchen-display">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Kitchen Display</h1>
                <p class="text-surface-600 dark:text-surface-400">Real-time order tracking for kitchen staff</p>
            </div>
            <div class="flex gap-2 items-center">
                <Tag :value="`${activeOrdersCount} Active Orders`" severity="info" />
                <Button :icon="isAutoRefresh ? 'pi pi-pause' : 'pi pi-play'" :label="isAutoRefresh ? 'Pause Auto-refresh' : 'Enable Auto-refresh'" @click="toggleAutoRefresh" :severity="isAutoRefresh ? 'warning' : 'success'" outlined />
                <Button label="Refresh" icon="pi pi-refresh" @click="refreshOrders" outlined />
            </div>
        </div>

        <!-- Kitchen Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-orange-600 mb-1">
                            {{ pendingOrdersCount }}
                        </div>
                        <div class="text-sm text-muted-color">Pending</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-blue-600 mb-1">
                            {{ preparingOrdersCount }}
                        </div>
                        <div class="text-sm text-muted-color">Preparing</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-green-600 mb-1">
                            {{ readyOrdersCount }}
                        </div>
                        <div class="text-sm text-muted-color">Ready</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-purple-600 mb-1">{{ averagePrepTime }} min</div>
                        <div class="text-sm text-muted-color">Avg Prep Time</div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Filter Options -->
        <div class="flex gap-4 items-center mb-6">
            <Dropdown v-model="selectedStatusFilter" :options="statusFilterOptions" optionLabel="label" placeholder="Filter by status" class="w-48" showClear />
            <Dropdown v-model="selectedPriorityFilter" :options="priorityFilterOptions" optionLabel="label" placeholder="Filter by priority" class="w-48" showClear />
            <Button :label="showOnlyDelayed ? 'Show All' : 'Show Delayed Only'" :icon="showOnlyDelayed ? 'pi pi-eye' : 'pi pi-clock'" @click="showOnlyDelayed = !showOnlyDelayed" :severity="showOnlyDelayed ? 'warning' : 'secondary'" outlined />
        </div>

        <!-- Orders Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card v-for="order in filteredOrders" :key="order.id" :class="getOrderCardClass(order)" class="order-card">
                <template #header>
                    <div class="flex justify-between items-center p-4 pb-0">
                        <div class="flex items-center gap-2">
                            <Tag :value="`Order #${order.id}`" severity="info" />
                            <Tag v-if="isOrderDelayed(order)" value="DELAYED" severity="danger" icon="pi pi-clock" />
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-surface-600 dark:text-surface-400">Table {{ getTableNumber(order.tableId) }}</div>
                            <div class="text-xs text-surface-500 dark:text-surface-500">
                                {{ formatTime(order.createdAt) }}
                            </div>
                        </div>
                    </div>
                </template>

                <template #content>
                    <div class="space-y-3">
                        <!-- Order Items -->
                        <div class="space-y-2">
                            <div v-for="item in order.items" :key="item.id" class="flex justify-between items-start bg-surface-50 dark:bg-surface-800 p-3 rounded-lg">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium">{{ item.quantity }}x</span>
                                        <span>{{ item.name }}</span>
                                        <Tag v-if="item.priority === 'high'" value="HIGH" severity="danger" class="text-xs" />
                                    </div>
                                    <div v-if="item.modifiers && item.modifiers.length" class="text-sm text-surface-600 dark:text-surface-400 mt-1">
                                        <span v-for="modifier in item.modifiers" :key="modifier.id" class="mr-2"> + {{ modifier.name }} </span>
                                    </div>
                                    <div v-if="item.notes" class="text-sm text-surface-600 dark:text-surface-400 mt-1 italic">Note: {{ item.notes }}</div>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <Button
                                        v-if="item.status !== 'ready'"
                                        :icon="item.status === 'preparing' ? 'pi pi-check' : 'pi pi-play'"
                                        :label="item.status === 'preparing' ? 'Ready' : 'Start'"
                                        size="small"
                                        :severity="item.status === 'preparing' ? 'success' : 'info'"
                                        @click="updateItemStatus(order.id, item.id, item.status === 'preparing' ? 'ready' : 'preparing')"
                                    />
                                    <Tag v-else value="READY" severity="success" icon="pi pi-check" />
                                </div>
                            </div>
                        </div>

                        <!-- Order Timer -->
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-clock text-surface-600 dark:text-surface-400"></i>
                                <span class="text-sm font-medium">
                                    {{ getOrderDuration(order.createdAt) }}
                                </span>
                            </div>
                            <div>
                                <Tag :value="order.status" :severity="getStatusSeverity(order.status)" class="uppercase" />
                            </div>
                        </div>

                        <!-- Special Instructions -->
                        <div v-if="order.specialInstructions" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                            <div class="flex items-start gap-2">
                                <i class="pi pi-exclamation-triangle text-yellow-600 mt-1"></i>
                                <div>
                                    <div class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Special Instructions</div>
                                    <div class="text-sm text-yellow-700 dark:text-yellow-300">{{ order.specialInstructions }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <template #footer>
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-surface-600 dark:text-surface-400">{{ getCompletedItemsCount(order) }}/{{ order.items.length }} items ready</div>
                        <div class="flex gap-2">
                            <Button v-if="order.status === 'pending'" label="Accept Order" icon="pi pi-play" size="small" @click="updateOrderStatus(order.id, 'preparing')" />
                            <Button v-else-if="order.status === 'preparing' && areAllItemsReady(order)" label="Complete Order" icon="pi pi-check" size="small" severity="success" @click="updateOrderStatus(order.id, 'ready')" />
                            <Button v-if="order.status === 'ready'" label="Served" icon="pi pi-send" size="small" severity="info" @click="updateOrderStatus(order.id, 'served')" />
                            <Button icon="pi pi-ellipsis-v" size="small" text @click="showOrderActions($event, order)" />
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Empty State -->
        <div v-if="filteredOrders.length === 0" class="text-center py-12">
            <i class="pi pi-inbox text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
            <h3 class="text-xl font-semibold text-surface-600 dark:text-surface-400 mb-2">No orders to display</h3>
            <p class="text-surface-500 dark:text-surface-500">
                {{ orderStore.orders.length === 0 ? 'No orders have been placed yet.' : 'All orders are filtered out.' }}
            </p>
        </div>

        <!-- Order Actions Context Menu -->
        <ContextMenu ref="orderActionsMenu" :model="orderActionItems" />

        <!-- Order Details Dialog -->
        <Dialog :visible="showOrderDetailsDialog" @update:visible="showOrderDetailsDialog = $event" modal header="Order Details" :style="{ width: '600px' }">
            <div v-if="selectedOrder" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-surface-600 dark:text-surface-400">Order ID</label>
                        <div class="text-lg font-semibold">#{{ selectedOrder.id }}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-surface-600 dark:text-surface-400">Table</label>
                        <div class="text-lg font-semibold">{{ getTableNumber(selectedOrder.tableId) }}</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-surface-600 dark:text-surface-400">Status</label>
                        <Tag :value="selectedOrder.status" :severity="getStatusSeverity(selectedOrder.status)" class="uppercase" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-surface-600 dark:text-surface-400">Duration</label>
                        <div>{{ getOrderDuration(selectedOrder.createdAt) }}</div>
                    </div>
                </div>

                <Divider />

                <div>
                    <h4 class="text-lg font-semibold mb-3">Order Items</h4>
                    <div class="space-y-3">
                        <div v-for="item in selectedOrder.items" :key="item.id" class="flex justify-between items-center p-3 border border-surface-200 dark:border-surface-700 rounded-lg">
                            <div>
                                <div class="font-medium">{{ item.quantity }}x {{ item.name }}</div>
                                <div v-if="item.modifiers && item.modifiers.length" class="text-sm text-surface-600 dark:text-surface-400">
                                    {{ item.modifiers.map((m) => m.name).join(', ') }}
                                </div>
                                <div v-if="item.notes" class="text-sm text-surface-600 dark:text-surface-400 italic">Note: {{ item.notes }}</div>
                            </div>
                            <Tag :value="item.status" :severity="getStatusSeverity(item.status)" class="uppercase" />
                        </div>
                    </div>
                </div>

                <div v-if="selectedOrder.specialInstructions">
                    <h4 class="text-lg font-semibold mb-2">Special Instructions</h4>
                    <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        {{ selectedOrder.specialInstructions }}
                    </div>
                </div>

                <div class="flex justify-end">
                    <Button label="Close" @click="showOrderDetailsDialog = false" />
                </div>
            </div>
        </Dialog>

        <!-- Audio notification for new orders -->
        <audio ref="notificationSound" preload="auto">
            <source src="/notification.mp3" type="audio/mpeg" />
            <source src="/notification.wav" type="audio/wav" />
        </audio>
    </div>
</template>

<style scoped>
.kitchen-display {
    padding: 1rem;
}

.order-card {
    transition: all 0.3s ease;
}

.order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
