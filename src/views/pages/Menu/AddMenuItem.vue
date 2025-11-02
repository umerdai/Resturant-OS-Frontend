<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

const availableIngredients = ref([
  { label: 'Bun', value: 'bun' },
  { label: 'Beef Patty', value: 'beef_patty' },
  { label: 'Cheese Slice', value: 'cheese_slice' },
  { label: 'Lettuce', value: 'lettuce' },
  { label: 'Tomato', value: 'tomato' },
  { label: 'Sauce', value: 'sauce' },
]);

const newItem = ref({
  name: '',
  category: null,
  Cost_price: null,
  Sale_price: null,
  unit: null,
  barcode: '',
  location: '',
  ingredients: [] // ✅ Initialize ingredients array
});

const categories = ref(['Beverages', 'Dairy', 'Produce', 'Meat', 'Bakery']);
const units = ref(['kg', 'liters', 'pcs', 'packs']);
const suppliers = ref(['Supplier A', 'Supplier B', 'Supplier C']);

// ✅ Add ingredient row
const addIngredient = () => {
  newItem.value.ingredients.push({
    name: '',
    quantity: 1,
  });
};

// ✅ Remove ingredient row
const removeIngredient = (index) => {
  newItem.value.ingredients.splice(index, 1);
};

// ✅ Save handler
const saveItem = () => {
  console.log('New item added:', newItem.value);
  alert('Item saved! (check console)');
};
</script>

<template>
  <div class="card p-4" style="max-width: 100%; margin: auto">
    <h3 class="mb-4 text-center">Add New Menu Item</h3>

    <div class="form-table">
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

      <div class="form-row">
        <div class="form-cell">
          <label for="price">Cost Price</label>
          <InputNumber id="price" v-model="newItem.Cost_price" mode="currency" currency="PKR" class="w-full" />
        </div>
        <div class="form-cell">
          <label for="unit">Sales Price</label>
          <InputNumber id="Sale_price" v-model="newItem.Sale_price" mode="currency" currency="PKR" class="w-full" />
        </div>
      </div>

      <!-- Ingredients -->
    <div class="form-row mt-4 flex items-center justify-between">
  <h4 class="m-0">Ingredients</h4>
  <Button
    label="Add Ingredient"
    icon="pi pi-plus"
    class="p-button-sm p-button-outlined"
    @click="addIngredient"
  />
</div>

      <div
        v-for="(ingredient, index) in newItem.ingredients"
        :key="index"
        class="form-row align-items-center mb-2"
      >
        <div class="form-cell w-1/2">
          <Dropdown
            v-model="ingredient.name"
            :options="availableIngredients"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Ingredient"
            class="w-full"
          />
        </div>

      <div class="form-cell w-1/4">
  <InputNumber
    v-model="ingredient.quantity"
    :min="0"
    placeholder="Quantity"
    suffix=" g"
    class="w-full"
  />
</div>
        <div class="form-cell w-1/4 text-center">
          <Button
            icon="pi pi-trash"
            class="p-button-danger p-button-sm"
            @click="removeIngredient(index)"
          />
        </div>
      </div>

      
    </div>

    <div class="mt-4 text-center">
      <Button label="Save Item" icon="pi pi-check" class="p-button-success w-10rem" @click="saveItem" />
    </div>
  </div>
</template>


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
