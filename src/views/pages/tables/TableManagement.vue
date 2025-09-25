<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useTableStore } from '@/stores/table';

const router = useRouter();
const toast = useToast();
const tableStore = useTableStore();

// Component state
const showAddTableDialog = ref(false);
const showFloorSettings = ref(false);
const showGrid = ref(false);
const selectedTable = ref(null);
const draggedTable = ref(null);

// Context menu
const tableContextMenu = ref();

// Form data
const newTable = ref({
    number: '',
    name: '',
    seats: 4,
    shape: 'rectangle',
    width: 80,
    height: 80,
    x: 100,
    y: 100
});

const floorSettings = ref({
    width: 1200,
    height: 800,
    backgroundColor: '#f8f9fa'
});

// Static data
const tableShapes = [
    { label: 'Rectangle', value: 'rectangle' },
    { label: 'Circle', value: 'circle' },
    { label: 'Square', value: 'square' }
];

const tableStatuses = [
    { label: 'Free', value: 'free', severity: 'success' },
    { label: 'Occupied', value: 'occupied', severity: 'info' },
    { label: 'Reserved', value: 'reserved', severity: 'warn' },
    { label: 'Cleaning', value: 'cleaning', severity: 'secondary' },
    { label: 'Out of Order', value: 'out_of_order', severity: 'danger' }
];

// Mock waiters data
const waiters = [
    { id: 3, name: 'John Smith' },
    { id: 4, name: 'Jane Doe' },
    { id: 5, name: 'Mike Johnson' }
];

// Computed properties
const contextMenuItems = computed(() => {
    if (!selectedTable.value) return [];

    const items = [
        {
            label: 'New Order',
            icon: 'pi pi-plus',
            command: () => createNewOrder(),
            visible: ['free', 'occupied'].includes(selectedTable.value.status)
        },
        {
            separator: true,
            visible: ['free', 'occupied'].includes(selectedTable.value.status)
        },
        {
            label: 'Set as Free',
            icon: 'pi pi-check-circle',
            command: () => updateTableStatus('free'),
            visible: selectedTable.value.status !== 'free'
        },
        {
            label: 'Set as Occupied',
            icon: 'pi pi-users',
            command: () => updateTableStatus('occupied'),
            visible: selectedTable.value.status !== 'occupied'
        },
        {
            label: 'Set as Reserved',
            icon: 'pi pi-calendar',
            command: () => updateTableStatus('reserved'),
            visible: selectedTable.value.status !== 'reserved'
        },
        {
            label: 'Set as Cleaning',
            icon: 'pi pi-refresh',
            command: () => updateTableStatus('cleaning'),
            visible: selectedTable.value.status !== 'cleaning'
        },
        {
            separator: true
        },
        {
            label: 'Assign Waiter',
            icon: 'pi pi-user',
            items: waiters.map((waiter) => ({
                label: waiter.name,
                command: () => assignWaiter(waiter.id)
            }))
        },
        {
            separator: true
        },
        {
            label: 'Edit Table',
            icon: 'pi pi-pencil',
            command: () => editTable()
        },
        {
            label: 'Delete Table',
            icon: 'pi pi-trash',
            command: () => deleteTable()
        }
    ];

    return items.filter((item) => item.visible !== false);
});

// Methods
const createNewOrder = () => {
    if (selectedTable.value) {
        router.push(`/orders/new?tableId=${selectedTable.value.id}`);
        tableContextMenu.value.hide();
    }
};

const getTableClasses = (table) => {
    const baseClasses = 'bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-0';

    switch (table.status) {
        case 'free':
            return `${baseClasses} border-green-500 bg-green-50 dark:bg-green-900/20`;
        case 'occupied':
            return `${baseClasses} border-blue-500 bg-blue-50 dark:bg-blue-900/20`;
        case 'reserved':
            return `${baseClasses} border-orange-500 bg-orange-50 dark:bg-orange-900/20`;
        case 'cleaning':
            return `${baseClasses} border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20`;
        case 'out_of_order':
            return `${baseClasses} border-red-500 bg-red-50 dark:bg-red-900/20`;
        default:
            return `${baseClasses} border-surface-300`;
    }
};

const getTableStatusSeverity = (status) => {
    switch (status) {
        case 'free':
            return 'success';
        case 'occupied':
            return 'info';
        case 'reserved':
            return 'warn';
        case 'cleaning':
            return 'secondary';
        case 'out_of_order':
            return 'danger';
        default:
            return 'secondary';
    }
};

const getWaiterName = (waiterId) => {
    const waiter = waiters.find((w) => w.id === waiterId);
    return waiter ? waiter.name : 'Unknown';
};

// Drag and drop handlers
const handleDragStart = (event, table) => {
    draggedTable.value = table;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target);
};

const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
};

const handleDrop = (event) => {
    event.preventDefault();

    if (!draggedTable.value) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Ensure table stays within bounds
    const maxX = tableStore.floorLayout.width - draggedTable.value.width;
    const maxY = tableStore.floorLayout.height - draggedTable.value.height;

    const newX = Math.max(0, Math.min(x - draggedTable.value.width / 2, maxX));
    const newY = Math.max(0, Math.min(y - draggedTable.value.height / 2, maxY));

    tableStore.updateTablePosition(draggedTable.value.id, { x: newX, y: newY });
    draggedTable.value = null;
};

// Context menu handlers
const showTableContextMenu = (event, table) => {
    event.preventDefault();
    selectedTable.value = table;
    tableContextMenu.value.show(event);
};

const updateTableStatus = async (status) => {
    if (!selectedTable.value) return;

    const result = await tableStore.updateTableStatus(selectedTable.value.id, status);
    if (result !== false) {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Table ${selectedTable.value.number} status updated`,
            life: 3000
        });
    }
};

const assignWaiter = async (waiterId) => {
    if (!selectedTable.value) return;

    await tableStore.assignWaiterToTable(selectedTable.value.id, waiterId);

    const waiterName = getWaiterName(waiterId);
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${waiterName} assigned to table ${selectedTable.value.number}`,
        life: 3000
    });
};

const editTable = () => {
    // TODO: Implement edit table functionality
    toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Edit table functionality coming soon',
        life: 3000
    });
};

const deleteTable = async () => {
    if (!selectedTable.value) return;

    const result = await tableStore.deleteTable(selectedTable.value.id);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Table ${selectedTable.value.number} deleted`,
            life: 3000
        });
    }
};

// Form handlers
const addTable = async () => {
    const result = await tableStore.addTable(newTable.value);

    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Table added successfully',
            life: 3000
        });

        showAddTableDialog.value = false;
        resetNewTableForm();
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message || 'Failed to add table',
            life: 5000
        });
    }
};

const resetNewTableForm = () => {
    newTable.value = {
        number: '',
        name: '',
        seats: 4,
        shape: 'rectangle',
        width: 80,
        height: 80,
        x: 100,
        y: 100
    };
};

const applyFloorSettings = () => {
    tableStore.floorLayout.width = floorSettings.value.width;
    tableStore.floorLayout.height = floorSettings.value.height;
    tableStore.floorLayout.backgroundColor = floorSettings.value.backgroundColor;

    showFloorSettings.value = false;

    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Floor settings applied',
        life: 3000
    });
};

// Lifecycle
onMounted(async () => {
    await tableStore.fetchTables();

    // Initialize floor settings
    floorSettings.value = { ...tableStore.floorLayout };
});
</script>

<template>
    <div class="p-6">
        <Toast />

        <!-- Page Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Table Management</h1>
                <p class="text-muted-color">Manage restaurant floor layout and table status</p>
            </div>

            <div class="flex gap-3">
                <Button label="Add Table" icon="pi pi-plus" @click="showAddTableDialog = true" />
                <Button label="Floor Settings" icon="pi pi-cog" outlined @click="showFloorSettings = true" />
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-green-600 mb-1">
                            {{ tableStore.tableStatistics.free }}
                        </div>
                        <div class="text-sm text-muted-color">Available</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-blue-600 mb-1">
                            {{ tableStore.tableStatistics.occupied }}
                        </div>
                        <div class="text-sm text-muted-color">Occupied</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-orange-600 mb-1">
                            {{ tableStore.tableStatistics.reserved }}
                        </div>
                        <div class="text-sm text-muted-color">Reserved</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-yellow-600 mb-1">
                            {{ tableStore.tableStatistics.cleaning }}
                        </div>
                        <div class="text-sm text-muted-color">Cleaning</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-red-600 mb-1">
                            {{ tableStore.tableStatistics.outOfOrder }}
                        </div>
                        <div class="text-sm text-muted-color">Out of Order</div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Floor Layout -->
        <Card>
            <template #title>
                <div class="flex justify-between items-center">
                    <span>Restaurant Floor Layout</span>
                    <div class="flex gap-2">
                        <Tag v-for="status in tableStatuses" :key="status.value" :value="status.label" :severity="status.severity" class="text-xs" />
                    </div>
                </div>
            </template>
            <template #content>
                <div
                    class="restaurant-floor relative border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg overflow-auto"
                    :style="{
                        width: tableStore.floorLayout.width + 'px',
                        height: tableStore.floorLayout.height + 'px',
                        backgroundColor: tableStore.floorLayout.backgroundColor,
                        minHeight: '500px'
                    }"
                    @drop="handleDrop"
                    @dragover="handleDragOver"
                >
                    <!-- Tables -->
                    <div
                        v-for="table in tableStore.tables"
                        :key="table.id"
                        :id="`table-${table.id}`"
                        class="table-item absolute cursor-move select-none"
                        :style="{
                            left: table.x + 'px',
                            top: table.y + 'px',
                            width: table.width + 'px',
                            height: table.height + 'px'
                        }"
                        draggable="true"
                        @dragstart="handleDragStart($event, table)"
                        @contextmenu="showTableContextMenu($event, table)"
                    >
                        <div class="table-visual h-full flex flex-col items-center justify-center rounded-lg border-2 shadow-md transition-all duration-200 hover:shadow-lg" :class="getTableClasses(table)">
                            <div class="text-xs font-bold mb-1">{{ table.number }}</div>
                            <div class="text-xs opacity-80">{{ table.seats }} seats</div>

                            <!-- Status Badge -->
                            <Badge :value="table.status.replace('_', ' ').toUpperCase()" :severity="getTableStatusSeverity(table.status)" class="text-xs mt-1" />

                            <!-- Waiter Assignment -->
                            <div v-if="table.assignedWaiter" class="text-xs mt-1 opacity-70">Waiter: {{ getWaiterName(table.assignedWaiter) }}</div>

                            <!-- Current Order -->
                            <div v-if="table.currentOrder" class="text-xs mt-1 font-medium">${{ table.currentOrder.total?.toFixed(2) }}</div>
                        </div>
                    </div>

                    <!-- Grid Lines (Optional) -->
                    <svg v-if="showGrid" class="absolute inset-0 pointer-events-none opacity-20" :width="tableStore.floorLayout.width" :height="tableStore.floorLayout.height">
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="gray" stroke-width="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
            </template>
        </Card>

        <!-- Add Table Dialog -->
        <Dialog :visible="showAddTableDialog" @update:visible="showAddTableDialog = $event" modal header="Add New Table" :style="{ width: '450px' }">
            <form @submit.prevent="addTable" class="space-y-4">
                <div class="field">
                    <label for="tableNumber" class="block text-sm font-medium mb-2">Table Number</label>
                    <InputText id="tableNumber" v-model="newTable.number" class="w-full" required />
                </div>

                <div class="field">
                    <label for="tableName" class="block text-sm font-medium mb-2">Table Name</label>
                    <InputText id="tableName" v-model="newTable.name" class="w-full" />
                </div>

                <div class="field">
                    <label for="tableSeats" class="block text-sm font-medium mb-2">Number of Seats</label>
                    <InputNumber id="tableSeats" v-model="newTable.seats" :min="1" :max="20" class="w-full" />
                </div>

                <div class="field">
                    <label for="tableShape" class="block text-sm font-medium mb-2">Shape</label>
                    <Dropdown id="tableShape" v-model="newTable.shape" :options="tableShapes" option-label="label" option-value="value" class="w-full" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="field">
                        <label for="tableWidth" class="block text-sm font-medium mb-2">Width (px)</label>
                        <InputNumber id="tableWidth" v-model="newTable.width" :min="40" :max="200" class="w-full" />
                    </div>

                    <div class="field">
                        <label for="tableHeight" class="block text-sm font-medium mb-2">Height (px)</label>
                        <InputNumber id="tableHeight" v-model="newTable.height" :min="40" :max="200" class="w-full" />
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <Button label="Cancel" outlined @click="showAddTableDialog = false" />
                    <Button type="submit" label="Add Table" :loading="tableStore.isLoading" />
                </div>
            </form>
        </Dialog>

        <!-- Table Context Menu -->
        <ContextMenu ref="tableContextMenu" :model="contextMenuItems" />

        <!-- Floor Settings Dialog -->
        <Dialog :visible="showFloorSettings" @update:visible="showFloorSettings = $event" modal header="Floor Layout Settings" :style="{ width: '400px' }">
            <div class="space-y-4">
                <div class="field">
                    <label class="block text-sm font-medium mb-2">Floor Width (px)</label>
                    <InputNumber v-model="floorSettings.width" :min="600" :max="2000" class="w-full" />
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Floor Height (px)</label>
                    <InputNumber v-model="floorSettings.height" :min="400" :max="1200" class="w-full" />
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Background Color</label>
                    <InputText v-model="floorSettings.backgroundColor" class="w-full" />
                </div>

                <div class="field">
                    <div class="flex items-center">
                        <Checkbox id="showGrid" v-model="showGrid" binary />
                        <label for="showGrid" class="ml-2">Show Grid</label>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <Button label="Cancel" outlined @click="showFloorSettings = false" />
                    <Button label="Apply" @click="applyFloorSettings" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.restaurant-floor {
    background-image: radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.1) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.1) 2px, transparent 0);
    background-size: 100px 100px;
}

.table-item:hover {
    z-index: 10;
}

.table-visual {
    transition: all 0.2s ease;
}

.table-item:hover .table-visual {
    transform: scale(1.05);
}
</style>
