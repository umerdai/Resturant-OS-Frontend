<script setup>
import Button from 'primevue/button';
</script>

<template>
    <div class="p-4">
        <h2 class="mb-4">Menu Management</h2>
        <div class="flex gap-2 mb-4">
            <Button label="Menu Items (New)" @click="$router.push('/menu/items')" class="p-button-success" />
            <Button label="Add New Menu Item" @click="$router.push('/menu/add')" />
            <Button label="View Menu" @click="$router.push('/menu/list')" />
            <!--<Button label="Add New Item" @click="$router.push('/menu/NewItem')" />-->
        </div>
        <router-view />
    </div>
</template>
