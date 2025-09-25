<script setup>
import { ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { useConfirm } from 'primevue/useconfirm';

const adminStore = useAdminStore();
const confirm = useConfirm();

// Component state
const activeTab = ref(0);
const loading = ref(false);
const showUserDialog = ref(false);
const showRoleDialog = ref(false);
const editingUser = ref(null);
const editingRole = ref(null);

// Form data
const userForm = ref({
    username: '',
    email: '',
    name: '',
    role: '',
    password: '',
    permissions: []
});

const roleForm = ref({
    id: '',
    name: '',
    description: '',
    color: '#3B82F6',
    permissions: []
});

// Computed properties
const filteredUsers = computed(() => {
    return adminStore.users;
});

const roleOptions = computed(() => {
    return adminStore.roles.map((role) => ({
        label: role.name,
        value: role.id
    }));
});

// Methods
const openUserDialog = (user = null) => {
    if (user) {
        editingUser.value = user;
        userForm.value = { ...user, password: '' };
    } else {
        editingUser.value = null;
        userForm.value = {
            username: '',
            email: '',
            name: '',
            role: '',
            password: '',
            permissions: []
        };
    }
    showUserDialog.value = true;
};

const saveUser = async () => {
    try {
        loading.value = true;

        if (editingUser.value) {
            await adminStore.updateUser(editingUser.value.id, userForm.value);
        } else {
            await adminStore.createUser(userForm.value);
        }

        showUserDialog.value = false;
        editingUser.value = null;
    } catch (error) {
        console.error('Error saving user:', error);
    } finally {
        loading.value = false;
    }
};

const confirmDeleteUser = (user) => {
    confirm.require({
        message: `Are you sure you want to delete "${user.name}"?`,
        header: 'Delete User',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await adminStore.deleteUser(user.id);
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    });
};

const openRoleDialog = (role = null) => {
    if (role) {
        editingRole.value = role;
        roleForm.value = { ...role };
    } else {
        editingRole.value = null;
        roleForm.value = {
            id: '',
            name: '',
            description: '',
            color: '#3B82F6',
            permissions: []
        };
    }
    showRoleDialog.value = true;
};

const saveRole = async () => {
    try {
        loading.value = true;
        await adminStore.createRole(roleForm.value);
        showRoleDialog.value = false;
        editingRole.value = null;
    } catch (error) {
        console.error('Error saving role:', error);
    } finally {
        loading.value = false;
    }
};

const updateSettings = async (section, settings) => {
    try {
        loading.value = true;
        await adminStore.updateSettings(section, settings);
    } catch (error) {
        console.error('Error updating settings:', error);
    } finally {
        loading.value = false;
    }
};

const performBackup = async () => {
    try {
        loading.value = true;
        await adminStore.performBackup();
    } catch (error) {
        console.error('Error performing backup:', error);
    } finally {
        loading.value = false;
    }
};

const exportLogs = () => {
    adminStore.exportAuditLogs('csv');
};

const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusSeverity = (status) => {
    const severities = {
        active: 'success',
        inactive: 'warning',
        suspended: 'danger'
    };
    return severities[status] || 'secondary';
};

const getServiceStatusSeverity = (status) => {
    const severities = {
        healthy: 'success',
        warning: 'warning',
        error: 'danger'
    };
    return severities[status] || 'secondary';
};
</script>

<template>
    <div class="admin-settings">
        <!-- Header -->
        <div class="admin-header">
            <div>
                <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Admin Settings</h1>
                <p class="text-surface-600 dark:text-surface-400">Manage users, system settings, and restaurant configuration</p>
            </div>
            <div class="flex gap-3">
                <Button label="System Backup" icon="pi pi-download" :loading="loading" @click="performBackup" outlined />
                <Button label="Export Logs" icon="pi pi-file-export" @click="exportLogs" outlined />
            </div>
        </div>

        <!-- Tab Navigation -->
        <TabView v-model="activeTab" class="admin-tabs">
            <!-- Users & Roles Tab -->
            <TabPanel header="Users & Roles">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Users Management -->
                    <div class="lg:col-span-2">
                        <Card>
                            <template #title>
                                <div class="flex justify-between items-center">
                                    <span>System Users</span>
                                    <Button label="Add User" icon="pi pi-plus" @click="openUserDialog()" size="small" />
                                </div>
                            </template>
                            <template #content>
                                <DataTable :value="filteredUsers" :rows="10" class="users-table">
                                    <Column field="name" header="Name" sortable>
                                        <template #body="{ data }">
                                            <div class="flex items-center gap-3">
                                                <Avatar
                                                    :label="
                                                        data.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                    "
                                                    class="mr-2"
                                                    size="normal"
                                                    style="background-color: #dee9fc; color: #1565c0"
                                                />
                                                <div>
                                                    <div class="font-semibold">{{ data.name }}</div>
                                                    <div class="text-sm text-surface-600">{{ data.username }}</div>
                                                </div>
                                            </div>
                                        </template>
                                    </Column>

                                    <Column field="email" header="Email" sortable />

                                    <Column field="role" header="Role" sortable>
                                        <template #body="{ data }">
                                            <Tag :value="adminStore.getRoleById(data.role)?.name || data.role" :style="{ backgroundColor: adminStore.getRoleById(data.role)?.color }" class="text-white" />
                                        </template>
                                    </Column>

                                    <Column field="status" header="Status" sortable>
                                        <template #body="{ data }">
                                            <Tag :value="data.status" :severity="getStatusSeverity(data.status)" class="capitalize" />
                                        </template>
                                    </Column>

                                    <Column field="lastLogin" header="Last Login" sortable>
                                        <template #body="{ data }">
                                            {{ formatDate(data.lastLogin) }}
                                        </template>
                                    </Column>

                                    <Column header="Actions" class="w-32">
                                        <template #body="{ data }">
                                            <div class="flex gap-1">
                                                <Button icon="pi pi-pencil" size="small" text @click="openUserDialog(data)" />
                                                <Button icon="pi pi-trash" size="small" text severity="danger" @click="confirmDeleteUser(data)" :disabled="data.role === 'admin'" />
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </template>
                        </Card>
                    </div>

                    <!-- Roles Management -->
                    <div>
                        <Card>
                            <template #title>
                                <div class="flex justify-between items-center">
                                    <span>Roles</span>
                                    <Button label="Add Role" icon="pi pi-plus" @click="openRoleDialog()" size="small" />
                                </div>
                            </template>
                            <template #content>
                                <div class="space-y-4">
                                    <div v-for="role in adminStore.roles" :key="role.id" class="role-card" :style="{ borderColor: role.color }">
                                        <div class="flex items-start justify-between">
                                            <div>
                                                <h4 class="font-semibold">{{ role.name }}</h4>
                                                <p class="text-sm text-surface-600">{{ role.description }}</p>
                                                <div class="mt-2">
                                                    <span class="text-xs text-surface-500"> {{ role.userCount }} users </span>
                                                </div>
                                            </div>
                                            <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: role.color }"></div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </TabPanel>

            <!-- Restaurant Settings Tab -->
            <TabPanel header="Restaurant Settings">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- General Settings -->
                    <Card>
                        <template #title>General Information</template>
                        <template #content>
                            <div class="space-y-4">
                                <div>
                                    <label class="form-label">Restaurant Name</label>
                                    <InputText v-model="adminStore.restaurantSettings.general.name" class="w-full" @blur="updateSettings('general', { name: adminStore.restaurantSettings.general.name })" />
                                </div>

                                <div>
                                    <label class="form-label">Address</label>
                                    <Textarea v-model="adminStore.restaurantSettings.general.address" class="w-full" rows="3" @blur="updateSettings('general', { address: adminStore.restaurantSettings.general.address })" />
                                </div>

                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="form-label">Phone</label>
                                        <InputText v-model="adminStore.restaurantSettings.general.phone" class="w-full" @blur="updateSettings('general', { phone: adminStore.restaurantSettings.general.phone })" />
                                    </div>
                                    <div>
                                        <label class="form-label">Email</label>
                                        <InputText v-model="adminStore.restaurantSettings.general.email" class="w-full" @blur="updateSettings('general', { email: adminStore.restaurantSettings.general.email })" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Operations Settings -->
                    <Card>
                        <template #title>Operations</template>
                        <template #content>
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="form-label">Opening Time</label>
                                        <InputText
                                            v-model="adminStore.restaurantSettings.operations.openingTime"
                                            type="time"
                                            class="w-full"
                                            @blur="updateSettings('operations', { openingTime: adminStore.restaurantSettings.operations.openingTime })"
                                        />
                                    </div>
                                    <div>
                                        <label class="form-label">Closing Time</label>
                                        <InputText
                                            v-model="adminStore.restaurantSettings.operations.closingTime"
                                            type="time"
                                            class="w-full"
                                            @blur="updateSettings('operations', { closingTime: adminStore.restaurantSettings.operations.closingTime })"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label class="form-label">Order Timeout (minutes)</label>
                                    <InputNumber
                                        v-model="adminStore.restaurantSettings.operations.orderTimeout"
                                        class="w-full"
                                        :min="5"
                                        :max="120"
                                        @blur="updateSettings('operations', { orderTimeout: adminStore.restaurantSettings.operations.orderTimeout })"
                                    />
                                </div>

                                <div class="flex items-center gap-3">
                                    <Checkbox v-model="adminStore.restaurantSettings.operations.autoAcceptOrders" binary @change="updateSettings('operations', { autoAcceptOrders: adminStore.restaurantSettings.operations.autoAcceptOrders })" />
                                    <label>Auto-accept orders</label>
                                </div>

                                <div class="flex items-center gap-3">
                                    <Checkbox
                                        v-model="adminStore.restaurantSettings.operations.kitchenPrintEnabled"
                                        binary
                                        @change="updateSettings('operations', { kitchenPrintEnabled: adminStore.restaurantSettings.operations.kitchenPrintEnabled })"
                                    />
                                    <label>Enable kitchen printing</label>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Payment Settings -->
                    <Card>
                        <template #title>Payment Settings</template>
                        <template #content>
                            <div class="space-y-4">
                                <div>
                                    <label class="form-label">Tax Rate (%)</label>
                                    <InputNumber
                                        v-model="adminStore.restaurantSettings.payment.taxRate"
                                        class="w-full"
                                        :minFractionDigits="2"
                                        :maxFractionDigits="2"
                                        @blur="updateSettings('payment', { taxRate: adminStore.restaurantSettings.payment.taxRate })"
                                    />
                                </div>

                                <div>
                                    <label class="form-label">Minimum Order Amount</label>
                                    <InputNumber
                                        v-model="adminStore.restaurantSettings.payment.minimumOrderAmount"
                                        mode="currency"
                                        currency="USD"
                                        class="w-full"
                                        @blur="updateSettings('payment', { minimumOrderAmount: adminStore.restaurantSettings.payment.minimumOrderAmount })"
                                    />
                                </div>

                                <div class="flex items-center gap-3">
                                    <Checkbox v-model="adminStore.restaurantSettings.payment.serviceChargeEnabled" binary @change="updateSettings('payment', { serviceChargeEnabled: adminStore.restaurantSettings.payment.serviceChargeEnabled })" />
                                    <label>Enable service charge</label>
                                </div>

                                <div class="flex items-center gap-3">
                                    <Checkbox v-model="adminStore.restaurantSettings.payment.enableSplitBills" binary @change="updateSettings('payment', { enableSplitBills: adminStore.restaurantSettings.payment.enableSplitBills })" />
                                    <label>Enable split bills</label>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Security Settings -->
                    <Card>
                        <template #title>Security Settings</template>
                        <template #content>
                            <div class="space-y-4">
                                <div>
                                    <label class="form-label">Session Timeout (minutes)</label>
                                    <InputNumber
                                        v-model="adminStore.restaurantSettings.security.sessionTimeout"
                                        class="w-full"
                                        :min="5"
                                        :max="480"
                                        @blur="updateSettings('security', { sessionTimeout: adminStore.restaurantSettings.security.sessionTimeout })"
                                    />
                                </div>

                                <div>
                                    <label class="form-label">Max Login Attempts</label>
                                    <InputNumber
                                        v-model="adminStore.restaurantSettings.security.maxLoginAttempts"
                                        class="w-full"
                                        :min="3"
                                        :max="10"
                                        @blur="updateSettings('security', { maxLoginAttempts: adminStore.restaurantSettings.security.maxLoginAttempts })"
                                    />
                                </div>

                                <div class="flex items-center gap-3">
                                    <Checkbox v-model="adminStore.restaurantSettings.security.requireTwoFactor" binary @change="updateSettings('security', { requireTwoFactor: adminStore.restaurantSettings.security.requireTwoFactor })" />
                                    <label>Require two-factor authentication</label>
                                </div>

                                <div class="flex items-center gap-3">
                                    <Checkbox v-model="adminStore.restaurantSettings.security.auditLogEnabled" binary @change="updateSettings('security', { auditLogEnabled: adminStore.restaurantSettings.security.auditLogEnabled })" />
                                    <label>Enable audit logging</label>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </TabPanel>

            <!-- System Status Tab -->
            <TabPanel header="System Status">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- System Overview -->
                    <Card>
                        <template #title>System Overview</template>
                        <template #content>
                            <div class="space-y-4">
                                <div class="flex justify-between">
                                    <span>Uptime</span>
                                    <Badge :value="adminStore.systemStatus.uptime" severity="success" />
                                </div>
                                <div class="flex justify-between">
                                    <span>Active Users</span>
                                    <span class="font-semibold">{{ adminStore.systemStatus.activeUsers }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>System Load</span>
                                    <Badge :value="adminStore.systemStatus.systemLoad" severity="info" />
                                </div>
                                <div class="flex justify-between">
                                    <span>Last Backup</span>
                                    <span class="text-sm">{{ formatDate(adminStore.systemStatus.lastBackup) }}</span>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Resource Usage -->
                    <Card>
                        <template #title>Resource Usage</template>
                        <template #content>
                            <div class="space-y-4">
                                <div>
                                    <div class="flex justify-between mb-2">
                                        <span>Memory Usage</span>
                                        <span>{{ adminStore.systemStatus.memoryUsage }}%</span>
                                    </div>
                                    <ProgressBar :value="adminStore.systemStatus.memoryUsage" />
                                </div>

                                <div>
                                    <div class="flex justify-between mb-2">
                                        <span>Disk Space</span>
                                        <span>{{ adminStore.systemStatus.diskSpace }}%</span>
                                    </div>
                                    <ProgressBar :value="adminStore.systemStatus.diskSpace" />
                                </div>

                                <div class="flex justify-between">
                                    <span>Database Size</span>
                                    <span>{{ adminStore.systemStatus.databaseSize }}</span>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Service Status -->
                    <Card>
                        <template #title>Service Status</template>
                        <template #content>
                            <div class="space-y-3">
                                <div v-for="(status, service) in adminStore.systemStatus.services" :key="service" class="flex justify-between items-center">
                                    <span class="capitalize">{{ service.replace('_', ' ') }}</span>
                                    <Tag :value="status" :severity="getServiceStatusSeverity(status)" class="capitalize" />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </TabPanel>

            <!-- Integrations Tab -->
            <TabPanel header="Integrations">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card v-for="(integration, key) in adminStore.integrations" :key="key" class="integration-card">
                        <template #title>
                            <div class="flex justify-between items-center">
                                <span class="capitalize">{{ key.replace('_', ' ') }}</span>
                                <ToggleButton v-model="integration.enabled" @change="adminStore.updateIntegration(key, { enabled: integration.enabled })" />
                            </div>
                        </template>
                        <template #content>
                            <div class="space-y-3">
                                <div v-if="integration.provider">
                                    <span class="text-sm text-surface-600">Provider: {{ integration.provider }}</span>
                                </div>

                                <div v-if="integration.enabled" class="integration-config">
                                    <!-- Integration-specific configuration would go here -->
                                    <p class="text-sm text-surface-500">Configuration options for {{ key }} integration</p>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </TabPanel>

            <!-- Audit Logs Tab -->
            <TabPanel header="Audit Logs">
                <Card>
                    <template #title>
                        <div class="flex justify-between items-center">
                            <span>System Audit Logs</span>
                            <Button label="Export Logs" icon="pi pi-download" @click="exportLogs" size="small" />
                        </div>
                    </template>
                    <template #content>
                        <DataTable :value="adminStore.auditLogs" :rows="20" paginator class="audit-table">
                            <Column field="timestamp" header="Timestamp" sortable>
                                <template #body="{ data }">
                                    {{ formatDate(data.timestamp) }}
                                </template>
                            </Column>

                            <Column field="userId" header="User" sortable>
                                <template #body="{ data }">
                                    {{ adminStore.getUserById(data.userId)?.name || 'System' }}
                                </template>
                            </Column>

                            <Column field="action" header="Action" sortable>
                                <template #body="{ data }">
                                    <Tag :value="data.action.replace('_', ' ')" class="capitalize" />
                                </template>
                            </Column>

                            <Column field="description" header="Description" />

                            <Column field="ipAddress" header="IP Address" />
                        </DataTable>
                    </template>
                </Card>
            </TabPanel>
        </TabView>

        <!-- User Dialog -->
        <Dialog :visible="showUserDialog" @update:visible="showUserDialog = $event" header="User Management" modal class="w-full max-w-2xl">
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="form-label">Full Name</label>
                        <InputText v-model="userForm.name" class="w-full" />
                    </div>
                    <div>
                        <label class="form-label">Username</label>
                        <InputText v-model="userForm.username" class="w-full" />
                    </div>
                </div>

                <div>
                    <label class="form-label">Email</label>
                    <InputText v-model="userForm.email" type="email" class="w-full" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="form-label">Role</label>
                        <Dropdown v-model="userForm.role" :options="roleOptions" optionLabel="label" optionValue="value" class="w-full" />
                    </div>
                    <div>
                        <label class="form-label">Password</label>
                        <Password v-model="userForm.password" class="w-full" toggleMask />
                    </div>
                </div>

                <div class="flex justify-end gap-3">
                    <Button label="Cancel" outlined @click="showUserDialog = false" />
                    <Button label="Save User" @click="saveUser" :loading="loading" />
                </div>
            </div>
        </Dialog>

        <!-- Role Dialog -->
        <Dialog :visible="showRoleDialog" @update:visible="showRoleDialog = $event" header="Role Management" modal class="w-full max-w-lg">
            <div class="space-y-4">
                <div>
                    <label class="form-label">Role Name</label>
                    <InputText v-model="roleForm.name" class="w-full" />
                </div>

                <div>
                    <label class="form-label">Description</label>
                    <Textarea v-model="roleForm.description" class="w-full" rows="3" />
                </div>

                <div class="flex justify-end gap-3">
                    <Button label="Cancel" outlined @click="showRoleDialog = false" />
                    <Button label="Save Role" @click="saveRole" :loading="loading" />
                </div>
            </div>
        </Dialog>

        <!-- Confirmation Dialogs -->
        <ConfirmDialog />
    </div>
</template>

<style scoped>
.admin-settings {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.admin-tabs {
    margin-top: 1rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-color);
}

.role-card {
    padding: 1rem;
    border: 2px solid;
    border-radius: 0.5rem;
    background: var(--surface-0);
    transition: transform 0.2s ease;
}

.role-card:hover {
    transform: translateY(-1px);
}

.integration-card {
    transition: transform 0.2s ease;
}

.integration-card:hover {
    transform: translateY(-2px);
}

.integration-config {
    padding: 1rem;
    background: var(--surface-50);
    border-radius: 0.5rem;
    border: 1px solid var(--surface-200);
}

.users-table,
.audit-table {
    margin: -1rem;
}

/* Dark mode adjustments */
.dark .role-card {
    background: var(--surface-800);
}

.dark .integration-config {
    background: var(--surface-700);
    border-color: var(--surface-600);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .admin-settings {
        padding: 1rem;
    }

    .admin-header {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
