<template>
  <div class="card p-4" style="max-width: 900px; margin: auto">
    <h3 class="mb-4 text-center">Add New Inventory Item</h3>

    <!-- Table-like layout -->
    <div class="form-table">
      <!-- Row 1 -->
      <div class="form-row">
        <div class="form-cell">
          <label for="name">Item Name</label>
          <InputText id="name" v-model="newItem.name" placeholder="Enter item name" class="w-full" />
        </div>
        <div class="form-cell">
          <label for="category">Category</label>
          <Dropdown id="category" v-model="newItem.category" :options="categories" placeholder="Select category" class="w-full" />
        </div>
      </div>

      <!-- Row 2 -->
      <div class="form-row">
        <div class="form-cell">
          <label for="quantity">Quantity</label>
          <InputNumber id="quantity" v-model="newItem.quantity" :min="0" class="w-full" />
        </div>
        <div class="form-cell">
          <label for="price">Price</label>
          <InputNumber id="price" v-model="newItem.price" mode="currency" currency="USD" class="w-full" />
        </div>
      </div>

      <!-- Row 3 -->
      <div class="form-row">
        <div class="form-cell">
          <label for="unit">Unit</label>
          <Dropdown id="unit" v-model="newItem.unit" :options="units" placeholder="Select unit" class="w-full" />
        </div>
        <div class="form-cell">
          <label for="supplier">Supplier</label>
          <Dropdown id="supplier" v-model="newItem.supplier" :options="suppliers" placeholder="Select supplier" class="w-full" />
        </div>
      </div>

      <!-- Row 4 -->
      <div class="form-row">
        <div class="form-cell">
          <label for="expiry">Expiry Date</label>
          <Calendar id="expiry" v-model="newItem.expiryDate" dateFormat="yy-mm-dd" showIcon class="w-full" />
        </div>
        <div class="form-cell">
          <label for="reorder">Reorder Level</label>
          <InputNumber id="reorder" v-model="newItem.reorderLevel" :min="0" class="w-full" />
        </div>
      </div>

      <!-- Row 5 -->
      <div class="form-row">
        <div class="form-cell">
          <label for="barcode">Barcode</label>
          <InputText id="barcode" v-model="newItem.barcode" placeholder="Enter barcode" class="w-full" />
        </div>
        <div class="form-cell">
          <label for="location">Storage Location</label>
          <InputText id="location" v-model="newItem.location" placeholder="Enter location" class="w-full" />
        </div>
      </div>
    </div>

    <!-- Submit -->
    <div class="mt-4 text-center">
      <Button label="Save Item" icon="pi pi-check" class="p-button-success w-10rem" @click="saveItem" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';

const newItem = ref({
  name: '',
  category: null,
  quantity: null,
  price: null,
  unit: null,
  supplier: null,
  expiryDate: null,
  reorderLevel: null,
  barcode: '',
  location: ''
});

const categories = ref(['Beverages', 'Dairy', 'Produce', 'Meat', 'Bakery']);
const units = ref(['kg', 'liters', 'pcs', 'packs']);
const suppliers = ref(['Supplier A', 'Supplier B', 'Supplier C']);

const saveItem = () => {
  console.log('New item added:', newItem.value);
};
</script>

<style scoped>
.form-table {
  display: table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 16px 12px; /* spacing between cells */
}
.form-row {
  display: table-row;
}
.form-cell {
  display: table-cell;
  vertical-align: top;
  width: 50%;
}
.form-cell label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}
</style>
