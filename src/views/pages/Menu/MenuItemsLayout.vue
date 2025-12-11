<template>
    <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">🍽️ Menu Items</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your restaurant menu items</p>
            </div>
            <div class="flex gap-2">
                <Button label="Add Menu Item" icon="pi pi-plus" class="p-button-success" @click="$router.push('/menu/items/create')" />
                <Button label="Refresh" icon="pi pi-refresh" class="p-button-outlined" @click="fetchMenuItems" :loading="isLoading" />
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
                        <label class="block text-sm font-medium mb-2">Category</label>
                        <Dropdown v-model="selectedCategory" :options="categories" optionLabel="name" optionValue="id" placeholder="All Categories" class="w-full" showClear />
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
            <p class="mt-4 text-gray-600">Loading menu items...</p>
        </div>

        <!-- Menu Items Grid -->
        <div v-else-if="filteredMenuItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="item in filteredMenuItems" :key="item.id" class="menu-item-card hover:shadow-lg transition-shadow">
                <template #header>
                    <div class="relative">
                        <img :src="item.image || '/demo/images/food-placeholder.jpg'" :alt="item.name" class="w-full h-48 object-cover rounded-t-lg" />
                        <Badge :value="item.is_available ? 'Available' : 'Unavailable'" :severity="item.is_available ? 'success' : 'danger'" class="absolute top-2 right-2" />
                        <div v-if="item.category_color" class="absolute top-2 left-2 w-4 h-4 rounded-full border-2 border-white" :style="{ backgroundColor: item.category_color }"></div>
                    </div>
                </template>

                <template #content>
                    <div class="space-y-3">
                        <!-- Item Name and Category -->
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ item.name }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.category_name || 'No Category' }}</p>
                        </div>

                        <!-- Description -->
                        <p v-if="item.description" class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {{ item.description }}
                        </p>

                        <!-- Pricing -->
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-lg font-bold text-primary-600">₨{{ item.price }}</span>
                                <span v-if="item.cost_price" class="text-sm text-gray-500 ml-2"> Cost: ₨{{ item.cost_price }} </span>
                            </div>
                            <div v-if="item.preparation_time" class="text-sm text-gray-600">
                                <i class="pi pi-clock mr-1"></i>
                                {{ item.preparation_time }} min
                            </div>
                        </div>

                        <!-- Ingredients Count -->
                        <div v-if="item.ingredients_count" class="text-sm text-gray-600">
                            <i class="pi pi-list mr-1"></i>
                            {{ item.ingredients_count }} ingredients
                        </div>
                    </div>
                </template>

                <template #footer>
                    <div class="space-y-3">
                        <!-- Availability Toggle -->
                        <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span class="text-sm font-medium">Available</span>
                            <InputSwitch v-model="item.is_available" @change="toggleAvailability(item)" :disabled="item.isToggling" />
                        </div>

                        <!-- Action Buttons (aligned like Categories/Branches) -->
                        <div class="flex gap-2 justify-end">
                            <Button label="View" icon="pi pi-eye" class="p-button-outlined p-button-sm" @click="viewMenuItem(item)" />
                            <Button icon="pi pi-trash" class="p-button-danger p-button-sm" @click="confirmDelete(item)" />
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Empty State -->
        <Card v-else class="text-center py-16">
            <template #content>
                <div class="space-y-4">
                    <i class="pi pi-inbox text-6xl text-gray-400"></i>
                    <h3 class="text-xl font-semibold text-gray-600">No Menu Items Found</h3>
                    <p class="text-gray-500">
                        {{ searchQuery || selectedCategory || selectedStatus ? 'No items match your filters' : 'Start by creating your first menu item' }}
                    </p>
                    <Button label="Add First Menu Item" icon="pi pi-plus" class="p-button-success" @click="$router.push('/menu/items/create')" />
                </div>
            </template>
        </Card>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true" class="p-fluid">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Are you sure?</h3>
                <p class="text-gray-600">
                    Do you want to delete "<strong>{{ selectedMenuItem?.name }}</strong
                    >"? This action cannot be undone.
                </p>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
                <Button label="Delete" icon="pi pi-check" class="p-button-danger" @click="deleteMenuItem" :loading="isDeleting" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

// State
const menuItems = ref([]);
const categories = ref([]);
const isLoading = ref(false);
const isDeleting = ref(false);
const showDeleteDialog = ref(false);
const selectedMenuItem = ref(null);

// Filters
const searchQuery = ref('');
const selectedCategory = ref(null);
const selectedStatus = ref(null);

const statusOptions = [
    { label: 'Available', value: true },
    { label: 'Unavailable', value: false }
];

// Computed
const filteredMenuItems = computed(() => {
    let filtered = [...menuItems.value];

    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((item) => item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query));
    }

    // Category filter
    if (selectedCategory.value) {
        filtered = filtered.filter((item) => item.category_id === selectedCategory.value);
    }

    // Status filter
    if (selectedStatus.value !== null) {
        filtered = filtered.filter((item) => item.is_available === selectedStatus.value);
    }

    return filtered;
});

// Methods
// Normalize a menu item from server to the client model
const normalizeMenuItem = (data) => {
    if (!data) return data;
    return {
        id: data.id,
        name: data.name || data.title,
        description: data.description || '',
        price: data.sale_price ? parseFloat(data.sale_price) : data.price ? parseFloat(data.price) : null,
        cost_price: data.cost_price ? parseFloat(data.cost_price) : data.costPrice ? parseFloat(data.costPrice) : null,
        is_available: data.status ? data.status === 'available' : (data.is_available ?? true),
        category_id: data.category || data.category_id || null,
        category_name: data.category_name || data.categoryName || null,
        image: data.image_url || data.image || null,
        preparation_time: data.preparation_time || data.prep_time || null,
        ingredients_count: data.ingredients_count || (data.ingredients ? data.ingredients.length : 0),
        
    };
};
const fetchMenuItems = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const response = await fetch('http://localhost:8000/menu-items/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const raw = data.results || data;
            if (Array.isArray(raw)) {
                menuItems.value = raw.map(normalizeMenuItem);
            } else if (raw) {
                // sometimes API returns an object with data array
                const list = raw.data || raw.results || raw;
                if (Array.isArray(list)) menuItems.value = list.map(normalizeMenuItem);
                else menuItems.value = [normalizeMenuItem(raw)];
            } else {
                menuItems.value = [];
            }
        } else {
            throw new Error('Failed to fetch menu items');
        }
    } catch (error) {
        console.error('Error fetching menu items:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch menu items',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

const fetchCategories = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        let url = 'http://localhost:8000/categories/';
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
            categories.value = data.results || data;
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const viewMenuItem = (item) => {
    router.push(`/menu/items/${item.id}/details`);
};

const editMenuItem = (item) => {
    router.push(`/menu/items/${item.id}/edit`);
};

const confirmDelete = (item) => {
    selectedMenuItem.value = item;
    showDeleteDialog.value = true;
};

const deleteMenuItem = async () => {
    if (!selectedMenuItem.value) return;

    isDeleting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/menu-items/${selectedMenuItem.value.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Menu item deleted successfully',
                life: 3000
            });
            await fetchMenuItems(); // Refresh the list
        } else {
            throw new Error('Failed to delete menu item');
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete menu item',
            life: 3000
        });
    } finally {
        isDeleting.value = false;
        showDeleteDialog.value = false;
        selectedMenuItem.value = null;
    }
};

const clearFilters = () => {
    searchQuery.value = '';
    selectedCategory.value = null;
    selectedStatus.value = null;
};

const toggleAvailability = async (item) => {
    // Set a loading state for this specific item
    item.isToggling = true;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const response = await fetch('http://localhost:8000/menu-items/toggle_availability/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ item_id: item.id })
        });

        if (response.ok) {
            const data = await response.json();

            // Update the item's availability status with the response from server
            const itemIndex = menuItems.value.findIndex((menuItem) => menuItem.id === item.id);
            if (itemIndex !== -1) {
                menuItems.value[itemIndex].is_available = data.is_available;
            }

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `Menu item ${data.is_available ? 'enabled' : 'disabled'} successfully`,
                life: 2000
            });
        } else {
            // If the API call fails, revert the toggle
            item.is_available = !item.is_available;
            throw new Error('Failed to toggle menu item availability');
        }
    } catch (error) {
        // Revert the toggle on error
        item.is_available = !item.is_available;
        console.error('Error toggling menu item availability:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to toggle menu item availability',
            life: 3000
        });
    } finally {
        // Remove the loading state
        item.isToggling = false;
    }
};

// Initialize
onMounted(() => {
    fetchMenuItems();
    fetchCategories();
});
</script>

<style scoped>
.menu-item-card {
    background: var(--surface-card);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--surface-border);
}

.menu-item-card:hover {
    transform: translateY(-2px);
    transition: all 0.2s ease;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

@media (max-width: 768px) {
    .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
        grid-template-columns: 1fr;
    }
}
</style>
