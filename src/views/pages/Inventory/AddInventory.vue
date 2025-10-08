<script setup>
import { ref, onMounted } from 'vue';
import { ProductService } from '@/service/ProductService';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

// Placeholder supplier options
const suppliers = ref([
    { id: 1, name: 'Local Farm' },
    { id: 2, name: 'Metro Wholesalers' },
    { id: 3, name: 'FreshFoods Ltd' }
]);

// Placeholder category options
const categories = ref([
    { label: 'Meat', value: 'Meat' },
    { label: 'Vegetable', value: 'Vegetable' },
    { label: 'Condiment', value: 'Condiment' },
    { label: 'Dairy', value: 'Dairy' },
    { label: 'Beverage', value: 'Beverage' },
    { label: 'Bakery', value: 'Bakery' },
    { label: 'Seafood', value: 'Seafood' },
    { label: 'Spice', value: 'Spice' },
    { label: 'Grain', value: 'Grain' },
    { label: 'Frozen', value: 'Frozen' }
]);

const products = ref([]);
const inventory = ref([]);

// Load mock products
onMounted(() => {
    ProductService.getProductsMini().then((data) => {
        products.value = data;
        inventory.value = [
            { id: 1, name: null, quantity: 0, price: 0, category: '', supplier: null }
        ];
    });
});

// Add a new row
const addRow = () => {
    inventory.value.push({
        id: Date.now(),
        name: null,
        quantity: 0,
        price: 0,
        category: '',
        supplier: null
    });
};

// Autofill when item changes
const onItemChange = (row) => {
    const selected = products.value.find((p) => p.name === row.name);
    if (selected) {
        row.price = selected.price;
        row.category = selected.category;
    }
};

// Save row
const saveRow = (row) => {
    console.log('Saved row:', row);
};

// Delete row
const deleteRow = (row) => {
    inventory.value = inventory.value.filter((r) => r.id !== row.id);
};
</script>

<template>
    <div class="card">
        <h3 class="mb-3">Manage Inventory</h3>

        <Button label="Add Row" icon="pi pi-plus" class="mb-3" @click="addRow" />

        <DataTable :value="inventory" dataKey="id" tableStyle="min-width: 60rem">
            <!-- Item Dropdown -->
            <Column field="name" header="Item">
                <template #body="{ data }">
                    <Dropdown v-model="data.name" :options="products" optionLabel="name" placeholder="Select Item" @change="onItemChange(data)" style="width: 100%" />
                </template>
            </Column>

            <!-- Quantity (numeric) -->
            <Column field="quantity" header="Quantity (Kg):">
                <template #body="{ data }">
                    <InputNumber v-model="data.quantity" :min="0" style="width: 100%" />
                </template>
            </Column>

            <!-- Price (numeric currency) -->
            <Column field="price" header="Price Per kg (PKR):">
                <template #body="{ data }">
                    <InputNumber v-model="data.price" mode="currency" currency="PKR" style="width: 100%" />
                </template>
            </Column>

            <!-- Category (readonly autofill) -->
           <!-- Category (dropdown editable) -->
<Column field="category" header="Category">
    <template #body="{ data }">
        <Dropdown 
            v-model="data.category"
            :options="categories"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Category"
            style="width: 100%"
        />
    </template>
</Column>


            <!-- Actions -->
            <Column header="Actions">
                <template #body="{ data }">
                    <Button icon="pi pi-check" class="p-button-sm p-button-success mr-2" @click="saveRow(data)" />
                    <Button icon="pi pi-times" class="p-button-sm p-button-danger" @click="deleteRow(data)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
