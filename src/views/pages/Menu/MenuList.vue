<script setup>
import { ref, onMounted, computed } from 'vue';
import { ProductService } from '@/service/ProductService';
import InputText from 'primevue/inputtext';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

const menuItems = ref([]);
const searchQuery = ref('');
const selectedCategory = ref(null);
const selectedPriceRange = ref(null);

// 🔸 Mock categories for menu
const categoryOptions = [
    { label: 'All', value: null },
    { label: 'Main Course', value: 'Main Course' },
    { label: 'Appetizer', value: 'Appetizer' },
    { label: 'Dessert', value: 'Dessert' },
    { label: 'Beverage', value: 'Beverage' },
    { label: 'Salad', value: 'Salad' },
    { label: 'Fast Food', value: 'Fast Food' },
    { label: 'Breakfast', value: 'Breakfast' }
];

// 🔸 Price range options
const priceOptions = [
    { label: 'All', value: null },
    { label: 'Low (< 300)', value: 'low' },
    { label: 'Medium (300 - 800)', value: 'medium' },
    { label: 'High (> 800)', value: 'high' }
];

// 🔸 Load menu data (mock)
onMounted(() => {
    ProductService.getProductsMini().then((data) => {
        // map mock data to your menu schema
        menuItems.value = data.map((p, i) => ({
            item_id: i + 1,
            item_name: p.name,
            category: p.category || 'Main Course',
            cost_price: p.price * 0.6, // mock cost
            sales_price: p.price,
            active: Math.random() > 0.2 // 80% active
        }));
    });
});

// 🔸 Filter logic
const filteredMenu = computed(() => {
    return menuItems.value.filter((item) => {
        const matchesName = searchQuery.value
            ? item.item_name.toLowerCase().includes(searchQuery.value.toLowerCase())
            : true;

        const matchesCategory = selectedCategory.value
            ? item.category === selectedCategory.value
            : true;

        let matchesPrice = true;
        if (selectedPriceRange.value === 'low') matchesPrice = item.sales_price < 300;
        if (selectedPriceRange.value === 'medium')
            matchesPrice = item.sales_price >= 300 && item.sales_price <= 800;
        if (selectedPriceRange.value === 'high') matchesPrice = item.sales_price > 800;

        return matchesName && matchesCategory && matchesPrice;
    });
});
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-xl font-semibold">Menu Items</h3>
        </div>

        <!-- 🔍 Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
            <!-- Search by Name -->
            <InputText v-model="searchQuery" placeholder="Search by item name" class="w-64" />

            <!-- Filter by Category -->
            <Dropdown
                v-model="selectedCategory"
                :options="categoryOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Filter by Category"
                class="w-56"
            />

            <!-- Filter by Price -->
            <Dropdown
                v-model="selectedPriceRange"
                :options="priceOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Filter by Price"
                class="w-48"
            />
        </div>

        <!-- ✅ Menu Table -->
        <div v-if="filteredMenu.length > 0">
            <DataTable :value="filteredMenu" tableStyle="min-width: 60rem">
                <Column field="item_name" header="Item Name"></Column>
                <Column field="category" header="Category"></Column>
                <Column field="cost_price" header="Cost Price (PKR)"></Column>
                <Column field="sales_price" header="Sales Price (PKR)"></Column>

                <Column header="Status">
                    <template #body="{ data }">
                        <Tag
                            :value="data.active ? 'Active' : 'Inactive'"
                            :severity="data.active ? 'success' : 'danger'"
                        />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center text-gray-500 py-6">
            No menu items found
            <i class="pi pi-search ml-2" style="font-size: 1rem"></i>
        </div>
    </div>
</template>
