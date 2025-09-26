<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

const toast = useToast();
const authStore = useAuthStore();

// Profile form
const profileForm = ref({
    name: '',
    email: '',
    phone: ''
});

// Password form
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Shift status
const selectedShiftStatus = ref(authStore.shiftStatus);

// Recent activity (mock data)
const recentActivity = ref([
    {
        id: 1,
        action: 'Logged in to system',
        timestamp: new Date(Date.now() - 3600000),
        icon: 'pi pi-sign-in'
    },
    {
        id: 2,
        action: 'Updated profile information',
        timestamp: new Date(Date.now() - 86400000),
        icon: 'pi pi-user-edit'
    },
    {
        id: 3,
        action: 'Changed shift status to On Duty',
        timestamp: new Date(Date.now() - 172800000),
        icon: 'pi pi-clock'
    }
]);

// Computed properties
const isPasswordFormValid = computed(() => {
    return passwordForm.value.currentPassword && passwordForm.value.newPassword && passwordForm.value.confirmPassword && passwordForm.value.newPassword === passwordForm.value.confirmPassword && passwordForm.value.newPassword.length >= 6;
});

// Methods
const getShiftStatusSeverity = (status) => {
    switch (status) {
        case 'on-duty':
            return 'success';
        case 'break':
            return 'warn';
        case 'off-duty':
            return 'danger';
        default:
            return 'secondary';
    }
};

const updateProfile = async () => {
    const result = await authStore.updateProfile(profileForm.value);

    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated successfully',
            life: 3000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message || 'Failed to update profile',
            life: 5000
        });
    }
};

const updateShiftStatus = () => {
    authStore.toggleShiftStatus(selectedShiftStatus.value);

    toast.add({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Shift status changed to ${selectedShiftStatus.value.replace('-', ' ')}`,
        life: 3000
    });
};

const changePassword = async () => {
    if (!isPasswordFormValid.value) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Please check your password requirements',
            life: 3000
        });
        return;
    }

    const result = await authStore.changePassword({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
    });

    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password changed successfully',
            life: 3000
        });

        // Reset form
        passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message || 'Failed to change password',
            life: 5000
        });
    }
};

const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
};

// Initialize profile form with user data
onMounted(() => {
    if (authStore.user) {
        profileForm.value = {
            name: authStore.user.name || '',
            email: authStore.user.email || '',
            phone: authStore.user.phone || ''
        };
    }
});

// Watch for shift status changes
watch(
    () => authStore.shiftStatus,
    (newStatus) => {
        selectedShiftStatus.value = newStatus;
    }
);
</script>

<template>
    <div class="p-6">
        <Toast />

        <!-- Page Header -->
        <div class="mb-6">
            <h1 class="text-3xl font-semibold text-surface-900 dark:text-surface-0 mb-2">User Profile</h1>
            <p class="text-muted-color">Manage your profile information and shift status</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Profile Information -->
            <Card class="h-fit">
                <template #title>Profile Information</template>
                <template #content>
                    <form @submit.prevent="updateProfile" class="space-y-4">
                        <div class="field">
                            <label for="name" class="block text-sm font-medium mb-2">Full Name</label>
                            <InputText id="name" v-model="profileForm.name" class="w-full" :disabled="authStore.isLoading" />
                        </div>

                        <div class="field">
                            <label for="email" class="block text-sm font-medium mb-2">Email</label>
                            <InputText id="email" v-model="profileForm.email" type="email" class="w-full" :disabled="authStore.isLoading" />
                        </div>

                        <div class="field">
                            <label for="role" class="block text-sm font-medium mb-2">Role</label>
                            <InputText id="role" :value="authStore.userRole" class="w-full" disabled />
                        </div>

                        <div class="field">
                            <label for="phone" class="block text-sm font-medium mb-2">Phone</label>
                            <InputText id="phone" v-model="profileForm.phone" class="w-full" :disabled="authStore.isLoading" />
                        </div>

                        <Button type="submit" label="Update Profile" class="w-full" :loading="authStore.isLoading" />
                    </form>
                </template>
            </Card>

            <!-- Shift Status -->
            <Card class="h-fit">
                <template #title>
                    <div class="flex items-center justify-between">
                        <span>Shift Status</span>
                        <Badge :value="authStore.shiftStatus.replace('_', ' ').toUpperCase()" :severity="getShiftStatusSeverity(authStore.shiftStatus)" />
                    </div>
                </template>
                <template #content>
                    <div class="space-y-4">
                        <p class="text-muted-color mb-4">Update your current shift status to let others know your availability.</p>

                        <div class="flex flex-col gap-3">
                            <div class="flex items-center">
                                <RadioButton v-model="selectedShiftStatus" inputId="on-duty" value="on-duty" />
                                <label for="on-duty" class="ml-2 flex items-center gap-2">
                                    <i class="pi pi-circle-fill text-green-500 text-xs"></i>
                                    On Duty
                                </label>
                            </div>

                            <div class="flex items-center">
                                <RadioButton v-model="selectedShiftStatus" inputId="break" value="break" />
                                <label for="break" class="ml-2 flex items-center gap-2">
                                    <i class="pi pi-circle-fill text-yellow-500 text-xs"></i>
                                    On Break
                                </label>
                            </div>

                            <div class="flex items-center">
                                <RadioButton v-model="selectedShiftStatus" inputId="off-duty" value="off-duty" />
                                <label for="off-duty" class="ml-2 flex items-center gap-2">
                                    <i class="pi pi-circle-fill text-red-500 text-xs"></i>
                                    Off Duty
                                </label>
                            </div>
                        </div>

                        <Button label="Update Status" class="w-full mt-4" @click="updateShiftStatus" :disabled="selectedShiftStatus === authStore.shiftStatus" />
                    </div>
                </template>
            </Card>

            <!-- Change Password -->
            <Card class="h-fit">
                <template #title>Change Password</template>
                <template #content>
                    <form @submit.prevent="changePassword" class="space-y-4">
                        <div class="field">
                            <label for="currentPassword" class="block text-sm font-medium mb-2"> Current Password </label>
                            <Password id="currentPassword" v-model="passwordForm.currentPassword" class="w-full" :feedback="false" :disabled="authStore.isLoading" />
                        </div>

                        <div class="field">
                            <label for="newPassword" class="block text-sm font-medium mb-2"> New Password </label>
                            <Password id="newPassword" v-model="passwordForm.newPassword" class="w-full" :disabled="authStore.isLoading" />
                        </div>

                        <div class="field">
                            <label for="confirmPassword" class="block text-sm font-medium mb-2"> Confirm New Password </label>
                            <Password id="confirmPassword" v-model="passwordForm.confirmPassword" class="w-full" :feedback="false" :disabled="authStore.isLoading" />
                        </div>

                        <Button type="submit" label="Change Password" class="w-full" :loading="authStore.isLoading" :disabled="!isPasswordFormValid" />
                    </form>
                </template>
            </Card>

            <!-- Activity Log -->
            <Card>
                <template #title>Recent Activity</template>
                <template #content>
                    <div class="space-y-3">
                        <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                            <i :class="activity.icon" class="text-primary mt-1"></i>
                            <div class="flex-1">
                                <p class="text-sm font-medium">{{ activity.action }}</p>
                                <p class="text-xs text-muted-color">{{ formatDate(activity.timestamp) }}</p>
                            </div>
                        </div>

                        <div v-if="!recentActivity.length" class="text-center py-4">
                            <p class="text-muted-color">No recent activity</p>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>
