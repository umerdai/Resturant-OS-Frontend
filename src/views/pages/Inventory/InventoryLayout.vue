<template>
  <div class="p-4">
    <h2 class="mb-4">Inventory Management Branch: ()</h2>
    <div class="flex gap-2 mb-4">
      <Button label="Add Item" @click="$router.push('/inventory/add')" />
      <Button label="View Inventory" @click="$router.push('/inventory/list')" />
      <Button label="Add New Item" @click="$router.push('/inventory/NewItem')" />
    </div>
    <router-view />
  </div>
</template>

<script setup>
import Button  from 'primevue/button';
</script>
