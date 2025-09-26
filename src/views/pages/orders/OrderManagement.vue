<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useOrderStore } from '@/stores/order';
import { useTableStore } from '@/stores/table';

const toast = useToast();
const orderStore = useOrderStore();
const tableStore = useTableStore();

// Component state
const showOrderDialog = ref(false);
const selectedOrder = ref(null);
const orderActionsMenu = ref();

// Filters
const filters = ref({
    status: null,
    tableId: null,
    waiterId: null,
    date: null
});

// Mock data for dropdowns
const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Ready', value: 'ready' },
    { label: 'Served', value: 'served' },
    { label: 'Cancelled', value: 'cancelled' }
];

const tableOptions = computed(() => {
    return tableStore.tables.map((table) => ({
        label: `Table ${table.number}`,
        value: table.id
    }));
});

const waiterOptions = [
    { label: 'John Smith', value: 3 },
    { label: 'Jane Doe', value: 4 },
    { label: 'Mike Johnson', value: 5 }
];

// Computed properties
const filteredOrders = computed(() => {
    let orders = [...orderStore.orders];

    if (filters.value.status) {
        orders = orders.filter((order) => order.status === filters.value.status);
    }

    if (filters.value.tableId) {
        orders = orders.filter((order) => order.tableId === filters.value.tableId);
    }

    if (filters.value.waiterId) {
        orders = orders.filter((order) => order.waiterId === filters.value.waiterId);
    }

    if (filters.value.date) {
        const filterDate = new Date(filters.value.date).toDateString();
        orders = orders.filter((order) => new Date(order.createdAt).toDateString() === filterDate);
    }

    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const orderActionItems = computed(() => {
    if (!selectedOrder.value) return [];

    const items = [
        {
            label: 'View Details',
            icon: 'pi pi-eye',
            command: () => viewOrder(selectedOrder.value)
        },
        {
            label: 'Duplicate Order',
            icon: 'pi pi-copy',
            command: () => duplicateOrder()
        },
        {
            separator: true
        }
    ];

    // Add status-specific actions
    if (selectedOrder.value.status === 'pending') {
        items.push({
            label: 'Cancel Order',
            icon: 'pi pi-times',
            command: () => cancelOrder()
        });
    }

    if (['pending', 'preparing'].includes(selectedOrder.value.status)) {
        items.push({
            label: 'Edit Order',
            icon: 'pi pi-pencil',
            command: () => editOrder()
        });
    }

    return items;
});

// Methods
const getStatusSeverity = (status) => {
    switch (status) {
        case 'pending':
            return 'warn';
        case 'preparing':
            return 'info';
        case 'ready':
            return 'success';
        case 'served':
            return 'secondary';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
};

const getTableNumber = (tableId) => {
    const table = tableStore.getTableById(tableId);
    return table ? table.number : 'N/A';
};

const getWaiterName = (waiterId) => {
    const waiter = waiterOptions.find((w) => w.value === waiterId);
    return waiter ? waiter.label : 'N/A';
};

const getItemsSummary = (items) => {
    if (!items.length) return '';
    const firstItems = items.slice(0, 2).map((item) => item.name);
    const summary = firstItems.join(', ');
    return items.length > 2 ? `${summary} +${items.length - 2} more` : summary;
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
};

const viewOrder = (order) => {
    selectedOrder.value = order;
    showOrderDialog.value = true;
};

const selectOrder = (event) => {
    selectedOrder.value = event.data;
};

const showOrderActions = (event, order) => {
    selectedOrder.value = order;
    orderActionsMenu.value.show(event);
};

const updateOrderStatus = async (orderId, newStatus) => {
    const result = await orderStore.updateOrderStatus(orderId, newStatus);

    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: `Order status changed to ${newStatus}`,
            life: 3000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message || 'Failed to update order status',
            life: 5000
        });
    }
};

const duplicateOrder = () => {
    toast.add({
        severity: 'info',
        summary: 'Feature Coming Soon',
        detail: 'Duplicate order functionality will be available soon',
        life: 3000
    });
};

const editOrder = () => {
    toast.add({
        severity: 'info',
        summary: 'Feature Coming Soon',
        detail: 'Edit order functionality will be available soon',
        life: 3000
    });
};

const cancelOrder = async () => {
    if (!selectedOrder.value) return;

    const result = await orderStore.updateOrderStatus(selectedOrder.value.id, 'cancelled');

    if (result.success) {
        toast.add({
            severity: 'warn',
            summary: 'Order Cancelled',
            detail: `Order ${selectedOrder.value.orderNumber} has been cancelled`,
            life: 3000
        });
    }
};

const clearFilters = () => {
    filters.value = {
        status: null,
        tableId: null,
        waiterId: null,
        date: null
    };
};

const refreshOrders = async () => {
    await orderStore.fetchOrders();
    toast.add({
        severity: 'info',
        summary: 'Refreshed',
        detail: 'Orders list updated',
        life: 2000
    });
};

// Lifecycle
onMounted(async () => {
    await Promise.all([orderStore.fetchOrders(), tableStore.fetchTables()]);
});
</script>

<template>
    <div class="p-6">
        <Toast />

        <!-- Page Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Order Management</h1>
                <p class="text-muted-color">View and manage all restaurant orders</p>
            </div>

            <div class="flex gap-3">
                <Button label="New Order" icon="pi pi-plus" @click="$router.push('/orders/new')" />
                <Button label="Refresh" icon="pi pi-refresh" outlined @click="refreshOrders" />
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-orange-600 mb-1">
                            {{ orderStore.orderStatistics.pending }}
                        </div>
                        <div class="text-sm text-muted-color">Pending</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-blue-600 mb-1">
                            {{ orderStore.orderStatistics.preparing }}
                        </div>
                        <div class="text-sm text-muted-color">Preparing</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-green-600 mb-1">
                            {{ orderStore.orderStatistics.ready }}
                        </div>
                        <div class="text-sm text-muted-color">Ready</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-primary mb-1">${{ orderStore.orderStatistics.revenue.toFixed(2) }}</div>
                        <div class="text-sm text-muted-color">Today's Revenue</div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Filters -->
        <Card class="mb-6">
            <template #content>
                <div class="flex flex-wrap gap-4 items-center">
                    <div class="field">
                        <label class="block text-sm font-medium mb-1">Status</label>
                        <Dropdown v-model="filters.status" :options="statusOptions" option-label="label" option-value="value" placeholder="All Statuses" class="w-48" show-clear />
                    </div>

                    <div class="field">
                        <label class="block text-sm font-medium mb-1">Table</label>
                        <Dropdown v-model="filters.tableId" :options="tableOptions" option-label="label" option-value="value" placeholder="All Tables" class="w-32" show-clear />
                    </div>

                    <div class="field">
                        <label class="block text-sm font-medium mb-1">Waiter</label>
                        <Dropdown v-model="filters.waiterId" :options="waiterOptions" option-label="label" option-value="value" placeholder="All Waiters" class="w-48" show-clear />
                    </div>

                    <div class="field">
                        <label class="block text-sm font-medium mb-1">Date</label>
                        <Calendar v-model="filters.date" date-format="yy-mm-dd" placeholder="Select Date" show-clear />
                    </div>

                    <div class="field">
                        <Button label="Clear Filters" outlined @click="clearFilters" class="mt-6" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Orders Table -->
        <Card>
            <template #title>Orders List</template>
            <template #content>
                <DataTable
                    :value="filteredOrders"
                    :loading="orderStore.isLoading"
                    paginator
                    :rows="20"
                    :rows-per-page-options="[10, 20, 50]"
                    responsive-layout="scroll"
                    :global-filter-fields="['orderNumber', 'tableId']"
                    selection-mode="single"
                    @row-select="selectOrder"
                    class="p-datatable-sm"
                >
                    <template #empty>
                        <div class="text-center py-8">
                            <i class="pi pi-inbox text-4xl text-muted-color mb-4"></i>
                            <p class="text-muted-color">No orders found</p>
                        </div>
                    </template>

                    <Column field="orderNumber" header="Order #" sortable>
                        <template #body="{ data }">
                            <span class="font-mono font-medium">{{ data.orderNumber }}</span>
                        </template>
                    </Column>

                    <Column field="tableId" header="Table" sortable>
                        <template #body="{ data }">
                            <Badge :value="getTableNumber(data.tableId)" severity="info" />
                        </template>
                    </Column>

                    <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                            <Badge :value="data.status.replace('_', ' ').toUpperCase()" :severity="getStatusSeverity(data.status)" />
                        </template>
                    </Column>

                    <Column field="items" header="Items">
                        <template #body="{ data }">
                            <div class="text-sm">{{ data.items.length }} item{{ data.items.length !== 1 ? 's' : '' }}</div>
                            <div class="text-xs text-muted-color">
                                {{ getItemsSummary(data.items) }}
                            </div>
                        </template>
                    </Column>

                    <Column field="total" header="Total" sortable>
                        <template #body="{ data }">
                            <span class="font-bold text-primary">${{ data.total?.toFixed(2) }}</span>
                        </template>
                    </Column>

                    <Column field="waiterId" header="Waiter">
                        <template #body="{ data }">
                            <span class="text-sm">{{ getWaiterName(data.waiterId) }}</span>
                        </template>
                    </Column>

                    <Column field="createdAt" header="Created" sortable>
                        <template #body="{ data }">
                            <div class="text-sm">
                                {{ formatDateTime(data.createdAt) }}
                            </div>
                        </template>
                    </Column>

                    <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                            <div class="flex gap-1">
                                <Button icon="pi pi-eye" size="small" outlined @click="viewOrder(data)" v-tooltip.top="'View Details'" />
                                <Button v-if="data.status === 'pending'" icon="pi pi-play" size="small" severity="success" outlined @click="updateOrderStatus(data.id, 'preparing')" v-tooltip.top="'Start Preparing'" />
                                <Button v-if="data.status === 'preparing'" icon="pi pi-check" size="small" severity="success" outlined @click="updateOrderStatus(data.id, 'ready')" v-tooltip.top="'Mark Ready'" />
                                <Button v-if="data.status === 'ready'" icon="pi pi-send" size="small" severity="info" outlined @click="updateOrderStatus(data.id, 'served')" v-tooltip.top="'Mark Served'" />
                                <Button icon="pi pi-ellipsis-v" size="small" text @click="showOrderActions($event, data)" v-tooltip.top="'More Actions'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <!-- Order Actions Context Menu -->
        <ContextMenu ref="orderActionsMenu" :model="orderActionItems" />

        <!-- Order Details Dialog -->
        <Dialog :visible="showOrderDialog" @update:visible="showOrderDialog = $event" modal :header="`Order Details - ${selectedOrder?.orderNumber}`" :style="{ width: '800px' }">
            <div v-if="selectedOrder" class="space-y-6">
                <!-- Order Info -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-medium mb-2">Order Information</h4>
                        <div class="space-y-1 text-sm">
                            <div><strong>Order #:</strong> {{ selectedOrder.orderNumber }}</div>
                            <div><strong>Table:</strong> {{ getTableNumber(selectedOrder.tableId) }}</div>
                            <div><strong>Waiter:</strong> {{ getWaiterName(selectedOrder.waiterId) }}</div>
                            <div>
                                <strong>Status:</strong>
                                <Badge :value="selectedOrder.status.replace('_', ' ').toUpperCase()" :severity="getStatusSeverity(selectedOrder.status)" class="ml-2" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-medium mb-2">Timing</h4>
                        <div class="space-y-1 text-sm">
                            <div><strong>Created:</strong> {{ formatDateTime(selectedOrder.createdAt) }}</div>
                            <div><strong>Updated:</strong> {{ formatDateTime(selectedOrder.updatedAt) }}</div>
                        </div>
                    </div>
                </div>

                <!-- Order Timeline -->
                <div>
                    <h4 class="font-medium mb-3">Order Timeline</h4>
                    <div class="space-y-2">
                        <div v-for="event in selectedOrder.timeline" :key="event.timestamp" class="flex items-center gap-3 text-sm">
                            <Badge :value="event.status.replace('_', ' ').toUpperCase()" :severity="getStatusSeverity(event.status)" />
                            <span class="flex-1">{{ event.notes }}</span>
                            <span class="text-muted-color">{{ formatDateTime(event.timestamp) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div>
                    <h4 class="font-medium mb-3">Order Items</h4>
                    <div class="space-y-3">
                        <div v-for="item in selectedOrder.items" :key="item.id" class="bg-surface-50 dark:bg-surface-800 p-3 rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h5 class="font-medium">{{ item.name }}</h5>
                                    <div v-if="item.modifiers?.length" class="text-xs text-muted-color mt-1">
                                        <span v-for="modifier in item.modifiers" :key="modifier.id" class="block"> + {{ modifier.name }} (+${{ modifier.price }}) </span>
                                    </div>
                                    <div v-if="item.notes" class="text-xs text-muted-color mt-1">Notes: {{ item.notes }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-medium">${{ item.price }} x {{ item.quantity }}</div>
                                    <div class="text-sm text-muted-color">Total: ${{ (item.price * item.quantity).toFixed(2) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Totals -->
                <div class="border-t pt-4">
                    <div class="space-y-2 max-w-sm ml-auto">
                        <div class="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${{ selectedOrder.subtotal?.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Tax:</span>
                            <span>${{ selectedOrder.tax?.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Service Charge:</span>
                            <span>${{ selectedOrder.serviceCharge?.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span class="text-primary">${{ selectedOrder.total?.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 0;
}

/* Make the table more compact */
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
    padding: 0.5rem;
}
</style>
