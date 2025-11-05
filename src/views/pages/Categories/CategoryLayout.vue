<script setup>
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const categories = ref([]);
const isLoading = ref(false);
const isDeleting = ref(false);
const showDeleteDialog = ref(false);
const selectedCategory = ref(null);

// Fetch categories from API
const fetchCategories = async () => {
    isLoading.value = true;
    console.log('Fetching categories...');
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/categories/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Categories fetched successfully.', data);
            categories.value = data.data;
        } else {
            throw new Error('Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch categories',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Handle category actions
const viewCategory = (category) => {
    router.push(`/categories/${category.id}/details`);
};

const confirmDelete = (category) => {
    selectedCategory.value = category;
    showDeleteDialog.value = true;
};

const deleteCategory = async () => {
    if (!selectedCategory.value) return;

    isDeleting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/categories/${selectedCategory.value.id}/`, {
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
                detail: 'Category deleted successfully',
                life: 3000
            });
            await fetchCategories(); // Refresh the list
        } else {
            throw new Error('Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete category',
            life: 3000
        });
    } finally {
        isDeleting.value = false;
        showDeleteDialog.value = false;
        selectedCategory.value = null;
    }
};

// Initialize data on component mount
onMounted(() => {
    fetchCategories();
});
</script>

<template>
    <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">�️ Category Management for {{ categories.length > 0 ? categories[0].restaurant_name : '...' }}</h2>
            <div class="flex gap-2">
                <Button label="Create Category" icon="pi pi-plus" @click="$router.push('/categories/create')" class="p-button-success" />
                <Button label="Refresh" icon="pi pi-refresh" @click="fetchCategories" :loading="isLoading" class="p-button-outlined" />
            </div>
        </div>

        <!-- Category Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="categories.length > 0">
            <Card v-for="category in categories" :key="category.id" class="category-card">
                <template #header>
                    <div class="bg-primary-50 dark:bg-primary-900 p-4 rounded-t-lg">
                        <div class="flex justify-between items-start">
                            <div class="text-left">
                                <h3 class="text-xl font-semibold text-primary-700 dark:text-primary-300 mb-2">
                                    {{ category.name }}
                                </h3>
                                <p class="text-sm text-primary-600 dark:text-primary-400">
                                    {{ category.description || 'No description available' }}
                                </p>
                            </div>
                            <Badge :value="category.is_active ? 'Active' : 'Inactive'" :severity="category.is_active ? 'success' : 'danger'" />
                        </div>
                    </div>
                </template>

                <template #content>
                    <div class="space-y-3 text-left">
                        <div class="flex items-center" v-if="category.color">
                            <i class="pi pi-palette mr-2 text-gray-500"></i>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Color:</span>
                            <div class="ml-2 flex items-center">
                                <div class="w-4 h-4 rounded-full border mr-2" :style="{ backgroundColor: category.color }"></div>
                                <span class="font-medium text-sm">{{ category.color }}</span>
                            </div>
                        </div>
                    </div>
                </template>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <Button label="View Details" icon="pi pi-eye" size="small" @click="viewCategory(category)" />
                        <Button icon="pi pi-trash" class="p-button-danger" size="small" v-tooltip.top="'Delete'" @click="confirmDelete(category)" />
                    </div>
                </template>
            </Card>
        </div>

        <!-- Empty State -->
        <Card v-else-if="!isLoading" class="text-center py-16">
            <template #content>
                <div class="space-y-4">
                    <i class="pi pi-tags text-6xl text-gray-400"></i>
                    <h3 class="text-xl font-semibold text-gray-600">No Categories Found</h3>
                    <p class="text-gray-500">No categories have been created yet.</p>
                    <Button label="Create First Category" icon="pi pi-plus" class="p-button-success" @click="$router.push('/categories/create')" />
                </div>
            </template>
        </Card>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading categories...</p>
        </div>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true" class="p-fluid">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Are you sure?</h3>
                <p class="text-gray-600">
                    Do you want to delete the category "<strong>{{ selectedCategory?.name }}</strong
                    >"? This action cannot be undone.
                </p>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
                <Button label="Delete" icon="pi pi-check" class="p-button-danger" @click="deleteCategory" :loading="isDeleting" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.category-card {
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    border-radius: 12px;
}

.category-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.category-card .p-card-header {
    padding: 0;
}

.category-card .p-card-content {
    padding: 1.5rem;
}

.category-card .p-card-footer {
    padding: 1rem 1.5rem;
    background-color: var(--surface-50);
    border-top: 1px solid var(--surface-200);
}

.dark .category-card .p-card-footer {
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
