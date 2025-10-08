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

<template>
    <div class="card p-4" style="max-width: 100%; margin: auto">
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
                    <label for="price">Price Per KG</label>
                    <InputNumber id="price" v-model="newItem.price" mode="currency" currency="PKR" class="w-full" />
                </div>
                 <div class="form-cell">
                    <label for="unit">Unit</label>
                    <Dropdown id="unit" v-model="newItem.unit" :options="units" placeholder="Select unit" class="w-full" />
                </div>
            </div>

            <!-- Row 4 -->
        </div>

        <!-- Submit -->
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
