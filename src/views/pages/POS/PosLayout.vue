<script setup>
import { useMenuStore } from '@/stores/menu.js';
import { usePosStore } from '@/stores/pos.js';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// PrimeVue Components
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import ScrollPanel from 'primevue/scrollpanel';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';

// Components
import PaymentDialog from '@/components/pos/PaymentDialog.vue';
import PosCart from '@/components/pos/PosCart.vue';

const menuStore = useMenuStore();
const posStore = usePosStore();
const toast = useToast();

// Reactive data
const searchQuery = ref('');
const selectedCategory = ref(null);
const showPaymentDialog = ref(false);
const showCustomerDialog = ref(false);
const showDiscountDialog = ref(false);
const customerForm = ref({
    name: '',
    phone: '',
    email: '',
    tableId: null
});

// Computed properties
const filteredItems = computed(() => {
    let items = menuStore.items;

    if (selectedCategory.value) {
        items = items.filter((item) => item.categoryId === selectedCategory.value.id);
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        items = items.filter((item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    }

    return items.filter((item) => item.isAvailable);
});

const categories = computed(() => menuStore.categories);
const cart = computed(() => posStore.cart);
const cartTotal = computed(() => posStore.cartTotal);
const cartItemsCount = computed(() => posStore.cartItemsCount);

// Methods
const addItemToCart = (item) => {
    posStore.addToCart(item, 1);
    toast.add({
        severity: 'success',
        summary: 'Added to Cart',
        detail: `${item.name} added to cart`,
        life: 2000
    });
};

const proceedToPayment = () => {
    if (cart.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Empty Cart',
            detail: 'Please add items to cart before proceeding to payment',
            life: 3000
        });
        return;
    }

    try {
        posStore.startTransaction();
        showPaymentDialog.value = true;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: 3000
        });
    }
};

const handlePaymentComplete = (paymentResult) => {
    showPaymentDialog.value = false;
    if (paymentResult.success) {
        toast.add({
            severity: 'success',
            summary: 'Payment Complete',
            detail: `Transaction ${paymentResult.transaction.transactionNumber} completed successfully`,
            life: 5000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Payment Failed',
            detail: paymentResult.message,
            life: 3000
        });
    }
};

const saveCustomer = () => {
    posStore.setCustomerInfo(customerForm.value);
    showCustomerDialog.value = false;
    toast.add({
        severity: 'success',
        summary: 'Customer Added',
        detail: 'Customer information saved',
        life: 2000
    });
};

const clearCart = () => {
    posStore.clearCart();
    toast.add({
        severity: 'info',
        summary: 'Cart Cleared',
        detail: 'All items removed from cart',
        life: 2000
    });
};

// Lifecycle
onMounted(async () => {
    await menuStore.fetchCategories();
    await menuStore.fetchItems();
    await posStore.fetchDiscounts();

    // Set default cashier (in real app, get from auth store)
    posStore.setCashierInfo({
        id: 1,
        name: 'John Doe',
        employeeId: 'EMP001'
    });
});

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const getItemImage = (item) => {
    return item.image || '/api/placeholder/200/150';
};
</script>

<template>
    <div class="pos-layout min-h-screen bg-gray-50">
        <!-- Header -->
        <Toolbar class="shadow-sm">
            <template #start>
                <h1 class="text-2xl font-bold text-gray-800">Point of Sale</h1>
            </template>
            <template #center>
                <div class="flex items-center gap-4">
                    <div class="relative">
                        <InputText v-model="searchQuery" placeholder="Search menu items..." class="w-80" />
                        <i class="pi pi-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <Dropdown v-model="selectedCategory" :options="categories" option-label="name" placeholder="All Categories" class="w-48" show-clear />
                </div>
            </template>
            <template #end>
                <div class="flex items-center gap-2">
                    <Button icon="pi pi-user" label="Customer" @click="showCustomerDialog = true" class="p-button-outlined" />
                    <Button icon="pi pi-trash" label="Clear Cart" @click="clearCart" :disabled="cartItemsCount === 0" severity="secondary" class="p-button-outlined" />
                </div>
            </template>
        </Toolbar>

        <div class="flex gap-6 min-h-screen POS-Parent-component">
            <!-- Menu Items Section -->
            <div class="flex-1 p-4 POS-Menu-component">
                <Card class="h-full">
                    <template #title>
                        <div class="flex justify-between items-center">
                            <span>Menu Items</span>
                            <Badge :value="filteredItems.length" severity="info" />
                        </div>
                    </template>
                    <template #content>
                        <ScrollPanel style="width: 100%; height: calc(100vh - 200px)">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <Card v-for="item in filteredItems" :key="item.id" class="menu-item-card cursor-pointer hover:shadow-lg transition-shadow duration-200" @click="addItemToCart(item)">
                                    <template #header>
                                        <img :src="getItemImage(item)" :alt="item.name" class="w-full h-32 object-cover" />
                                    </template>
                                    <template #title>
                                        <div class="text-lg font-semibold text-gray-800 truncate">
                                            {{ item.name }}
                                        </div>
                                    </template>
                                    <template #subtitle>
                                        <div class="text-sm text-gray-600 mb-2">
                                            {{ item.description }}
                                        </div>
                                    </template>
                                    <template #content>
                                        <div class="flex justify-between items-center">
                                            <span class="text-xl font-bold text-green-600">
                                                {{ formatCurrency(item.price) }}
                                            </span>
                                            <div class="flex gap-1">
                                                <Tag v-if="item.isVegetarian" severity="success" value="Veg" />
                                                <Tag v-if="item.isVegan" severity="info" value="Vegan" />
                                                <Tag v-if="item.spiceLevel > 0" severity="warning" :value="`🌶️${item.spiceLevel}`" />
                                            </div>
                                        </div>
                                        <div class="text-sm text-gray-500 mt-2">Prep time: {{ item.prepTime }} min</div>
                                    </template>
                                </Card>
                            </div>
                        </ScrollPanel>
                    </template>
                </Card>
            </div>

            <!-- Cart Section -->
            <div class="w-96 POS-Order-Summary-component">
                <Card class="h-full">
                    <template #title>
                        <div class="flex justify-between items-center">
                            <span>Order Summary</span>
                            <Badge :value="cartItemsCount" severity="success" />
                        </div>
                    </template>
                    <template #content>
                        <PosCart />

                        <Divider />

                        <!-- Order Total -->
                        <div class="space-y-3 mb-4">
                            <div class="flex justify-between text-lg">
                                <span>Subtotal:</span>
                                <span>{{ formatCurrency(posStore.cartSubtotal) }}</span>
                            </div>
                            <div v-if="posStore.appliedDiscount" class="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>-{{ formatCurrency(posStore.discountAmount) }}</span>
                            </div>
                            <div class="flex justify-between text-sm text-gray-600">
                                <span style="color: var(--text-color)">Tax ({{ (posStore.taxRate * 100).toFixed(0) }}%):</span>
                                <span style="color: var(--text-color)">{{ formatCurrency(posStore.cartTax) }}</span>
                            </div>
                            <div class="flex justify-between text-sm text-gray-600">
                                <span style="color: var(--text-color)">Service Charge ({{ (posStore.serviceChargeRate * 100).toFixed(0) }}%):</span>
                                <span style="color: var(--text-color)">{{ formatCurrency(posStore.cartServiceCharge) }}</span>
                            </div>
                            <Divider />
                            <div class="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span>{{ formatCurrency(cartTotal) }}</span>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="space-y-2">
                            <Button label="Process Payment" icon="pi pi-credit-card" @click="proceedToPayment" :disabled="cartItemsCount === 0" class="w-full" size="large" />
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Customer Dialog -->
        <Dialog :visible="showCustomerDialog" @update:visible="showCustomerDialog = $event" header="Customer Information" :modal="true" :style="{ width: '400px' }">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <InputText v-model="customerForm.name" class="w-full" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <InputText v-model="customerForm.phone" class="w-full" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <InputText v-model="customerForm.email" class="w-full" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Table Number</label>
                    <InputNumber v-model="customerForm.tableId" class="w-full" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showCustomerDialog = false" />
                <Button label="Save" @click="saveCustomer" />
            </template>
        </Dialog>

        <!-- Payment Dialog -->
        <PaymentDialog :visible="showPaymentDialog" @update:visible="showPaymentDialog = $event" :transaction="posStore.currentTransaction" @payment-complete="handlePaymentComplete" />
    </div>
</template>

<style scoped>
.pos-layout {
    background: #f8fafc;
}

.menu-item-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.2s ease-in-out;
}

.menu-item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
}

.menu-item-card:active {
    transform: translateY(0);
}

.POS-Menu-component {
    border-radius: 10px;
    background-color: var(--surface-card);
    color: var(--text-color);
}
.POS-Order-Summary-component {
    border-radius: 10px;
}
.POS-Parent-component {
    background-color: var(--surface-card);
    color: var(--text-color);
    padding: 0.75rem;
    border-radius: 0.5rem;
}
</style>
