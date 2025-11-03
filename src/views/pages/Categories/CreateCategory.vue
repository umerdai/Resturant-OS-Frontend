<template>
    <div class="p-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">🏷️ Create New Category</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Fill out the form below to create a new category</p>
            </div>
            <Button label="Back to List" icon="pi pi-arrow-left" class="p-button-outlined" @click="$router.push('/category')" />
        </div>

        <!-- Create Category Form -->
        <Card class="category-form-card">
            <template #content>
                <form @submit.prevent="createCategory" class="space-y-6">
                    <!-- Category Name -->
                    <div class="form-group">
                        <label for="categoryName" class="form-label required"> Category Name </label>
                        <InputText id="categoryName" v-model="form.name" placeholder="Enter category name" class="w-full" :class="{ 'p-invalid': errors.name }" required />
                        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                    </div>

                    <!-- Description -->
                    <div class="form-group">
                        <label for="description" class="form-label"> Description </label>
                        <Textarea id="description" v-model="form.description" placeholder="Enter category description" rows="3" class="w-full" :class="{ 'p-invalid': errors.description }" />
                        <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                    </div>

                    <!-- Color Picker -->
                    <div class="form-group">
                        <label for="color" class="form-label"> Category Color </label>
                        <div class="flex items-center gap-3">
                            <ColorPicker v-model="form.color" format="hex" class="color-picker" />
                            <InputText v-model="form.color" placeholder="#000000" class="flex-1" :class="{ 'p-invalid': errors.color }" />
                            <div class="w-10 h-10 rounded border-2 border-gray-300" :style="{ backgroundColor: form.color }"></div>
                        </div>
                        <small class="text-gray-500">Choose a color to represent this category</small>
                        <small v-if="errors.color" class="p-error block">{{ errors.color }}</small>
                    </div>

                    <!-- Sort Order -->
                    <div class="form-group">
                        <label for="sortOrder" class="form-label"> Sort Order </label>
                        <InputNumber id="sortOrder" v-model="form.sort_order" placeholder="0" :min="0" :max="9999" class="w-full" :class="{ 'p-invalid': errors.sort_order }" />
                        <small class="text-gray-500">Lower numbers appear first in lists</small>
                        <small v-if="errors.sort_order" class="p-error block">{{ errors.sort_order }}</small>
                    </div>

                    <!-- Active Status -->
                    <div class="form-group">
                        <div class="flex items-center space-x-3">
                            <Checkbox id="isActive" v-model="form.is_active" :binary="true" />
                            <label for="isActive" class="form-label"> Category is Active </label>
                        </div>
                        <small class="text-gray-500 ml-6">Check this to make the category active immediately</small>
                    </div>

                    <!-- Form Actions -->
                    <Divider />

                    <div class="flex justify-end space-x-3 pt-4 form-actions">
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$router.push('/category')" :disabled="isSubmitting" />
                        <Button label="Reset Form" icon="pi pi-refresh" class="p-button-outlined" @click="resetForm" :disabled="isSubmitting" />
                        <Button type="submit" label="Create Category" icon="pi pi-check" class="p-button-success" :loading="isSubmitting" />
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
import ColorPicker from 'primevue/colorpicker';
import Divider from 'primevue/divider';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

// Form state
const isSubmitting = ref(false);
const errors = ref({});

// Form data
const form = reactive({
    name: '',
    description: '',
    color: '#3B82F6',
    sort_order: 0,
    is_active: true
});

// Validation function
const validateForm = () => {
    errors.value = {};
    let isValid = true;

    if (!form.name.trim()) {
        errors.value.name = 'Category name is required';
        isValid = false;
    } else if (form.name.trim().length < 2) {
        errors.value.name = 'Category name must be at least 2 characters';
        isValid = false;
    }

    if (form.description && form.description.length > 500) {
        errors.value.description = 'Description must be less than 500 characters';
        isValid = false;
    }

    if (form.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(form.color)) {
        errors.value.color = 'Please enter a valid hex color code';
        isValid = false;
    }

    if (form.sort_order < 0 || form.sort_order > 9999) {
        errors.value.sort_order = 'Sort order must be between 0 and 9999';
        isValid = false;
    }

    return isValid;
};

// Create category function
const createCategory = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Please fix the errors in the form',
            life: 3000
        });
        return;
    }

    isSubmitting.value = true;

    try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('User ID not found in localStorage');
        }

        // Prepare the data to send
        const categoryData = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            color: form.color || null,
            sort_order: form.sort_order,
            is_active: form.is_active
        };

        const response = await fetch('http://localhost:8000/categories/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${userId}`
            },
            body: JSON.stringify(categoryData)
        });

        const data = await response.json();

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `Category "${form.name}" created successfully!`,
                life: 5000
            });

            // Reset form
            resetForm();

            // Navigate back to category list after a short delay
            setTimeout(() => {
                router.push('/category');
            }, 1500);
        } else {
            // Handle validation errors from backend
            if (data.errors || data.error) {
                const errorMessage = data.errors ? Object.values(data.errors).flat().join(', ') : data.error;
                throw new Error(errorMessage);
            } else {
                throw new Error(data.message || 'Failed to create category');
            }
        }
    } catch (error) {
        console.error('Error creating category:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to create category',
            life: 5000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form function
const resetForm = () => {
    form.name = '';
    form.description = '';
    form.color = '#3B82F6';
    form.sort_order = 0;
    form.is_active = true;
    errors.value = {};
};
</script>

<style scoped>
.category-form-card {
    background: var(--surface-card);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 0.5rem;
}

.form-label.required::after {
    content: '*';
    color: #ef4444;
    margin-left: 0.25rem;
}

.p-error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

/* Input styling */
.p-inputtext,
.p-textarea,
.p-inputnumber-input {
    transition: all 0.2s ease-in-out;
}

.p-inputtext:focus,
.p-textarea:focus,
.p-inputnumber:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.p-invalid {
    border-color: #ef4444 !important;
}

.p-invalid:focus {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

.color-picker {
    width: 3rem;
    height: 2.5rem;
}

/* Form actions responsive */
@media (max-width: 768px) {
    .category-form-card {
        margin: 0 1rem;
    }

    .form-actions {
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-actions .p-button {
        width: 100%;
        justify-content: center;
    }
}
</style>
