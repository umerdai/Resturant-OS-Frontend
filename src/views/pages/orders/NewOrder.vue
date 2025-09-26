<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useMenuStore } from '@/stores/menu';
import { useOrderStore } from '@/stores/order';
import { useTableStore } from '@/stores/table';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const menuStore = useMenuStore();
const orderStore = useOrderStore();
const tableStore = useTableStore();
const authStore = useAuthStore();

// Component state
const currentOrderItems = ref([]);
const selectedTable = ref(null);
const showModifiersDialog = ref(false);

// Initialize data
onMounted(() => {
    menuStore.loadMenuData();
    tableStore.loadTables();

    // Initialize table from route parameter
    const tableId = route.query.tableId;
    if (tableId) {
        const table = tableStore.tables.find((t) => t.id == tableId);
        if (table) {
            selectedTable.value = table;
        }
    }
});
const selectedItem = ref(null);
const selectedModifiers = ref([]);
const itemNotes = ref('');
const itemQuantity = ref(1);

// Computed properties
const availableModifiers = computed(() => {
    if (!selectedItem.value) return [];
    return menuStore.getModifiersByItemId(selectedItem.value.id);
});

const orderSummary = computed(() => {
    const subtotal = currentOrderItems.value.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const modifiersTotal = (item.modifiers || []).reduce((modSum, mod) => modSum + mod.price * item.quantity, 0);
        return sum + itemTotal + modifiersTotal;
    }, 0);

    const tax = subtotal * 0.08;
    const serviceCharge = subtotal * 0.1;
    const total = subtotal + tax + serviceCharge;

    return { subtotal, tax, serviceCharge, total };
});

// Methods
const addItemToOrder = (item) => {
    const modifiers = menuStore.getModifiersByItemId(item.id);

    if (modifiers.length > 0) {
        // Show modifiers dialog if item has modifiers
        selectedItem.value = item;
        selectedModifiers.value = [];
        itemNotes.value = '';
        itemQuantity.value = 1;
        showModifiersDialog.value = true;
    } else {
        // Add directly if no modifiers
        currentOrderItems.value.push({
            ...item,
            quantity: 1,
            notes: '',
            modifiers: [],
            orderItemId: Date.now()
        });

        toast.add({
            severity: 'success',
            summary: 'Item Added',
            detail: `${item.name} added to order`,
            life: 2000
        });
    }
};

const confirmAddItem = () => {
    if (!selectedItem.value) return;

    currentOrderItems.value.push({
        ...selectedItem.value,
        quantity: itemQuantity.value,
        notes: itemNotes.value,
        modifiers: [...selectedModifiers.value],
        orderItemId: Date.now()
    });

    toast.add({
        severity: 'success',
        summary: 'Item Added',
        detail: `${selectedItem.value.name} added to order`,
        life: 2000
    });

    showModifiersDialog.value = false;
};

const removeItemFromOrder = (index) => {
    const item = currentOrderItems.value[index];
    currentOrderItems.value.splice(index, 1);

    toast.add({
        severity: 'info',
        summary: 'Item Removed',
        detail: `${item.name} removed from order`,
        life: 2000
    });
};

const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    currentOrderItems.value[index].quantity = newQuantity;
};

const placeOrder = async () => {
    if (!selectedTable.value || !currentOrderItems.value.length) return;

    const orderData = {
        tableId: selectedTable.value.id,
        waiterId: authStore.user?.id,
        items: currentOrderItems.value.map((item) => ({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes,
            modifiers: item.modifiers
        })),
        subtotal: orderSummary.value.subtotal,
        tax: orderSummary.value.tax,
        serviceCharge: orderSummary.value.serviceCharge,
        total: orderSummary.value.total,
        taxRate: 0.08,
        serviceChargeRate: 0.1
    };

    const result = await orderStore.createOrder(orderData);

    if (result.success) {
        // Update table status
        await tableStore.updateTableStatus(selectedTable.value.id, 'occupied', authStore.user?.id);

        toast.add({
            severity: 'success',
            summary: 'Order Placed',
            detail: `Order #${result.order.orderNumber} created successfully`,
            life: 5000
        });

        // Clear current order and go back to tables
        clearOrder();
        router.push('/tables');
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message || 'Failed to place order',
            life: 5000
        });
    }
};

const saveDraft = () => {
    // TODO: Implement save draft functionality
    toast.add({
        severity: 'info',
        summary: 'Draft Saved',
        detail: 'Order saved as draft',
        life: 3000
    });
};

const clearOrder = () => {
    currentOrderItems.value = [];
    toast.add({
        severity: 'warn',
        summary: 'Order Cleared',
        detail: 'All items removed from order',
        life: 2000
    });
};

// Lifecycle
onMounted(async () => {
    // Load menu data
    await menuStore.fetchCategories();
    await menuStore.fetchItems();
    await menuStore.fetchModifiers();

    // Load tables
    await tableStore.fetchTables();

    // Get table from route params
    const tableId = route.params.tableId || route.query.table;
    if (tableId) {
        selectedTable.value = tableStore.getTableById(parseInt(tableId));
    }

    // If no table selected, redirect to table selection
    if (!selectedTable.value) {
        router.push('/tables');
    }
});

// Watch for route changes
watch(
    () => route.params.tableId,
    (newTableId) => {
        if (newTableId) {
            selectedTable.value = tableStore.getTableById(parseInt(newTableId));
        }
    }
);
</script>

<template>
    <div class="h-screen bg-surface-50 dark:bg-surface-900">
        <Toast />

        <div class="grid grid-cols-12 h-full">
            <!-- Menu Items Panel -->
            <div class="col-span-7 xl:col-span-8 p-4 overflow-hidden">
                <!-- Header with Search and Categories -->
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">New Order - Table {{ selectedTable?.number || 'N/A' }}</h1>
                        <Button label="Back to Tables" icon="pi pi-arrow-left" outlined @click="$router.push('/tables')" />
                    </div>

                    <!-- Search Bar -->
                    <div class="mb-4">
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-search" />
                            <InputText v-model="menuStore.searchQuery" placeholder="Search menu items..." class="w-full" />
                        </span>
                    </div>

                    <!-- Categories -->
                    <div class="flex gap-2 mb-4 overflow-x-auto">
                        <Button label="All" :outlined="menuStore.selectedCategory !== null" @click="menuStore.setSelectedCategory(null)" />
                        <Button v-for="category in menuStore.availableCategories" :key="category.id" :label="category.name" :outlined="menuStore.selectedCategory?.id !== category.id" @click="menuStore.setSelectedCategory(category)" />
                    </div>
                </div>

                <!-- Menu Items Grid -->
                <div class="overflow-y-auto" style="height: calc(100vh - 200px)">
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <Card v-for="item in menuStore.filteredItems" :key="item.id" class="cursor-pointer hover:shadow-lg transition-shadow" @click="addItemToOrder(item)">
                            <template #header>
                                <img :src="item.image || '/api/placeholder/300/200'" :alt="item.name" class="w-full h-32 object-cover" />
                            </template>
                            <template #title>
                                <div class="text-lg font-medium">{{ item.name }}</div>
                            </template>
                            <template #subtitle>
                                <div class="text-sm text-muted-color mb-2">{{ item.description }}</div>
                            </template>
                            <template #content>
                                <div class="flex justify-between items-center">
                                    <span class="text-xl font-bold text-primary">${{ item.price }}</span>
                                    <div class="flex items-center gap-2">
                                        <Badge v-if="item.isVegetarian" value="V" severity="success" class="text-xs" />
                                        <Badge v-if="item.spiceLevel > 0" :value="'🌶'.repeat(item.spiceLevel)" severity="warn" class="text-xs" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>

            <!-- Order Summary Panel -->
            <div class="col-span-5 xl:col-span-4 bg-white dark:bg-surface-800 border-l border-surface-200 dark:border-surface-700 p-4 flex flex-col">
                <!-- Order Header -->
                <div class="mb-4 pb-4 border-b border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between items-center mb-2">
                        <h2 class="text-xl font-semibold">Current Order</h2>
                        <Badge :value="currentOrderItems.length + ' items'" severity="info" />
                    </div>
                    <div v-if="selectedTable" class="text-sm text-muted-color">Table: {{ selectedTable.number }} ({{ selectedTable.seats }} seats)</div>
                </div>

                <!-- Order Items -->
                <div class="flex-1 overflow-y-auto mb-4">
                    <div v-if="!currentOrderItems.length" class="text-center py-8 text-muted-color">
                        <i class="pi pi-shopping-cart text-4xl mb-4"></i>
                        <p>No items in order</p>
                        <p class="text-sm">Click on menu items to add them</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="(item, index) in currentOrderItems" :key="`${item.id}-${index}`" class="bg-surface-50 dark:bg-surface-900 p-3 rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex-1">
                                    <h4 class="font-medium">{{ item.name }}</h4>
                                    <p class="text-sm text-muted-color">{{ item.description }}</p>
                                </div>
                                <Button icon="pi pi-times" size="small" text severity="danger" @click="removeItemFromOrder(index)" />
                            </div>

                            <!-- Modifiers -->
                            <div v-if="item.modifiers?.length" class="text-xs text-muted-color mb-2">
                                <span v-for="modifier in item.modifiers" :key="modifier.id" class="block"> + {{ modifier.name }} (+${{ modifier.price }}) </span>
                            </div>

                            <!-- Special Notes -->
                            <div v-if="item.notes" class="text-xs text-muted-color mb-2">Notes: {{ item.notes }}</div>

                            <!-- Quantity and Price -->
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-2">
                                    <Button icon="pi pi-minus" size="small" outlined @click="updateItemQuantity(index, item.quantity - 1)" :disabled="item.quantity <= 1" />
                                    <span class="w-8 text-center">{{ item.quantity }}</span>
                                    <Button icon="pi pi-plus" size="small" outlined @click="updateItemQuantity(index, item.quantity + 1)" />
                                </div>
                                <div class="font-bold">${{ (item.price * item.quantity + (item.modifiers?.reduce((sum, m) => sum + m.price * item.quantity, 0) || 0)).toFixed(2) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="border-t border-surface-200 dark:border-surface-700 pt-4">
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${{ orderSummary.subtotal.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Tax (8%):</span>
                            <span>${{ orderSummary.tax.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Service (10%):</span>
                            <span>${{ orderSummary.serviceCharge.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span class="text-primary">${{ orderSummary.total.toFixed(2) }}</span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="space-y-2">
                        <Button label="Place Order" icon="pi pi-check" class="w-full" :disabled="!currentOrderItems.length" @click="placeOrder" />
                        <div class="grid grid-cols-2 gap-2">
                            <Button label="Save Draft" icon="pi pi-save" outlined class="w-full" :disabled="!currentOrderItems.length" @click="saveDraft" />
                            <Button label="Clear All" icon="pi pi-trash" severity="danger" outlined class="w-full" :disabled="!currentOrderItems.length" @click="clearOrder" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Item Modifiers Dialog -->
        <Dialog :visible="showModifiersDialog" @update:visible="showModifiersDialog = $event" modal :header="`Customize ${selectedItem?.name}`" :style="{ width: '600px' }">
            <div v-if="selectedItem" class="space-y-4">
                <!-- Item Info -->
                <div class="flex items-center gap-4 mb-4">
                    <img :src="selectedItem.image || '/api/placeholder/150/100'" :alt="selectedItem.name" class="w-20 h-16 object-cover rounded" />
                    <div>
                        <h3 class="text-xl font-semibold">{{ selectedItem.name }}</h3>
                        <p class="text-muted-color">{{ selectedItem.description }}</p>
                        <p class="text-lg font-bold text-primary">${{ selectedItem.price }}</p>
                    </div>
                </div>

                <!-- Modifiers -->
                <div v-if="availableModifiers.length" class="mb-4">
                    <h4 class="font-medium mb-3">Available Modifiers</h4>
                    <div class="space-y-2">
                        <div v-for="modifier in availableModifiers" :key="modifier.id" class="flex items-center justify-between p-2 border rounded">
                            <div>
                                <label :for="`modifier-${modifier.id}`" class="cursor-pointer">
                                    {{ modifier.name }}
                                    <span v-if="modifier.price > 0" class="text-muted-color"> (+${{ modifier.price }}) </span>
                                </label>
                            </div>
                            <Checkbox :id="`modifier-${modifier.id}`" v-model="selectedModifiers" :value="modifier" />
                        </div>
                    </div>
                </div>

                <!-- Special Notes -->
                <div class="mb-4">
                    <label for="notes" class="block font-medium mb-2">Special Notes</label>
                    <Textarea id="notes" v-model="itemNotes" rows="3" class="w-full" placeholder="Any special instructions..." />
                </div>

                <!-- Quantity -->
                <div class="mb-4">
                    <label class="block font-medium mb-2">Quantity</label>
                    <div class="flex items-center gap-3">
                        <Button icon="pi pi-minus" outlined @click="itemQuantity = Math.max(1, itemQuantity - 1)" :disabled="itemQuantity <= 1" />
                        <span class="w-12 text-center text-lg">{{ itemQuantity }}</span>
                        <Button icon="pi pi-plus" outlined @click="itemQuantity++" />
                    </div>
                </div>

                <!-- Dialog Actions -->
                <div class="flex justify-end gap-2 pt-4">
                    <Button label="Cancel" outlined @click="showModifiersDialog = false" />
                    <Button label="Add to Order" @click="confirmAddItem" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Ensure consistent card heights */
.p-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.p-card .p-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.p-card .p-card-content {
    flex: 1;
}
</style>
