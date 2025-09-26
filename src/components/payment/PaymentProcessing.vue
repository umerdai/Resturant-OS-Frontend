<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePaymentStore } from '@/stores/payment.js';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Badge from 'primevue/badge';
import Divider from 'primevue/divider';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';

const paymentStore = usePaymentStore();
const toast = useToast();

// Reactive data
const showPaymentDialog = ref(false);
const showSplitDialog = ref(false);
const showReceiptDialog = ref(false);
const showSettingsDialog = ref(false);
const isProcessing = ref(false);
const currentReceipt = ref(null);

// Payment form
const paymentForm = ref({
    orderId: 'ORD-001',
    customerId: null,
    amount: 0,
    tip: 0,
    method: 'cash',
    cashReceived: 0,
    cardDetails: {
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    },
    giftCard: {
        number: '',
        pin: ''
    },
    walletType: 'apple_pay'
});

// Split payment form
const splitForm = ref({
    orderId: 'ORD-001',
    totalAmount: 100.0,
    tip: 0,
    payments: [
        { method: 'cash', amount: 50.0 },
        { method: 'card', amount: 50.0 }
    ]
});

// Settings form
const settingsForm = ref({
    autoReceipt: true,
    emailReceipts: true,
    smsReceipts: false,
    printerEnabled: true,
    requireSignature: 50.0,
    tipSuggestions: [15, 18, 20, 22],
    roundingEnabled: true
});

// Computed properties
const paymentMethods = computed(() => paymentStore.enabledPaymentMethods);
const transactions = computed(() => paymentStore.transactions);
const todayTotal = computed(() => paymentStore.todayTotal);
const currentPayment = computed(() => paymentStore.currentPayment);

const totalSplitAmount = computed(() => splitForm.value.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0));

const changeAmount = computed(() => {
    if (paymentForm.value.method === 'cash') {
        return Math.max(0, paymentForm.value.cashReceived - (paymentForm.value.amount + paymentForm.value.tip));
    }
    return 0;
});

// Methods
const openPaymentDialog = (orderData = {}) => {
    paymentForm.value = {
        orderId: orderData.orderId || 'ORD-001',
        customerId: orderData.customerId || null,
        amount: orderData.amount || 0,
        tip: 0,
        method: 'cash',
        cashReceived: 0,
        cardDetails: { number: '', expiry: '', cvv: '', name: '' },
        giftCard: { number: '', pin: '' },
        walletType: 'apple_pay'
    };
    showPaymentDialog.value = true;
};

const processPayment = async () => {
    try {
        isProcessing.value = true;

        const paymentData = {
            orderId: paymentForm.value.orderId,
            customerId: paymentForm.value.customerId,
            amount: paymentForm.value.amount,
            tip: paymentForm.value.tip,
            method: paymentForm.value.method
        };

        // Add method-specific data
        if (paymentForm.value.method === 'cash') {
            paymentData.cashReceived = paymentForm.value.cashReceived;
        } else if (paymentForm.value.method === 'digital_wallet') {
            paymentData.walletType = paymentForm.value.walletType;
        } else if (paymentForm.value.method === 'gift_card') {
            paymentData.giftCardNumber = paymentForm.value.giftCard.number;
            paymentData.pin = paymentForm.value.giftCard.pin;
        }

        const result = await paymentStore.processPayment(paymentData);

        if (result.success) {
            showPaymentDialog.value = false;
            toast.add({
                severity: 'success',
                summary: 'Payment Successful',
                detail: result.message,
                life: 3000
            });

            if (result.change > 0) {
                toast.add({
                    severity: 'info',
                    summary: 'Change Due',
                    detail: `Change: $${result.change.toFixed(2)}`,
                    life: 5000
                });
            }
        } else {
            toast.add({
                severity: 'error',
                summary: 'Payment Failed',
                detail: result.error,
                life: 4000
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Processing Error',
            detail: error.message,
            life: 4000
        });
    } finally {
        isProcessing.value = false;
    }
};

const openSplitDialog = (orderData = {}) => {
    splitForm.value = {
        orderId: orderData.orderId || 'ORD-001',
        totalAmount: orderData.amount || 100.0,
        tip: 0,
        payments: [
            { method: 'cash', amount: (orderData.amount || 100.0) / 2 },
            { method: 'card', amount: (orderData.amount || 100.0) / 2 }
        ]
    };
    showSplitDialog.value = true;
};

const addSplitPayment = () => {
    splitForm.value.payments.push({
        method: 'cash',
        amount: 0
    });
};

const removeSplitPayment = (index) => {
    if (splitForm.value.payments.length > 1) {
        splitForm.value.payments.splice(index, 1);
    }
};

const processSplitPayment = async () => {
    try {
        isProcessing.value = true;

        const result = await paymentStore.processSplitPayment(splitForm.value);

        if (result.success) {
            showSplitDialog.value = false;
            toast.add({
                severity: 'success',
                summary: 'Split Payment Successful',
                detail: result.message,
                life: 3000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Split Payment Failed',
                detail: result.message,
                life: 4000
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Processing Error',
            detail: error.message,
            life: 4000
        });
    } finally {
        isProcessing.value = false;
    }
};

const viewReceipt = (transaction) => {
    const receipt = paymentStore.receipts.find((r) => r.transactionId === transaction.id);
    currentReceipt.value = receipt;
    showReceiptDialog.value = true;
};

const printReceipt = async (receipt) => {
    const result = await paymentStore.printReceipt(receipt);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Receipt Printed',
            detail: 'Receipt sent to printer',
            life: 2000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Print Failed',
            detail: result.error,
            life: 3000
        });
    }
};

const emailReceipt = async (receipt) => {
    const result = await paymentStore.emailReceipt(receipt);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Email Sent',
            detail: 'Receipt emailed to customer',
            life: 2000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Email Failed',
            detail: result.error,
            life: 3000
        });
    }
};

const refundPayment = async (transaction) => {
    try {
        const result = await paymentStore.refundPayment(transaction.id);
        if (result.success) {
            toast.add({
                severity: 'success',
                summary: 'Refund Processed',
                detail: `Refund of $${result.refund.amount.toFixed(2)} processed`,
                life: 3000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Refund Failed',
                detail: result.error,
                life: 3000
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Refund Error',
            detail: error.message,
            life: 3000
        });
    }
};

const openSettings = () => {
    settingsForm.value = { ...paymentStore.settings };
    showSettingsDialog.value = true;
};

const saveSettings = () => {
    paymentStore.updatePaymentSettings(settingsForm.value);
    showSettingsDialog.value = false;
    toast.add({
        severity: 'success',
        summary: 'Settings Updated',
        detail: 'Payment settings saved successfully',
        life: 2000
    });
};

const getStatusColor = (status) => {
    const colors = {
        completed: 'success',
        processing: 'warning',
        failed: 'danger',
        pending: 'info',
        partial: 'warning'
    };
    return colors[status] || 'secondary';
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Quick tip calculations
const addTipPercentage = (percentage) => {
    paymentForm.value.tip = (paymentForm.value.amount * percentage) / 100;
};

// Lifecycle
onMounted(async () => {
    await paymentStore.initializePayments();
});
</script>

<template>
    <div class="payment-processing p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Payment Processing</h1>
                <p class="text-gray-600">Advanced payment methods, split payments, and receipt management</p>
            </div>

            <div class="flex gap-2">
                <Button label="Process Payment" icon="pi pi-credit-card" @click="openPaymentDialog()" />
                <Button label="Split Payment" icon="pi pi-share-alt" severity="secondary" @click="openSplitDialog()" />
                <Button icon="pi pi-cog" severity="help" @click="openSettings" v-tooltip="'Payment Settings'" />
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-green-600">{{ formatCurrency(todayTotal) }}</div>
                    <div class="text-sm text-gray-600">Today's Total</div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-blue-600">{{ transactions.filter((t) => t.status === 'completed').length }}</div>
                    <div class="text-sm text-gray-600">Completed</div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-orange-600">{{ transactions.filter((t) => t.status === 'pending').length }}</div>
                    <div class="text-sm text-gray-600">Pending</div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="text-2xl font-bold text-red-600">{{ transactions.filter((t) => t.status === 'failed').length }}</div>
                    <div class="text-sm text-gray-600">Failed</div>
                </template>
            </Card>
        </div>

        <!-- Payment Methods Grid -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">Available Payment Methods</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <Card v-for="method in paymentMethods" :key="method.id" class="payment-method-card cursor-pointer hover:shadow-lg transition-shadow text-center" @click="openPaymentDialog({ method: method.id })">
                    <template #content>
                        <div class="flex flex-col items-center gap-2">
                            <i :class="method.icon" class="text-2xl" :style="{ color: method.color }"></i>
                            <span class="text-sm font-medium">{{ method.name }}</span>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Transactions Table -->
        <Card>
            <template #title>Recent Transactions</template>
            <template #content>
                <DataTable :value="transactions" :paginator="true" :rows="10" dataKey="id" responsiveLayout="scroll">
                    <Column field="id" header="Transaction ID">
                        <template #body="slotProps">
                            <span class="font-mono text-sm">{{ slotProps.data.id }}</span>
                        </template>
                    </Column>

                    <Column field="orderId" header="Order ID" />

                    <Column field="amount" header="Amount">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.total) }}
                        </template>
                    </Column>

                    <Column field="method" header="Method">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.method === 'split'">
                                <Tag value="SPLIT" severity="info" class="mb-1" />
                                <div class="text-xs space-y-1">
                                    <div v-for="payment in slotProps.data.payments.slice(0, 2)" :key="payment.id" class="flex items-center gap-1">
                                        <i :class="paymentMethods.find((m) => m.id === payment.method)?.icon || 'pi pi-circle'" class="text-xs"></i>
                                        <span>{{ formatCurrency(payment.amount) }}</span>
                                    </div>
                                    <div v-if="slotProps.data.payments.length > 2" class="text-gray-500">+{{ slotProps.data.payments.length - 2 }} more</div>
                                </div>
                            </div>
                            <div v-else class="flex items-center gap-2">
                                <i :class="paymentMethods.find((m) => m.id === slotProps.data.method)?.icon || 'pi pi-circle'"></i>
                                <span class="capitalize">{{ slotProps.data.method.replace('_', ' ') }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="status" header="Status">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.status.toUpperCase()" :severity="getStatusColor(slotProps.data.status)" />
                        </template>
                    </Column>

                    <Column field="date" header="Date">
                        <template #body="slotProps">
                            {{ new Date(slotProps.data.date).toLocaleString() }}
                        </template>
                    </Column>

                    <Column header="Actions">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-file" size="small" severity="info" @click="viewReceipt(slotProps.data)" v-tooltip="'View Receipt'" />
                                <Button v-if="slotProps.data.status === 'completed' && !slotProps.data.refunded" icon="pi pi-undo" size="small" severity="warning" @click="refundPayment(slotProps.data)" v-tooltip="'Refund'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <!-- Payment Dialog -->
        <Dialog :visible="showPaymentDialog" @update:visible="showPaymentDialog = $event" header="Process Payment" :modal="true" :style="{ width: '500px' }">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Order ID</label>
                        <InputText v-model="paymentForm.orderId" class="w-full" readonly />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Payment Method</label>
                        <Dropdown v-model="paymentForm.method" :options="paymentMethods" option-label="name" option-value="id" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Amount</label>
                        <InputNumber v-model="paymentForm.amount" mode="currency" currency="USD" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Tip</label>
                        <InputNumber v-model="paymentForm.tip" mode="currency" currency="USD" class="w-full" />
                    </div>
                </div>

                <!-- Quick Tip Buttons -->
                <div class="flex gap-2 justify-center">
                    <Button v-for="percentage in [15, 18, 20, 22]" :key="percentage" :label="`${percentage}%`" size="small" severity="secondary" @click="addTipPercentage(percentage)" />
                </div>

                <!-- Method-specific fields -->
                <div v-if="paymentForm.method === 'cash'" class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium mb-2">Cash Received</label>
                        <InputNumber v-model="paymentForm.cashReceived" mode="currency" currency="USD" class="w-full" />
                    </div>
                    <div v-if="changeAmount > 0" class="bg-green-50 p-3 rounded-lg">
                        <div class="text-sm font-medium text-green-800">Change: {{ formatCurrency(changeAmount) }}</div>
                    </div>
                </div>

                <div v-if="paymentForm.method === 'digital_wallet'" class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium mb-2">Wallet Type</label>
                        <Dropdown
                            v-model="paymentForm.walletType"
                            :options="[
                                { label: 'Apple Pay', value: 'apple_pay' },
                                { label: 'Google Pay', value: 'google_pay' },
                                { label: 'Samsung Pay', value: 'samsung_pay' }
                            ]"
                            option-label="label"
                            option-value="value"
                            class="w-full"
                        />
                    </div>
                </div>

                <div v-if="paymentForm.method === 'gift_card'" class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium mb-2">Gift Card Number</label>
                        <InputText v-model="paymentForm.giftCard.number" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">PIN</label>
                        <InputText v-model="paymentForm.giftCard.pin" type="password" class="w-full" />
                    </div>
                </div>

                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="text-lg font-semibold">Total: {{ formatCurrency(paymentForm.amount + paymentForm.tip) }}</div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showPaymentDialog = false" :disabled="isProcessing" />
                <Button :label="isProcessing ? 'Processing...' : 'Process Payment'" @click="processPayment" :disabled="isProcessing || (paymentForm.method === 'cash' && changeAmount < 0)">
                    <ProgressSpinner v-if="isProcessing" class="w-4 h-4 mr-2" />
                </Button>
            </template>
        </Dialog>

        <!-- Split Payment Dialog -->
        <Dialog :visible="showSplitDialog" @update:visible="showSplitDialog = $event" header="Split Payment" :modal="true" :style="{ width: '600px' }">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Order ID</label>
                        <InputText v-model="splitForm.orderId" class="w-full" readonly />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Total Amount</label>
                        <InputNumber v-model="splitForm.totalAmount" mode="currency" currency="USD" class="w-full" readonly />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Tip</label>
                    <InputNumber v-model="splitForm.tip" mode="currency" currency="USD" class="w-full" />
                </div>

                <Divider />

                <div>
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-medium">Payment Split</h4>
                        <Button icon="pi pi-plus" label="Add Payment" size="small" @click="addSplitPayment" />
                    </div>

                    <div class="space-y-3">
                        <div v-for="(payment, index) in splitForm.payments" :key="index" class="flex items-center gap-3 p-3 border rounded-lg">
                            <Dropdown v-model="payment.method" :options="paymentMethods" option-label="name" option-value="id" class="flex-1" />
                            <InputNumber v-model="payment.amount" mode="currency" currency="USD" class="flex-1" />
                            <Button icon="pi pi-trash" severity="danger" size="small" @click="removeSplitPayment(index)" :disabled="splitForm.payments.length === 1" />
                        </div>
                    </div>

                    <div class="mt-4 p-3 rounded-lg" :class="Math.abs(totalSplitAmount - splitForm.totalAmount) < 0.01 ? 'bg-green-50' : 'bg-red-50'">
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Split Total:</span>
                            <span class="font-bold">{{ formatCurrency(totalSplitAmount) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Order Total:</span>
                            <span class="font-bold">{{ formatCurrency(splitForm.totalAmount) }}</span>
                        </div>
                        <div class="flex justify-between items-center" :class="Math.abs(totalSplitAmount - splitForm.totalAmount) < 0.01 ? 'text-green-600' : 'text-red-600'">
                            <span class="font-medium">Difference:</span>
                            <span class="font-bold">{{ formatCurrency(totalSplitAmount - splitForm.totalAmount) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showSplitDialog = false" :disabled="isProcessing" />
                <Button :label="isProcessing ? 'Processing...' : 'Process Split Payment'" @click="processSplitPayment" :disabled="isProcessing || Math.abs(totalSplitAmount - splitForm.totalAmount) > 0.01">
                    <ProgressSpinner v-if="isProcessing" class="w-4 h-4 mr-2" />
                </Button>
            </template>
        </Dialog>

        <!-- Receipt Dialog -->
        <Dialog :visible="showReceiptDialog" @update:visible="showReceiptDialog = $event" header="Receipt" :modal="true" :style="{ width: '400px' }">
            <div v-if="currentReceipt" class="receipt-content space-y-4">
                <div class="text-center">
                    <h3 class="font-bold text-lg">{{ currentReceipt.restaurant.name }}</h3>
                    <p class="text-sm text-gray-600">{{ currentReceipt.restaurant.address }}</p>
                    <p class="text-sm text-gray-600">{{ currentReceipt.restaurant.phone }}</p>
                </div>

                <Divider />

                <div class="text-sm">
                    <div class="flex justify-between">
                        <span>Receipt #:</span>
                        <span class="font-mono">{{ currentReceipt.id }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Order #:</span>
                        <span class="font-mono">{{ currentReceipt.orderId }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Date:</span>
                        <span>{{ new Date(currentReceipt.date).toLocaleString() }}</span>
                    </div>
                </div>

                <Divider />

                <div class="space-y-2">
                    <div v-for="item in currentReceipt.items" :key="item.id" class="flex justify-between text-sm">
                        <span>{{ item.name }} × {{ item.quantity }}</span>
                        <span>{{ formatCurrency(item.price * item.quantity) }}</span>
                    </div>
                </div>

                <Divider />

                <div class="space-y-1 text-sm">
                    <div class="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{{ formatCurrency(currentReceipt.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Tax:</span>
                        <span>{{ formatCurrency(currentReceipt.tax) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Tip:</span>
                        <span>{{ formatCurrency(currentReceipt.tip) }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-base">
                        <span>Total:</span>
                        <span>{{ formatCurrency(currentReceipt.total) }}</span>
                    </div>
                </div>

                <Divider />

                <div class="space-y-1 text-sm">
                    <div v-for="payment in currentReceipt.payments" :key="payment.id" class="flex justify-between">
                        <span class="capitalize">{{ payment.method.replace('_', ' ') }}:</span>
                        <span>{{ formatCurrency(payment.amount) }}</span>
                    </div>
                </div>

                <div class="text-center text-sm text-gray-600">Thank you for your business!</div>
            </div>

            <template #footer>
                <div class="flex gap-2">
                    <Button label="Print" icon="pi pi-print" @click="printReceipt(currentReceipt)" />
                    <Button label="Email" icon="pi pi-envelope" severity="secondary" @click="emailReceipt(currentReceipt)" />
                    <Button label="Close" severity="help" @click="showReceiptDialog = false" />
                </div>
            </template>
        </Dialog>

        <!-- Settings Dialog -->
        <Dialog :visible="showSettingsDialog" @update:visible="showSettingsDialog = $event" header="Payment Settings" :modal="true" :style="{ width: '500px' }">
            <div class="space-y-4">
                <div class="space-y-3">
                    <h4 class="font-medium">Receipt Settings</h4>
                    <div class="flex items-center gap-3">
                        <Checkbox v-model="settingsForm.autoReceipt" inputId="autoReceipt" />
                        <label for="autoReceipt" class="text-sm">Auto-generate receipts</label>
                    </div>
                    <div class="flex items-center gap-3">
                        <Checkbox v-model="settingsForm.emailReceipts" inputId="emailReceipts" />
                        <label for="emailReceipts" class="text-sm">Email receipts to customers</label>
                    </div>
                    <div class="flex items-center gap-3">
                        <Checkbox v-model="settingsForm.smsReceipts" inputId="smsReceipts" />
                        <label for="smsReceipts" class="text-sm">SMS receipts to customers</label>
                    </div>
                    <div class="flex items-center gap-3">
                        <Checkbox v-model="settingsForm.printerEnabled" inputId="printerEnabled" />
                        <label for="printerEnabled" class="text-sm">Enable receipt printer</label>
                    </div>
                </div>

                <Divider />

                <div class="space-y-3">
                    <h4 class="font-medium">Payment Settings</h4>
                    <div>
                        <label class="block text-sm font-medium mb-2">Signature Required Above</label>
                        <InputNumber v-model="settingsForm.requireSignature" mode="currency" currency="USD" class="w-full" />
                    </div>
                    <div class="flex items-center gap-3">
                        <Checkbox v-model="settingsForm.roundingEnabled" inputId="roundingEnabled" />
                        <label for="roundingEnabled" class="text-sm">Enable amount rounding</label>
                    </div>
                </div>

                <Divider />

                <div>
                    <h4 class="font-medium mb-3">Tip Suggestions (%)</h4>
                    <div class="grid grid-cols-4 gap-2">
                        <InputNumber v-for="(tip, index) in settingsForm.tipSuggestions" :key="index" v-model="settingsForm.tipSuggestions[index]" class="w-full" :min="0" :max="100" />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" @click="showSettingsDialog = false" />
                <Button label="Save Settings" @click="saveSettings" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.payment-method-card {
    border: 2px solid transparent;
    transition: all 0.2s ease-in-out;
}

.payment-method-card:hover {
    transform: translateY(-2px);
    border-color: #3b82f6;
}

.receipt-content {
    font-family: 'Courier New', monospace;
    background: white;
    max-height: 500px;
    overflow-y: auto;
}

:deep(.p-card-content) {
    padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem;
}

:deep(.p-progressspinner) {
    width: 1rem;
    height: 1rem;
}
</style>
