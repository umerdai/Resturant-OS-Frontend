<template>
    <div class="p-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">🏢 Create New Branch</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Fill out the form below to create a new branch</p>
            </div>
            <Button label="Back to List" icon="pi pi-arrow-left" class="p-button-outlined" @click="$router.push('/branches')" />
        </div>

        <!-- Create Branch Form -->
        <Card class="branch-form-card">
            <template #content>
                <form @submit.prevent="createBranch" class="space-y-6">
                    <!-- Branch Name -->
                    <div class="form-group">
                        <label for="branchName" class="form-label required"> Branch Name </label>
                        <InputText id="branchName" v-model="form.name" placeholder="Enter branch name" class="w-full" :class="{ 'p-invalid': errors.name }" required />
                        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                    </div>

                    <!-- Address -->
                    <div class="form-group">
                        <label for="address" class="form-label required"> Address </label>
                        <Textarea id="address" v-model="form.address" placeholder="Enter branch address" rows="3" class="w-full" :class="{ 'p-invalid': errors.address }" required />
                        <small v-if="errors.address" class="p-error">{{ errors.address }}</small>
                    </div>

                    <!-- Phone Number -->
                    <div class="form-group">
                        <label for="phone" class="form-label"> Phone Number </label>
                        <InputText id="phone" v-model="form.phone" placeholder="Enter phone number" class="w-full" :class="{ 'p-invalid': errors.phone }" />
                        <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                    </div>

                    <!-- Manager Name -->
                    <div class="form-group">
                        <label for="managerName" class="form-label"> Manager Name </label>
                        <InputText id="managerName" v-model="form.manager_name" placeholder="Enter manager's name" class="w-full" :class="{ 'p-invalid': errors.manager_name }" />
                        <small v-if="errors.manager_name" class="p-error">{{ errors.manager_name }}</small>
                    </div>
                    <div class="form-group">
                        <label for="city" class="form-label"> City </label>
                        <InputText id="city" v-model="form.city" placeholder="Enter city" class="w-full" :class="{ 'p-invalid': errors.city }" />
                        <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
                    </div>

                    <!-- Opening Hours -->
                    <div class="form-group">
                        <label for="openingHours" class="form-label"> Opening Hours </label>
                        <InputText id="openingHours" v-model="form.opening_hours" placeholder="e.g., 9:00 AM - 10:00 PM" class="w-full" :class="{ 'p-invalid': errors.opening_hours }" />
                        <small class="text-gray-500">Enter the branch operating hours</small>
                        <small v-if="errors.opening_hours" class="p-error block">{{ errors.opening_hours }}</small>
                    </div>

                    <!-- Email -->
                    <div class="form-group">
                        <label for="email" class="form-label"> Email Address </label>
                        <InputText id="email" v-model="form.email" placeholder="Enter branch email" type="email" class="w-full" :class="{ 'p-invalid': errors.email }" />
                        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                    </div>

                    <!-- Active Status -->
                    <div class="form-group">
                        <div class="flex items-center space-x-3">
                            <Checkbox id="isActive" v-model="form.is_active" :binary="true" />
                            <label for="isActive" class="form-label"> Branch is Active </label>
                        </div>
                        <small class="text-gray-500 ml-6">Check this to make the branch active immediately</small>
                    </div>

                    <!-- Form Actions -->
                    <Divider />

                    <div class="flex justify-end space-x-3 pt-4 form-actions">
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$router.push('/branches')" :disabled="isSubmitting" />
                        <Button label="Reset Form" icon="pi pi-refresh" class="p-button-outlined" @click="resetForm" :disabled="isSubmitting" />
                        <Button type="submit" label="Create Branch" icon="pi pi-check" class="p-button-success" :loading="isSubmitting" />
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
    address: '',
    phone: '',
    city: '',
    manager_name: '',
    opening_hours: '',
    email: '',
    is_active: true
});

// Validation function
const validateForm = () => {
    errors.value = {};
    let isValid = true;

    if (!form.name.trim()) {
        errors.value.name = 'Branch name is required';
        isValid = false;
    } else if (form.name.trim().length < 2) {
        errors.value.name = 'Branch name must be at least 2 characters';
        isValid = false;
    }

    if (!form.address.trim()) {
        errors.value.address = 'Address is required';
        isValid = false;
    } else if (form.address.trim().length < 10) {
        errors.value.address = 'Address must be at least 10 characters';
        isValid = false;
    }

    if (form.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.value.phone = 'Please enter a valid phone number';
        isValid = false;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.value.email = 'Please enter a valid email address';
        isValid = false;
    }

    return isValid;
};

// Create branch function
const createBranch = async () => {
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
        const restaurant_id = localStorage.getItem('restaurant_id');
        // Prepare the data to send
        const branchData = {
            restaurant: restaurant_id,
            city: form.city.trim() || null,
            branch_name: form.name.trim(),
            address: form.address.trim(),
            phone: form.phone.trim() || null,
            manager_name: form.manager_name.trim() || null,
            opening_hours: form.opening_hours.trim() || null,
            email: form.email.trim() || null,
            is_active: form.is_active
        };

        const response = await fetch('http://localhost:8000/branches/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${userId}`
            },
            body: JSON.stringify(branchData)
        });

        const data = await response.json();

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `Branch "${form.name}" created successfully!`,
                life: 5000
            });

            // Reset form
            resetForm();

            // Navigate back to branch list after a short delay
            setTimeout(() => {
                router.push('/branches');
            }, 1500);
        } else {
            // Handle validation errors from backend
            if (data.errors || data.error) {
                const errorMessage = data.errors ? Object.values(data.errors).flat().join(', ') : data.error;
                throw new Error(errorMessage);
            } else {
                throw new Error(data.message || 'Failed to create branch');
            }
        }
    } catch (error) {
        console.error('Error creating branch:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to create branch',
            life: 5000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form function
const resetForm = () => {
    form.name = '';
    form.address = '';
    form.phone = '';
    form.manager_name = '';
    form.opening_hours = '';
    form.email = '';
    form.is_active = true;
    errors.value = {};
};
</script>

<style scoped>
.branch-form-card {
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
.p-textarea {
    transition: all 0.2s ease-in-out;
}

.p-inputtext:focus,
.p-textarea:focus {
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
    .branch-form-card {
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
