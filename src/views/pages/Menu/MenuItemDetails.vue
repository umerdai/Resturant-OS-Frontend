<template>
    <div class="p-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">🍽️ Menu Item Details</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">View and manage menu item information</p>
            </div>
            <div class="flex gap-2">
                <Button label="Back to Menu" icon="pi pi-arrow-left" class="p-button-outlined" @click="$router.push('/menu/items')" />
                <Button label="Edit Item" icon="pi pi-pencil" class="p-button-warning" @click="toggleEditMode" v-if="!isEditing" />
                <Button label="Delete Item" icon="pi pi-trash" class="p-button-danger" @click="confirmDelete" v-if="!isEditing" />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading menu item details...</p>
        </div>

        <!-- Menu Item Details -->
        <div v-else-if="menuItem" class="space-y-6">
            <!-- Edit Mode Actions -->
            <div v-if="isEditing" class="mb-6">
                <div class="flex justify-end gap-2 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelEdit" />
                    <Button label="Save Changes" icon="pi pi-check" class="p-button-success" @click="saveMenuItem" :loading="isSaving" />
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Column - Image & Quick Info -->
                <div class="lg:col-span-1 space-y-6">
                    <!-- Image Card -->
                    <Card class="image-card">
                        <template #content>
                            <div class="relative">
                                <img :src="(isEditing ? editForm.image : menuItem.image) || '/demo/images/food-placeholder.jpg'" :alt="isEditing ? editForm.name : menuItem.name" class="w-full h-64 object-cover rounded-lg" />
                                <Badge
                                    :value="(isEditing ? editForm.is_available : menuItem.is_available) ? 'Available' : 'Unavailable'"
                                    :severity="(isEditing ? editForm.is_available : menuItem.is_available) ? 'success' : 'danger'"
                                    class="absolute top-2 right-2"
                                />
                                <div v-if="menuItem.category_color" class="absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white" :style="{ backgroundColor: menuItem.category_color }"></div>
                            </div>

                            <!-- Image URL Edit -->
                            <div v-if="isEditing" class="mt-4">
                                <label class="block text-sm font-medium mb-2">Image URL</label>
                                <InputText v-model="editForm.image" placeholder="Enter image URL" class="w-full" />
                            </div>
                        </template>
                    </Card>

                    <!-- Quick Stats -->
                    <Card class="stats-card">
                        <template #header>
                            <div class="p-4 border-b">
                                <h4 class="text-lg font-semibold">Quick Stats</h4>
                            </div>
                        </template>
                        <template #content>
                            <div class="space-y-4">
                                <div class="stat-item">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600">Sale Price</span>
                                        <span class="font-bold text-lg text-green-600"> ₨{{ isEditing ? editForm.price : menuItem.price }} </span>
                                    </div>
                                </div>

                                <div v-if="menuItem.cost_price" class="stat-item">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600">Cost Price</span>
                                        <span class="font-medium text-orange-600"> ₨{{ isEditing ? editForm.cost_price : menuItem.cost_price }} </span>
                                    </div>
                                </div>

                                <div v-if="menuItem.preparation_time" class="stat-item">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600">Prep Time</span>
                                        <span class="font-medium"> {{ isEditing ? editForm.preparation_time : menuItem.preparation_time }} min </span>
                                    </div>
                                </div>

                                <div class="stat-item">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600">Ingredients</span>
                                        <span class="font-medium">
                                            {{ (isEditing ? editForm.ingredients : menuItem.ingredients)?.length || 0 }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Right Column - Detailed Information -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Basic Information -->
                    <Card class="info-section">
                        <template #header>
                            <div class="p-4 border-b">
                                <h4 class="text-lg font-semibold flex items-center">
                                    <i class="pi pi-info-circle mr-2"></i>
                                    Basic Information
                                </h4>
                            </div>
                        </template>
                        <template #content>
                            <div class="space-y-4">
                                <!-- Item Name -->
                                <div class="detail-item">
                                    <label class="detail-label">Item Name</label>
                                    <span v-if="!isEditing" class="detail-value text-xl font-semibold">{{ menuItem.name }}</span>
                                    <div v-else class="detail-edit">
                                        <InputText v-model="editForm.name" class="w-full text-xl" :class="{ 'p-invalid': errors.name }" />
                                        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                                    </div>
                                </div>

                                <!-- Category -->
                                <div class="detail-item">
                                    <label class="detail-label">Category</label>
                                    <span v-if="!isEditing" class="detail-value">{{ menuItem.category_name || 'No Category' }}</span>
                                    <div v-else class="detail-edit">
                                        <Dropdown v-model="editForm.category_id" :options="categories" optionLabel="name" optionValue="id" placeholder="Select category" class="w-full" :class="{ 'p-invalid': errors.category_id }" />
                                        <small v-if="errors.category_id" class="p-error">{{ errors.category_id }}</small>
                                    </div>
                                </div>

                                <!-- Description -->
                                <div class="detail-item">
                                    <label class="detail-label">Description</label>
                                    <span v-if="!isEditing" class="detail-value">{{ menuItem.description || 'No description provided' }}</span>
                                    <div v-else class="detail-edit">
                                        <Textarea v-model="editForm.description" rows="3" class="w-full" />
                                    </div>
                                </div>

                                <!-- Status -->
                                <div class="detail-item">
                                    <label class="detail-label">Availability Status</label>
                                    <div v-if="!isEditing" class="detail-value">
                                        <Badge :value="menuItem.is_available ? 'Available' : 'Unavailable'" :severity="menuItem.is_available ? 'success' : 'danger'" />
                                    </div>
                                    <div v-else class="detail-edit">
                                        <div class="flex items-center space-x-3">
                                            <Checkbox v-model="editForm.is_available" :binary="true" />
                                            <label>Available for order</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Pricing Information -->
                    <Card class="info-section">
                        <template #header>
                            <div class="p-4 border-b">
                                <h4 class="text-lg font-semibold flex items-center">
                                    <i class="pi pi-dollar mr-2"></i>
                                    Pricing & Time
                                </h4>
                            </div>
                        </template>
                        <template #content>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <!-- Sale Price -->
                                <div class="detail-item">
                                    <label class="detail-label">Sale Price</label>
                                    <span v-if="!isEditing" class="detail-value text-lg font-bold text-green-600">₨{{ menuItem.price }}</span>
                                    <div v-else class="detail-edit">
                                        <InputNumber v-model="editForm.price" mode="currency" currency="PKR" :min="0" class="w-full" :class="{ 'p-invalid': errors.price }" />
                                        <small v-if="errors.price" class="p-error">{{ errors.price }}</small>
                                    </div>
                                </div>

                                <!-- Cost Price -->
                                <div class="detail-item">
                                    <label class="detail-label">Cost Price</label>
                                    <span v-if="!isEditing" class="detail-value">₨{{ menuItem.cost_price || 'Not set' }}</span>
                                    <div v-else class="detail-edit">
                                        <InputNumber v-model="editForm.cost_price" mode="currency" currency="PKR" :min="0" class="w-full" />
                                    </div>
                                </div>

                                <!-- Preparation Time -->
                                <div class="detail-item">
                                    <label class="detail-label">Preparation Time</label>
                                    <span v-if="!isEditing" class="detail-value">{{ menuItem.preparation_time || 'Not set' }} {{ menuItem.preparation_time ? 'min' : '' }}</span>
                                    <div v-else class="detail-edit">
                                        <InputNumber v-model="editForm.preparation_time" :min="1" suffix=" min" class="w-full" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Ingredients -->
                    <Card class="info-section">
                        <template #header>
                            <div class="p-4 border-b flex justify-between items-center">
                                <h4 class="text-lg font-semibold flex items-center">
                                    <i class="pi pi-list mr-2"></i>
                                    Ingredients
                                </h4>
                                <Button v-if="isEditing" label="Add Ingredient" icon="pi pi-plus" class="p-button-outlined p-button-sm" @click="addIngredient" />
                            </div>
                        </template>
                        <template #content>
                            <!-- View Mode -->
                            <div v-if="!isEditing" class="space-y-2">
                                <div v-if="menuItem.ingredients && menuItem.ingredients.length > 0">
                                    <div v-for="ingredient in menuItem.ingredients" :key="ingredient.id || ingredient.name" class="ingredient-item">
                                        <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span class="font-medium">{{ ingredient.name }}</span>
                                            <span class="text-gray-600">{{ ingredient.quantity }} {{ ingredient.unit }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="text-center py-6 text-gray-500">
                                    <i class="pi pi-info-circle text-2xl mb-2"></i>
                                    <p>No ingredients specified</p>
                                </div>
                            </div>

                            <!-- Edit Mode -->
                            <div v-else class="space-y-3">
                                <div v-if="editForm.ingredients.length > 0">
                                    <div v-for="(ingredient, index) in editForm.ingredients" :key="index" class="ingredient-edit-row">
                                        <div class="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div class="col-span-6">
                                                <InputText v-model="ingredient.name" placeholder="Ingredient name" class="w-full" />
                                            </div>
                                            <div class="col-span-3">
                                                <InputNumber v-model="ingredient.quantity" :min="0" placeholder="Quantity" class="w-full" />
                                            </div>
                                            <div class="col-span-2">
                                                <Dropdown v-model="ingredient.unit" :options="units" placeholder="Unit" class="w-full" />
                                            </div>
                                            <div class="col-span-1">
                                                <Button icon="pi pi-trash" class="p-button-danger p-button-sm w-full" @click="removeIngredient(index)" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <i class="pi pi-info-circle text-2xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-600">No ingredients added yet</p>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Timestamps -->
                    <Card class="info-section">
                        <template #header>
                            <div class="p-4 border-b">
                                <h4 class="text-lg font-semibold flex items-center">
                                    <i class="pi pi-calendar mr-2"></i>
                                    Timestamps
                                </h4>
                            </div>
                        </template>
                        <template #content>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="detail-item">
                                    <label class="detail-label">Created Date</label>
                                    <span class="detail-value">{{ formatDate(menuItem.created_at) }}</span>
                                </div>
                                <div class="detail-item">
                                    <label class="detail-label">Last Updated</label>
                                    <span class="detail-value">{{ formatDate(menuItem.updated_at) }}</span>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <Card v-else class="text-center py-16">
            <template #content>
                <div class="space-y-4">
                    <i class="pi pi-exclamation-triangle text-6xl text-red-400"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Menu Item Not Found</h3>
                    <p class="text-gray-500">The requested menu item could not be found.</p>
                    <Button label="Back to Menu Items" icon="pi pi-arrow-left" @click="$router.push('/menu/items')" />
                </div>
            </template>
        </Card>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Are you sure?</h3>
                <p class="text-gray-600">
                    Do you want to delete "<strong>{{ menuItem?.name }}</strong
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
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const menuItem = ref(null);
const categories = ref([]);
const isLoading = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const showDeleteDialog = ref(false);
const errors = ref({});

const units = ['g', 'kg', 'ml', 'l', 'pcs', 'cups', 'tbsp', 'tsp'];

// Edit form
const editForm = reactive({
    name: '',
    description: '',
    category_id: null,
    price: null,
    cost_price: null,
    preparation_time: null,
    is_available: true,
    image: '',
    ingredients: []
});

// Methods
const fetchMenuItem = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/menu-items/${route.params.id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Normalize server response to client model
            const normalized = {
                id: data.id,
                name: data.name,
                description: data.description,
                price: data.sale_price ? parseFloat(data.sale_price) : data.price ? parseFloat(data.price) : null,
                cost_price: data.cost_price ? parseFloat(data.cost_price) : null,
                is_available: data.status ? data.status === 'available' : (data.is_available ?? true),
                category_id: data.category || data.category_id || null,
                category_name: data.category_name || data.categoryName || null,
                image: data.image_url || data.image || null,
                preparation_time: data.preparation_time || null,
                ingredients: data.ingredients || [],
                created_at: data.created_at || null,
                updated_at: data.updated_at || null,
                raw: data
            };

            menuItem.value = normalized;
            populateEditForm();
        } else {
            throw new Error('Failed to fetch menu item details');
        }
    } catch (error) {
        console.error('Error fetching menu item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch menu item details',
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
            categories.value = data.data || data.results || data;
            console.log('Fetched categories for menu item details:', categories.value);
        } else {
            console.error('Failed to fetch categories:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const populateEditForm = () => {
    if (menuItem.value) {
        editForm.name = menuItem.value.name || '';
        editForm.description = menuItem.value.description || '';
        editForm.category_id = menuItem.value.category_id;
        editForm.price = menuItem.value.price;
        editForm.cost_price = menuItem.value.cost_price;
        editForm.preparation_time = menuItem.value.preparation_time;
        editForm.is_available = menuItem.value.is_available;
        editForm.image = menuItem.value.image || '';
        editForm.ingredients = [...(menuItem.value.ingredients || [])];
    }
};

const toggleEditMode = () => {
    isEditing.value = true;
    populateEditForm();
};

const cancelEdit = () => {
    isEditing.value = false;
    errors.value = {};
    populateEditForm();
};

const addIngredient = () => {
    editForm.ingredients.push({
        name: '',
        quantity: null,
        unit: 'g'
    });
};

const removeIngredient = (index) => {
    editForm.ingredients.splice(index, 1);
};

const validateForm = () => {
    errors.value = {};
    let isValid = true;

    if (!editForm.name.trim()) {
        errors.value.name = 'Item name is required';
        isValid = false;
    }

    if (!editForm.category_id) {
        errors.value.category_id = 'Category is required';
        isValid = false;
    }

    if (!editForm.price || editForm.price <= 0) {
        errors.value.price = 'Sale price must be greater than 0';
        isValid = false;
    }

    return isValid;
};

const saveMenuItem = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Please fix the errors in the form',
            life: 3000
        });
        return;
    }

    isSaving.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const submitData = {
            ...editForm,
            ingredients: editForm.ingredients.filter((ing) => ing.name.trim())
        };

        const response = await fetch(`http://localhost:8000/menu-items/${route.params.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(submitData)
        });

        if (response.ok) {
            const data = await response.json();
            menuItem.value = data;
            isEditing.value = false;
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Menu item updated successfully',
                life: 3000
            });
        } else {
            throw new Error('Failed to update menu item');
        }
    } catch (error) {
        console.error('Error updating menu item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update menu item',
            life: 3000
        });
    } finally {
        isSaving.value = false;
    }
};

const confirmDelete = () => {
    showDeleteDialog.value = true;
};

const deleteMenuItem = async () => {
    isDeleting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/menu-items/${route.params.id}/`, {
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
            router.push('/menu/items');
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
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
};

// Initialize
onMounted(() => {
    fetchMenuItem();
    fetchCategories();
});
</script>

<style scoped>
.image-card,
.stats-card,
.info-section {
    background: var(--surface-card);
    border-radius: 8px;
    border: 1px solid var(--surface-border);
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.detail-label {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.detail-value {
    font-size: 1rem;
    color: var(--text-color);
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--surface-border);
    min-height: 2rem;
    display: flex;
    align-items: center;
}

.detail-edit {
    margin-top: 0.25rem;
}

.stat-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--surface-border);
}

.stat-item:last-child {
    border-bottom: none;
}

.ingredient-item,
.ingredient-edit-row {
    margin-bottom: 0.5rem;
}

.ingredient-edit-row:last-child {
    margin-bottom: 0;
}

.p-error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.p-invalid {
    border-color: #ef4444 !important;
}

@media (max-width: 768px) {
    .grid-cols-12 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .col-span-1,
    .col-span-2,
    .col-span-3,
    .col-span-6 {
        grid-column: span 1;
    }
}
</style>
