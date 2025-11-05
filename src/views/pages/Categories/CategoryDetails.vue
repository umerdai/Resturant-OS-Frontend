<template>
    <div class="p-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">🏷️ Category Details</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">View and manage category information</p>
            </div>
            <div class="flex gap-2">
                <Button label="Back to Categories" icon="pi pi-arrow-left" class="p-button-outlined" @click="$router.push('/category')" />
                <Button label="Edit Category" icon="pi pi-pencil" class="p-button-warning" @click="toggleEditMode" v-if="!isEditing" />
                <Button label="Delete Category" icon="pi pi-trash" class="p-button-danger" @click="confirmDelete" v-if="!isEditing" />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading category details...</p>
        </div>

        <!-- Category Details Card -->
        <Card v-else-if="category" class="category-details-card">
            <template #header>
                <div class="bg-primary-50 dark:bg-primary-900 p-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-2xl font-semibold text-primary-700 dark:text-primary-300 mb-2">
                                <span v-if="!isEditing">{{ category.name }}</span>
                                <InputText v-else v-model="editForm.name" class="text-2xl font-semibold bg-transparent border-b-2 border-primary-500" :class="{ 'p-invalid': errors.name }" />
                            </h3>
                            <p v-if="!isEditing" class="text-primary-600 dark:text-primary-400">
                                {{ category.description || 'No description available' }}
                            </p>
                            <Textarea v-else v-model="editForm.description" class="bg-transparent border border-primary-500 rounded text-primary-600" rows="2" placeholder="Enter description" />
                        </div>
                        <Badge
                            :value="isEditing ? (editForm.is_active ? 'Active' : 'Inactive') : category.is_active ? 'Active' : 'Inactive'"
                            :severity="(isEditing ? editForm.is_active : category.is_active) ? 'success' : 'danger'"
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
                        <Button label="Save Changes" icon="pi pi-check" class="p-button-success" @click="saveCategory" :loading="isSaving" />
                    </div>
                </div>

                <!-- Basic Information -->
                <Card class="info-section mb-6">
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
                            <!-- Category Name -->
                            <div class="detail-item">
                                <label class="detail-label">Category Name</label>
                                <span v-if="!isEditing" class="detail-value">{{ category.name }}</span>
                                <div v-else class="detail-edit">
                                    <InputText v-model="editForm.name" class="w-full" :class="{ 'p-invalid': errors.name }" />
                                    <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="detail-item">
                                <label class="detail-label">Description</label>
                                <span v-if="!isEditing" class="detail-value">{{ category.description || 'No description provided' }}</span>
                                <div v-else class="detail-edit">
                                    <Textarea v-model="editForm.description" class="w-full" rows="3" placeholder="Enter category description" />
                                </div>
                            </div>

                            <!-- Restaurant -->
                            <div v-if="category.restaurant_name" class="detail-item">
                                <label class="detail-label">Restaurant</label>
                                <span class="detail-value">{{ category.restaurant_name }}</span>
                            </div>

                            <!-- Status -->
                            <div class="detail-item">
                                <label class="detail-label">Status</label>
                                <div v-if="!isEditing" class="detail-value">
                                    <Badge :value="category.is_active ? 'Active' : 'Inactive'" :severity="category.is_active ? 'success' : 'danger'" />
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
                                <span class="detail-value">{{ formatDate(category.created_at) }}</span>
                            </div>
                            <div class="detail-item">
                                <label class="detail-label">Last Updated</label>
                                <span class="detail-value">{{ formatDate(category.updated_at) }}</span>
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
                    <h3 class="text-xl font-semibold text-gray-600">Category Not Found</h3>
                    <p class="text-gray-500">The requested category could not be found.</p>
                    <Button label="Back to Categories" icon="pi pi-arrow-left" @click="$router.push('/category')" />
                </div>
            </template>
        </Card>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true" class="p-fluid">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Are you sure?</h3>
                <p class="text-gray-600">
                    Do you want to delete the category "<strong>{{ category?.name }}</strong
                    >"? This action cannot be undone and may affect menu items using this category.
                </p>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
                <Button label="Delete" icon="pi pi-check" class="p-button-danger" @click="deleteCategory" :loading="isDeleting" />
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
const category = ref(null);
const isLoading = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const showDeleteDialog = ref(false);
const errors = ref({});

// Edit form
const editForm = reactive({
    name: '',
    description: '',
    is_active: true
});

// Fetch category details
const fetchCategory = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/categories/${route.params.id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            category.value = data;
            populateEditForm();
        } else {
            throw new Error('Failed to fetch category details');
        }
    } catch (error) {
        console.error('Error fetching category:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch category details',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Populate edit form with current data
const populateEditForm = () => {
    if (category.value) {
        editForm.name = category.value.name || '';
        editForm.description = category.value.description || '';
        editForm.is_active = Boolean(category.value.is_active);
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

    if (!editForm.name.trim()) {
        errors.value.name = 'Category name is required';
        isValid = false;
    }

    return isValid;
};

// Save category
const saveCategory = async () => {
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

        const response = await fetch(`http://localhost:8000/categories/${route.params.id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(editForm)
        });

        if (response.ok) {
            const data = await response.json();
            category.value = data;
            isEditing.value = false;
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Category updated successfully',
                life: 3000
            });
        } else {
            throw new Error('Failed to update category');
        }
    } catch (error) {
        console.error('Error updating category:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update category',
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

// Delete category
const deleteCategory = async () => {
    isDeleting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/categories/${route.params.id}/`, {
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
            router.push('/category');
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
    }
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
};

// Initialize
onMounted(() => {
    fetchCategory();
});
</script>

<style scoped>
.category-details-card {
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
