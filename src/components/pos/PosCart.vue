<script setup>
import { ref, computed } from 'vue';
import { usePosStore } from '@/stores/pos.js';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Divider from 'primevue/divider';
import ScrollPanel from 'primevue/scrollpanel';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';

const posStore = usePosStore();
const toast = useToast();

// Reactive data
const showItemDetails = ref(false);
const selectedItem = ref(null);
const showDiscountDialog = ref(false);

// Computed properties
const cart = computed(() => posStore.cart);
const discounts = computed(() => posStore.discounts);
const appliedDiscount = computed(() => posStore.appliedDiscount);

// Methods
const updateQuantity = (cartItemId, quantity) => {
    posStore.updateCartItemQuantity(cartItemId, quantity);
};

const removeItem = (cartItemId) => {
    posStore.removeFromCart(cartItemId);
    toast.add({
        severity: 'info',
        summary: 'Item Removed',
        detail: 'Item removed from cart',
        life: 2000
    });
};

const openItemDetails = (item) => {
    selectedItem.value = item;
    showItemDetails.value = true;
};

const updateItemNotes = () => {
    posStore.updateCartItemNotes(selectedItem.value.cartItemId, selectedItem.value.notes);
    showItemDetails.value = false;
    toast.add({
        severity: 'success',
        summary: 'Notes Updated',
        detail: 'Item notes have been updated',
        life: 2000
    });
};

const applyDiscount = (discount) => {
    posStore.applyDiscount(discount);
    showDiscountDialog.value = false;
    toast.add({
        severity: 'success',
        summary: 'Discount Applied',
        detail: `${discount.name} applied to order`,
        life: 3000
    });
};

const removeDiscount = () => {
    posStore.removeDiscount();
    toast.add({
        severity: 'info',
        summary: 'Discount Removed',
        detail: 'Discount removed from order',
        life: 2000
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const getItemTotal = (item) => {
    const itemPrice = item.price * item.quantity;
    const modifiersPrice = (item.modifiers || []).reduce((total, mod) => total + mod.price * item.quantity, 0);
    return itemPrice + modifiersPrice;
};
</script>

<template>
    <div class="pos-cart">
        <div v-if="cart.length === 0" class="text-center py-8 text-gray-500">
            <i class="pi pi-shopping-cart text-4xl mb-4"></i>
            <p class="text-lg">Your cart is empty</p>
            <p class="text-sm">Add items from the menu to get started</p>
        </div>

        <div v-else class="space-y-1">
            <!-- Applied Discount -->
            <div v-if="appliedDiscount" class="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-green-700 font-medium">{{ appliedDiscount.name }}</div>
                        <div class="text-green-600 text-sm">{{ appliedDiscount.description }}</div>
                    </div>
                    <Button icon="pi pi-times" size="small" severity="danger" text @click="removeDiscount" class="p-1" />
                </div>
            </div>

            <!-- Discount Button -->
            <div v-else class="mb-4">
                <Button label="Apply Discount" icon="pi pi-percentage" severity="secondary" size="small" @click="showDiscountDialog = true" class="w-full p-button-outlined" />
            </div>

            <!-- Cart Items -->
            <ScrollPanel style="width: 100%; height: 400px" class="border rounded-lg">
                <div class="space-y-2 p-2">
                    <div v-for="item in cart" :key="item.cartItemId" class="cart-item border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex-1 cursor-pointer" @click="openItemDetails(item)">
                                <h4 class="font-medium text-gray-800 hover:text-blue-600">
                                    {{ item.name }}
                                </h4>
                                <p class="text-sm text-gray-600">{{ formatCurrency(item.price) }} each</p>
                                <div v-if="item.modifiers && item.modifiers.length > 0" class="mt-1">
                                    <div v-for="modifier in item.modifiers" :key="modifier.id" class="text-xs text-gray-500">+ {{ modifier.name }} ({{ formatCurrency(modifier.price) }})</div>
                                </div>
                                <div v-if="item.notes" class="text-xs text-blue-600 italic mt-1">Note: {{ item.notes }}</div>
                            </div>
                            <Button icon="pi pi-trash" size="small" severity="danger" text @click="removeItem(item.cartItemId)" class="p-1 ml-2" />
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <Button icon="pi pi-minus" size="small" severity="secondary" @click="updateQuantity(item.cartItemId, item.quantity - 1)" :disabled="item.quantity <= 1" class="p-1" />
                                <InputNumber :model-value="item.quantity" @update:model-value="updateQuantity(item.cartItemId, $event)" :min="1" :max="99" class="w-16 text-center" size="small" />
                                <Button icon="pi pi-plus" size="small" severity="secondary" @click="updateQuantity(item.cartItemId, item.quantity + 1)" class="p-1" />
                            </div>
                            <div class="text-lg font-semibold text-gray-800">
                                {{ formatCurrency(getItemTotal(item)) }}
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollPanel>
        </div>

        <!-- Item Details Dialog -->
        <Dialog :visible="showItemDetails" @update:visible="showItemDetails = $event" :header="`Edit: ${selectedItem?.name}`" :modal="true" :style="{ width: '400px' }">
            <div v-if="selectedItem" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <Textarea v-model="selectedItem.notes" rows="4" class="w-full" placeholder="Add any special instructions for this item..." />
                </div>

                <div v-if="selectedItem.modifiers && selectedItem.modifiers.length > 0">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Modifiers</label>
                    <div class="space-y-2">
                        <div v-for="modifier in selectedItem.modifiers" :key="modifier.id" class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span>{{ modifier.name }}</span>
                            <span class="text-sm text-gray-600">
                                {{ formatCurrency(modifier.price) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showItemDetails = false" />
                <Button label="Update" @click="updateItemNotes" />
            </template>
        </Dialog>

        <!-- Discount Dialog -->
        <Dialog :visible="showDiscountDialog" @update:visible="showDiscountDialog = $event" header="Apply Discount" :modal="true" :style="{ width: '400px' }">
            <div class="space-y-3">
                <div v-for="discount in discounts" :key="discount.id" class="discount-option border rounded-lg p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors" @click="applyDiscount(discount)">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-medium text-gray-800">{{ discount.name }}</h4>
                            <p class="text-sm text-gray-600">{{ discount.description }}</p>
                        </div>
                        <div class="text-lg font-semibold text-green-600">
                            {{ discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value) }}
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showDiscountDialog = false" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.cart-item {
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease-in-out;
}

.cart-item:hover {
    border-color: #cbd5e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.discount-option {
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease-in-out;
}

.discount-option:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
