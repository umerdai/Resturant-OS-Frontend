<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStaffStore } from '@/stores/staff.js';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Dropdown from 'primevue/dropdown';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Toolbar from 'primevue/toolbar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Calendar from 'primevue/calendar';

const staffStore = useStaffStore();
const toast = useToast();

// Reactive data
const showLoginDialog = ref(false);
const showStaffDialog = ref(false);
const showShiftDialog = ref(false);
const selectedStaff = ref(null);
const activeTab = ref(0);

// Forms
const loginForm = ref({
    employeeId: '',
    password: '',
    pin: ''
});

const staffForm = ref({
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    department: 'service',
    employeeId: '',
    address: '',
    emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
    }
});

// Options
const roleOptions = computed(() =>
    Object.entries(staffStore.roles).map(([key, role]) => ({
        label: role.name,
        value: key
    }))
);

const departmentOptions = [
    { label: 'Management', value: 'management' },
    { label: 'Kitchen', value: 'kitchen' },
    { label: 'Service', value: 'service' },
    { label: 'Bar', value: 'bar' },
    { label: 'Host', value: 'host' }
];

// Computed properties
const staff = computed(() => staffStore.staff);
const activeStaff = computed(() => staffStore.activeStaff);
const currentUser = computed(() => staffStore.currentUser);
const currentShift = computed(() => staffStore.getCurrentShift);

// Methods
const openLoginDialog = () => {
    loginForm.value = { employeeId: '', password: '', pin: '' };
    showLoginDialog.value = true;
};

const login = async () => {
    const result = await staffStore.login(loginForm.value);
    if (result.success) {
        showLoginDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: result.message,
            life: 3000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: result.message,
            life: 3000
        });
    }
};

const logout = async () => {
    const result = await staffStore.logout();
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Logged Out',
            detail: result.message,
            life: 2000
        });
    }
};

const clockIn = async () => {
    if (!currentUser.value) return;

    const result = await staffStore.clockIn(currentUser.value.id);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Clocked In',
            detail: result.message,
            life: 2000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Clock In Failed',
            detail: result.message,
            life: 3000
        });
    }
};

const clockOut = async () => {
    if (!currentUser.value) return;

    const result = await staffStore.clockOut(currentUser.value.id);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Clocked Out',
            detail: result.message,
            life: 2000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Clock Out Failed',
            detail: result.message,
            life: 3000
        });
    }
};

const startBreak = async (type = 'break') => {
    if (!currentUser.value) return;

    const result = await staffStore.startBreak(currentUser.value.id, type);
    if (result.success) {
        toast.add({
            severity: 'info',
            summary: 'Break Started',
            detail: result.message,
            life: 2000
        });
    }
};

const endBreak = async () => {
    if (!currentUser.value) return;

    const result = await staffStore.endBreak(currentUser.value.id);
    if (result.success) {
        toast.add({
            severity: 'info',
            summary: 'Break Ended',
            detail: result.message,
            life: 2000
        });
    }
};

const openStaffDialog = (staff = null) => {
    if (staff) {
        staffForm.value = { ...staff };
        selectedStaff.value = staff;
    } else {
        staffForm.value = {
            name: '',
            email: '',
            phone: '',
            role: 'waiter',
            department: 'service',
            employeeId: '',
            address: '',
            emergencyContact: { name: '', phone: '', relationship: '' }
        };
        selectedStaff.value = null;
    }
    showStaffDialog.value = true;
};

const saveStaff = async () => {
    let result;
    if (selectedStaff.value) {
        result = await staffStore.updateStaff(selectedStaff.value.id, staffForm.value);
    } else {
        result = await staffStore.createStaff(staffForm.value);
    }

    if (result.success) {
        showStaffDialog.value = false;
        toast.add({
            severity: 'success',
            summary: selectedStaff.value ? 'Staff Updated' : 'Staff Created',
            detail: `Staff member ${selectedStaff.value ? 'updated' : 'created'} successfully`,
            life: 3000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message,
            life: 3000
        });
    }
};

const deactivateStaff = async (staffMember) => {
    const result = await staffStore.deactivateStaff(staffMember.id);
    if (result.success) {
        toast.add({
            severity: 'warning',
            summary: 'Staff Deactivated',
            detail: result.message,
            life: 3000
        });
    }
};

const getRoleColor = (role) => {
    const colors = {
        admin: 'danger',
        manager: 'warning',
        cashier: 'info',
        waiter: 'success',
        kitchen: 'secondary',
        bartender: 'info',
        host: 'secondary'
    };
    return colors[role] || 'secondary';
};

const getShiftStatus = (staff) => {
    if (!staff.currentShift) return 'Off Duty';

    switch (staff.currentShift.status) {
        case 'active':
            return 'On Duty';
        case 'on_break':
            return 'On Break';
        default:
            return 'Off Duty';
    }
};

const getShiftStatusColor = (staff) => {
    if (!staff.currentShift) return 'secondary';

    switch (staff.currentShift.status) {
        case 'active':
            return 'success';
        case 'on_break':
            return 'warning';
        default:
            return 'secondary';
    }
};

const formatShiftTime = (shift) => {
    if (!shift || !shift.clockInTime) return 'Not clocked in';

    const clockIn = new Date(shift.clockInTime);
    const now = new Date();
    const duration = (now - clockIn) / (1000 * 60 * 60); // Hours

    return `${duration.toFixed(1)} hours`;
};

// Lifecycle
onMounted(async () => {
    await staffStore.initializeStaff();
});
</script>

<template>
    <div class="staff-management p-6 staff-management-parent">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold ">Staff Management</h1>
                <p class="text-gray-600">Manage staff authentication, shifts, and performance</p>
            </div>

            <div class="flex gap-2">
                <Button v-if="!currentUser" label="Staff Login" icon="pi pi-sign-in" @click="openLoginDialog" />
                <Button v-if="currentUser" :label="currentUser.name" icon="pi pi-user" severity="secondary" @click="logout" />
                <Button v-if="staffStore.hasPermission('staff.manage')" label="Add Staff" icon="pi pi-plus" @click="openStaffDialog()" />
            </div>
        </div>

        <!-- Current User Panel -->
        <div v-if="currentUser" class="mb-6">
            <Card>
                <template #title>
                    <div class="flex items-center gap-3">
                        <Avatar :label="currentUser.name.charAt(0)" size="large" shape="circle" />
                        <div>
                            <div class="text-xl font-bold">{{ currentUser.name }}</div>
                            <div class="text-sm text-gray-600">{{ staffStore.roles[currentUser.role]?.name }}</div>
                        </div>
                    </div>
                </template>

                <template #content>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold" :class="getShiftStatusColor(currentUser) === 'success' ? 'text-green-600' : 'text-gray-600'">
                                {{ getShiftStatus(currentUser) }}
                            </div>
                            <div class="text-sm text-gray-600">Current Status</div>
                        </div>

                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">
                                {{ currentShift ? formatShiftTime(currentShift) : '0 hours' }}
                            </div>
                            <div class="text-sm text-gray-600">Today's Hours</div>
                        </div>

                        <div class="text-center">
                            <div class="text-2xl font-bold ">{{ currentUser.performance?.rating || 0 }}/5.0</div>
                            <div class="text-sm">Performance Rating</div>
                        </div>
                    </div>

                    <div class="flex justify-center gap-2 mt-4">
                        <Button v-if="!currentShift" label="Clock In" icon="pi pi-clock" @click="clockIn" />
                        <Button v-if="currentShift && currentShift.status === 'active'" label="Start Break" icon="pi pi-pause" severity="secondary" @click="startBreak()" />
                        <Button v-if="currentShift && currentShift.status === 'on_break'" label="End Break" icon="pi pi-play" severity="info" @click="endBreak" />
                        <Button v-if="currentShift" label="Clock Out" icon="pi pi-sign-out" severity="warning" @click="clockOut" />
                    </div>
                </template>
            </Card>
        </div>

        <!-- Staff Overview -->
        <TabView v-model:activeIndex="activeTab" class="staff-tabs">
            <TabPanel header="Active Staff">
                <DataTable :value="activeStaff" :paginator="true" :rows="10" dataKey="id" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span class="text-xl font-semibold">Currently Active Staff</span>
                            <Badge :value="activeStaff.length" severity="success" />
                        </div>
                    </template>

                    <Column field="name" header="Name" header-class="bg-red-50">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <Avatar :label="slotProps.data.name.charAt(0)" size="normal" shape="circle" />
                                <div>
                                    <div class="font-medium">{{ slotProps.data.name }}</div>
                                    <div class="text-sm text-gray-500">{{ slotProps.data.employeeId }}</div>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column field="role" header="Role">
                        <template #body="slotProps">
                            <Tag :value="staffStore.roles[slotProps.data.role]?.name" :severity="getRoleColor(slotProps.data.role)" />
                        </template>
                    </Column>

                    <Column field="status" header="Status">
                        <template #body="slotProps">
                            <Tag :value="getShiftStatus(slotProps.data)" :severity="getShiftStatusColor(slotProps.data)" />
                        </template>
                    </Column>

                    <Column field="shiftTime" header="Shift Time">
                        <template #body="slotProps">
                            {{ formatShiftTime(slotProps.data.currentShift) }}
                        </template>
                    </Column>

                    <Column field="performance" header="Performance">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2 staff-management-parent">
                                <ProgressBar :value="(slotProps.data.performance?.rating || 0) * 20" class="w-20" />
                                <span class="text-sm">{{ slotProps.data.performance?.rating || 0 }}/5</span>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <TabPanel header="All Staff">
                <DataTable :value="staff" :paginator="true" :rows="15" dataKey="id" responsiveLayout="scroll">
                    <template #header>
                        <Toolbar>
                            <template #start>
                                <span class="text-xl font-semibold">All Staff Members</span>
                            </template>
                            <template #end>
                                <Button v-if="staffStore.hasPermission('staff.manage')" icon="pi pi-plus" label="Add Staff" @click="openStaffDialog()" />
                            </template>
                        </Toolbar>
                    </template>

                    <Column field="name" header="Employee">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <Avatar :label="slotProps.data.name.charAt(0)" size="normal" shape="circle" />
                                <div>
                                    <div class="font-medium">{{ slotProps.data.name }}</div>
                                    <div class="text-sm text-gray-500">{{ slotProps.data.email }}</div>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column field="employeeId" header="ID" />

                    <Column field="role" header="Role">
                        <template #body="slotProps">
                            <Tag :value="staffStore.roles[slotProps.data.role]?.name" :severity="getRoleColor(slotProps.data.role)" />
                        </template>
                    </Column>

                    <Column field="department" header="Department" class="capitalize" />

                    <Column field="hireDate" header="Hire Date" />

                    <Column field="isActive" header="Status">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.isActive ? 'Active' : 'Inactive'" :severity="slotProps.data.isActive ? 'success' : 'danger'" />
                        </template>
                    </Column>

                    <Column header="Actions">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button v-if="staffStore.hasPermission('staff.manage')" icon="pi pi-pencil" severity="info" size="small" @click="openStaffDialog(slotProps.data)" />
                                <Button v-if="staffStore.hasPermission('staff.manage') && slotProps.data.isActive" icon="pi pi-times" severity="danger" size="small" @click="deactivateStaff(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>

        <!-- Login Dialog -->
        <Dialog :visible="showLoginDialog" @update:visible="showLoginDialog = $event" header="Staff Login" :modal="true" :style="{ width: '400px' }">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Employee ID or Email</label>
                    <InputText v-model="loginForm.employeeId" class="w-full" placeholder="Enter employee ID or email" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Password</label>
                    <Password v-model="loginForm.password" class="w-full" placeholder="Enter password" :feedback="false" />
                </div>

                <div class="text-center text-gray-500">OR</div>

                <div>
                    <label class="block text-sm font-medium mb-2">PIN</label>
                    <Password v-model="loginForm.pin" class="w-full" placeholder="Enter 4-digit PIN" :feedback="false" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showLoginDialog = false" />
                <Button label="Login" @click="login" />
            </template>
        </Dialog>

        <!-- Staff Create/Edit Dialog -->
        <Dialog :visible="showStaffDialog" @update:visible="showStaffDialog = $event" :header="selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'" :modal="true" :style="{ width: '600px' }">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Full Name</label>
                        <InputText v-model="staffForm.name" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Employee ID</label>
                        <InputText v-model="staffForm.employeeId" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Email</label>
                        <InputText v-model="staffForm.email" type="email" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Phone</label>
                        <InputText v-model="staffForm.phone" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Role</label>
                        <Dropdown v-model="staffForm.role" :options="roleOptions" option-label="label" option-value="value" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Department</label>
                        <Dropdown v-model="staffForm.department" :options="departmentOptions" option-label="label" option-value="value" class="w-full" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Address</label>
                    <InputText v-model="staffForm.address" class="w-full" />
                </div>

                <div class="space-y-3">
                    <h4 class="font-medium">Emergency Contact</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Name</label>
                            <InputText v-model="staffForm.emergencyContact.name" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Phone</label>
                            <InputText v-model="staffForm.emergencyContact.phone" class="w-full" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Relationship</label>
                        <InputText v-model="staffForm.emergencyContact.relationship" class="w-full" />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showStaffDialog = false" />
                <Button :label="selectedStaff ? 'Update' : 'Create'" @click="saveStaff" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.staff-management-parent {
    background-color: var(--surface-card);
    color: var(--p-text-color);
}
:deep(.staff-tabs .p-tabview-panels) {
    padding: 0;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #f8fafc;
    border-color: #e2e8f0;
}

:deep(.p-card-content) {
    padding: 1.5rem;
}

:deep(.p-avatar) {
    background-color: #6366f1;
    color: white;
}
</style>
