<template>
  <div class="p-6 card shadow-md">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">📦 Inventory Management</h2>

      <!-- Placeholder Dropdown -->
      <Dropdown
        v-model="selectedBranch"
        :options="branches"
        optionLabel="label"
        placeholder="Select Branch"
        class="w-64"
      />
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3 mb-6">
      <Button label="Add Item" icon="pi pi-plus" @click="$router.push('/inventory/Add')" class="p-button-success" />
      <Button label="View Inventory" icon="pi pi-list" @click="$router.push('/inventory/list')" class="p-button-info" />
      <Button label="Add New Item" icon="pi pi-file" @click="$router.push('/inventory/NewItem')" class="p-button-warning" />
      <Button label="Update Item" icon="pi pi-pencil" @click="$router.push('/inventory/UpdateItem')" class="p-button-help" />
    </div>

    <!-- Routed Component -->
    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

// Example branch dropdown (placeholder)
const selectedBranch = ref(null);
const branches = ref([
  { label: 'Head Office', value: 'head' },
  { label: 'Branch A', value: 'a' },
  { label: 'Branch B', value: 'b' },
  { label: 'Branch C', value: 'c' }
]);
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
}
</style>
