<script setup>
import Toast from 'primevue/toast';
</script>

<template>
    <div id="app">
        <!-- Global Toast -->
        <Toast />

        <!-- Router outlet -->
        <router-view />
    </div>
</template>
