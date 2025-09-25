<script setup>
import { ref, computed, onMounted } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import IngredientForm from '@/components/inventory/IngredientForm.vue';
import StockAdjustmentDialog from '@/components/inventory/StockAdjustmentDialog.vue';
import PurchaseOrderDialog from '@/components/inventory/PurchaseOrderDialog.vue';
import IngredientDetailsDialog from '@/components/inventory/IngredientDetailsDialog.vue';

const inventoryStore = useInventoryStore();
const confirm = useConfirm();
const toast = useToast();

// Component state
const loading = ref(false);
const tableView = ref('table'); // 'table' or 'grid'
const searchQuery = ref('');
const selectedCategory = ref(null);
const selectedStatus = ref(null);
const selectedSupplier = ref(null);

// Dialog states
const showAddDialog = ref(false);
const showAdjustmentDialog = ref(false);
const showPurchaseOrderDialog = ref(false);
const showDetailsDialog = ref(false);
const showAllAlerts = ref(false);

// Selected items
const editingIngredient = ref(null);
const adjustmentIngredient = ref(null);
const selectedIngredient = ref(null);

// Computed properties
const categoryOptions = computed(() => [
    { label: 'All Categories', value: null },
    ...inventoryStore.categories.map((cat) => ({
        label: cat.name,
        value: cat.id
    }))
]);

const statusOptions = computed(() => [
    { label: 'All Status', value: null },
    { label: 'In Stock', value: 'in-stock' },
    { label: 'Low Stock', value: 'low-stock' },
    { label: 'Out of Stock', value: 'out-of-stock' }
]);

const supplierOptions = computed(() => [
    { label: 'All Suppliers', value: null },
    ...inventoryStore.suppliers.map((sup) => ({
        label: sup.name,
        value: sup.id
    }))
]);

const filteredIngredients = computed(() => {
    let filtered = [...inventoryStore.ingredients];

    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((item) => item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query) || item.barcode.toLowerCase().includes(query));
    }

    // Category filter
    if (selectedCategory.value) {
        filtered = filtered.filter((item) => item.category === selectedCategory.value);
    }

    // Status filter
    if (selectedStatus.value) {
        filtered = filtered.filter((item) => item.status === selectedStatus.value);
    }

    // Supplier filter
    if (selectedSupplier.value) {
        filtered = filtered.filter((item) => item.supplierId === selectedSupplier.value);
    }

    return filtered;
});

const reorderSuggestions = computed(() => {
    return inventoryStore.generateReorderSuggestions();
});

// Methods
const refreshInventory = async () => {
    loading.value = true;
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loading.value = false;
    toast.add({
        severity: 'success',
        summary: 'Inventory Updated',
        detail: 'Inventory data has been refreshed',
        life: 3000
    });
};

const toggleView = () => {
    tableView.value = tableView.value === 'table' ? 'grid' : 'table';
};

const editIngredient = (ingredient) => {
    editingIngredient.value = { ...ingredient };
    showAddDialog.value = true;
};

const handleIngredientSave = async (ingredientData) => {
    try {
        if (editingIngredient.value) {
            await inventoryStore.updateIngredient(editingIngredient.value.id, ingredientData);
        } else {
            await inventoryStore.addIngredient(ingredientData);
        }
        closeIngredientDialog();
    } catch (error) {
        console.error('Error saving ingredient:', error);
    }
};

const closeIngredientDialog = () => {
    showAddDialog.value = false;
    editingIngredient.value = null;
};

const showStockAdjustment = (ingredient) => {
    adjustmentIngredient.value = ingredient;
    showAdjustmentDialog.value = true;
};

const handleStockAdjustment = async (adjustment) => {
    try {
        await inventoryStore.adjustStock(adjustmentIngredient.value.id, adjustment.quantity, adjustment.reason);
        showAdjustmentDialog.value = false;
        adjustmentIngredient.value = null;
    } catch (error) {
        console.error('Error adjusting stock:', error);
    }
};

const quickReorder = (ingredient) => {
    // Pre-populate purchase order dialog with this ingredient
    // Set suggestions and show dialog
    showPurchaseOrderDialog.value = true;

    // Use ingredient data for reorder (implementation depends on dialog needs)
    console.log('Quick reorder for:', ingredient.name);
};

const handlePurchaseOrderCreate = async (orderData) => {
    try {
        await inventoryStore.createPurchaseOrder(orderData);
        showPurchaseOrderDialog.value = false;
    } catch (error) {
        console.error('Error creating purchase order:', error);
    }
};

const viewIngredientDetails = (ingredient) => {
    selectedIngredient.value = ingredient;
    showDetailsDialog.value = true;
};

const confirmDelete = (ingredient) => {
    confirm.require({
        message: `Are you sure you want to delete "${ingredient.name}" from inventory?`,
        header: 'Delete Ingredient',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
            inventoryStore.deleteIngredient(ingredient.id);
        }
    });
};

const exportInventoryReport = () => {
    // Create CSV data
    const csvData = [
        ['Name', 'Category', 'Current Stock', 'Unit', 'Status', 'Cost Per Unit', 'Total Value', 'Min Stock', 'Max Stock', 'Supplier', 'Expiry Date'],
        ...filteredIngredients.value.map((item) => [
            item.name,
            getCategoryName(item.category),
            item.currentStock,
            item.unit,
            getStatusLabel(item.status),
            item.costPerUnit.toFixed(2),
            (item.currentStock * item.costPerUnit).toFixed(2),
            item.minStock,
            item.maxStock,
            inventoryStore.getSupplierById(item.supplierId)?.name || '',
            formatDate(item.expiryDate)
        ])
    ];

    const csv = csvData.map((row) => row.map((field) => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.add({
        severity: 'success',
        summary: 'Export Complete',
        detail: 'Inventory report has been downloaded',
        life: 3000
    });
};

// Helper methods
const getCategoryName = (categoryId) => {
    const category = inventoryStore.getCategoryById(categoryId);
    return category ? category.name : categoryId;
};

const getCategoryIcon = (categoryId) => {
    const category = inventoryStore.getCategoryById(categoryId);
    return category ? category.icon : 'pi-box';
};

const getStockPercentage = (ingredient) => {
    return Math.min(100, (ingredient.currentStock / ingredient.maxStock) * 100);
};

const getStockProgressClass = (ingredient) => {
    if (ingredient.status === 'out-of-stock') return 'progress-critical';
    if (ingredient.status === 'low-stock') return 'progress-warning';
    return 'progress-success';
};

const getStatusLabel = (status) => {
    const labels = {
        'in-stock': 'In Stock',
        'low-stock': 'Low Stock',
        'out-of-stock': 'Out of Stock'
    };
    return labels[status] || status;
};

const getStatusSeverity = (status) => {
    const severities = {
        'in-stock': 'success',
        'low-stock': 'warning',
        'out-of-stock': 'danger'
    };
    return severities[status] || 'secondary';
};

const getStatusIcon = (status) => {
    const icons = {
        'in-stock': 'pi-check-circle',
        'low-stock': 'pi-exclamation-triangle',
        'out-of-stock': 'pi-times-circle'
    };
    return icons[status] || 'pi-circle';
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const isExpiringSoon = (dateString) => {
    const expiryDate = new Date(dateString);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return expiryDate <= threeDaysFromNow;
};

const getDaysUntilExpiry = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

// Lifecycle
onMounted(() => {
    // Component is ready
});
</script>

<template>
    <div class="inventory-management">
        <!-- Header Section -->
        <div class="inventory-header">
            <div>
                <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Inventory Management</h1>
                <p class="text-surface-600 dark:text-surface-400">Track stock levels, manage suppliers, and automate reordering</p>
            </div>
            <div class="flex gap-3">
                <Button label="Add Ingredient" icon="pi pi-plus" @click="showAddDialog = true" severity="success" />
                <Button label="Create Purchase Order" icon="pi pi-shopping-cart" @click="showPurchaseOrderDialog = true" outlined />
                <Button label="Generate Report" icon="pi pi-file-export" @click="exportInventoryReport" outlined />
            </div>
        </div>

        <!-- Critical Alerts -->
        <div v-if="inventoryStore.criticalAlerts.length > 0" class="mb-6">
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-exclamation-triangle text-orange-500"></i>
                        <span>Critical Inventory Alerts ({{ inventoryStore.criticalAlerts.length }})</span>
                    </div>
                </template>
                <template #content>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="alert in inventoryStore.criticalAlerts.slice(0, 6)" :key="alert.id" class="alert-card" :class="`alert-${alert.type}`">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-semibold">{{ alert.title }}</h4>
                                    <p class="text-sm text-surface-600 dark:text-surface-400">
                                        {{ alert.message }}
                                    </p>
                                </div>
                                <Button v-if="alert.action === 'reorder'" icon="pi pi-cart-plus" size="small" text @click="quickReorder(alert.ingredient)" />
                            </div>
                        </div>
                    </div>
                    <div v-if="inventoryStore.criticalAlerts.length > 6" class="mt-4 text-center">
                        <Button :label="`View All ${inventoryStore.criticalAlerts.length} Alerts`" size="small" outlined @click="showAllAlerts = true" />
                    </div>
                </template>
            </Card>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon-container bg-blue-100 dark:bg-blue-900/30">
                            <i class="pi pi-box text-2xl text-blue-600"></i>
                        </div>
                        <div>
                            <div class="stat-value text-blue-600">{{ inventoryStore.ingredients.length }}</div>
                            <div class="stat-label">Total Items</div>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon-container bg-green-100 dark:bg-green-900/30">
                            <i class="pi pi-dollar text-2xl text-green-600"></i>
                        </div>
                        <div>
                            <div class="stat-value text-green-600">${{ inventoryStore.totalInventoryValue.toFixed(2) }}</div>
                            <div class="stat-label">Total Value</div>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon-container bg-orange-100 dark:bg-orange-900/30">
                            <i class="pi pi-exclamation-triangle text-2xl text-orange-600"></i>
                        </div>
                        <div>
                            <div class="stat-value text-orange-600">{{ inventoryStore.lowStockItems.length }}</div>
                            <div class="stat-label">Low Stock</div>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon-container bg-red-100 dark:bg-red-900/30">
                            <i class="pi pi-times-circle text-2xl text-red-600"></i>
                        </div>
                        <div>
                            <div class="stat-value text-red-600">{{ inventoryStore.outOfStockItems.length }}</div>
                            <div class="stat-label">Out of Stock</div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Filter and Search Section -->
        <Card class="mb-6">
            <template #content>
                <div class="filter-section">
                    <div class="flex flex-wrap gap-4 items-end">
                        <div class="flex-1 min-w-[200px]">
                            <label class="block text-sm font-medium mb-2">Search Ingredients</label>
                            <IconField iconPosition="left">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="searchQuery" placeholder="Search by name, category, or barcode..." class="w-full" />
                            </IconField>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Category</label>
                            <Dropdown v-model="selectedCategory" :options="categoryOptions" optionLabel="label" optionValue="value" placeholder="All Categories" class="w-48" showClear />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Stock Status</label>
                            <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="All Status" class="w-40" showClear />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Supplier</label>
                            <Dropdown v-model="selectedSupplier" :options="supplierOptions" optionLabel="label" optionValue="value" placeholder="All Suppliers" class="w-48" showClear />
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Inventory Table -->
        <Card>
            <template #title>
                <div class="flex justify-between items-center">
                    <span>Ingredients ({{ filteredIngredients.length }})</span>
                    <div class="flex gap-2">
                        <Button icon="pi pi-refresh" @click="refreshInventory" :loading="loading" text />
                        <Button :icon="tableView === 'grid' ? 'pi pi-list' : 'pi pi-th-large'" @click="toggleView" text />
                    </div>
                </div>
            </template>
            <template #content>
                <!-- Table View -->
                <DataTable
                    v-if="tableView === 'table'"
                    :value="filteredIngredients"
                    :paginator="true"
                    :rows="20"
                    :loading="loading"
                    sortMode="multiple"
                    removableSort
                    class="inventory-table"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[10, 20, 50]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} ingredients"
                >
                    <Column field="name" header="Ingredient" sortable class="min-w-[200px]">
                        <template #body="{ data }">
                            <div class="flex items-center gap-3">
                                <div class="ingredient-avatar">
                                    <i :class="`pi ${getCategoryIcon(data.category)} text-lg`"></i>
                                </div>
                                <div>
                                    <div class="font-semibold">{{ data.name }}</div>
                                    <div class="text-sm text-surface-600 dark:text-surface-400">
                                        {{ getCategoryName(data.category) }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column field="currentStock" header="Current Stock" sortable>
                        <template #body="{ data }">
                            <div class="text-center">
                                <div class="font-semibold">{{ data.currentStock }} {{ data.unit }}</div>
                                <ProgressBar :value="getStockPercentage(data)" :class="getStockProgressClass(data)" class="mt-1" style="height: 4px" />
                            </div>
                        </template>
                    </Column>

                    <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" :icon="getStatusIcon(data.status)" />
                        </template>
                    </Column>

                    <Column field="costPerUnit" header="Cost/Unit" sortable>
                        <template #body="{ data }">
                            <span class="font-medium">${{ data.costPerUnit.toFixed(2) }}</span>
                        </template>
                    </Column>

                    <Column field="totalValue" header="Total Value" sortable>
                        <template #body="{ data }">
                            <span class="font-semibold">${{ (data.currentStock * data.costPerUnit).toFixed(2) }}</span>
                        </template>
                    </Column>

                    <Column field="expiryDate" header="Expiry" sortable>
                        <template #body="{ data }">
                            <div class="text-sm">
                                {{ formatDate(data.expiryDate) }}
                                <div v-if="isExpiringSoon(data.expiryDate)" class="text-orange-600 font-medium">{{ getDaysUntilExpiry(data.expiryDate) }} days left</div>
                            </div>
                        </template>
                    </Column>

                    <Column header="Actions" class="w-32">
                        <template #body="{ data }">
                            <div class="flex gap-1">
                                <Button icon="pi pi-pencil" size="small" text @click="editIngredient(data)" />
                                <Button icon="pi pi-plus-circle" size="small" text @click="showStockAdjustment(data)" />
                                <Button icon="pi pi-shopping-cart" size="small" text @click="quickReorder(data)" />
                                <Button icon="pi pi-trash" size="small" text severity="danger" @click="confirmDelete(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- Grid View -->
                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <Card v-for="ingredient in filteredIngredients" :key="ingredient.id" class="ingredient-card cursor-pointer" @click="viewIngredientDetails(ingredient)">
                        <template #content>
                            <div class="ingredient-card-content">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="ingredient-avatar-large">
                                        <i :class="`pi ${getCategoryIcon(ingredient.category)} text-xl`"></i>
                                    </div>
                                    <Tag :value="getStatusLabel(ingredient.status)" :severity="getStatusSeverity(ingredient.status)" size="small" />
                                </div>

                                <h4 class="font-semibold mb-1">{{ ingredient.name }}</h4>
                                <p class="text-sm text-surface-600 dark:text-surface-400 mb-3">
                                    {{ getCategoryName(ingredient.category) }}
                                </p>

                                <div class="stock-info mb-3">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-sm">Stock Level</span>
                                        <span class="font-medium">{{ ingredient.currentStock }} {{ ingredient.unit }}</span>
                                    </div>
                                    <ProgressBar :value="getStockPercentage(ingredient)" :class="getStockProgressClass(ingredient)" style="height: 6px" />
                                </div>

                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span class="text-surface-600 dark:text-surface-400">Cost/Unit</span>
                                        <div class="font-medium">${{ ingredient.costPerUnit.toFixed(2) }}</div>
                                    </div>
                                    <div>
                                        <span class="text-surface-600 dark:text-surface-400">Total Value</span>
                                        <div class="font-medium">${{ (ingredient.currentStock * ingredient.costPerUnit).toFixed(2) }}</div>
                                    </div>
                                </div>

                                <div class="flex gap-1 mt-3">
                                    <Button icon="pi pi-pencil" size="small" text @click.stop="editIngredient(ingredient)" />
                                    <Button icon="pi pi-plus-circle" size="small" text @click.stop="showStockAdjustment(ingredient)" />
                                    <Button icon="pi pi-shopping-cart" size="small" text @click.stop="quickReorder(ingredient)" />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </template>
        </Card>

        <!-- Add/Edit Ingredient Dialog -->
        <Dialog :visible="showAddDialog" @update:visible="showAddDialog = $event" :header="editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'" modal class="w-full max-w-2xl">
            <IngredientForm :ingredient="editingIngredient" @save="handleIngredientSave" @cancel="closeIngredientDialog" />
        </Dialog>

        <!-- Stock Adjustment Dialog -->
        <StockAdjustmentDialog :visible="showAdjustmentDialog" @update:visible="showAdjustmentDialog = $event" :ingredient="adjustmentIngredient" @adjust="handleStockAdjustment" />

        <!-- Purchase Order Dialog -->
        <PurchaseOrderDialog :visible="showPurchaseOrderDialog" @update:visible="showPurchaseOrderDialog = $event" :suggested-items="reorderSuggestions" @create="handlePurchaseOrderCreate" />

        <!-- Ingredient Details Dialog -->
        <IngredientDetailsDialog :visible="showDetailsDialog" @update:visible="showDetailsDialog = $event" :ingredient="selectedIngredient" />

        <!-- Confirmation Dialogs -->
        <ConfirmDialog />
    </div>
</template>

<style scoped>
.inventory-management {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.inventory-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.stat-card {
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-icon-container {
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-value {
    font-size: 1.875rem;
    font-weight: 700;
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-top: 0.25rem;
}

.filter-section {
    background: var(--surface-100);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin: -1rem;
}

.alert-card {
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid;
    transition: transform 0.2s ease;
}

.alert-card:hover {
    transform: translateX(2px);
}

.alert-critical {
    background: var(--red-50);
    border-color: var(--red-500);
}

.alert-warning {
    background: var(--orange-50);
    border-color: var(--orange-500);
}

.alert-info {
    background: var(--blue-50);
    border-color: var(--blue-500);
}

.ingredient-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--surface-100);
    display: flex;
    align-items: center;
    justify-content: center;
}

.ingredient-avatar-large {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    background: var(--surface-100);
    display: flex;
    align-items: center;
    justify-content: center;
}

.ingredient-card {
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.ingredient-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ingredient-card-content {
    padding: 0;
}

.progress-success .p-progressbar-value {
    background: var(--green-500);
}

.progress-warning .p-progressbar-value {
    background: var(--orange-500);
}

.progress-critical .p-progressbar-value {
    background: var(--red-500);
}

.inventory-table {
    margin: -1rem;
}

.stock-info .p-progressbar {
    border-radius: 3px;
}

/* Dark mode adjustments */
.dark .filter-section {
    background: var(--surface-800);
}

.dark .alert-critical {
    background: var(--red-900);
    color: var(--red-100);
}

.dark .alert-warning {
    background: var(--orange-900);
    color: var(--orange-100);
}

.dark .alert-info {
    background: var(--blue-900);
    color: var(--blue-100);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .inventory-management {
        padding: 1rem;
    }

    .inventory-header {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-section {
        padding: 1rem;
    }

    .stat-value {
        font-size: 1.5rem;
    }
}
</style>
