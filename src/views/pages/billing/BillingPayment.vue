<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useOrderStore } from '@/stores/order';
import { useTableStore } from '@/stores/table';

const toast = useToast();
const orderStore = useOrderStore();
const tableStore = useTableStore();

// Component state
const selectedOrder = ref(null);
const selectedPaymentMethod = ref(null);
const selectedDiscount = ref(null);
const selectedTip = ref(0);
const customDiscountAmount = ref(0);
const customTipAmount = ref(0);
const cashReceived = ref(0);
const isSplitPayment = ref(false);
const splitCount = ref(1);

// Dialog states
const showPaymentSuccess = ref(false);
const showReceiptsDialog = ref(false);
const showPaymentHistory = ref(false);
const loadingReceipts = ref(false);
const loadingPaymentHistory = ref(false);

// Processed payment info
const processedPayment = ref(null);

// Receipts and history
const recentReceipts = ref([]);
const paymentHistory = ref([]);

// Filters
const paymentHistoryFilters = ref({
    dateRange: null,
    method: null
});

// Constants
const taxRate = 0.08; // 8% tax

// Static data
const paymentMethods = [
    { type: 'cash', label: 'Cash', icon: 'pi pi-money-bill' },
    { type: 'card', label: 'Card', icon: 'pi pi-credit-card' },
    { type: 'digital', label: 'Digital Wallet', icon: 'pi pi-mobile' },
    { type: 'gift_card', label: 'Gift Card', icon: 'pi pi-gift' }
];

const discountOptions = [
    { type: 'student', label: '10% Student', percentage: 10 },
    { type: 'senior', label: '15% Senior', percentage: 15 },
    { type: 'employee', label: '20% Employee', percentage: 20 },
    { type: 'loyalty', label: '5% Loyalty', percentage: 5 }
];

const tipOptions = [{ percentage: 15 }, { percentage: 18 }, { percentage: 20 }, { percentage: 25 }];

const splitOptions = [{ count: 2 }, { count: 3 }, { count: 4 }, { count: 6 }];

const paymentMethodFilter = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'Digital Wallet', value: 'digital' },
    { label: 'Gift Card', value: 'gift_card' }
];

// Computed properties
const readyOrders = computed(() => {
    return orderStore.orders.filter((order) => order.status === 'ready');
});

const billCalculation = computed(() => {
    if (!selectedOrder.value) {
        return { subtotal: 0, tax: 0, discount: 0, tip: 0, total: 0 };
    }

    const subtotal = calculateOrderTotal(selectedOrder.value);
    const discount = selectedDiscount.value ? (subtotal * selectedDiscount.value.percentage) / 100 : customDiscountAmount.value || 0;
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * taxRate;
    const tip = (customTipAmount.value || 0) + (selectedTip.value ? (discountedSubtotal * selectedTip.value) / 100 : 0);

    return {
        subtotal,
        tax,
        discount,
        tip,
        total: discountedSubtotal + tax
    };
});

const finalTotal = computed(() => {
    return billCalculation.value.total + billCalculation.value.tip;
});

const changeDue = computed(() => {
    if (selectedPaymentMethod.value?.type !== 'cash' || !cashReceived.value) {
        return 0;
    }
    return Math.max(0, cashReceived.value - finalTotal.value);
});

const dailySummary = computed(() => {
    const today = new Date().toDateString();
    const todayPayments = paymentHistory.value.filter((p) => new Date(p.timestamp).toDateString() === today && p.status === 'completed');

    const totalSales = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalTips = todayPayments.reduce((sum, p) => sum + (p.tip || 0), 0);
    const transactionCount = todayPayments.length;
    const averageTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

    return {
        totalSales,
        totalTips,
        transactionCount,
        averageTransaction
    };
});

const filteredPaymentHistory = computed(() => {
    let filtered = [...paymentHistory.value];

    if (paymentHistoryFilters.value.dateRange && paymentHistoryFilters.value.dateRange.length === 2) {
        const [start, end] = paymentHistoryFilters.value.dateRange;
        filtered = filtered.filter((p) => {
            const date = new Date(p.timestamp);
            return date >= start && date <= end;
        });
    }

    if (paymentHistoryFilters.value.method) {
        filtered = filtered.filter((p) => p.paymentMethod === paymentHistoryFilters.value.method.value);
    }

    return filtered;
});

// Methods
const refreshOrders = async () => {
    await orderStore.fetchOrders();
    toast.add({
        severity: 'info',
        summary: 'Orders Refreshed',
        detail: 'Order list updated',
        life: 2000
    });
};

const selectOrder = (order) => {
    selectedOrder.value = order;
    resetPaymentForm();
};

const resetPaymentForm = () => {
    selectedPaymentMethod.value = null;
    selectedDiscount.value = null;
    selectedTip.value = 0;
    customDiscountAmount.value = 0;
    customTipAmount.value = 0;
    cashReceived.value = 0;
    isSplitPayment.value = false;
    splitCount.value = 1;
};

const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => {
        let itemTotal = item.price * item.quantity;

        // Add modifier costs
        if (item.modifiers) {
            itemTotal += item.modifiers.reduce((modTotal, mod) => modTotal + (mod.price || 0), 0) * item.quantity;
        }

        return total + itemTotal;
    }, 0);
};

const getTableNumber = (tableId) => {
    const table = tableStore.tables.find((t) => t.id === tableId);
    return table ? table.number : tableId;
};

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const selectPaymentMethod = (method) => {
    selectedPaymentMethod.value = method;
    if (method.type === 'cash') {
        cashReceived.value = finalTotal.value;
    }
};

const applyDiscount = (discount) => {
    selectedDiscount.value = selectedDiscount.value?.type === discount.type ? null : discount;
    customDiscountAmount.value = 0;
};

const applyCustomDiscount = () => {
    if (customDiscountAmount.value > 0) {
        selectedDiscount.value = null;
    }
};

const applyTip = (percentage) => {
    selectedTip.value = selectedTip.value === percentage ? 0 : percentage;
    customTipAmount.value = 0;
};

const applyCustomTip = () => {
    if (customTipAmount.value > 0) {
        selectedTip.value = 0;
    }
};

const splitBill = (count) => {
    splitCount.value = count;
    isSplitPayment.value = true;
};

const processPayment = async () => {
    try {
        const paymentData = {
            orderId: selectedOrder.value.id,
            amount: finalTotal.value,
            paymentMethod: selectedPaymentMethod.value.type,
            subtotal: billCalculation.value.subtotal,
            tax: billCalculation.value.tax,
            discount: billCalculation.value.discount,
            tip: billCalculation.value.tip,
            splitPayment: isSplitPayment.value,
            splitCount: splitCount.value,
            cashReceived: cashReceived.value,
            changeDue: changeDue.value,
            transactionId: generateTransactionId()
        };

        // Process the payment
        await orderStore.processPayment(paymentData);

        // Add to payment history
        paymentHistory.value.unshift({
            ...paymentData,
            status: 'completed',
            timestamp: new Date().toISOString()
        });

        // Update order status to completed
        await orderStore.updateOrderStatus(selectedOrder.value.id, 'completed');

        processedPayment.value = paymentData;
        showPaymentSuccess.value = true;

        toast.add({
            severity: 'success',
            summary: 'Payment Processed',
            detail: `Payment of $${paymentData.amount.toFixed(2)} processed successfully`,
            life: 5000
        });

        selectedOrder.value = null;
        resetPaymentForm();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Payment Failed',
            detail: error.message || 'Failed to process payment',
            life: 5000
        });
    }
};

const generateTransactionId = () => {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

const printBill = () => {
    // TODO: Implement bill printing
    toast.add({
        severity: 'info',
        summary: 'Print Bill',
        detail: 'Bill printing feature will be implemented',
        life: 3000
    });
};

const printReceipt = () => {
    // TODO: Implement receipt printing
    toast.add({
        severity: 'info',
        summary: 'Print Receipt',
        detail: 'Receipt printing feature will be implemented',
        life: 3000
    });
};

const emailReceipt = () => {
    // TODO: Implement email receipt
    toast.add({
        severity: 'info',
        summary: 'Email Receipt',
        detail: 'Email receipt feature will be implemented',
        life: 3000
    });
};

const closePaymentSuccess = () => {
    showPaymentSuccess.value = false;
    processedPayment.value = null;
};

const reprintReceipt = (receipt) => {
    // TODO: Implement receipt reprinting
    toast.add({
        severity: 'info',
        summary: 'Reprint Receipt',
        detail: `Reprinting receipt ${receipt.id}`,
        life: 3000
    });
};

const downloadReceipt = (receipt) => {
    // TODO: Implement receipt download
    toast.add({
        severity: 'info',
        summary: 'Download Receipt',
        detail: `Downloading receipt ${receipt.id}`,
        life: 3000
    });
};

const filterPaymentHistory = () => {
    // The filtering is handled by the computed property
    toast.add({
        severity: 'info',
        summary: 'Filter Applied',
        detail: 'Payment history filtered',
        life: 2000
    });
};

// Mock data generators
const generateMockReceipts = () => {
    const receipts = [];
    for (let i = 1; i <= 25; i++) {
        receipts.push({
            id: `RCP${String(i).padStart(4, '0')}`,
            orderId: 100 + i,
            amount: Math.random() * 50 + 10,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)].label,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    return receipts;
};

const generateMockPaymentHistory = () => {
    const history = [];
    for (let i = 1; i <= 50; i++) {
        const amount = Math.random() * 80 + 15;
        const tip = Math.random() * 15 + 2;
        history.push({
            transactionId: `TXN${String(i).padStart(6, '0')}`,
            orderId: 200 + i,
            amount,
            tip,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)].type,
            status: Math.random() > 0.1 ? 'completed' : 'pending',
            timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    return history;
};

// Lifecycle
onMounted(async () => {
    await Promise.all([orderStore.fetchOrders(), tableStore.loadTables()]);

    // Generate mock data
    recentReceipts.value = generateMockReceipts();
    paymentHistory.value = generateMockPaymentHistory();
});
</script>

<template>
    <div class="billing-payment">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Billing & Payment</h1>
                <p class="text-surface-600 dark:text-surface-400">Process payments and generate receipts</p>
            </div>
            <div class="flex gap-2">
                <Button label="View Receipts" icon="pi pi-file-pdf" outlined @click="showReceiptsDialog = true" />
                <Button label="Payment History" icon="pi pi-history" outlined @click="showPaymentHistory = true" />
            </div>
        </div>

        <!-- Daily Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-green-600 mb-1">${{ dailySummary.totalSales.toFixed(2) }}</div>
                        <div class="text-sm text-muted-color">Total Sales</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-blue-600 mb-1">
                            {{ dailySummary.transactionCount }}
                        </div>
                        <div class="text-sm text-muted-color">Transactions</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-orange-600 mb-1">${{ dailySummary.averageTransaction.toFixed(2) }}</div>
                        <div class="text-sm text-muted-color">Avg Transaction</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-purple-600 mb-1">${{ dailySummary.totalTips.toFixed(2) }}</div>
                        <div class="text-sm text-muted-color">Total Tips</div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Order Selection -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Orders List -->
            <Card>
                <template #title>
                    <div class="flex justify-between items-center">
                        <span>Orders Ready for Payment</span>
                        <Button icon="pi pi-refresh" size="small" outlined @click="refreshOrders" />
                    </div>
                </template>
                <template #content>
                    <div class="space-y-3">
                        <div
                            v-for="order in readyOrders"
                            :key="order.id"
                            class="p-4 border border-surface-200 dark:border-surface-700 rounded-lg cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                            :class="{ 'ring-2 ring-blue-500': selectedOrder?.id === order.id }"
                            @click="selectOrder(order)"
                        >
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="flex items-center gap-2 mb-2">
                                        <Tag :value="`Order #${order.id}`" severity="info" />
                                        <Tag :value="`Table ${getTableNumber(order.tableId)}`" />
                                    </div>
                                    <div class="space-y-1">
                                        <div v-for="item in order.items" :key="item.id" class="text-sm text-surface-600 dark:text-surface-400">{{ item.quantity }}x {{ item.name }} - ${{ (item.price * item.quantity).toFixed(2) }}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-lg font-bold text-green-600">${{ calculateOrderTotal(order).toFixed(2) }}</div>
                                    <div class="text-xs text-surface-500 dark:text-surface-500">
                                        {{ formatTime(order.createdAt) }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-if="readyOrders.length === 0" class="text-center py-8">
                            <i class="pi pi-inbox text-4xl text-surface-400 dark:text-surface-600 mb-2"></i>
                            <p class="text-surface-500 dark:text-surface-500">No orders ready for payment</p>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Payment Processing -->
            <Card>
                <template #title>
                    <span>Payment Processing</span>
                </template>
                <template #content>
                    <div v-if="selectedOrder" class="space-y-6">
                        <!-- Order Summary -->
                        <div class="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="font-semibold">Order #{{ selectedOrder.id }}</h4>
                                <Tag :value="`Table ${getTableNumber(selectedOrder.tableId)}`" />
                            </div>

                            <!-- Bill Breakdown -->
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${{ billCalculation.subtotal.toFixed(2) }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span>Tax ({{ taxRate * 100 }}%)</span>
                                    <span>${{ billCalculation.tax.toFixed(2) }}</span>
                                </div>
                                <div v-if="billCalculation.discount > 0" class="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-${{ billCalculation.discount.toFixed(2) }}</span>
                                </div>
                                <Divider class="my-2" />
                                <div class="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>${{ billCalculation.total.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Discount Options -->
                        <div class="space-y-3">
                            <h5 class="font-semibold">Discount Options</h5>
                            <div class="grid grid-cols-2 gap-2">
                                <Button v-for="discount in discountOptions" :key="discount.type" :label="discount.label" size="small" :severity="selectedDiscount?.type === discount.type ? 'success' : 'secondary'" @click="applyDiscount(discount)" />
                            </div>
                            <div class="flex gap-2">
                                <InputNumber v-model="customDiscountAmount" placeholder="Custom discount" mode="currency" currency="USD" :min="0" :max="billCalculation.subtotal" class="flex-1" />
                                <Button label="Apply" @click="applyCustomDiscount" />
                            </div>
                        </div>

                        <!-- Payment Method Selection -->
                        <div class="space-y-3">
                            <h5 class="font-semibold">Payment Method</h5>
                            <div class="grid grid-cols-2 gap-2">
                                <Button
                                    v-for="method in paymentMethods"
                                    :key="method.type"
                                    :label="method.label"
                                    :icon="method.icon"
                                    size="small"
                                    :severity="selectedPaymentMethod?.type === method.type ? 'success' : 'secondary'"
                                    @click="selectPaymentMethod(method)"
                                />
                            </div>
                        </div>

                        <!-- Cash Payment Specifics -->
                        <div v-if="selectedPaymentMethod?.type === 'cash'" class="space-y-3">
                            <h5 class="font-semibold">Cash Payment</h5>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">Amount Received</label>
                                    <InputNumber v-model="cashReceived" mode="currency" currency="USD" :min="billCalculation.total" class="w-full" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Change Due</label>
                                    <div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <span class="text-lg font-bold text-green-700 dark:text-green-300"> ${{ changeDue.toFixed(2) }} </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Split Payment Options -->
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <h5 class="font-semibold">Split Payment</h5>
                                <ToggleButton v-model="isSplitPayment" onLabel="Enabled" offLabel="Disabled" onIcon="pi pi-check" offIcon="pi pi-times" />
                            </div>

                            <div v-if="isSplitPayment" class="space-y-2">
                                <div class="grid grid-cols-3 gap-2">
                                    <Button v-for="split in splitOptions" :key="split.count" :label="`${split.count} Ways`" size="small" @click="splitBill(split.count)" />
                                </div>
                                <div class="text-sm text-surface-600 dark:text-surface-400">Each person pays: ${{ (billCalculation.total / (splitCount || 1)).toFixed(2) }}</div>
                            </div>
                        </div>

                        <!-- Tip Options -->
                        <div class="space-y-3">
                            <h5 class="font-semibold">Add Tip</h5>
                            <div class="grid grid-cols-4 gap-2">
                                <Button
                                    v-for="tipOption in tipOptions"
                                    :key="tipOption.percentage"
                                    :label="`${tipOption.percentage}%`"
                                    size="small"
                                    :severity="selectedTip === tipOption.percentage ? 'success' : 'secondary'"
                                    @click="applyTip(tipOption.percentage)"
                                />
                            </div>
                            <div class="flex gap-2">
                                <InputNumber v-model="customTipAmount" placeholder="Custom tip" mode="currency" currency="USD" :min="0" class="flex-1" />
                                <Button label="Apply" @click="applyCustomTip" />
                            </div>
                            <div v-if="billCalculation.tip > 0" class="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <span class="text-blue-700 dark:text-blue-300 font-medium"> Tip: ${{ billCalculation.tip.toFixed(2) }} </span>
                            </div>
                        </div>

                        <!-- Final Total -->
                        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <div class="text-center">
                                <div class="text-sm text-green-700 dark:text-green-300 mb-1">Final Total</div>
                                <div class="text-2xl font-bold text-green-700 dark:text-green-300">${{ finalTotal.toFixed(2) }}</div>
                            </div>
                        </div>

                        <!-- Payment Actions -->
                        <div class="flex gap-2">
                            <Button label="Process Payment" icon="pi pi-credit-card" :disabled="!selectedPaymentMethod || (selectedPaymentMethod.type === 'cash' && cashReceived < billCalculation.total)" @click="processPayment" class="flex-1" />
                            <Button label="Print Bill" icon="pi pi-print" outlined @click="printBill" />
                        </div>
                    </div>

                    <!-- No Order Selected -->
                    <div v-else class="text-center py-8">
                        <i class="pi pi-hand-pointer text-4xl text-surface-400 dark:text-surface-600 mb-2"></i>
                        <p class="text-surface-500 dark:text-surface-500">Select an order to process payment</p>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Payment Success Dialog -->
        <Dialog :visible="showPaymentSuccess" @update:visible="showPaymentSuccess = $event" modal header="Payment Successful" :style="{ width: '450px' }">
            <div class="text-center space-y-4">
                <i class="pi pi-check-circle text-6xl text-green-500"></i>
                <div>
                    <h3 class="text-xl font-semibold mb-2">Payment Processed Successfully!</h3>
                    <p class="text-surface-600 dark:text-surface-400">Order #{{ processedPayment?.orderId }} has been paid</p>
                </div>

                <div class="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Amount Paid:</span>
                            <span class="font-medium">${{ processedPayment?.amount?.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Payment Method:</span>
                            <span class="font-medium">{{ processedPayment?.method }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Transaction ID:</span>
                            <span class="font-medium">{{ processedPayment?.transactionId }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex gap-2">
                    <Button label="Print Receipt" icon="pi pi-print" @click="printReceipt" class="flex-1" />
                    <Button label="Email Receipt" icon="pi pi-send" outlined @click="emailReceipt" class="flex-1" />
                </div>

                <Button label="Close" @click="closePaymentSuccess" class="w-full" outlined />
            </div>
        </Dialog>

        <!-- Receipts Dialog -->
        <Dialog :visible="showReceiptsDialog" @update:visible="showReceiptsDialog = $event" modal header="Recent Receipts" :style="{ width: '800px' }">
            <DataTable :value="recentReceipts" paginator :rows="10" :loading="loadingReceipts">
                <Column field="id" header="Receipt ID" sortable></Column>
                <Column field="orderId" header="Order ID" sortable></Column>
                <Column field="amount" header="Amount" sortable>
                    <template #body="slotProps"> ${{ slotProps.data.amount.toFixed(2) }} </template>
                </Column>
                <Column field="paymentMethod" header="Method" sortable></Column>
                <Column field="timestamp" header="Date" sortable>
                    <template #body="slotProps">
                        {{ new Date(slotProps.data.timestamp).toLocaleDateString() }}
                    </template>
                </Column>
                <Column header="Actions">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button icon="pi pi-print" size="small" outlined @click="reprintReceipt(slotProps.data)" />
                            <Button icon="pi pi-download" size="small" outlined @click="downloadReceipt(slotProps.data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </Dialog>

        <!-- Payment History Dialog -->
        <Dialog :visible="showPaymentHistory" @update:visible="showPaymentHistory = $event" modal header="Payment History" :style="{ width: '1000px' }">
            <div class="space-y-4">
                <!-- Filters -->
                <div class="flex gap-4 items-center">
                    <Calendar v-model="paymentHistoryFilters.dateRange" selectionMode="range" placeholder="Select date range" class="w-64" />
                    <Dropdown v-model="paymentHistoryFilters.method" :options="paymentMethodFilter" optionLabel="label" placeholder="All Methods" class="w-48" showClear />
                    <Button label="Apply Filter" @click="filterPaymentHistory" />
                </div>

                <DataTable :value="filteredPaymentHistory" paginator :rows="15" :loading="loadingPaymentHistory" sortField="timestamp" :sortOrder="-1">
                    <Column field="transactionId" header="Transaction ID" sortable></Column>
                    <Column field="orderId" header="Order ID" sortable></Column>
                    <Column field="amount" header="Amount" sortable>
                        <template #body="slotProps"> ${{ slotProps.data.amount.toFixed(2) }} </template>
                    </Column>
                    <Column field="tip" header="Tip" sortable>
                        <template #body="slotProps"> ${{ (slotProps.data.tip || 0).toFixed(2) }} </template>
                    </Column>
                    <Column field="paymentMethod" header="Method" sortable>
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.paymentMethod" />
                        </template>
                    </Column>
                    <Column field="status" header="Status" sortable>
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'completed' ? 'success' : 'warning'" />
                        </template>
                    </Column>
                    <Column field="timestamp" header="Date & Time" sortable>
                        <template #body="slotProps">
                            {{ new Date(slotProps.data.timestamp).toLocaleString() }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.billing-payment {
    padding: 1rem;
}
</style>
