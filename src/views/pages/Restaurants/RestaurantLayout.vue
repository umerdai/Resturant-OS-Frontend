<script setup>
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const restaurants = ref([]);
const isLoading = ref(false);

// Fetch restaurants from API
const fetchRestaurants = async () => {
    isLoading.value = true;
    try {
        const userId = localStorage.getItem('token');
        if (!userId) {
            throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/restaurants/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userId}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            restaurants.value = data;
        } else {
            throw new Error('Failed to fetch restaurants');
        }
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch restaurants',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Handle restaurant actions
const viewRestaurant = (restaurant) => {
    toast.add({
        severity: 'info',
        summary: 'View Restaurant',
        detail: `Viewing details for ${restaurant.name}`,
        life: 3000
    });
    // TODO: Navigate to restaurant details view
    // router.push(`/restaurants/${restaurant.id}`);
};

const manageRestaurant = (restaurant) => {
    toast.add({
        severity: 'info',
        summary: 'Manage Restaurant',
        detail: `Managing ${restaurant.name}`,
        life: 3000
    });
    // TODO: Navigate to restaurant management view
    // router.push(`/restaurants/${restaurant.id}/manage`);
};

// Initialize data on component mount
onMounted(() => {
    fetchRestaurants();
});
</script>

<template>
    <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">🏪 Restaurant Management</h2>
            <div class="flex gap-2">
                <Button label="Create Restaurant" icon="pi pi-plus" @click="$router.push('/restaurant/create')" class="p-button-success" />
                <Button label="Refresh" icon="pi pi-refresh" @click="fetchRestaurants" :loading="isLoading" class="p-button-outlined" />
            </div>
        </div>

        <!-- Restaurant Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="restaurants.length > 0">
            <Card v-for="restaurant in restaurants" :key="restaurant.id" class="restaurant-card">
                <template #header>
                    <div class="bg-primary-50 dark:bg-primary-900 p-4 rounded-t-lg">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-semibold text-primary-700 dark:text-primary-300">
                                {{ restaurant.name }}
                            </h3>
                            <Badge :value="restaurant.is_active ? 'Active' : 'Inactive'" :severity="restaurant.is_active ? 'success' : 'danger'" />
                        </div>
                    </div>
                </template>

                <template #content>
                    <div class="space-y-3">
                        <div class="flex items-center">
                            <i class="pi pi-user mr-2 text-gray-500"></i>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Owner:</span>
                            <span class="ml-2 font-medium">{{ restaurant.owner_name }}</span>
                        </div>

                        <div class="flex items-center">
                            <i class="pi pi-dollar mr-2 text-gray-500"></i>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Tax Rate:</span>
                            <span class="ml-2 font-medium">{{ restaurant.tax_rate }}%</span>
                        </div>

                        <div class="flex items-center">
                            <i class="pi pi-money-bill mr-2 text-gray-500"></i>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Currency:</span>
                            <span class="ml-2 font-medium">{{ restaurant.currency }}</span>
                        </div>

                        <div class="text-xs text-gray-400 mt-4">ID: {{ restaurant.id }}</div>
                    </div>
                </template>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <Button label="Manage" icon="pi pi-cog" size="small" class="p-button-outlined" @click="manageRestaurant(restaurant)" />
                        <Button label="View Details" icon="pi pi-eye" size="small" @click="viewRestaurant(restaurant)" />
                    </div>
                </template>
            </Card>
        </div>

        <!-- Empty State -->
        <Card v-else-if="!isLoading" class="text-center py-16">
            <template #content>
                <div class="space-y-4">
                    <i class="pi pi-building text-6xl text-gray-400"></i>
                    <h3 class="text-xl font-semibold text-gray-600">No Restaurants Found</h3>
                    <p class="text-gray-500">You don't have access to any restaurants yet.</p>
                    <Button label="Contact Administrator" icon="pi pi-envelope" class="p-button-outlined" />
                </div>
            </template>
        </Card>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading restaurants...</p>
        </div>

        <!-- Data Table View (Alternative) -->
        <Card class="mt-6" v-if="restaurants.length > 0">
            <template #header>
                <div class="p-4 border-b">
                    <h3 class="text-lg font-semibold">Restaurant List</h3>
                </div>
            </template>

            <template #content>
                <DataTable :value="restaurants" :loading="isLoading" paginator :rows="10" responsiveLayout="scroll" class="p-datatable-sm">
                    <Column field="name" header="Restaurant Name" sortable>
                        <template #body="slotProps">
                            <div class="font-medium">{{ slotProps.data.name }}</div>
                        </template>
                    </Column>

                    <Column field="owner_name" header="Owner" sortable></Column>

                    <Column field="currency" header="Currency" sortable></Column>

                    <Column field="tax_rate" header="Tax Rate" sortable>
                        <template #body="slotProps"> {{ slotProps.data.tax_rate }}% </template>
                    </Column>

                    <Column field="is_active" header="Status" sortable>
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.is_active ? 'Active' : 'Inactive'" :severity="slotProps.data.is_active ? 'success' : 'danger'" />
                        </template>
                    </Column>

                    <Column header="Actions">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" size="small" class="p-button-text" @click="viewRestaurant(slotProps.data)" v-tooltip="'View Details'" />
                                <Button icon="pi pi-cog" size="small" class="p-button-text" @click="manageRestaurant(slotProps.data)" v-tooltip="'Manage Restaurant'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.restaurant-card {
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    border-radius: 12px;
}

.restaurant-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.restaurant-card .p-card-header {
    padding: 0;
}

.restaurant-card .p-card-content {
    padding: 1.5rem;
}

.restaurant-card .p-card-footer {
    padding: 1rem 1.5rem;
    background-color: var(--surface-50);
    border-top: 1px solid var(--surface-200);
}

.dark .restaurant-card .p-card-footer {
    background-color: var(--surface-800);
    border-top: 1px solid var(--surface-700);
}

/* Grid responsive adjustments */
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }
}

@media (min-width: 768px) and (max-width: 1024px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
