<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTableStore } from '@/stores/table.js';
import { usePosStore } from '@/stores/pos.js';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import Badge from 'primevue/badge';
import Toolbar from 'primevue/toolbar';
import ContextMenu from 'primevue/contextmenu';

const tableStore = useTableStore();
const posStore = usePosStore();
const toast = useToast();

// Reactive data
const showTableDialog = ref(false);
const showReservationDialog = ref(false);
const showMergeDialog = ref(false);
const selectedTables = ref([]);
const contextMenuRef = ref();
const contextMenuTable = ref(null);
const viewMode = ref('grid'); // grid, floor_plan

// Form data
const tableForm = ref({
    number: '',
    name: '',
    capacity: 4,
    section: 'main_dining',
    type: 'regular',
    position: { x: 100, y: 100 },
    amenities: []
});

const reservationForm = ref({
    tableId: null,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 2,
    reservationTime: null,
    duration: 120,
    notes: ''
});

// Options
const sectionOptions = [
    { label: 'Main Dining', value: 'main_dining' },
    { label: 'Bar Area', value: 'bar_area' },
    { label: 'Patio', value: 'patio' },
    { label: 'VIP Section', value: 'vip_area' },
    { label: 'Private Dining', value: 'private' }
];

const tableTypeOptions = [
    { label: 'Regular Table', value: 'regular' },
    { label: 'Booth', value: 'booth' },
    { label: 'Bar Table', value: 'bar' },
    { label: 'VIP Table', value: 'vip' },
    { label: 'Outdoor Table', value: 'outdoor' }
];

const amenityOptions = ['Window View', 'Privacy Screen', 'High Chairs Available', 'Wheelchair Accessible', 'Premium Location', 'Bar Service', 'Charging Station', 'Live Music View'];

// Context menu items
const contextMenuItems = ref([
    {
        label: 'Assign to Order',
        icon: 'pi pi-shopping-cart',
        command: () => assignTableToOrder(contextMenuTable.value)
    },
    {
        label: 'Change Status',
        icon: 'pi pi-refresh',
        items: [
            {
                label: 'Available',
                command: () => changeTableStatus(contextMenuTable.value, 'available')
            },
            {
                label: 'Occupied',
                command: () => changeTableStatus(contextMenuTable.value, 'occupied')
            },
            {
                label: 'Reserved',
                command: () => changeTableStatus(contextMenuTable.value, 'reserved')
            },
            {
                label: 'Cleaning',
                command: () => changeTableStatus(contextMenuTable.value, 'cleaning')
            },
            {
                label: 'Out of Order',
                command: () => changeTableStatus(contextMenuTable.value, 'out_of_order')
            }
        ]
    },
    {
        label: 'Create Reservation',
        icon: 'pi pi-calendar-plus',
        command: () => openReservationDialog(contextMenuTable.value)
    },
    {
        label: 'Clear Table',
        icon: 'pi pi-times',
        command: () => clearTable(contextMenuTable.value)
    }
]);

// Computed properties
const tables = computed(() => tableStore.tables);
const tableStats = computed(() => tableStore.tableStatistics);
const tablesBySection = computed(() => tableStore.tablesBySection);

// Methods
const openTableDialog = () => {
    tableForm.value = {
        number: '',
        name: '',
        capacity: 4,
        section: 'main_dining',
        type: 'regular',
        position: { x: 100, y: 100 },
        amenities: []
    };
    showTableDialog.value = true;
};

const saveTable = async () => {
    const result = await tableStore.createTable(tableForm.value);
    if (result.success) {
        showTableDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Table Created',
            detail: `${tableForm.value.name} has been created successfully`,
            life: 3000
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

const openReservationDialog = (table) => {
    reservationForm.value = {
        tableId: table?.id || null,
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        partySize: 2,
        reservationTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        duration: 120,
        notes: ''
    };
    showReservationDialog.value = true;
};

const saveReservation = async () => {
    const result = await tableStore.createReservation(reservationForm.value);
    if (result.success) {
        showReservationDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Reservation Created',
            detail: `Reservation for ${reservationForm.value.customerName} has been created`,
            life: 3000
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

const assignTableToOrder = (table) => {
    if (posStore.cart.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Empty Cart',
            detail: 'Please add items to cart before assigning a table',
            life: 3000
        });
        return;
    }

    posStore.setCustomerInfo({
        ...posStore.customerInfo,
        tableId: table.id,
        tableName: table.name
    });

    tableStore.updateTableStatus(table.id, 'occupied');

    toast.add({
        severity: 'success',
        summary: 'Table Assigned',
        detail: `Order assigned to ${table.name}`,
        life: 3000
    });
};

const changeTableStatus = async (table, status) => {
    const result = await tableStore.updateTableStatus(table.id, status);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: `${table.name} status changed to ${status}`,
            life: 2000
        });
    }
};

const clearTable = async (table) => {
    const result = await tableStore.clearTable(table.id);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Table Cleared',
            detail: `${table.name} has been cleared`,
            life: 2000
        });
    }
};

const mergeTables = async () => {
    if (selectedTables.value.length < 2) {
        toast.add({
            severity: 'warn',
            summary: 'Select Tables',
            detail: 'Please select at least 2 tables to merge',
            life: 3000
        });
        return;
    }

    const [primary, ...secondary] = selectedTables.value;
    const result = await tableStore.mergeTables(
        primary.id,
        secondary.map((t) => t.id)
    );

    if (result.success) {
        selectedTables.value = [];
        showMergeDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Tables Merged',
            detail: `Tables have been merged successfully`,
            life: 3000
        });
    }
};

const getTableStatusColor = (status) => {
    switch (status) {
        case 'available':
            return 'success';
        case 'occupied':
            return 'danger';
        case 'reserved':
            return 'warning';
        case 'cleaning':
            return 'info';
        case 'out_of_order':
            return 'secondary';
        default:
            return 'secondary';
    }
};

const getTableStatusIcon = (status) => {
    switch (status) {
        case 'available':
            return 'pi pi-check-circle';
        case 'occupied':
            return 'pi pi-users';
        case 'reserved':
            return 'pi pi-calendar';
        case 'cleaning':
            return 'pi pi-refresh';
        case 'out_of_order':
            return 'pi pi-exclamation-triangle';
        default:
            return 'pi pi-circle';
    }
};

const onTableContextMenu = (event, table) => {
    contextMenuTable.value = table;
    contextMenuRef.value.show(event);
};

const toggleTableSelection = (table) => {
    const index = selectedTables.value.findIndex((t) => t.id === table.id);
    if (index > -1) {
        selectedTables.value.splice(index, 1);
    } else {
        selectedTables.value.push(table);
    }
};

// Lifecycle
onMounted(async () => {
    await tableStore.fetchTables();
});

const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};
</script>

<template>
    <div class="table-management p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Table Management</h1>
                <p class="text-gray-600">Manage restaurant tables, reservations, and floor layout</p>
            </div>

            <div class="flex gap-2">
                <Button icon="pi pi-th-large" :severity="viewMode === 'grid' ? 'info' : 'secondary'" @click="viewMode = 'grid'" v-tooltip="'Grid View'" />
                <Button icon="pi pi-map" :severity="viewMode === 'floor_plan' ? 'info' : 'secondary'" @click="viewMode = 'floor_plan'" v-tooltip="'Floor Plan'" />
                <Button label="New Table" icon="pi pi-plus" @click="openTableDialog" />
                <Button label="New Reservation" icon="pi pi-calendar-plus" severity="secondary" @click="openReservationDialog()" />
            </div>
        </div>

        <!-- Statistics Dashboard -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-blue-600">{{ tableStats.total }}</div>
                    <div class="text-sm text-gray-600">Total Tables</div>
                </template>
            </Card>
            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-green-600">{{ tableStats.available }}</div>
                    <div class="text-sm text-gray-600">Available</div>
                </template>
            </Card>
            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-red-600">{{ tableStats.occupied }}</div>
                    <div class="text-sm text-gray-600">Occupied</div>
                </template>
            </Card>
            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-orange-600">{{ tableStats.reserved }}</div>
                    <div class="text-sm text-gray-600">Reserved</div>
                </template>
            </Card>
        </div>

        <!-- Table Actions -->
        <Toolbar class="mb-4">
            <template #start>
                <div v-if="selectedTables.length > 0" class="flex items-center gap-2">
                    <Badge :value="selectedTables.length" severity="info" />
                    <span class="text-sm">tables selected</span>
                </div>
            </template>
            <template #end>
                <div class="flex gap-2">
                    <Button label="Merge Tables" icon="pi pi-share-alt" :disabled="selectedTables.length < 2" @click="showMergeDialog = true" severity="secondary" />
                    <Button label="Clear Selection" icon="pi pi-times" :disabled="selectedTables.length === 0" @click="selectedTables = []" text />
                </div>
            </template>
        </Toolbar>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="space-y-6">
            <div v-for="(sectionTables, section) in tablesBySection" :key="section">
                <h3 class="text-lg font-semibold mb-3 capitalize">
                    {{ section.replace('_', ' ') }}
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <Card
                        v-for="table in sectionTables"
                        :key="table.id"
                        class="table-card cursor-pointer transition-all duration-200"
                        :class="{
                            'ring-2 ring-blue-500': selectedTables.some((t) => t.id === table.id),
                            'hover:shadow-lg': true
                        }"
                        @click="toggleTableSelection(table)"
                        @contextmenu="onTableContextMenu($event, table)"
                    >
                        <template #header>
                            <div class="flex justify-between items-start p-3 pb-0">
                                <div class="flex items-center gap-2">
                                    <i :class="getTableStatusIcon(table.status)"></i>
                                    <span class="font-medium">{{ table.name || `Table ${table.number}` }}</span>
                                </div>
                                <Badge :value="table.status.toUpperCase()" :severity="getTableStatusColor(table.status)" class="text-xs" />
                            </div>
                        </template>

                        <template #content>
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Capacity:</span>
                                    <span class="font-medium">{{ table.capacity }} guests</span>
                                </div>

                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Type:</span>
                                    <span class="font-medium capitalize">{{ table.type }}</span>
                                </div>

                                <div v-if="table.currentOrder" class="text-sm">
                                    <span class="text-gray-600">Order:</span>
                                    <span class="font-medium text-blue-600">#{{ table.currentOrder }}</span>
                                </div>

                                <div v-if="table.occupiedAt" class="text-sm">
                                    <span class="text-gray-600">Occupied:</span>
                                    <span class="font-medium">{{ formatTime(table.occupiedAt) }}</span>
                                </div>

                                <div v-if="table.reservations && table.reservations.length > 0" class="text-sm">
                                    <div class="text-orange-600 font-medium">Next: {{ table.reservations[0].customerName }}</div>
                                    <div class="text-gray-500">
                                        {{ formatTime(table.reservations[0].reservationTime) }}
                                    </div>
                                </div>

                                <div v-if="table.amenities && table.amenities.length > 0" class="flex flex-wrap gap-1">
                                    <Badge v-for="amenity in table.amenities.slice(0, 2)" :key="amenity" :value="amenity" severity="secondary" class="text-xs" />
                                    <Badge v-if="table.amenities.length > 2" :value="`+${table.amenities.length - 2}`" severity="info" class="text-xs" />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>

        <!-- Floor Plan View -->
        <div v-if="viewMode === 'floor_plan'" class="floor-plan-container">
            <Card class="h-96">
                <template #title>Restaurant Floor Plan</template>
                <template #content>
                    <div class="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                        <!-- Floor plan will be implemented here -->
                        <div class="absolute inset-0 flex items-center justify-center text-gray-500">
                            <div class="text-center">
                                <i class="pi pi-map text-4xl mb-2"></i>
                                <div>Interactive Floor Plan</div>
                                <div class="text-sm">Drag and drop tables to arrange layout</div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Context Menu -->
        <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />

        <!-- Table Creation Dialog -->
        <Dialog :visible="showTableDialog" @update:visible="showTableDialog = $event" header="Create New Table" :modal="true" :style="{ width: '500px' }">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Table Number</label>
                        <InputNumber v-model="tableForm.number" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Table Name</label>
                        <InputText v-model="tableForm.name" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Capacity</label>
                        <InputNumber v-model="tableForm.capacity" :min="1" :max="20" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Section</label>
                        <Dropdown v-model="tableForm.section" :options="sectionOptions" option-label="label" option-value="value" class="w-full" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Table Type</label>
                    <Dropdown v-model="tableForm.type" :options="tableTypeOptions" option-label="label" option-value="value" class="w-full" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Amenities</label>
                    <div class="flex flex-wrap gap-2">
                        <Badge
                            v-for="amenity in amenityOptions"
                            :key="amenity"
                            :value="amenity"
                            :severity="tableForm.amenities.includes(amenity) ? 'info' : 'secondary'"
                            class="cursor-pointer"
                            @click="
                                () => {
                                    const index = tableForm.amenities.indexOf(amenity);
                                    if (index > -1) {
                                        tableForm.amenities.splice(index, 1);
                                    } else {
                                        tableForm.amenities.push(amenity);
                                    }
                                }
                            "
                        />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showTableDialog = false" />
                <Button label="Create Table" @click="saveTable" />
            </template>
        </Dialog>

        <!-- Reservation Dialog -->
        <Dialog :visible="showReservationDialog" @update:visible="showReservationDialog = $event" header="Create Reservation" :modal="true" :style="{ width: '500px' }">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Customer Name</label>
                        <InputText v-model="reservationForm.customerName" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Phone Number</label>
                        <InputText v-model="reservationForm.customerPhone" class="w-full" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Email (Optional)</label>
                    <InputText v-model="reservationForm.customerEmail" type="email" class="w-full" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Party Size</label>
                        <InputNumber v-model="reservationForm.partySize" :min="1" :max="20" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Duration (minutes)</label>
                        <InputNumber v-model="reservationForm.duration" :min="30" :step="30" class="w-full" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Reservation Time</label>
                    <Calendar v-model="reservationForm.reservationTime" show-time :min-date="new Date()" class="w-full" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Table</label>
                    <Dropdown v-model="reservationForm.tableId" :options="tableStore.getAvailableTablesForCapacity(reservationForm.partySize)" option-label="name" option-value="id" placeholder="Select a table" class="w-full" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Special Notes</label>
                    <Textarea v-model="reservationForm.notes" rows="3" class="w-full" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showReservationDialog = false" />
                <Button label="Create Reservation" @click="saveReservation" />
            </template>
        </Dialog>

        <!-- Merge Tables Dialog -->
        <Dialog :visible="showMergeDialog" @update:visible="showMergeDialog = $event" header="Merge Tables" :modal="true" :style="{ width: '400px' }">
            <div class="space-y-4">
                <p>You are about to merge the following tables:</p>
                <ul class="list-disc list-inside space-y-1">
                    <li v-for="table in selectedTables" :key="table.id">{{ table.name }} (Capacity: {{ table.capacity }})</li>
                </ul>
                <div class="bg-blue-50 p-3 rounded-lg">
                    <div class="text-sm text-blue-800">
                        <strong>Total Capacity:</strong>
                        {{ selectedTables.reduce((sum, t) => sum + t.capacity, 0) }} guests
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showMergeDialog = false" />
                <Button label="Merge Tables" @click="mergeTables" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.table-card {
    border: 2px solid transparent;
    transition: all 0.2s ease-in-out;
}

.table-card:hover {
    transform: translateY(-2px);
}

.table-card.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
}

.floor-plan-container {
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
}

:deep(.p-card-content) {
    padding: 1rem;
}

:deep(.p-badge) {
    font-size: 0.75rem;
}
</style>
