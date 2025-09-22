<template>
  <div class="card">
    <h3 class="mb-3">Current Inventory</h3>
    <DataTable :value="products" tableStyle="min-width: 50rem">
      <Column field="name" header="Item Name"></Column>
      <Column field="quantity" header="Quantity"></Column>
      <Column field="price" header="Price"></Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ProductService } from '@/service/ProductService';

onMounted(() => {
    ProductService.getProductsMini().then((data) => (products.value = data));
});

const products = ref();
</script>
