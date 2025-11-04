<template>
    <div class="p-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">🏢 Branch Details</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">View and manage branch information</p>
            </div>
            <div class="flex gap-2">
                <Button label="Back to List" icon="pi pi-arrow-left" class="p-button-outlined" @click="$router.push('/branches')" />
                <Button label="Edit Branch" icon="pi pi-pencil" class="p-button-warning" @click="toggleEditMode" v-if="!isEditing" />
                <Button label="Delete Branch" icon="pi pi-trash" class="p-button-danger" @click="confirmDelete" v-if="!isEditing" />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading branch details...</p>
        </div>

        <!-- Branch Details Card -->
        <Card v-else-if="branch" class="branch-details-card">
            <template #header>
                <div class="bg-primary-50 dark:bg-primary-900 p-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-2xl font-semibold text-primary-700 dark:text-primary-300 mb-2">
                                <span v-if="!isEditing">{{ branch.branch_name }}</span>
                                <InputText v-else v-model="editForm.branch_name" class="text-2xl font-semibold bg-transparent border-b-2 border-primary-500" :class="{ 'p-invalid': errors.branch_name }" />
                            </h3>
                            <p class="text-primary-600 dark:text-primary-400">{{ branch.restaurant_name }}</p>
                        </div>
                        <Badge
                            :value="isEditing ? (editForm.is_active ? 'Active' : 'Inactive') : branch.is_active ? 'Active' : 'Inactive'"
                            :severity="(isEditing ? editForm.is_active : branch.is_active) ? 'success' : 'danger'"
                            class="text-lg px-3 py-1"
                        />
                    </div>
                </div>
            </template>

            <template #content>
                <div v-if="isEditing" class="mb-6">
                    <!-- Edit Mode Actions -->
                    <div class="flex justify-end gap-2 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelEdit" />
                        <Button label="Save Changes" icon="pi pi-check" class="p-button-success" @click="saveBranch" :loading="isSaving" />
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                <!-- Branch ID -->
                                <div class="detail-item">
                                    <label class="detail-label">Branch ID</label>
                                    <span class="detail-value font-mono text-sm">{{ branch.id }}</span>
                                </div>

                                <!-- Branch Name -->
                                <div class="detail-item">
                                    <label class="detail-label">Branch Name</label>
                                    <span v-if="!isEditing" class="detail-value">{{ branch.branch_name }}</span>
                                    <div v-else class="detail-edit">
                                        <InputText v-model="editForm.branch_name" class="w-full" :class="{ 'p-invalid': errors.branch_name }" />
                                        <small v-if="errors.branch_name" class="p-error">{{ errors.branch_name }}</small>
                                    </div>
                                </div>

                                <!-- Address -->
                                <div class="detail-item">
                                    <label class="detail-label">Address</label>
                                    <span v-if="!isEditing" class="detail-value">{{ branch.address || 'Not provided' }}</span>
                                    <div v-else class="detail-edit">
                                        <Textarea v-model="editForm.address" class="w-full" rows="3" :class="{ 'p-invalid': errors.address }" />
                                        <small v-if="errors.address" class="p-error">{{ errors.address }}</small>
                                    </div>
                                </div>

                                <!-- Status -->
                                <div class="detail-item">
                                    <label class="detail-label">Status</label>
                                    <div v-if="!isEditing" class="detail-value">
                                        <Badge :value="branch.is_active ? 'Active' : 'Inactive'" :severity="branch.is_active ? 'success' : 'danger'" />
                                    </div>
                                    <div v-else class="detail-edit">
                                        <div class="flex items-center space-x-3">
                                            <Checkbox v-model="editForm.is_active" :binary="true" />
                                            <label>Active</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Contact Information -->
                    <Card class="info-section">
                        <template #header>
                            <div class="p-4 border-b">
                                <h4 class="text-lg font-semibold flex items-center">
                                    <i class="pi pi-phone mr-2"></i>
                                    Contact Information
                                </h4>
                            </div>
                        </template>
                        <template #content>
                            <div class="space-y-4">
                                <!-- Phone -->
                                <div class="detail-item">
                                    <label class="detail-label">Phone Number</label>
                                    <span v-if="!isEditing" class="detail-value">{{ branch.phone || 'Not provided' }}</span>
                                    <div v-else class="detail-edit">
                                        <InputText v-model="editForm.phone" class="w-full" :class="{ 'p-invalid': errors.phone }" />
                                        <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                                    </div>
                                </div>

                                <!-- Email -->
                                <div class="detail-item">
                                    <label class="detail-label">Email Address</label>
                                    <span v-if="!isEditing" class="detail-value">{{ branch.email || 'Not provided' }}</span>
                                    <div v-else class="detail-edit">
                                        <InputText v-model="editForm.email" class="w-full" type="email" :class="{ 'p-invalid': errors.email }" />
                                        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                                    </div>
                                </div>

                                <!-- Manager -->
                                <div class="detail-item">
                                    <label class="detail-label">Manager Name</label>
                                    <span v-if="!isEditing" class="detail-value">{{ branch.manager_name || 'Not assigned' }}</span>
                                    <div v-else class="detail-edit">
                                        <InputText v-model="editForm.manager_name" class="w-full" />
                                    </div>
                                </div>

                                <!-- Opening Hours -->
                                <div class="detail-item">
                                    <label class="detail-label">Opening Hours</label>
                                    <span v-if="!isEditing" class="detail-value">{{ branch.opening_hours || 'Not specified' }}</span>
                                    <div v-else class="detail-edit">
                                        <InputText v-model="editForm.opening_hours" class="w-full" placeholder="e.g., 9:00 AM - 10:00 PM" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Timestamps -->
                <Card class="mt-6 info-section">
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
                                <span class="detail-value">{{ formatDate(branch.created_at) }}</span>
                            </div>
                            <div class="detail-item">
                                <label class="detail-label">Last Updated</label>
                                <span class="detail-value">{{ formatDate(branch.updated_at) }}</span>
                            </div>
                        </div>
                    </template>
                </Card>
            </template>
        </Card>

        <!-- Error State -->
        <Card v-else class="text-center py-16">
            <template #content>
                <div class="space-y-4">
                    <i class="pi pi-exclamation-triangle text-6xl text-red-400"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Branch Not Found</h3>
                    <p class="text-gray-500">The requested branch could not be found.</p>
                    <Button label="Back to Branches" icon="pi pi-arrow-left" @click="$router.push('/branches')" />
                </div>
            </template>
        </Card>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true" class="p-fluid">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Are you sure?</h3>
                <p class="text-gray-600">
                    Do you want to delete the branch "<strong>{{ branch?.branch_name }}</strong
                    >"? This action cannot be undone.
                </p>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
                <Button label="Delete" icon="pi pi-check" class="p-button-danger" @click="deleteBranch" :loading="isDeleting" />
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
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const branch = ref(null);
const isLoading = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const showDeleteDialog = ref(false);
const errors = ref({});

// Edit form
const editForm = reactive({
    branch_name: '',
    address: '',
    phone: '',
    email: '',
    manager_name: '',
    opening_hours: '',
    is_active: true
});

// Fetch branch details
const fetchBranch = async () => {
    isLoading.value = true;
    try {
        const userId = localStorage.getItem('token');
        if (!userId) {
            throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/branches/${route.params.id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userId}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            branch.value = data;
            populateEditForm();
        } else {
            throw new Error('Failed to fetch branch details');
        }
    } catch (error) {
        console.error('Error fetching branch:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch branch details',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Populate edit form with current data
const populateEditForm = () => {
    if (branch.value) {
        editForm.branch_name = branch.value.branch_name || '';
        editForm.address = branch.value.address || '';
        editForm.phone = branch.value.phone || '';
        editForm.email = branch.value.email || '';
        editForm.manager_name = branch.value.manager_name || '';
        editForm.opening_hours = branch.value.opening_hours || '';
        editForm.is_active = branch.value.is_active;
    }
};

// Toggle edit mode
const toggleEditMode = () => {
    isEditing.value = true;
    populateEditForm();
};

// Cancel edit
const cancelEdit = () => {
    isEditing.value = false;
    errors.value = {};
    populateEditForm();
};

// Validate form
const validateForm = () => {
    errors.value = {};
    let isValid = true;

    if (!editForm.branch_name.trim()) {
        errors.value.branch_name = 'Branch name is required';
        isValid = false;
    }

    if (!editForm.address.trim()) {
        errors.value.address = 'Address is required';
        isValid = false;
    }

    if (editForm.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(editForm.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.value.phone = 'Please enter a valid phone number';
        isValid = false;
    }

    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
        errors.value.email = 'Please enter a valid email address';
        isValid = false;
    }

    return isValid;
};

// Save branch
const saveBranch = async () => {
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
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/branches/${route.params.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userId}`
            },
            body: JSON.stringify(editForm)
        });

        if (response.ok) {
            const data = await response.json();
            branch.value = data;
            isEditing.value = false;
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Branch updated successfully',
                life: 3000
            });
        } else {
            throw new Error('Failed to update branch');
        }
    } catch (error) {
        console.error('Error updating branch:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update branch',
            life: 3000
        });
    } finally {
        isSaving.value = false;
    }
};

// Confirm delete
const confirmDelete = () => {
    showDeleteDialog.value = true;
};

// Delete branch
const deleteBranch = async () => {
    isDeleting.value = true;
    try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/branches/${route.params.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userId}`
            }
        });

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Branch deleted successfully',
                life: 3000
            });
            router.push('/branches');
        } else {
            throw new Error('Failed to delete branch');
        }
    } catch (error) {
        console.error('Error deleting branch:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete branch',
            life: 3000
        });
    } finally {
        isDeleting.value = false;
        showDeleteDialog.value = false;
    }
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
};

// Initialize
onMounted(() => {
    fetchBranch();
});
</script>

<style scoped>
.branch-details-card {
    background: var(--surface-card);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

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
}
</style>
