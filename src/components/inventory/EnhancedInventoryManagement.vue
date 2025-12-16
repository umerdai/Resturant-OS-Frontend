<script>
import { useEnhancedInventoryStore } from '@/stores/enhancedInventory';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

export default {
    name: 'EnhancedInventoryManagement',
    setup() {
        const inventoryStore = useEnhancedInventoryStore();
        const toast = useToast();

        // Reactive data
        const loading = ref(false);
        const showAddItemDialog = ref(false);
        const showAddStockDlg = ref(false);
        const showWasteDialog = ref(false);
        const showPurchaseOrderDialog = ref(false);
        const showSupplierDialog = ref(false);
        const showAllAlertsDialog = ref(false);
        const selectedItem = ref(null);

        // Form data
        const newItem = ref({
            name: '',
            category: '',
            currentStock: 0,
            unitType: 'kg',
            unitCost: 0,
            supplierId: ''
        });

        const stockAdjustment = ref({
            quantity: 0,
            reason: '',
            notes: ''
        });

        const wasteEntry = ref({
            inventoryId: '',
            quantity: 0,
            reason: '',
            notes: ''
        });

        // Filters
        const filters = ref({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        });

        // Options
        const categoryOptions = ['Proteins', 'Vegetables', 'Dairy', 'Grains', 'Beverages', 'Condiments'];
        const unitTypeOptions = ['kg', 'g', 'L', 'ml', 'pieces', 'boxes'];
        const addStockReasons = ['Purchase Order', 'Manual Count', 'Return', 'Transfer'];
        const wasteReasons = ['Expired', 'Spoiled', 'Damaged', 'Overproduction', 'Cooking Error'];

        // Computed properties
        const inventoryItems = computed(() => inventoryStore.inventoryItems);
        const purchaseOrders = computed(() => inventoryStore.purchaseOrders);
        const suppliers = computed(() => inventoryStore.suppliers);
        const statistics = computed(() => inventoryStore.statistics);
        const activeAlerts = computed(() => inventoryStore.getActiveAlerts);
        const recentStockMovements = computed(() => inventoryStore.getRecentStockMovements);
        const wasteEntries = computed(() => inventoryStore.wasteEntries);

        const inventoryOptions = computed(() =>
            inventoryItems.value.map((item) => ({
                id: item.id,
                name: `${item.name} (${item.currentStock} ${item.unitType})`
            }))
        );

        const supplierOptions = computed(() => suppliers.value.filter((s) => s.isActive));

        // Methods
        const refreshData = async () => {
            loading.value = true;
            try {
                await inventoryStore.initializeInventorySystem();
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Inventory data refreshed successfully',
                    life: 3000
                });
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to refresh inventory data',
                    life: 3000
                });
            } finally {
                loading.value = false;
            }
        };

        const getStockStatusClass = (item) => {
            if (item.currentStock <= 0) return 'bg-red-100 text-red-700';
            if (item.currentStock <= item.minStockLevel) return 'bg-orange-100 text-orange-700';
            return 'bg-green-100 text-green-700';
        };

        const getExpirySeverity = (expiryDate) => {
            const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 1) return 'danger';
            if (daysUntilExpiry <= 3) return 'warning';
            return 'info';
        };

        const getPurchaseOrderSeverity = (status) => {
            switch (status) {
                case 'completed':
                    return 'success';
                case 'pending':
                    return 'warning';
                case 'sent':
                    return 'info';
                case 'cancelled':
                    return 'danger';
                default:
                    return 'secondary';
            }
        };

        const formatDate = (dateString, format = 'full') => {
            const date = new Date(dateString);
            if (format === 'short') {
                return date.toLocaleDateString();
            }
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        };

        const clearFilter = () => {
            filters.value.global.value = null;
        };

        const editItem = (item) => {
            selectedItem.value = item;
            newItem.value = { ...item };
            showAddItemDialog.value = true;
        };

        const showAddStockDialog = (item) => {
            selectedItem.value = item;
            stockAdjustment.value = {
                quantity: 0,
                reason: '',
                notes: ''
            };
            showAddStockDlg.value = true;
        };

        const showDeductStockDialog = (item) => {
            // Similar to add stock but for deduction
            showAddStockDialog(item);
        };

        const addInventoryItem = async () => {
            try {
                // Create new inventory item
                const newInventoryItem = {
                    id: `INV${Date.now()}`,
                    ...newItem.value,
                    minStockLevel: Math.floor(newItem.value.currentStock * 0.2),
                    maxStockLevel: newItem.value.currentStock * 3,
                    reorderPoint: Math.floor(newItem.value.currentStock * 0.3),
                    reorderQuantity: newItem.value.currentStock,
                    supplier: suppliers.value.find((s) => s.id === newItem.value.supplierId)?.name,
                    lastRestocked: new Date().toISOString(),
                    autoReorder: true,
                    trackExpiry: true,
                    allergens: ['None']
                };

                inventoryStore.inventoryItems.push(newInventoryItem);
                await inventoryStore.calculateStatistics();

                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Inventory item added successfully',
                    life: 3000
                });

                showAddItemDialog.value = false;
                newItem.value = {
                    name: '',
                    category: '',
                    currentStock: 0,
                    unitType: 'kg',
                    unitCost: 0,
                    supplierId: ''
                };
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            }
        };

        const addStock = async () => {
            try {
                const result = await inventoryStore.addStock(selectedItem.value.id, stockAdjustment.value.quantity, stockAdjustment.value.reason, stockAdjustment.value.notes);

                if (result.success) {
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Stock added successfully',
                        life: 3000
                    });
                    showAddStockDlg.value = false;
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
            }
        };

        const recordWaste = async () => {
            try {
                const result = await inventoryStore.recordWaste(wasteEntry.value.inventoryId, wasteEntry.value.quantity, wasteEntry.value.reason, wasteEntry.value.notes);

                if (result.success) {
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Waste recorded successfully',
                        life: 3000
                    });
                    showWasteDialog.value = false;
                    wasteEntry.value = {
                        inventoryId: '',
                        quantity: 0,
                        reason: '',
                        notes: ''
                    };
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
            }
        };

        const acknowledgeAlert = (alertId) => {
            inventoryStore.acknowledgeAlert(alertId);
        };

        const exportInventory = () => {
            try {
                inventoryStore.exportInventoryData('csv');
                toast.add({
                    severity: 'success',
                    summary: 'Export Complete',
                    detail: 'Inventory data exported successfully',
                    life: 3000
                });
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Export Failed',
                    detail: error.message,
                    life: 3000
                });
            }
        };

        const viewPurchaseOrder = (po) => {
            // Implementation for viewing purchase order details
            console.log('View PO:', po);
        };

        const editSupplier = (supplier) => {
            // Implementation for editing supplier
            console.log('Edit supplier:', supplier);
        };

        // Initialize data on component mount
        onMounted(async () => {
            await refreshData();
        });

        return {
            // Reactive data
            loading,
            showAddItemDialog,
            showAddStockDlg,
            showWasteDialog,
            showPurchaseOrderDialog,
            showSupplierDialog,
            showAllAlertsDialog,
            selectedItem,
            newItem,
            stockAdjustment,
            wasteEntry,
            filters,

            // Options
            categoryOptions,
            unitTypeOptions,
            addStockReasons,
            wasteReasons,

            // Computed
            inventoryItems,
            purchaseOrders,
            suppliers,
            statistics,
            activeAlerts,
            recentStockMovements,
            wasteEntries,
            inventoryOptions,
            supplierOptions,

            // Methods
            refreshData,
            getStockStatusClass,
            getExpirySeverity,
            getPurchaseOrderSeverity,
            formatDate,
            clearFilter,
            editItem,
            showAddStockDialog,
            showDeductStockDialog,
            addInventoryItem,
            addStock,
            recordWaste,
            acknowledgeAlert,
            exportInventory,
            viewPurchaseOrder,
            editSupplier
        };
    }
};
</script>

<template>
    <div class="enhanced-inventory-management">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex justify-content-between align-items-center">
                <div>
                    <h2 class="text-3xl font-semibold text-900 mb-2">Enhanced Inventory Management</h2>
                    <p class="text-600">Advanced stock tracking, auto-reorder, and supplier management</p>
                </div>
                <div class="flex gap-2">
                    <Button label="Add Item" icon="pi pi-plus" @click="showAddItemDialog = true" class="p-button-success" />
                    <Button label="Purchase Order" icon="pi pi-shopping-cart" @click="showPurchaseOrderDialog = true" class="p-button-outlined" />
                    <Button label="Record Waste" icon="pi pi-trash" @click="showWasteDialog = true" class="p-button-outlined" />
                    <Button label="Export" icon="pi pi-download" @click="exportInventory" class="p-button-outlined" />
                    <Button label="Refresh" icon="pi pi-refresh" @click="refreshData" :loading="loading" />
                </div>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid mb-6">
            <div class="col-12 lg:col-3 md:col-6">
                <Card class="mb-4 border-left-3 border-blue-500">
                    <template #content>
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-500 font-medium mb-3">Total Items</span>
                                <div class="text-900 font-medium text-xl">{{ statistics.totalItems }}</div>
                                <span class="text-500 font-medium"> Value: ${{ statistics.totalValue.toLocaleString() }} </span>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-box text-blue-500 text-xl"></i>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <div class="col-12 lg:col-3 md:col-6">
                <Card class="mb-4 border-left-3 border-orange-500">
                    <template #content>
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-500 font-medium mb-3">Low Stock Items</span>
                                <div class="text-900 font-medium text-xl text-orange-500">
                                    {{ statistics.lowStockItems }}
                                </div>
                                <span class="text-500 font-medium">Need attention</span>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-exclamation-triangle text-orange-500 text-xl"></i>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <div class="col-12 lg:col-3 md:col-6">
                <Card class="mb-4 border-left-3 border-red-500">
                    <template #content>
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-500 font-medium mb-3">Expiring Soon</span>
                                <div class="text-900 font-medium text-xl text-red-500">
                                    {{ statistics.expiringSoonItems }}
                                </div>
                                <span class="text-500 font-medium">Within 3 days</span>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-calendar-times text-red-500 text-xl"></i>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <div class="col-12 lg:col-3 md:col-6">
                <Card class="mb-4 border-left-3 border-green-500">
                    <template #content>
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-500 font-medium mb-3">Monthly Waste</span>
                                <div class="text-900 font-medium text-xl text-green-500">${{ statistics.monthlyWasteValue.toLocaleString() }}</div>
                                <span class="text-500 font-medium"> Turnover: {{ statistics.averageInventoryTurnover.toFixed(1) }}x </span>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-chart-line text-green-500 text-xl"></i>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Alerts Panel -->
        <Card v-if="activeAlerts.length > 0" class="mb-6">
            <template #title>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-bell text-orange-500"></i>
                    <span>Active Alerts ({{ activeAlerts.length }})</span>
                </div>
            </template>
            <template #content>
                <div class="grid">
                    <div v-for="alert in activeAlerts.slice(0, 6)" :key="alert.id" class="col-12 md:col-6 lg:col-4">
                        <Message :severity="alert.severity === 'danger' ? 'error' : alert.severity" :closable="true" @close="acknowledgeAlert(alert.id)">
                            <div class="ml-2">
                                <div class="font-medium">{{ alert.message }}</div>
                                <small class="text-500">
                                    {{ formatDate(alert.createdAt) }}
                                </small>
                            </div>
                        </Message>
                    </div>
                </div>
                <Button v-if="activeAlerts.length > 6" label="View All Alerts" class="p-button-link p-0 mt-2" @click="showAllAlertsDialog = true" />
            </template>
        </Card>

        <!-- Inventory Table -->
        <TabView>
            <!-- Inventory Items -->
            <TabPanel header="Inventory Items">
                <DataTable :value="inventoryItems" :paginator="true" :rows="20" :loading="loading" filterDisplay="menu" :globalFilterFields="['name', 'category', 'supplier']" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex justify-content-between">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined" @click="clearFilter()" />
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search inventory..." />
                            </span>
                        </div>
                    </template>

                    <Column field="name" header="Item" sortable>
                        <template #body="{ data }">
                            <div>
                                <div class="font-semibold">{{ data.name }}</div>
                                <div class="text-sm text-500">{{ data.category }}</div>
                            </div>
                        </template>
                    </Column>

                    <Column field="currentStock" header="Current Stock" sortable>
                        <template #body="{ data }">
                            <div class="text-center">
                                <Chip :label="`${data.currentStock} ${data.unitType}`" :class="getStockStatusClass(data)" />
                            </div>
                        </template>
                    </Column>

                    <Column field="minStockLevel" header="Min/Max" sortable>
                        <template #body="{ data }">
                            <div class="text-sm">
                                <div>Min: {{ data.minStockLevel }} {{ data.unitType }}</div>
                                <div>Max: {{ data.maxStockLevel }} {{ data.unitType }}</div>
                            </div>
                        </template>
                    </Column>

                    <Column field="unitCost" header="Unit Cost" sortable>
                        <template #body="{ data }"> ${{ data.unitCost.toFixed(2) }} </template>
                    </Column>

                    <Column field="supplier" header="Supplier" sortable>
                        <template #body="{ data }">
                            <div class="text-sm">{{ data.supplier }}</div>
                        </template>
                    </Column>

                    <Column field="expiryDate" header="Expiry" sortable>
                        <template #body="{ data }">
                            <div v-if="data.trackExpiry && data.expiryDate" class="text-sm">
                                <Tag :value="formatDate(data.expiryDate, 'short')" :severity="getExpirySeverity(data.expiryDate)" />
                            </div>
                            <span v-else class="text-500">N/A</span>
                        </template>
                    </Column>

                    <Column header="Actions" style="width: 120px">
                        <template #body="{ data }">
                            <div class="flex gap-1">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-outlined p-button-sm" @click="editItem(data)" v-tooltip.top="'Edit'" />
                                <Button icon="pi pi-plus" class="p-button-rounded p-button-success p-button-sm" @click="showAddStockDialog(data)" v-tooltip.top="'Add Stock'" />
                                <Button icon="pi pi-minus" class="p-button-rounded p-button-warning p-button-sm" @click="showDeductStockDialog(data)" v-tooltip.top="'Deduct Stock'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <!-- Purchase Orders -->
            <TabPanel header="Purchase Orders">
                <DataTable :value="purchaseOrders" :paginator="true" :rows="10" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex justify-content-between">
                            <h3>Purchase Orders</h3>
                            <Button label="New Purchase Order" icon="pi pi-plus" @click="showPurchaseOrderDialog = true" />
                        </div>
                    </template>

                    <Column field="id" header="PO Number" sortable />

                    <Column field="supplierName" header="Supplier" sortable />

                    <Column field="orderDate" header="Order Date" sortable>
                        <template #body="{ data }">
                            {{ formatDate(data.orderDate, 'short') }}
                        </template>
                    </Column>

                    <Column field="totalAmount" header="Total Amount" sortable>
                        <template #body="{ data }"> ${{ data.totalAmount.toLocaleString() }} </template>
                    </Column>

                    <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.status.replace('_', ' ').toUpperCase()" :severity="getPurchaseOrderSeverity(data.status)" />
                        </template>
                    </Column>

                    <Column header="Actions" style="width: 100px">
                        <template #body="{ data }">
                            <Button icon="pi pi-eye" class="p-button-rounded p-button-outlined p-button-sm" @click="viewPurchaseOrder(data)" v-tooltip.top="'View Details'" />
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <!-- Stock Movements -->
            <TabPanel header="Stock Movements">
                <DataTable :value="recentStockMovements" :paginator="true" :rows="15" responsiveLayout="scroll">
                    <Column field="timestamp" header="Date/Time" sortable>
                        <template #body="{ data }">
                            {{ formatDate(data.timestamp) }}
                        </template>
                    </Column>

                    <Column field="itemName" header="Item" sortable />

                    <Column field="type" header="Type" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.type.toUpperCase()" :severity="data.type === 'addition' ? 'success' : 'warning'" />
                        </template>
                    </Column>

                    <Column field="quantity" header="Quantity" sortable>
                        <template #body="{ data }">
                            <span :class="data.quantity > 0 ? 'text-green-500' : 'text-red-500'"> {{ data.quantity > 0 ? '+' : '' }}{{ data.quantity }} </span>
                        </template>
                    </Column>

                    <Column field="reason" header="Reason" sortable />

                    <Column field="newStock" header="New Stock" sortable />
                </DataTable>
            </TabPanel>

            <!-- Waste Tracking -->
            <TabPanel header="Waste Tracking">
                <DataTable :value="wasteEntries" :paginator="true" :rows="15" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex justify-content-between">
                            <h3>Waste Entries</h3>
                            <Button label="Record Waste" icon="pi pi-trash" @click="showWasteDialog = true" />
                        </div>
                    </template>

                    <Column field="date" header="Date" sortable>
                        <template #body="{ data }">
                            {{ formatDate(data.date, 'short') }}
                        </template>
                    </Column>

                    <Column field="itemName" header="Item" sortable />

                    <Column field="quantity" header="Quantity" sortable />

                    <Column field="reason" header="Reason" sortable />

                    <Column field="cost" header="Cost" sortable>
                        <template #body="{ data }"> ${{ data.cost.toFixed(2) }} </template>
                    </Column>

                    <Column field="recordedBy" header="Recorded By" sortable />
                </DataTable>
            </TabPanel>

            <!-- Suppliers -->
            <TabPanel header="Suppliers">
                <DataTable :value="suppliers" :paginator="true" :rows="10" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex justify-content-between">
                            <h3>Suppliers</h3>
                            <Button label="Add Supplier" icon="pi pi-plus" @click="showSupplierDialog = true" />
                        </div>
                    </template>

                    <Column field="name" header="Supplier Name" sortable />

                    <Column field="contactPerson" header="Contact Person" sortable />

                    <Column field="email" header="Email" sortable />

                    <Column field="phone" header="Phone" sortable />

                    <Column field="deliveryDays" header="Delivery Days">
                        <template #body="{ data }">
                            <div class="flex gap-1 flex-wrap">
                                <Tag v-for="day in data.deliveryDays" :key="day" :value="day.slice(0, 3)" severity="info" class="text-xs" />
                            </div>
                        </template>
                    </Column>

                    <Column field="rating" header="Rating" sortable>
                        <template #body="{ data }">
                            <Rating :model-value="data.rating" readonly :cancel="false" />
                        </template>
                    </Column>

                    <Column header="Actions" style="width: 100px">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-outlined p-button-sm" @click="editSupplier(data)" v-tooltip.top="'Edit'" />
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>

        <!-- Add/Edit Item Dialog -->
        <Dialog v-model:visible="showAddItemDialog" modal header="Add Inventory Item" :style="{ width: '50rem' }">
            <div class="grid">
                <div class="col-12 md:col-6">
                    <label class="block text-900 font-medium mb-2">Item Name</label>
                    <InputText v-model="newItem.name" class="w-full" />
                </div>
                <div class="col-12 md:col-6">
                    <label class="block text-900 font-medium mb-2">Category</label>
                    <Dropdown v-model="newItem.category" :options="categoryOptions" class="w-full" />
                </div>
                <div class="col-12 md:col-6">
                    <label class="block text-900 font-medium mb-2">Initial Stock</label>
                    <InputNumber v-model="newItem.currentStock" class="w-full" />
                </div>
                <div class="col-12 md:col-6">
                    <label class="block text-900 font-medium mb-2">Unit Type</label>
                    <Dropdown v-model="newItem.unitType" :options="unitTypeOptions" class="w-full" />
                </div>
                <div class="col-12 md:col-6">
                    <label class="block text-900 font-medium mb-2">Unit Cost</label>
                    <InputNumber v-model="newItem.unitCost" mode="currency" currency="USD" class="w-full" />
                </div>
                <div class="col-12 md:col-6">
                    <label class="block text-900 font-medium mb-2">Supplier</label>
                    <Dropdown v-model="newItem.supplierId" :options="supplierOptions" option-label="name" option-value="id" class="w-full" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="showAddItemDialog = false" class="p-button-text" />
                <Button label="Add Item" icon="pi pi-check" @click="addInventoryItem" />
            </template>
        </Dialog>

        <!-- Add Stock Dialog -->
        <Dialog v-model:visible="showAddStockDlg" modal header="Add Stock" :style="{ width: '30rem' }">
            <div v-if="selectedItem">
                <p class="mb-4">
                    Add stock for: <strong>{{ selectedItem.name }}</strong>
                </p>

                <div class="mb-4">
                    <label class="block text-900 font-medium mb-2">Quantity to Add</label>
                    <InputNumber v-model="stockAdjustment.quantity" class="w-full" :min="0" />
                </div>

                <div class="mb-4">
                    <label class="block text-900 font-medium mb-2">Reason</label>
                    <Dropdown v-model="stockAdjustment.reason" :options="addStockReasons" class="w-full" />
                </div>

                <div class="mb-4">
                    <label class="block text-900 font-medium mb-2">Notes (Optional)</label>
                    <Textarea v-model="stockAdjustment.notes" class="w-full" rows="3" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="showAddStockDlg = false" class="p-button-text" />
                <Button label="Add Stock" icon="pi pi-check" @click="addStock" />
            </template>
        </Dialog>

        <!-- Record Waste Dialog -->
        <Dialog v-model:visible="showWasteDialog" modal header="Record Waste" :style="{ width: '30rem' }">
            <div class="mb-4">
                <label class="block text-900 font-medium mb-2">Item</label>
                <Dropdown v-model="wasteEntry.inventoryId" :options="inventoryOptions" option-label="name" option-value="id" class="w-full" />
            </div>

            <div class="mb-4">
                <label class="block text-900 font-medium mb-2">Quantity Wasted</label>
                <InputNumber v-model="wasteEntry.quantity" class="w-full" :min="0" />
            </div>

            <div class="mb-4">
                <label class="block text-900 font-medium mb-2">Reason</label>
                <Dropdown v-model="wasteEntry.reason" :options="wasteReasons" class="w-full" />
            </div>

            <div class="mb-4">
                <label class="block text-900 font-medium mb-2">Notes (Optional)</label>
                <Textarea v-model="wasteEntry.notes" class="w-full" rows="3" />
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="showWasteDialog = false" class="p-button-text" />
                <Button label="Record Waste" icon="pi pi-check" @click="recordWaste" class="p-button-danger" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.enhanced-inventory-management {
    padding: 1rem;
}

.border-left-3 {
    border-left: 3px solid;
}

.border-blue-500 {
    border-left-color: #3b82f6;
}

.border-orange-500 {
    border-left-color: #f97316;
}

.border-red-500 {
    border-left-color: #ef4444;
}

.border-green-500 {
    border-left-color: #22c55e;
}

.p-datatable .p-datatable-thead > tr > th {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.p-card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.p-tabview .p-tabview-panels {
    padding: 1rem 0;
}
</style>
