<script setup>
defineProps({
    visible: Boolean,
    ingredient: Object
});

defineEmits(['update:visible']);
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Ingredient Details" modal class="w-full max-w-lg">
        <div v-if="ingredient" class="space-y-4">
            <div class="text-center">
                <h2 class="text-xl font-bold">{{ ingredient.name }}</h2>
                <p class="text-surface-600">{{ ingredient.category }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="font-medium">Current Stock:</label>
                    <p>{{ ingredient.currentStock }} {{ ingredient.unit }}</p>
                </div>
                <div>
                    <label class="font-medium">Cost per Unit:</label>
                    <p>${{ ingredient.costPerUnit }}</p>
                </div>
            </div>

            <Button label="Close" class="w-full" @click="$emit('update:visible', false)" />
        </div>
    </Dialog>
</template>
