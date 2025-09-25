<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    visible: Boolean,
    ingredient: Object
});

const emit = defineEmits(['update:visible', 'adjust']);

const adjustmentType = ref('restock');
const quantity = ref(0);
const reason = ref('');
const loading = ref(false);

const adjustmentTypes = [
    { label: 'Restock (Add)', value: 'restock', icon: 'pi-plus', color: 'success' },
    { label: 'Usage (Remove)', value: 'usage', icon: 'pi-minus', color: 'info' },
    { label: 'Waste/Spoilage', value: 'waste', icon: 'pi-trash', color: 'warning' },
    { label: 'Adjustment', value: 'adjustment', icon: 'pi-pencil', color: 'secondary' }
];

const selectedType = computed(() => {
    return adjustmentTypes.find((type) => type.value === adjustmentType.value);
});

const adjustedQuantity = computed(() => {
    const sign = adjustmentType.value === 'restock' ? 1 : -1;
    return quantity.value * sign;
});

const newStockLevel = computed(() => {
    if (!props.ingredient) return 0;
    return Math.max(0, props.ingredient.currentStock + adjustedQuantity.value);
});

const handleSubmit = async () => {
    if (!quantity.value || !reason.value.trim()) return;

    loading.value = true;

    try {
        emit('adjust', {
            quantity: adjustedQuantity.value,
            reason: reason.value,
            type: adjustmentType.value
        });

        // Reset form
        quantity.value = 0;
        reason.value = '';
        adjustmentType.value = 'restock';
    } finally {
        loading.value = false;
    }
};

const handleClose = () => {
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Stock Adjustment" modal class="w-full max-w-md">
        <div v-if="ingredient" class="space-y-6">
            <!-- Ingredient Info -->
            <div class="text-center p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <h3 class="text-lg font-semibold">{{ ingredient.name }}</h3>
                <p class="text-surface-600 dark:text-surface-400">Current Stock: {{ ingredient.currentStock }} {{ ingredient.unit }}</p>
            </div>

            <!-- Adjustment Type -->
            <div>
                <label class="block text-sm font-medium mb-2">Adjustment Type</label>
                <div class="grid grid-cols-2 gap-2">
                    <Button
                        v-for="type in adjustmentTypes"
                        :key="type.value"
                        :label="type.label"
                        :icon="type.icon"
                        :severity="adjustmentType === type.value ? type.color : 'secondary'"
                        :outlined="adjustmentType !== type.value"
                        size="small"
                        class="justify-start"
                        @click="adjustmentType = type.value"
                    />
                </div>
            </div>

            <!-- Quantity -->
            <div>
                <label class="block text-sm font-medium mb-2">Quantity</label>
                <InputNumber v-model="quantity" :min="0" :suffix="` ${ingredient.unit}`" placeholder="Enter quantity" class="w-full" />
            </div>

            <!-- Reason -->
            <div>
                <label class="block text-sm font-medium mb-2">Reason</label>
                <Textarea v-model="reason" placeholder="Enter reason for adjustment..." rows="3" class="w-full" />
            </div>

            <!-- Preview -->
            <div v-if="quantity > 0" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 class="font-medium mb-2">Preview Changes</h4>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="text-lg font-semibold">{{ ingredient.currentStock }}</div>
                        <div class="text-sm text-surface-600">Current</div>
                    </div>
                    <div>
                        <div class="text-lg font-semibold" :class="adjustedQuantity >= 0 ? 'text-green-600' : 'text-red-600'">{{ adjustedQuantity >= 0 ? '+' : '' }}{{ adjustedQuantity }}</div>
                        <div class="text-sm text-surface-600">Change</div>
                    </div>
                    <div>
                        <div class="text-lg font-semibold text-blue-600">{{ newStockLevel }}</div>
                        <div class="text-sm text-surface-600">New Stock</div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
                <Button label="Cancel" outlined @click="handleClose" />
                <Button :label="`${selectedType?.label} Stock`" :icon="selectedType?.icon" :severity="selectedType?.color" :disabled="!quantity || !reason.trim()" :loading="loading" @click="handleSubmit" />
            </div>
        </div>
    </Dialog>
</template>
