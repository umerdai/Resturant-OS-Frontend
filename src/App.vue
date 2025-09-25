<template>
  <div id="app">
    <!-- Global Toast -->
    <Toast />

    <!-- Router outlet -->
    <router-view />
  </div>
</template>

<script setup>
import Toast from 'primevue/toast'
</script>
