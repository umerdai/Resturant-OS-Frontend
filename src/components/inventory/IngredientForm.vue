<script setup>
import { ref, computed, watch } from 'vue';
import { useInventoryStore } from '@/stores/inventory';

const props = defineProps({
    ingredient: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['save', 'cancel']);

const inventoryStore = useInventoryStore();

// Form data
const formData = ref({
    name: '',
    category: '',
    currentStock: 0,
    unit: '',
    minStock: 0,
    maxStock: 100,
    costPerUnit: 0,
    supplierId: null,
    expiryDate: '',
    location: '',
    barcode: ''
});

const errors = ref({});
const loading = ref(false);

// Options
const unitOptions = [
    { label: 'Pounds (lbs)', value: 'lbs' },
    { label: 'Kilograms (kg)', value: 'kg' },
    { label: 'Liters (l)', value: 'liters' },
    { label: 'Gallons (gal)', value: 'gallons' },
    { label: 'Pieces (pcs)', value: 'pieces' },
    { label: 'Ounces (oz)', value: 'oz' },
    { label: 'Grams (g)', value: 'grams' },
    { label: 'Cups', value: 'cups' }
];

const categoryOptions = computed(() =>
    inventoryStore.categories.map((cat) => ({
        label: cat.name,
        value: cat.id
    }))
);

const supplierOptions = computed(() =>
    inventoryStore.suppliers.map((sup) => ({
        label: sup.name,
        value: sup.id
    }))
);

// Computed properties
const isEditing = computed(() => !!props.ingredient);

const formattedTotalValue = computed(() => {
    const total = formData.value.currentStock * formData.value.costPerUnit;
    return total.toFixed(2);
});

// Methods
const validateForm = () => {
    errors.value = {};

    if (!formData.value.name.trim()) {
        errors.value.name = 'Ingredient name is required';
    }

    if (!formData.value.category) {
        errors.value.category = 'Category is required';
    }

    if (!formData.value.unit) {
        errors.value.unit = 'Unit is required';
    }

    if (formData.value.currentStock < 0) {
        errors.value.currentStock = 'Current stock cannot be negative';
    }

    if (formData.value.minStock < 0) {
        errors.value.minStock = 'Minimum stock cannot be negative';
    }

    if (formData.value.maxStock <= formData.value.minStock) {
        errors.value.maxStock = 'Maximum stock must be greater than minimum stock';
    }

    if (formData.value.costPerUnit <= 0) {
        errors.value.costPerUnit = 'Cost per unit must be greater than 0';
    }

    if (!formData.value.supplierId) {
        errors.value.supplierId = 'Supplier is required';
    }

    if (!formData.value.expiryDate) {
        errors.value.expiryDate = 'Expiry date is required';
    }

    return Object.keys(errors.value).length === 0;
};

const handleSave = async () => {
    if (!validateForm()) {
        return;
    }

    loading.value = true;

    try {
        const ingredientData = { ...formData.value };

        // Generate barcode if not provided
        if (!ingredientData.barcode) {
            ingredientData.barcode = generateBarcode();
        }

        emit('save', ingredientData);
    } catch (error) {
        console.error('Error saving ingredient:', error);
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    emit('cancel');
};

const generateBarcode = () => {
    return '123456' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
};

const resetForm = () => {
    formData.value = {
        name: '',
        category: '',
        currentStock: 0,
        unit: '',
        minStock: 0,
        maxStock: 100,
        costPerUnit: 0,
        supplierId: null,
        expiryDate: '',
        location: '',
        barcode: ''
    };
    errors.value = {};
};

// Watch for ingredient prop changes
watch(
    () => props.ingredient,
    (newIngredient) => {
        if (newIngredient) {
            formData.value = { ...newIngredient };
        } else {
            resetForm();
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="ingredient-form p-6">
        <form @submit.prevent="handleSave">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                    <label for="name" class="form-label required">Ingredient Name</label>
                    <InputText id="name" v-model="formData.name" placeholder="Enter ingredient name" :class="{ 'p-invalid': errors.name }" class="w-full" />
                    <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                </div>

                <div class="form-group">
                    <label for="category" class="form-label required">Category</label>
                    <Dropdown id="category" v-model="formData.category" :options="categoryOptions" optionLabel="label" optionValue="value" placeholder="Select category" :class="{ 'p-invalid': errors.category }" class="w-full" />
                    <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
                </div>
            </div>

            <!-- Stock Information -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div class="form-group">
                    <label for="currentStock" class="form-label required">Current Stock</label>
                    <InputNumber id="currentStock" v-model="formData.currentStock" :min="0" :maxFractionDigits="2" :class="{ 'p-invalid': errors.currentStock }" class="w-full" />
                    <small v-if="errors.currentStock" class="p-error">{{ errors.currentStock }}</small>
                </div>

                <div class="form-group">
                    <label for="unit" class="form-label required">Unit</label>
                    <Dropdown id="unit" v-model="formData.unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Select unit" :class="{ 'p-invalid': errors.unit }" class="w-full" />
                    <small v-if="errors.unit" class="p-error">{{ errors.unit }}</small>
                </div>

                <div class="form-group">
                    <label for="costPerUnit" class="form-label required">Cost per Unit ($)</label>
                    <InputNumber id="costPerUnit" v-model="formData.costPerUnit" mode="currency" currency="USD" :min="0" :maxFractionDigits="2" :class="{ 'p-invalid': errors.costPerUnit }" class="w-full" />
                    <small v-if="errors.costPerUnit" class="p-error">{{ errors.costPerUnit }}</small>
                </div>
            </div>

            <!-- Stock Levels -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div class="form-group">
                    <label for="minStock" class="form-label required">Minimum Stock Level</label>
                    <InputNumber id="minStock" v-model="formData.minStock" :min="0" :maxFractionDigits="2" :class="{ 'p-invalid': errors.minStock }" class="w-full" />
                    <small v-if="errors.minStock" class="p-error">{{ errors.minStock }}</small>
                </div>

                <div class="form-group">
                    <label for="maxStock" class="form-label required">Maximum Stock Level</label>
                    <InputNumber id="maxStock" v-model="formData.maxStock" :min="formData.minStock + 1" :maxFractionDigits="2" :class="{ 'p-invalid': errors.maxStock }" class="w-full" />
                    <small v-if="errors.maxStock" class="p-error">{{ errors.maxStock }}</small>
                </div>
            </div>

            <!-- Supplier and Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div class="form-group">
                    <label for="supplier" class="form-label required">Supplier</label>
                    <Dropdown id="supplier" v-model="formData.supplierId" :options="supplierOptions" optionLabel="label" optionValue="value" placeholder="Select supplier" :class="{ 'p-invalid': errors.supplierId }" class="w-full" />
                    <small v-if="errors.supplierId" class="p-error">{{ errors.supplierId }}</small>
                </div>

                <div class="form-group">
                    <label for="location" class="form-label">Storage Location</label>
                    <InputText id="location" v-model="formData.location" placeholder="e.g., Freezer A, Dry Storage" class="w-full" />
                </div>
            </div>

            <!-- Expiry and Barcode -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div class="form-group">
                    <label for="expiryDate" class="form-label required">Expiry Date</label>
                    <Calendar id="expiryDate" v-model="formData.expiryDate" :minDate="new Date()" dateFormat="yy-mm-dd" placeholder="Select expiry date" :class="{ 'p-invalid': errors.expiryDate }" class="w-full" />
                    <small v-if="errors.expiryDate" class="p-error">{{ errors.expiryDate }}</small>
                </div>

                <div class="form-group">
                    <label for="barcode" class="form-label">Barcode</label>
                    <div class="flex">
                        <InputText id="barcode" v-model="formData.barcode" placeholder="Enter or generate barcode" class="flex-1" />
                        <Button type="button" icon="pi pi-refresh" class="ml-2" outlined @click="formData.barcode = generateBarcode()" />
                    </div>
                </div>
            </div>

            <!-- Summary Card -->
            <Card class="mt-6 bg-surface-50 dark:bg-surface-800">
                <template #content>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div class="text-lg font-semibold text-blue-600">{{ formData.currentStock }} {{ formData.unit }}</div>
                            <div class="text-sm text-surface-600 dark:text-surface-400">Current Stock</div>
                        </div>
                        <div>
                            <div class="text-lg font-semibold text-green-600">${{ formData.costPerUnit.toFixed(2) }}</div>
                            <div class="text-sm text-surface-600 dark:text-surface-400">Cost per Unit</div>
                        </div>
                        <div>
                            <div class="text-lg font-semibold text-purple-600">${{ formattedTotalValue }}</div>
                            <div class="text-sm text-surface-600 dark:text-surface-400">Total Value</div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 mt-8">
                <Button type="button" label="Cancel" icon="pi pi-times" outlined @click="handleCancel" />
                <Button type="submit" :label="isEditing ? 'Update Ingredient' : 'Add Ingredient'" icon="pi pi-check" :loading="loading" />
            </div>
        </form>
    </div>
</template>

<style scoped>
.ingredient-form {
    max-height: 70vh;
    overflow-y: auto;
}

.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-color);
}

.form-label.required::after {
    content: ' *';
    color: var(--red-500);
}

.p-error {
    color: var(--red-500);
    font-size: 0.75rem;
    margin-top: 0.25rem;
    display: block;
}

.p-invalid {
    border-color: var(--red-500) !important;
}

/* Custom styling for form elements */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber) {
    width: 100%;
}

:deep(.p-inputnumber-input) {
    width: 100%;
}

:deep(.p-calendar-input) {
    width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .ingredient-form {
        padding: 1rem;
    }

    .grid {
        grid-template-columns: 1fr;
    }
}
</style>
