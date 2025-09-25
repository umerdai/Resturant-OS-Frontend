<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { ProductService } from '@/service/ProductService';

const products = ref([]);
const toast = useToast();
const showSuccess = () => {
    toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
};

onMounted(() => {
    ProductService.getProductsMini().then((data) => (products.value = data));
});

const saveUpdates = () => {
    try {
        console.log('Updated Products:', products.value);
        showSuccess();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'Error Content', life: 3000 });
    }
};
</script>

<template>
    <div class="card">
        <h3 class="mb-3">Update Inventory</h3>

        <!-- ✅ Toast Component -->
        <Toast />

        <DataTable :value="products" tableStyle="min-width: 50rem">
            <!-- Item Name -->
            <Column field="name" header="Item Name">
                <template #body="{ data }">
                    <InputText v-model="data.name" class="w-full" />
                </template>
            </Column>

            <!-- Quantity -->
            <Column field="quantity" header="Quantity">
                <template #body="{ data }">
                    <InputNumber v-model="data.quantity" :min="0" class="w-full" />
                </template>
            </Column>

            <!-- Price -->
            <Column field="price" header="Price">
                <template #body="{ data }">
                    <InputNumber v-model="data.price" mode="currency" currency="USD" locale="en-US" class="w-full" />
                </template>
            </Column>
        </DataTable>

        <!-- Save Button -->
        <div class="mt-4 text-center">
            <Button label="Save Updates" icon="pi pi-check" class="p-button-success" @click="saveUpdates" />
        </div>
    </div>
</template>
