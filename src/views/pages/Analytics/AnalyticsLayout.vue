<script setup>
import Button from 'primevue/button';
</script>

<template>
    <div class="p-4">
        <h2 class="mb-4">Analytics Management</h2>
        <div class="flex gap-2 mb-4">
            <Button label="Add Item" @click="$router.push('/analytics/add')" />
            <Button label="View Analytics" @click="$router.push('/analytics/list')" />
            <Button label="Add New Item" @click="$router.push('/analytics/NewItem')" />
        </div>
        <router-view />
    </div>
</template>
