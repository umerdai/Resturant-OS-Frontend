<script setup>
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

const toast = useToast();

// Reactive data
const menuItems = ref([]);
const categories = ref([]);
const branches = ref([]);
const searchQuery = ref('');
const selectedCategory = ref(null);
const showPaymentDialog = ref(false);
const showCustomerDialog = ref(false);
const isLoading = ref(false);
const cart = ref([]);
const customerForm = ref({
    name: '',
    phone: '',
    email: '',
    tableId: null
});
const selectedBranch = ref(null);
const discountAmount = ref(0);

// Computed properties
const filteredItems = computed(() => {
    let items = [...menuItems.value];

    if (selectedCategory.value) {
        items = items.filter((item) => item.category_id === selectedCategory.value || item.category === selectedCategory.value);
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        items = items.filter((item) => item.name.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query)));
    }

    return items.filter((item) => item.is_available || item.status === 'available');
});

const cartItemsCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0);
});

const cartSubtotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

const cartTax = computed(() => {
    return cartSubtotal.value * 0.05; // 5% tax
});

const cartTotal = computed(() => {
    return cartSubtotal.value + cartTax.value;
});

// Methods
const fetchMenuItems = async () => {
    isLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found');
        }

        const response = await fetch('http://localhost:8000/menu-items/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Menu items fetched successfully.', data);
            const items = data.results || data;

            // Normalize data
            menuItems.value = items.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: parseFloat(item.sale_price || item.price || 0),
                cost_price: parseFloat(item.cost_price || 0),
                is_available: item.status === 'available' || item.is_available,
                category_id: item.category || item.category_id,
                category_name: item.category_name,
                image: item.image_url || item.image || '/demo/images/food-placeholder.jpg',
                preparation_time: item.preparation_time || 15
            }));
        }
    } catch (error) {
        console.error('Error fetching menu items:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch menu items',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

const fetchCategories = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        let url = 'http://localhost:8000/categories/';
        if (restaurantId) {
            url += `?restaurant_id=${restaurantId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            categories.value = data.results || data;
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const fetchBranches = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const restaurantId = localStorage.getItem('restaurant_id') || localStorage.getItem('restaurantId');
        let url = 'http://localhost:8000/branches/';
        if (restaurantId) {
            url += `?restaurant_id=${restaurantId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            branches.value = data.results || data;
            
            // Auto-select branch from localStorage or first branch
            const savedBranchId = localStorage.getItem('branch_id');
            if (savedBranchId) {
                selectedBranch.value = parseInt(savedBranchId);
            } else if (branches.value.length > 0) {
                selectedBranch.value = branches.value[0].id;
            }
        }
    } catch (error) {
        console.error('Error fetching branches:', error);
    }
};

const addItemToCart = (item) => {
    const existingItem = cart.value.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.value.push({
            ...item,
            quantity: 1
        });
    }

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

    showPaymentDialog.value = true;
};

const handlePaymentComplete = (paymentResult) => {
    showPaymentDialog.value = false;
    if (paymentResult && paymentResult.success) {
        // Reset form after successful payment
        cart.value = [];
        customerForm.value = {
            name: '',
            phone: '',
            email: '',
            tableId: null
        };
        discountAmount.value = 0;
        
        toast.add({
            severity: 'success',
            summary: 'Payment Complete',
            detail: 'Transaction completed successfully',
            life: 5000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Payment Failed',
            detail: paymentResult?.message || 'Payment failed',
            life: 3000
        });
    }
};

const saveCustomer = () => {
    showCustomerDialog.value = false;
    toast.add({
        severity: 'success',
        summary: 'Customer Added',
        detail: 'Customer information saved',
        life: 2000
    });
};

const clearCart = () => {
    cart.value = [];
    toast.add({
        severity: 'info',
        summary: 'Cart Cleared',
        detail: 'All items removed from cart',
        life: 2000
    });
};

const removeFromCart = (itemId) => {
    const index = cart.value.findIndex((item) => item.id === itemId);
    if (index !== -1) {
        cart.value.splice(index, 1);
    }
};

const updateCartItemQuantity = (itemId, quantity) => {
    const item = cart.value.find((cartItem) => cartItem.id === itemId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = quantity;
        }
    }
};

// Lifecycle
onMounted(async () => {
    await fetchBranches();
    await fetchCategories();
    await fetchMenuItems();
});

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR'
    }).format(amount);
};

const getItemImage = (item) => {
    return item.image || '/demo/images/food-placeholder.jpg';
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
                    <Dropdown v-model="selectedCategory" :options="categories" optionLabel="name" optionValue="id" placeholder="All Categories" class="w-48" show-clear />
                    <Dropdown v-model="selectedBranch" :options="branches" optionLabel="branch_name" optionValue="id" placeholder="Select Branch" class="w-48" />
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
                                                <Tag v-if="item.category_name" severity="info" :value="item.category_name" />
                                            </div>
                                        </div>
                                        <div v-if="item.preparation_time" class="text-sm text-gray-500 mt-2">Prep time: {{ item.preparation_time }} min</div>
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
                        <!-- Cart Items -->
                        <ScrollPanel style="width: 100%; height: 300px">
                            <div v-if="cart.length === 0" class="text-center py-8 text-gray-500">
                                <i class="pi pi-shopping-cart text-4xl mb-2"></i>
                                <p>Cart is empty</p>
                            </div>
                            <div v-else class="space-y-2">
                                <div v-for="item in cart" :key="item.id" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <img :src="getItemImage(item)" :alt="item.name" class="w-12 h-12 object-cover rounded" />
                                    <div class="flex-1">
                                        <div class="font-semibold">{{ item.name }}</div>
                                        <div class="text-sm text-gray-600">{{ formatCurrency(item.price) }}</div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Button icon="pi pi-minus" size="small" class="p-button-text" @click="updateCartItemQuantity(item.id, item.quantity - 1)" />
                                        <span class="font-semibold">{{ item.quantity }}</span>
                                        <Button icon="pi pi-plus" size="small" class="p-button-text" @click="updateCartItemQuantity(item.id, item.quantity + 1)" />
                                    </div>
                                    <Button icon="pi pi-trash" size="small" class="p-button-danger p-button-text" @click="removeFromCart(item.id)" />
                                </div>
                            </div>
                        </ScrollPanel>

                        <Divider />

                        <!-- Order Total -->
                        <div class="space-y-3 mb-4">
                            <div class="flex justify-between text-lg">
                                <span>Subtotal:</span>
                                <span>{{ formatCurrency(cartSubtotal) }}</span>
                            </div>
                            <div class="flex justify-between text-sm text-gray-600">
                                <span style="color: var(--text-color)">Tax (5%):</span>
                                <span style="color: var(--text-color)">{{ formatCurrency(cartTax) }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm">Discount:</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-sm">₨</span>
                                    <InputNumber v-model="discountAmount" :min="0" :max="cartSubtotal" class="w-24" size="small" />
                                </div>
                            </div>
                            <Divider />
                            <div class="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span>{{ formatCurrency(cartTotal - discountAmount) }}</span>
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
        <PaymentDialog 
            v-if="showPaymentDialog" 
            :visible="showPaymentDialog" 
            @update:visible="showPaymentDialog = $event" 
            :cart="cart" 
            :total="cartTotal" 
            :customer="customerForm"
            :branch-id="selectedBranch"
            :discount="discountAmount"
            @payment-complete="handlePaymentComplete" 
        />
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
