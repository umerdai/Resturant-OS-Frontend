<template>
    <div class="p-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">📖 Recipe Management</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Manage recipe for {{ menuItem?.name || 'Menu Item' }}</p>
            </div>
            <div class="flex gap-2">
                <Button label="Back to Menu" icon="pi pi-arrow-left" class="p-button-outlined" @click="$router.push('/menu/items')" />
                <Button label="Save Recipe" icon="pi pi-save" class="p-button-success" @click="saveRecipe" :loading="isSaving" />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading recipe...</p>
        </div>

        <!-- Recipe Form -->
        <div v-else class="space-y-6">
            <!-- Menu Item Info Card -->
            <Card>
                <template #header>
                    <div class="p-4 border-b">
                        <h4 class="text-lg font-semibold flex items-center">
                            <i class="pi pi-info-circle mr-2"></i>
                            Menu Item Information
                        </h4>
                    </div>
                </template>
                <template #content>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                            <p class="text-lg font-semibold">{{ menuItem?.name }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <p>{{ menuItem?.category_name || 'N/A' }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                            <p class="text-green-600 font-bold">₨{{ menuItem?.price }}</p>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Recipe Details -->
            <Card>
                <template #header>
                    <div class="p-4 border-b">
                        <h4 class="text-lg font-semibold flex items-center">
                            <i class="pi pi-file-edit mr-2"></i>
                            Recipe Details
                        </h4>
                    </div>
                </template>
                <template #content>
                    <div class="space-y-4">
                        <!-- Recipe Name -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Recipe Name <span class="text-red-500">*</span></label>
                            <InputText v-model="recipeForm.name" class="w-full" placeholder="Enter recipe name" />
                        </div>

                        <!-- Preparation Time -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Preparation Time (min) <span class="text-red-500">*</span></label>
                                <InputNumber v-model="recipeForm.preparation_time" :min="0" class="w-full" />
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Ingredients -->
            <Card>
                <template #header>
                    <div class="p-4 border-b flex justify-between items-center">
                        <h4 class="text-lg font-semibold flex items-center">
                            <i class="pi pi-shopping-cart mr-2"></i>
                            Ingredients
                        </h4>
                        <Button label="Add Ingredient" icon="pi pi-plus" size="small" @click="addIngredient" />
                    </div>
                </template>
                <template #content>
                    <div v-if="recipeForm.ingredients.length === 0" class="text-center py-8 text-gray-500">
                        <i class="pi pi-inbox text-4xl mb-2"></i>
                        <p>No ingredients added yet. Click "Add Ingredient" to get started.</p>
                    </div>
                    <div v-else class="space-y-3">
                        <div v-for="(ingredient, index) in recipeForm.ingredients" :key="index" class="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div class="md:col-span-2">
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Inventory Item ID <span class="text-red-500">*</span></label>
                                    <InputText v-model="ingredient.inventory_item" placeholder="Enter inventory item ID" class="w-full" />
                                    <small class="text-xs text-gray-500">Enter the inventory item ID from your inventory</small>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Quantity <span class="text-red-500">*</span></label>
                                    <InputNumber v-model="ingredient.quantity" :min="0" :minFractionDigits="0" :maxFractionDigits="3" class="w-full" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Unit <span class="text-red-500">*</span></label>
                                    <Dropdown v-model="ingredient.unit" :options="units" placeholder="Select unit" class="w-full" />
                                </div>
                            </div>
                            <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeIngredient(index)" />
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const menuItem = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);

// Recipe form
const recipeForm = reactive({
    name: '',
    preparation_time: 10,
    ingredients: []
});

// Options
const units = ['kg', 'g', 'l', 'ml', 'pcs', 'cups', 'tbsp', 'tsp'];

// Methods
const fetchMenuItem = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found');
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
            menuItem.value = {
                id: data.id,
                name: data.name,
                category_name: data.category_name,
                price: data.sale_price || data.price
            };

            // Load existing recipe if available
            if (data.recipe) {
                recipeForm.name = data.recipe.name || '';
                recipeForm.preparation_time = data.recipe.preparation_time || 10;
                recipeForm.ingredients = data.recipe.ingredients || [];
            }
        } else {
            throw new Error('Failed to fetch menu item');
        }
    } catch (error) {
        console.error('Error fetching menu item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to load menu item',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

const addIngredient = () => {
    recipeForm.ingredients.push({
        inventory_item: '',
        quantity: 0,
        unit: 'kg'
    });
};

const removeIngredient = (index) => {
    recipeForm.ingredients.splice(index, 1);
};

const saveRecipe = async () => {
    isSaving.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found');
        }

        // Validate
        if (!recipeForm.name || !recipeForm.preparation_time) {
            toast.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Recipe name and preparation time are required',
                life: 3000
            });
            return;
        }

        const payload = {
            menu_item: route.params.id,
            name: recipeForm.name || `${menuItem.value?.name} Recipe`,
            preparation_time: recipeForm.prep_time || recipeForm.preparation_time || 0,
            ingredients: recipeForm.ingredients.map((ing) => ({
                inventory_item: ing.inventory_item || ing.id || null,
                quantity: parseFloat(ing.quantity) || 0,
                unit: ing.unit || 'g'
            }))
        };

        const response = await fetch('http://localhost:8000/recipes/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Recipe saved successfully',
                life: 3000
            });
            router.push('/menu/items');
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to save recipe');
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to save recipe',
            life: 3000
        });
    } finally {
        isSaving.value = false;
    }
};

// Initialize
onMounted(() => {
    fetchMenuItem();
});
</script>

<style scoped>
.p-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
}
</style>
