<script setup>
import Button from 'primevue/button';
</script>

<template>
    <div class="p-4">
        <h2 class="mb-4">POS</h2>
        <div class="flex gap-2 mb-4">
            <Button label="Add Item" @click="$router.push('/menu/add')" />
            <Button label="View Menu" @click="$router.push('/menu/list')" />
            <Button label="Add New Item" @click="$router.push('/menu/NewItem')" />
        </div>
        <router-view />
    </div>
</template>
