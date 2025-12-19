<script setup>
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();

// State
const inventory = ref([]);
const branches = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const selectedBranch = ref(null);
const selectedStatus = ref(null);
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const isSubmitting = ref(false);

// Form data for add/edit
const formData = ref({
    item_name: '',
    quantity: 0,
    unit: 'kg',
    reorder_level: 0,
    cost_per_unit: 0,
    branch: null
});

// Status options
const statusOptions = [
    { label: 'All Status', value: null },
    { label: 'In Stock', value: 'in_stock' },
    { label: 'Low Stock', value: 'low_stock' },
    { label: 'Out of Stock', value: 'out_of_stock' }
];

const unitOptions = [
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Gram (g)', value: 'g' },
    { label: 'Liter (L)', value: 'L' },
    { label: 'Milliliter (ml)', value: 'ml' },
    { label: 'Piece (pcs)', value: 'pcs' },
    { label: 'Dozen', value: 'dozen' }
];

// Fetch inventory from API
const fetchInventory = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');

        const response = await fetch('http://localhost:8000/inventory/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                restaurant: restaurantId
            })
        });

        if (response.ok) {
            const data = await response.json();
            inventory.value = data.results || data;
        } else {
            throw new Error('Failed to fetch inventory');
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch inventory',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Fetch branches
const fetchBranches = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

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
        }
    } catch (error) {
        console.error('Error fetching branches:', error);
    }
};

// Filtered inventory
const filteredInventory = computed(() => {
    return inventory.value.filter((item) => {
        const matchesSearch = searchQuery.value ? item.item_name.toLowerCase().includes(searchQuery.value.toLowerCase()) : true;
        const matchesBranch = selectedBranch.value ? item.branch === selectedBranch.value : true;
        const matchesStatus = selectedStatus.value ? getStockStatus(item) === selectedStatus.value : true;

        return matchesSearch && matchesBranch && matchesStatus;
    });
});

// Get stock status
const getStockStatus = (item) => {
    if (item.quantity <= 0) return 'out_of_stock';
    if (item.quantity <= item.reorder_level) return 'low_stock';
    return 'in_stock';
};

// Get stock badge severity
const getStockSeverity = (item) => {
    const status = getStockStatus(item);
    switch (status) {
        case 'out_of_stock':
            return 'danger';
        case 'low_stock':
            return 'warning';
        default:
            return 'success';
    }
};

// Open add dialog
const openAddDialog = () => {
    formData.value = {
        item_name: '',
        quantity: 0,
        unit: 'kg',
        reorder_level: 0,
        cost_per_unit: 0,
        branch: null
    };
    showAddDialog.value = true;
};

// Open edit dialog
const openEditDialog = (item) => {
    selectedItem.value = item;
    formData.value = { ...item };
    showEditDialog.value = true;
};

// Add inventory item
const addInventoryItem = async () => {
    isSubmitting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        const requestData = {
            ...formData.value,
            restaurant: restaurantId
        };

        const response = await fetch('http://localhost:8000/inventory/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Inventory item added successfully',
                life: 3000
            });
            showAddDialog.value = false;
            await fetchInventory();
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add inventory item');
        }
    } catch (error) {
        console.error('Error adding inventory item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to add inventory item',
            life: 3000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Update inventory item
const updateInventoryItem = async () => {
    isSubmitting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        const requestData = {
            ...formData.value,
            restaurant: restaurantId
        };

        const response = await fetch(`http://localhost:8000/inventory/${selectedItem.value.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Inventory item updated successfully',
                life: 3000
            });
            showEditDialog.value = false;
            await fetchInventory();
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update inventory item');
        }
    } catch (error) {
        console.error('Error updating inventory item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update inventory item',
            life: 3000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Delete inventory item
const confirmDelete = (item) => {
    selectedItem.value = item;
    showDeleteDialog.value = true;
};

const deleteInventoryItem = async () => {
    isSubmitting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');

        const response = await fetch(`http://localhost:8000/inventory/${selectedItem.value.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                restaurant: restaurantId
            })
        });

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Inventory item deleted successfully',
                life: 3000
            });
            showDeleteDialog.value = false;
            await fetchInventory();
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete inventory item');
        }
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete inventory item',
            life: 3000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Clear filters
const clearFilters = () => {
    searchQuery.value = '';
    selectedBranch.value = null;
    selectedStatus.value = null;
};

// Initialize
onMounted(() => {
    fetchInventory();
    fetchBranches();
});
</script>

<template>
    <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">📦 Inventory Management</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Track and manage your inventory items</p>
            </div>
            <div class="flex gap-2">
                <Button label="Add Item" icon="pi pi-plus" class="p-button-success" @click="openAddDialog" />
                <Button label="Refresh" icon="pi pi-refresh" class="p-button-outlined" @click="fetchInventory" :loading="isLoading" />
            </div>
        </div>

        <!-- Search and Filters -->
        <Card class="mb-6">
            <template #content>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Search Items</label>
                        <InputText v-model="searchQuery" placeholder="Search by name..." class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Branch</label>
                        <Dropdown v-model="selectedBranch" :options="branches" optionLabel="branch_name" optionValue="id" placeholder="All Branches" class="w-full" showClear />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Status</label>
                        <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="All Status" class="w-full" showClear />
                    </div>
                    <div class="flex items-end">
                        <Button label="Clear Filters" icon="pi pi-filter-slash" class="p-button-outlined w-full" @click="clearFilters" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading inventory...</p>
        </div>

        <!-- Inventory Table -->
        <Card v-else-if="filteredInventory.length > 0">
            <template #content>
                <DataTable :value="filteredInventory" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" responsiveLayout="scroll" class="p-datatable-sm">
                    <Column field="item_name" header="Item Name" :sortable="true" style="min-width: 200px">
                        <template #body="{ data }">
                            <div class="font-semibold">{{ data.item_name }}</div>
                        </template>
                    </Column>
                    <Column field="quantity" header="Quantity" :sortable="true" style="min-width: 120px">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <span class="font-medium">{{ data.quantity }}</span>
                                <span class="text-sm text-gray-500">{{ data.unit }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="reorder_level" header="Reorder Level" :sortable="true" style="min-width: 140px" />
                    <Column field="cost_per_unit" header="Cost/Unit" :sortable="true" style="min-width: 120px">
                        <template #body="{ data }">
                            <span class="font-medium">₨{{ data.cost_per_unit }}</span>
                        </template>
                    </Column>
                    <Column header="Status" style="min-width: 120px">
                        <template #body="{ data }">
                            <Badge :value="getStockStatus(data).replace('_', ' ').toUpperCase()" :severity="getStockSeverity(data)" />
                        </template>
                    </Column>
                    <Column header="Actions" style="min-width: 150px">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" class="p-button-sm p-button-info" @click="openEditDialog(data)" v-tooltip.top="'Edit'" />
                                <Button icon="pi pi-trash" class="p-button-sm p-button-danger" @click="confirmDelete(data)" v-tooltip.top="'Delete'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <!-- Empty State -->
        <Card v-else class="text-center py-16">
            <template #content>
                <div class="space-y-4">
                    <i class="pi pi-inbox text-6xl text-gray-400"></i>
                    <h3 class="text-xl font-semibold text-gray-600">No Inventory Items Found</h3>
                    <p class="text-gray-500">
                        {{ searchQuery || selectedBranch || selectedStatus ? 'No items match your filters' : 'Start by adding your first inventory item' }}
                    </p>
                    <Button label="Add First Item" icon="pi pi-plus" class="p-button-success" @click="openAddDialog" />
                </div>
            </template>
        </Card>

        <!-- Add Item Dialog -->
        <Dialog v-model:visible="showAddDialog" :style="{ width: '600px' }" header="Add Inventory Item" :modal="true" class="p-fluid">
            <div class="space-y-4 mt-4">
                <div>
                    <label for="item_name" class="block text-sm font-medium mb-2">Item Name <span class="text-red-500">*</span></label>
                    <InputText id="item_name" v-model="formData.item_name" placeholder="Enter item name" class="w-full" required />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="quantity" class="block text-sm font-medium mb-2">Quantity <span class="text-red-500">*</span></label>
                        <InputNumber id="quantity" v-model="formData.quantity" placeholder="0" class="w-full" :min="0" required />
                    </div>
                    <div>
                        <label for="unit" class="block text-sm font-medium mb-2">Unit <span class="text-red-500">*</span></label>
                        <Dropdown id="unit" v-model="formData.unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Select unit" class="w-full" required />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="reorder_level" class="block text-sm font-medium mb-2">Reorder Level</label>
                        <InputNumber id="reorder_level" v-model="formData.reorder_level" placeholder="0" class="w-full" :min="0" />
                    </div>
                    <div>
                        <label for="cost_per_unit" class="block text-sm font-medium mb-2">Cost per Unit</label>
                        <InputNumber id="cost_per_unit" v-model="formData.cost_per_unit" placeholder="0" class="w-full" :min="0" mode="currency" currency="PKR" />
                    </div>
                </div>

                <div>
                    <label for="branch" class="block text-sm font-medium mb-2">Branch</label>
                    <Dropdown id="branch" v-model="formData.branch" :options="branches" optionLabel="branch_name" optionValue="id" placeholder="Select branch" class="w-full" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showAddDialog = false" />
                <Button label="Add Item" icon="pi pi-check" @click="addInventoryItem" :loading="isSubmitting" />
            </template>
        </Dialog>

        <!-- Edit Item Dialog -->
        <Dialog v-model:visible="showEditDialog" :style="{ width: '600px' }" header="Edit Inventory Item" :modal="true" class="p-fluid">
            <div class="space-y-4 mt-4">
                <div>
                    <label for="edit_item_name" class="block text-sm font-medium mb-2">Item Name <span class="text-red-500">*</span></label>
                    <InputText id="edit_item_name" v-model="formData.item_name" placeholder="Enter item name" class="w-full" required />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="edit_quantity" class="block text-sm font-medium mb-2">Quantity <span class="text-red-500">*</span></label>
                        <InputNumber id="edit_quantity" v-model="formData.quantity" placeholder="0" class="w-full" :min="0" required />
                    </div>
                    <div>
                        <label for="edit_unit" class="block text-sm font-medium mb-2">Unit <span class="text-red-500">*</span></label>
                        <Dropdown id="edit_unit" v-model="formData.unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Select unit" class="w-full" required />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="edit_reorder_level" class="block text-sm font-medium mb-2">Reorder Level</label>
                        <InputNumber id="edit_reorder_level" v-model="formData.reorder_level" placeholder="0" class="w-full" :min="0" />
                    </div>
                    <div>
                        <label for="edit_cost_per_unit" class="block text-sm font-medium mb-2">Cost per Unit</label>
                        <InputNumber id="edit_cost_per_unit" v-model="formData.cost_per_unit" placeholder="0" class="w-full" :min="0" mode="currency" currency="PKR" />
                    </div>
                </div>

                <div>
                    <label for="edit_branch" class="block text-sm font-medium mb-2">Branch</label>
                    <Dropdown id="edit_branch" v-model="formData.branch" :options="branches" optionLabel="branch_name" optionValue="id" placeholder="Select branch" class="w-full" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" />
                <Button label="Update" icon="pi pi-check" @click="updateInventoryItem" :loading="isSubmitting" />
            </template>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Are you sure?</h3>
                <p class="text-gray-600">
                    Do you want to delete "<strong>{{ selectedItem?.item_name }}</strong
                    >"? This action cannot be undone.
                </p>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
                <Button label="Delete" icon="pi pi-check" class="p-button-danger" @click="deleteInventoryItem" :loading="isSubmitting" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--primary-color);
    color: white;
}
</style>
