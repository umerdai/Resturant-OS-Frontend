<script setup>
import Button from 'primevue/button';
</script>

<template>
    <div class="p-4">
        <h2 class="mb-4">Statistics Management</h2>
        <div class="flex gap-2 mb-4">
            <Button label="Add Item" @click="$router.push('/statistics/add')" />
            <Button label="View Statistics" @click="$router.push('/statistics/list')" />
            <Button label="Add New Item" @click="$router.push('/statistics/NewItem')" />
        </div>
        <router-view />
    </div>
</template>
