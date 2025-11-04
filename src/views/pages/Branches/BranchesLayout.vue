<script setup>
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();
const branches = ref([]);
const isLoading = ref(false);

// Fetch branches from API
const fetchBranches = async () => {
    isLoading.value = true;
    try {
        const userId = localStorage.getItem('token');
        if (!userId) {
            throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(`http://localhost:8000/branches/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userId}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            branches.value = data;
        } else {
            throw new Error('Failed to fetch branches');
        }
    } catch (error) {
        console.error('Error fetching branches:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to fetch branches',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Handle branch actions
const viewBranch = (branch) => {
    // Navigate to branch details view
    router.push(`/branches/${branch.id}/details`);
};

// Initialize data on component mount
onMounted(() => {
    fetchBranches();
});
</script>

<template>
    <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">
                � Branch Management <span class="text-green-500">({{ branches[0]?.restaurant_name }})</span>
            </h2>
            <div class="flex gap-2">
                <Button label="Create Branch" icon="pi pi-plus" @click="$router.push('/branches/create')" />
                <Button label="Refresh" icon="pi pi-refresh" @click="fetchBranches" :loading="isLoading" class="p-button-outlined" />
            </div>
        </div>

        <!-- Branch Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="branches.length > 0">
            <Card v-for="branch in branches" :key="branch.id" class="branch-card">
                <template #header>
                    <div class="bg-primary-50 dark:bg-primary-900 p-4 rounded-t-lg">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-semibold text-primary-700 dark:text-primary-300">
                                {{ branch.branch_name }}
                            </h3>
                            <Badge :value="branch.is_active ? 'Active' : 'Inactive'" :severity="branch.is_active ? 'success' : 'danger'" />
                        </div>
                    </div>
                </template>

                <template #content>
                    <div class="space-y-3">
                        <div class="flex items-center" v-if="branch.address">
                            <i class="pi pi-map-marker mr-2 text-gray-500"></i>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Address:</span>
                            <span class="ml-2 font-medium">{{ branch.address }}</span>
                        </div>

                        <div class="flex items-center" v-if="branch.phone">
                            <i class="pi pi-phone mr-2 text-gray-500"></i>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                            <span class="ml-2 font-medium">{{ branch.phone }}</span>
                        </div>

                        <div class="flex items-center" v-if="branch.manager_name">
                            <i class="pi pi-user mr-2 text-gray-500"></i>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Manager:</span>
                            <span class="ml-2 font-medium">{{ branch.manager_name }}</span>
                        </div>

                        <div class="flex items-center" v-if="branch.opening_hours">
                            <i class="pi pi-clock mr-2 text-gray-500"></i>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Hours:</span>
                            <span class="ml-2 font-medium">{{ branch.opening_hours }}</span>
                        </div>

                        <div class="text-xs text-gray-400 mt-4">ID: {{ branch.id }}</div>
                    </div>
                </template>

                <template #footer>
                    <div class="flex justify-end">
                        <Button label="View Details" icon="pi pi-eye" size="small" @click="viewBranch(branch)" />
                    </div>
                </template>
            </Card>
        </div>

        <!-- Empty State -->
        <Card v-else-if="!isLoading" class="text-center py-16">
            <template #content>
                <div class="space-y-4">
                    <i class="pi pi-building text-6xl text-gray-400"></i>
                    <h3 class="text-xl font-semibold text-gray-600">No Branches Found</h3>
                    <p class="text-gray-500">No branches have been created yet.</p>
                    <Button label="Create First Branch" icon="pi pi-plus" @click="$router.push('/branches/create')" />
                </div>
            </template>
        </Card>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            <p class="mt-4 text-gray-600">Loading branches...</p>
        </div>
    </div>
</template>

<style scoped>
.branch-card {
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    border-radius: 12px;
}

.branch-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.branch-card .p-card-header {
    padding: 0;
}

.branch-card .p-card-content {
    padding: 1.5rem;
}

.branch-card .p-card-footer {
    padding: 1rem 1.5rem;
    background-color: var(--surface-50);
    border-top: 1px solid var(--surface-200);
}

.dark .branch-card .p-card-footer {
    background-color: var(--surface-800);
    border-top: 1px solid var(--surface-700);
}

/* Grid responsive adjustments */
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }
}

@media (min-width: 768px) and (max-width: 1024px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
