<template>
    <div class="p-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">🏪 Create New Restaurant</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Fill out the form below to create a new restaurant</p>
            </div>
            <Button label="Back to List" icon="pi pi-arrow-left" class="p-button-outlined" @click="$router.push('/restaurant')" />
        </div>

        <!-- Create Restaurant Form -->
        <Card class="restaurant-form-card">
            <template #content>
                <form @submit.prevent="createRestaurant" class="space-y-6">
                    <!-- Restaurant Name -->
                    <div class="form-group">
                        <label for="restaurantName" class="form-label required"> Restaurant Name </label>
                        <InputText id="restaurantName" v-model="form.name" placeholder="Enter restaurant name" class="w-full" :class="{ 'p-invalid': errors.name }" required />
                        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                    </div>

                    <!-- Owner Name -->
                    <div class="form-group">
                        <label for="ownerName" class="form-label required"> Owner Name </label>
                        <InputText id="ownerName" v-model="form.owner_name" placeholder="Enter owner's full name" class="w-full" :class="{ 'p-invalid': errors.owner_name }" required />
                        <small v-if="errors.owner_name" class="p-error">{{ errors.owner_name }}</small>
                    </div>

                    <!-- Currency -->
                    <div class="form-group">
                        <label for="currency" class="form-label required"> Currency </label>
                        <Dropdown id="currency" v-model="form.currency" :options="currencyOptions" optionLabel="label" optionValue="value" placeholder="Select currency" class="w-full" :class="{ 'p-invalid': errors.currency }" filter required />
                        <small v-if="errors.currency" class="p-error">{{ errors.currency }}</small>
                    </div>

                    <!-- Tax Rate -->
                    <div class="form-group">
                        <label for="taxRate" class="form-label"> Tax Rate (%) </label>
                        <InputNumber id="taxRate" v-model="form.tax_rate" placeholder="0.00" :min="0" :max="100" :minFractionDigits="2" :maxFractionDigits="2" class="w-full" :class="{ 'p-invalid': errors.tax_rate }" />
                        <small class="text-gray-500">Default is 0.00% if not specified</small>
                        <small v-if="errors.tax_rate" class="p-error block">{{ errors.tax_rate }}</small>
                    </div>

                    <!-- Active Status -->
                    <div class="form-group">
                        <div class="flex items-center space-x-3">
                            <Checkbox id="isActive" v-model="form.is_active" :binary="true" />
                            <label for="isActive" class="form-label"> Restaurant is Active </label>
                        </div>
                        <small class="text-gray-500 ml-6">Check this to make the restaurant active immediately</small>
                    </div>

                    <!-- Form Actions -->
                    <Divider />

                    <div class="flex justify-end space-x-3 pt-4 form-actions">
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$router.push('/restaurant')" :disabled="isSubmitting" />
                        <Button label="Reset Form" icon="pi pi-refresh" class="p-button-outlined" @click="resetForm" :disabled="isSubmitting" />
                        <Button type="submit" label="Create Restaurant" icon="pi pi-check" class="p-button-success" :loading="isSubmitting" />
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
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
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
    owner_name: '',
    currency: 'PKR',
    tax_rate: 0.0,
    is_active: true
});

// Currency options
const currencyOptions = ref([
    { label: 'PKR - Pakistani Rupee', value: 'PKR' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'AED - UAE Dirham', value: 'AED' },
    { label: 'SAR - Saudi Riyal', value: 'SAR' },
    { label: 'INR - Indian Rupee', value: 'INR' },
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'AUD - Australian Dollar', value: 'AUD' },
    { label: 'JPY - Japanese Yen', value: 'JPY' }
]);

// Validation function
const validateForm = () => {
    errors.value = {};
    let isValid = true;

    if (!form.name.trim()) {
        errors.value.name = 'Restaurant name is required';
        isValid = false;
    } else if (form.name.trim().length < 2) {
        errors.value.name = 'Restaurant name must be at least 2 characters';
        isValid = false;
    }

    if (!form.owner_name.trim()) {
        errors.value.owner_name = 'Owner name is required';
        isValid = false;
    } else if (form.owner_name.trim().length < 2) {
        errors.value.owner_name = 'Owner name must be at least 2 characters';
        isValid = false;
    }

    if (!form.currency) {
        errors.value.currency = 'Currency is required';
        isValid = false;
    }

    if (form.tax_rate < 0 || form.tax_rate > 100) {
        errors.value.tax_rate = 'Tax rate must be between 0 and 100';
        isValid = false;
    }

    return isValid;
};

// Create restaurant function
const createRestaurant = async () => {
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
        const userId = localStorage.getItem('pos_token');
        if (!userId) {
            throw new Error('User ID not found in localStorage');
        }

        // Prepare the data to send
        const userid= localStorage.getItem('user_id');
        const restaurantData = {
            owner: userid,
            name: form.name.trim(),
            owner_name: form.owner_name.trim(),
            currency: form.currency,
            tax_rate: form.tax_rate.toString(),
            is_active: form.is_active
        };
       console.log (restaurantData)
        const response = await fetch('http://localhost:8000/restaurants/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${userId}`
            },
            body: JSON.stringify(restaurantData)
        });

        const data = await response.json();

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `Restaurant "${form.name}" created successfully!`,
                life: 5000
            });

            // Reset form
            resetForm();

            // Navigate back to restaurant list after a short delay
            setTimeout(() => {
                router.push('/restaurant');
            }, 1500);
        } else {
            // Handle validation errors from backend
            if (data.errors || data.error) {
                const errorMessage = data.errors ? Object.values(data.errors).flat().join(', ') : data.error;
                throw new Error(errorMessage);
            } else {
                throw new Error(data.message || 'Failed to create restaurant');
            }
        }
    } catch (error) {
        console.error('Error creating restaurant:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to create restaurant',
            life: 5000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form function
const resetForm = () => {
    form.name = '';
    form.owner_name = '';
    form.currency = 'PKR';
    form.tax_rate = 0.0;
    form.is_active = true;
    errors.value = {};
};
</script>

<style scoped>
.restaurant-form-card {
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
.p-dropdown,
.p-inputnumber-input {
    transition: all 0.2s ease-in-out;
}

.p-inputtext:focus,
.p-dropdown:focus-within,
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

/* Form actions responsive */
@media (max-width: 768px) {
    .restaurant-form-card {
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
