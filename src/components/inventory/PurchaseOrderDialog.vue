<script setup>
import { ref } from 'vue';

defineProps({
    visible: Boolean,
    suggestedItems: Array
});

const emit = defineEmits(['update:visible', 'create']);

const orderItems = ref([]);
const selectedSupplier = ref(null);
const loading = ref(false);

const handleSubmit = () => {
    if (orderItems.value.length === 0) return;

    loading.value = true;

    const orderData = {
        supplierId: selectedSupplier.value,
        items: orderItems.value,
        notes: 'Auto-generated from inventory alerts'
    };

    emit('create', orderData);
    loading.value = false;
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Create Purchase Order" modal class="w-full max-w-2xl">
        <div class="space-y-4">
            <p>Purchase Order functionality will be implemented here.</p>

            <div class="flex justify-end gap-3">
                <Button label="Cancel" outlined @click="$emit('update:visible', false)" />
                <Button label="Create Order" :loading="loading" @click="handleSubmit" />
            </div>
        </div>
    </Dialog>
</template>
