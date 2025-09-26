<script setup>
import { ref, onMounted, computed } from 'vue';
import { ProductService } from '@/service/ProductService';
import InputText from 'primevue/inputtext';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';

const products = ref([]);
const searchQuery = ref('');
const selectedQuantity = ref(null);
const selectedPrice = ref(null);

// Dropdown options
const quantityOptions = [
    { label: 'All', value: null },
    { label: 'Low (< 10)', value: 'low' },
    { label: 'Medium (10 - 50)', value: 'medium' },
    { label: 'High (> 50)', value: 'high' }
];

const priceOptions = [
    { label: 'All', value: null },
    { label: 'Cheap (< 100)', value: 'cheap' },
    { label: 'Moderate (100 - 500)', value: 'moderate' },
    { label: 'Expensive (> 500)', value: 'expensive' }
];

// Load products
onMounted(() => {
    ProductService.getProductsMini().then((data) => (products.value = data));
});

// ✅ Filter by name, quantity, and price (dropdown logic)
const filteredProducts = computed(() => {
    return products.value.filter((p) => {
        const matchesName = searchQuery.value ? p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) : true;

        // Quantity filter
        let matchesQuantity = true;
        if (selectedQuantity.value === 'low') matchesQuantity = p.quantity < 10;
        if (selectedQuantity.value === 'medium') matchesQuantity = p.quantity >= 10 && p.quantity <= 50;
        if (selectedQuantity.value === 'high') matchesQuantity = p.quantity > 50;

        // Price filter
        let matchesPrice = true;
        if (selectedPrice.value === 'cheap') matchesPrice = p.price < 100;
        if (selectedPrice.value === 'moderate') matchesPrice = p.price >= 100 && p.price <= 500;
        if (selectedPrice.value === 'expensive') matchesPrice = p.price > 500;

        return matchesName && matchesQuantity && matchesPrice;
    });
});
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-xl font-semibold">Current Inventory</h3>
        </div>

        <!-- 🔍 Search Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
            <!-- Search by Name -->
            <InputText v-model="searchQuery" placeholder="Search by item name" class="w-64" />

            <!-- Filter by Quantity -->
            <Dropdown v-model="selectedQuantity" :options="quantityOptions" optionLabel="label" optionValue="value" placeholder="Filter by Quantity" class="w-48" />

            <!-- Filter by Price -->
            <Dropdown v-model="selectedPrice" :options="priceOptions" optionLabel="label" optionValue="value" placeholder="Filter by Price" class="w-48" />
        </div>

        <!-- ✅ Conditionally render -->
        <div v-if="filteredProducts.length > 0">
            <DataTable :value="filteredProducts" tableStyle="min-width: 50rem">
                <Column field="name" header="Item Name"></Column>
                <Column field="quantity" header="Quantity"></Column>
                <Column field="price" header="Price"></Column>
            </DataTable>
        </div>
        <div v-else class="text-center text-gray-500 py-6">
            Nothing found
            <i class="pi pi-search ml-2" style="font-size: 1rem"></i>
        </div>
    </div>
</template>
