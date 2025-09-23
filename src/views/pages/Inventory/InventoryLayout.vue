<template>
  <div class="p-4">
    <h2 class="mb-4">Inventory Management Branch: ()</h2>
    <div class="flex gap-2 mb-4">
      <Button label="Add Item" @click="$router.push('/inventory/Add')" />
      <Button label="View Inventory" @click="$router.push('/inventory/list')" />
      <Button label="Add New Item" @click="$router.push('/inventory/NewItem')" />
      <Button label="Update Item" @click="$router.push('/inventory/UpdateItem')" />
    </div>
    <router-view />
  </div>
</template>

<script setup>
import Button  from 'primevue/button';
</script>
