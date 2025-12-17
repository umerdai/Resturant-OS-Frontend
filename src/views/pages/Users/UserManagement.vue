<script setup>
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();

// State
const users = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const selectedRole = ref(null);
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedUser = ref(null);
const isSubmitting = ref(false);

// Form data for add/edit
const formData = ref({
    full_name: '',
    email: '',
    password: '',
    role: 'staff'
});

// Role options
const roleOptions = [
    { label: 'All Roles', value: null },
    { label: 'Owner', value: 'owner' },
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Staff', value: 'staff' },
    { label: 'Cashier', value: 'cashier' },
    { label: 'Chef', value: 'chef' },
    { label: 'Waiter', value: 'waiter' }
];

const createRoleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Staff', value: 'staff' },
    { label: 'Cashier', value: 'cashier' },
    { label: 'Chef', value: 'chef' },
    { label: 'Waiter', value: 'waiter' }
];

// Fetch users from API
const fetchUsers = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        let url = 'http://localhost:8000/users/';
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
            users.value = data.results || data;
        } else {
            throw new Error('Failed to fetch users');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch users',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Filtered users
const filteredUsers = computed(() => {
    return users.value.filter((user) => {
        const matchesSearch = searchQuery.value
            ? user.full_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
            : true;
        const matchesRole = selectedRole.value ? user.role === selectedRole.value : true;

        return matchesSearch && matchesRole;
    });
});

// Get role badge severity
const getRoleSeverity = (role) => {
    switch (role) {
        case 'owner':
            return 'danger';
        case 'admin':
            return 'warning';
        case 'manager':
            return 'info';
        default:
            return 'success';
    }
};

// Open add dialog
const openAddDialog = () => {
    formData.value = {
        full_name: '',
        email: '',
        password: '',
        role: 'staff'
    };
    showAddDialog.value = true;
};

// Open edit dialog
const openEditDialog = (user) => {
    selectedUser.value = user;
    formData.value = {
        full_name: user.full_name || '',
        email: user.email,
        password: '', // Don't populate password for security
        role: user.role
    };
    showEditDialog.value = true;
};

// Add user
const addUser = async () => {
    isSubmitting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const userData = {
            full_name: formData.value.full_name,
            email: formData.value.email,
            password: formData.value.password,
            role: formData.value.role
        };

        const response = await fetch('http://localhost:8000/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'User created successfully',
                life: 3000
            });
            showAddDialog.value = false;
            await fetchUsers();
        } else {
            const error = await response.json();
            throw new Error(error.detail || error.message || 'Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to create user',
            life: 3000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Update user
const updateUser = async () => {
    isSubmitting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const userData = {
            full_name: formData.value.full_name,
            email: formData.value.email,
            role: formData.value.role
        };

        // Only include password if it's provided
        if (formData.value.password) {
            userData.password = formData.value.password;
        }

        const response = await fetch(`http://localhost:8000/users/${selectedUser.value.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'User updated successfully',
                life: 3000
            });
            showEditDialog.value = false;
            await fetchUsers();
        } else {
            const error = await response.json();
            throw new Error(error.detail || error.message || 'Failed to update user');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update user',
            life: 3000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Delete user
const confirmDelete = (user) => {
    selectedUser.value = user;
    showDeleteDialog.value = true;
};

const deleteUser = async () => {
    isSubmitting.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await fetch(`http://localhost:8000/users/${selectedUser.value.id}/`, {
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
                detail: 'User deleted successfully',
                life: 3000
            });
            showDeleteDialog.value = false;
            await fetchUsers();
        } else {
            const error = await response.json();
            throw new Error(error.detail || error.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete user',
            life: 3000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Clear filters
const clearFilters = () => {
    searchQuery.value = '';
    selectedRole.value = null;
};

// Initialize
onMounted(() => {
    fetchUsers();
});
</script>

<template>
    <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">👥 User Management</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Manage system users and their roles</p>
            </div>
            <div class="flex gap-2">
                <Button label="Add User" icon="pi pi-plus" class="p-button-success" @click="openAddDialog" />
                <Button label="Refresh" icon="pi pi-refresh" class="p-button-outlined" @click="fetchUsers" :loading="isLoading" />
            </div>
        </div>

        <!-- Search and Filters -->
        <Card class="mb-6">
            <template #content>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Search Users</label>
                        <InputText v-model="searchQuery" placeholder="Search by name or email..." class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Role</label>
                        <Dropdown v-model="selectedRole" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="All Roles" class="w-full" showClear />
                    </div>
                    <div class="flex items-end">
                        <Button label="Clear Filters" icon="pi pi-filter-slash" class="p-button-outlined w-full" @click="clearFilters" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading users...</p>
        </div>

        <!-- Users Table -->
        <Card v-else-if="filteredUsers.length > 0">
            <template #content>
                <DataTable :value="filteredUsers" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" responsiveLayout="scroll" class="p-datatable-sm">
                    <Column field="full_name" header="Full Name" :sortable="true" style="min-width: 200px">
                        <template #body="{ data }">
                            <div class="font-semibold">{{ data.full_name }}</div>
                        </template>
                    </Column>
                    <Column field="email" header="Email" :sortable="true" style="min-width: 250px" />
                    <Column field="role" header="Role" :sortable="true" style="min-width: 120px">
                        <template #body="{ data }">
                            <Badge :value="data.role.toUpperCase()" :severity="getRoleSeverity(data.role)" />
                        </template>
                    </Column>
                    <Column field="is_active" header="Status" style="min-width: 100px">
                        <template #body="{ data }">
                            <Badge :value="data.is_active ? 'Active' : 'Inactive'" :severity="data.is_active ? 'success' : 'danger'" />
                        </template>
                    </Column>
                    <Column header="Actions" style="min-width: 150px">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" class="p-button-sm p-button-info" @click="openEditDialog(data)" v-tooltip.top="'Edit'" />
                                <Button icon="pi pi-trash" class="p-button-sm p-button-danger" @click="confirmDelete(data)" v-tooltip.top="'Delete'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <!-- Empty State -->
        <Card v-else class="text-center py-16">
            <template #content>
                <div class="space-y-4">
                    <i class="pi pi-users text-6xl text-gray-400"></i>
                    <h3 class="text-xl font-semibold text-gray-600">No Users Found</h3>
                    <p class="text-gray-500">
                        {{ searchQuery || selectedRole ? 'No users match your filters' : 'Start by adding your first user' }}
                    </p>
                    <Button label="Add First User" icon="pi pi-plus" class="p-button-success" @click="openAddDialog" />
                </div>
            </template>
        </Card>

        <!-- Add User Dialog -->
        <Dialog v-model:visible="showAddDialog" :style="{ width: '600px' }" header="Add User" :modal="true" class="p-fluid">
            <div class="space-y-4 mt-4">
                <div>
                    <label for="full_name" class="block text-sm font-medium mb-2">Full Name <span class="text-red-500">*</span></label>
                    <InputText id="full_name" v-model="formData.full_name" placeholder="Enter full name" class="w-full" required />
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium mb-2">Email <span class="text-red-500">*</span></label>
                    <InputText id="email" v-model="formData.email" type="email" placeholder="Enter email" class="w-full" required />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium mb-2">Password <span class="text-red-500">*</span></label>
                    <Password id="password" v-model="formData.password" placeholder="Enter password" class="w-full" toggleMask required />
                </div>

                <div>
                    <label for="role" class="block text-sm font-medium mb-2">Role <span class="text-red-500">*</span></label>
                    <Dropdown id="role" v-model="formData.role" :options="createRoleOptions" optionLabel="label" optionValue="value" placeholder="Select role" class="w-full" required />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showAddDialog = false" />
                <Button label="Add User" icon="pi pi-check" @click="addUser" :loading="isSubmitting" />
            </template>
        </Dialog>

        <!-- Edit User Dialog -->
        <Dialog v-model:visible="showEditDialog" :style="{ width: '600px' }" header="Edit User" :modal="true" class="p-fluid">
            <div class="space-y-4 mt-4">
                <div>
                    <label for="edit_full_name" class="block text-sm font-medium mb-2">Full Name <span class="text-red-500">*</span></label>
                    <InputText id="edit_full_name" v-model="formData.full_name" placeholder="Enter full name" class="w-full" required />
                </div>

                <div>
                    <label for="edit_email" class="block text-sm font-medium mb-2">Email <span class="text-red-500">*</span></label>
                    <InputText id="edit_email" v-model="formData.email" type="email" placeholder="Enter email" class="w-full" required />
                </div>

                <div>
                    <label for="edit_password" class="block text-sm font-medium mb-2">Password <small class="text-gray-500">(leave blank to keep current)</small></label>
                    <Password id="edit_password" v-model="formData.password" placeholder="Enter new password" class="w-full" toggleMask />
                </div>

                <div>
                    <label for="edit_role" class="block text-sm font-medium mb-2">Role <span class="text-red-500">*</span></label>
                    <Dropdown id="edit_role" v-model="formData.role" :options="createRoleOptions" optionLabel="label" optionValue="value" placeholder="Select role" class="w-full" required />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" />
                <Button label="Update" icon="pi pi-check" @click="updateUser" :loading="isSubmitting" />
            </template>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Are you sure?</h3>
                <p class="text-gray-600">
                    Do you want to delete user "<strong>{{ selectedUser?.full_name }}</strong
                    >"? This action cannot be undone.
                </p>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
                <Button label="Delete" icon="pi pi-check" class="p-button-danger" @click="deleteUser" :loading="isSubmitting" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--primary-color);
    color: white;
}
</style>
