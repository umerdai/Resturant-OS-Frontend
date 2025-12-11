<template>
    <div class="p-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">🍽️ Create Menu Item</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Add a new item to your menu</p>
            </div>
            <Button label="Back to Menu" icon="pi pi-arrow-left" class="p-button-outlined" @click="$router.push('/menu/items')" />
        </div>

        <!-- Form -->
        <Card class="create-form-card">
            <template #content>
                <form @submit.prevent="saveMenuItem" class="space-y-6">
                    <!-- Basic Information Section -->
                    <div class="form-section">
                        <h3 class="section-title">Basic Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Item Name -->
                            <div class="form-group">
                                <label for="name" class="form-label">Item Name <span class="text-red-500">*</span></label>
                                <InputText id="name" v-model="formData.name" placeholder="Enter menu item name" class="w-full" :class="{ 'p-invalid': errors.name }" />
                                <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                            </div>

                            <!-- Category -->
                            <div class="form-group">
                                <label for="category" class="form-label">Category <span class="text-red-500">*</span></label>
                                <Dropdown id="category" v-model="formData.category_id" :options="categories" optionLabel="name" optionValue="id" placeholder="Select category" class="w-full" :class="{ 'p-invalid': errors.category_id }" />
                                <small v-if="errors.category_id" class="p-error">{{ errors.category_id }}</small>
                            </div>

                            <!-- Description -->
                            <div class="form-group md:col-span-2">
                                <label for="description" class="form-label">Description</label>
                                <Textarea id="description" v-model="formData.description" placeholder="Enter item description" rows="3" class="w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Pricing Section -->
                    <div class="form-section">
                        <h3 class="section-title">Pricing & Details</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Sale Price -->
                            <div class="form-group">
                                <label for="price" class="form-label">Sale Price <span class="text-red-500">*</span></label>
                                <InputNumber id="price" v-model="formData.price" mode="currency" currency="PKR" :min="0" :maxFractionDigits="2" class="w-full" :class="{ 'p-invalid': errors.price }" />
                                <small v-if="errors.price" class="p-error">{{ errors.price }}</small>
                            </div>

                            <!-- Cost Price -->
                            <div class="form-group">
                                <label for="cost_price" class="form-label">Cost Price</label>
                                <InputNumber id="cost_price" v-model="formData.cost_price" mode="currency" currency="PKR" :min="0" :maxFractionDigits="2" class="w-full" />
                                <small v-if="errors.cost_price" class="p-error">{{ errors.cost_price }}</small>
                            </div>

                            <!-- Preparation Time -->
                            <div class="form-group">
                                <label for="preparation_time" class="form-label">Prep Time (minutes)</label>
                                <InputNumber id="preparation_time" v-model="formData.preparation_time" :min="1" :max="999" suffix=" min" class="w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Ingredients Section -->
                    <div class="form-section">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="section-title mb-0">Ingredients</h3>
                            <Button type="button" label="Add Ingredient" icon="pi pi-plus" class="p-button-outlined p-button-sm" @click="addIngredient" />
                        </div>

                        <div v-if="formData.ingredients.length > 0" class="space-y-3">
                            <div v-for="(ingredient, index) in formData.ingredients" :key="index" class="ingredient-row">
                                <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                    <!-- Ingredient Name -->
                                    <div class="md:col-span-6">
                                        <label class="form-label text-xs">Ingredient Name</label>
                                        <InputText v-model="ingredient.name" placeholder="Enter ingredient name" class="w-full" />
                                    </div>

                                    <!-- Quantity -->
                                    <div class="md:col-span-3">
                                        <label class="form-label text-xs">Quantity</label>
                                        <InputNumber v-model="ingredient.quantity" :min="0" :maxFractionDigits="2" placeholder="0" class="w-full" />
                                    </div>

                                    <!-- Unit -->
                                    <div class="md:col-span-2">
                                        <label class="form-label text-xs">Unit</label>
                                        <Dropdown v-model="ingredient.unit" :options="units" placeholder="Unit" class="w-full" />
                                    </div>

                                    <!-- Remove Button -->
                                    <div class="md:col-span-1">
                                        <Button type="button" icon="pi pi-trash" class="p-button-danger p-button-sm w-full" @click="removeIngredient(index)" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else class="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <i class="pi pi-info-circle text-2xl text-gray-400 mb-2"></i>
                            <p class="text-gray-600">No ingredients added yet. Click "Add Ingredient" to start.</p>
                        </div>
                    </div>

                    <!-- Status & Image Section -->
                    <div class="form-section">
                        <h3 class="section-title">Status & Media</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Status Toggle -->
                            <div class="form-group">
                                <div class="flex items-center space-x-3">
                                    <Checkbox id="is_available" v-model="formData.is_available" :binary="true" />
                                    <label for="is_available" class="form-label mb-0">Available for order</label>
                                </div>
                                <small class="text-gray-600">Toggle item availability on the menu</small>
                            </div>

                            <!-- Image URL -->
                            <div class="form-group">
                                <label for="image" class="form-label">Image URL</label>
                                <InputText id="image" v-model="formData.image" placeholder="Enter image URL (optional)" class="w-full" />
                            </div>
                        </div>

                        <!-- Image Preview -->
                        <div v-if="formData.image" class="mt-4">
                            <label class="form-label">Image Preview</label>
                            <div class="image-preview">
                                <img :src="formData.image" :alt="formData.name" @error="handleImageError" class="preview-image" />
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-3 pt-6 border-t">
                        <Button type="button" label="Cancel" icon="pi pi-times" class="p-button-text" @click="$router.push('/menu/items')" />
                        <Button type="submit" label="Save Menu Item" icon="pi pi-check" class="p-button-success" :loading="isSaving" />
                    </div>
                </form>
            </template>
        </Card>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

// State
const isSaving = ref(false);
const categories = ref([]);
const errors = ref({});

const units = ['g', 'kg', 'ml', 'l', 'pcs', 'cups', 'tbsp', 'tsp'];

// Form data
const formData = reactive({
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
const fetchCategories = async () => {
    try {
        const userId = localStorage.getItem('token');
        if (!userId) return;

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        let url = 'http://localhost:8000/categories/';
        if (restaurantId) {
            url += `?restaurant_id=${restaurantId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userId}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            // API may return { data: [...] } or { results: [...] } or direct array
            categories.value = data.data || data.results || data;
            console.log('Fetched categories for create menu item:', categories.value);
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const addIngredient = () => {
    formData.ingredients.push({
        name: '',
        quantity: null,
        unit: 'g'
    });
};

const removeIngredient = (index) => {
    formData.ingredients.splice(index, 1);
};

const validateForm = () => {
    errors.value = {};
    let isValid = true;

    // Required fields
    if (!formData.name.trim()) {
        errors.value.name = 'Item name is required';
        isValid = false;
    }

    if (!formData.category_id) {
        errors.value.category_id = 'Category is required';
        isValid = false;
    }

    if (!formData.price || formData.price <= 0) {
        errors.value.price = 'Sale price must be greater than 0';
        isValid = false;
    }

    // If cost price is provided, ensure sale price covers it
    if (formData.cost_price != null && formData.price != null) {
        const sale = Number(formData.price);
        const cost = Number(formData.cost_price);
        if (!isNaN(cost) && sale < cost) {
            errors.value.price = 'Sale price must be greater than or equal to cost price';
            isValid = false;
        }
    }

    return isValid;
};

const handleImageError = (event) => {
    event.target.style.display = 'none';
    toast.add({
        severity: 'warn',
        summary: 'Image Error',
        detail: 'Failed to load the image from the provided URL',
        life: 3000
    });
};

const saveMenuItem = async () => {
    if (!validateForm()) {
        // show inline errors plus a concise toast with details
        const messages = Object.values(errors.value).filter(Boolean).slice(0, 5).join(' | ');
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: messages || 'Please fix the errors in the form',
            life: 4000
        });
        return;
    }

    isSaving.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        // Prepare data for API in the exact shape backend expects
        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        // find category name from loaded categories if available
        const selectedCategory = categories.value.find((c) => c.id === (formData.category_id || formData.category));
        const categoryName = selectedCategory ? selectedCategory.name : formData.category_name || null;
        const restaurantName = (categories.value && categories.value.length > 0 && categories.value[0].restaurant_name) || localStorage.getItem('restaurant_name') || null;

        const salePrice = formData.price != null ? Number(formData.price) : null;
        const costPrice = formData.cost_price != null ? Number(formData.cost_price) : null;

        const submitData = {
            restaurant: restaurantId || formData.restaurant || null,
            restaurant_name: (categories.value && categories.value.length > 0 && categories.value[0].restaurant_name) || localStorage.getItem('restaurant_name') || null,
            category: formData.category_id || formData.category || null,
            category_name: categoryName,
            name: formData.name,
            description: formData.description,
            cost_price: costPrice != null ? Number(costPrice).toFixed(2) : null,
            sale_price: salePrice != null ? Number(salePrice).toFixed(2) : null,
            price_with_tax: salePrice != null ? Number(salePrice) : null,
            profit_margin: salePrice != null && costPrice != null ? Number((salePrice - costPrice).toFixed(2)) : null,
            status: formData.is_available ? 'available' : 'unavailable',
            image_url: formData.image || null,
            preparation_time: formData.preparation_time || null
        };
        console.log('Submitting menu item data (API expected shape):', submitData);

        const response = await fetch('http://localhost:8000/menu-items/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(submitData)
        });

        if (response.ok) {
            const data = await response.json();

            // Normalize server response to the client model used across the app
            const normalized = {
                id: data.id,
                name: data.name,
                description: data.description,
                sale_price: data.sale_price ? parseFloat(data.sale_price) : data.price ? parseFloat(data.price) : null,
                cost_price: data.cost_price ? parseFloat(data.cost_price) : null,
                is_available: data.status ? data.status === 'available' : (data.is_available ?? true),
                category: data.category || data.category_id || null,
                image: data.image_url || data.image || null,
                preparation_time: data.preparation_time || null
            };

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Menu item created successfully',
                life: 3000
            });

            // Navigate to the newly created item's details using its id
            router.push(`/menu/items/${normalized.id}/details`);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create menu item');
        }
    } catch (error) {
        console.error('Error creating menu item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to create menu item',
            life: 3000
        });
    } finally {
        isSaving.value = false;
    }
};

// Initialize
onMounted(() => {
    fetchCategories();
});
</script>

<style scoped>
.create-form-card {
    background: var(--surface-card);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-section {
    padding: 1.5rem;
    border-bottom: 1px solid var(--surface-border);
}

.form-section:last-child {
    border-bottom: none;
}

.section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
}

.section-title::before {
    content: '';
    width: 4px;
    height: 1.5rem;
    background: var(--primary-color);
    margin-right: 0.75rem;
    border-radius: 2px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-bottom: 0.5rem;
}

.ingredient-row {
    background: var(--surface-50);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--surface-border);
}

.image-preview {
    max-width: 200px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--surface-border);
}

.preview-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
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
    .grid {
        grid-template-columns: 1fr;
    }

    .md\:col-span-2,
    .md\:col-span-3,
    .md\:col-span-6 {
        grid-column: span 1;
    }
}
</style>
