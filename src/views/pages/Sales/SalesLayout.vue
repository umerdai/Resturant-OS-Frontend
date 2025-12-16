<script setup>
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();

// State
const salesData = ref([]);
const branches = ref([]);
const menuItems = ref([]);
const isLoading = ref(false);

// Filters
const selectedDate = ref(null);
const selectedBranch = ref(null);
const selectedItem = ref(null);

// Computed filtered sales
const filteredSales = computed(() => {
    let filtered = [...salesData.value];

    if (selectedDate.value) {
        const filterDate = new Date(selectedDate.value).toDateString();
        filtered = filtered.filter((sale) => {
            const saleDate = new Date(sale.date).toDateString();
            return saleDate === filterDate;
        });
    }

    if (selectedBranch.value) {
        filtered = filtered.filter((sale) => sale.branch_id === selectedBranch.value);
    }

    if (selectedItem.value) {
        filtered = filtered.filter((sale) => sale.item_id === selectedItem.value);
    }

    return filtered;
});

// Methods
const fetchBranches = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/branches/', {
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

const fetchMenuItems = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/menu-items/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            menuItems.value = data.results || data;
        }
    } catch (error) {
        console.error('Error fetching menu items:', error);
    }
};

const fetchSalesData = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/sales/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            salesData.value = data.results || data;
        }
    } catch (error) {
        console.error('Error fetching sales:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch sales data',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

const clearFilters = () => {
    selectedDate.value = null;
    selectedBranch.value = null;
    selectedItem.value = null;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR'
    }).format(value);
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Initialize
onMounted(() => {
    fetchBranches();
    fetchMenuItems();
    fetchSalesData();
});
</script>

<template>
    <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">💰 Sales Management</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">View and filter sales transactions</p>
            </div>
            <div class="flex gap-2">
                <Button label="Refresh" icon="pi pi-refresh" class="p-button-outlined" @click="fetchSalesData" :loading="isLoading" />
            </div>
        </div>

        <!-- Filters Card -->
        <Card class="mb-6">
            <template #content>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Filter by Date</label>
                        <Calendar v-model="selectedDate" dateFormat="yy-mm-dd" placeholder="Select date" class="w-full" showIcon />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Filter by Branch</label>
                        <Dropdown v-model="selectedBranch" :options="branches" optionLabel="name" optionValue="id" placeholder="All Branches" class="w-full" showClear />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Filter by Item</label>
                        <Dropdown v-model="selectedItem" :options="menuItems" optionLabel="name" optionValue="id" placeholder="All Items" class="w-full" showClear />
                    </div>
                    <div class="flex items-end">
                        <Button label="Clear Filters" icon="pi pi-filter-slash" class="p-button-outlined w-full" @click="clearFilters" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Sales Data Table -->
        <Card>
            <template #content>
                <DataTable :value="filteredSales" :loading="isLoading" paginator :rows="10" responsiveLayout="scroll" stripedRows>
                    <template #empty>
                        <div class="text-center py-8">
                            <i class="pi pi-inbox text-4xl text-gray-400 mb-2"></i>
                            <p class="text-gray-600">No sales data found</p>
                        </div>
                    </template>

                    <Column field="id" header="Transaction ID" sortable>
                        <template #body="slotProps">
                            <span class="font-mono text-sm">{{ slotProps.data.id }}</span>
                        </template>
                    </Column>

                    <Column field="date" header="Date" sortable>
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.date) }}
                        </template>
                    </Column>

                    <Column field="branch_name" header="Branch" sortable>
                        <template #body="slotProps">
                            {{ slotProps.data.branch_name || 'N/A' }}
                        </template>
                    </Column>

                    <Column field="item_name" header="Item" sortable>
                        <template #body="slotProps">
                            {{ slotProps.data.item_name || slotProps.data.name || 'N/A' }}
                        </template>
                    </Column>

                    <Column field="quantity" header="Quantity" sortable>
                        <template #body="slotProps">
                            <span class="font-semibold">{{ slotProps.data.quantity || 0 }}</span>
                        </template>
                    </Column>

                    <Column field="price" header="Unit Price" sortable>
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.price || slotProps.data.unit_price || 0) }}
                        </template>
                    </Column>

                    <Column field="total" header="Total Amount" sortable>
                        <template #body="slotProps">
                            <span class="font-bold text-green-600">
                                {{ formatCurrency(slotProps.data.total || slotProps.data.total_amount || 0) }}
                            </span>
                        </template>
                    </Column>

                    <Column header="Actions">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" size="small" class="p-button-text" v-tooltip="'View Details'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.p-card {
    background: var(--surface-card);
    border-radius: 8px;
}
</style>
