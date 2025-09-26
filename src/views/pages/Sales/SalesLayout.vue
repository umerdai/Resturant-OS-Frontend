<script setup>
import Button from 'primevue/button';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
</script>

<template>
    <div class="p-4">
        <h2 class="mb-4">Sales Management</h2>
        <div class="flex gap-2 mb-4">
            <Button label="Add Item" @click="$router.push('/sales/add')" />
            <Button label="View Sales" @click="$router.push('/sales/list')" />
            <Button label="Add New Item" @click="$router.push('/sales/NewItem')" />
        </div>
        <router-view />
        <div>
            <RevenueStreamWidget />
        </div>
    </div>
</template>
