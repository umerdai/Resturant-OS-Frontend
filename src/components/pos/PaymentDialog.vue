<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue';
import { usePosStore } from '@/stores/pos.js';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import RadioButton from 'primevue/radiobutton';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import Card from 'primevue/card';
import ProgressSpinner from 'primevue/progressspinner';

// Props and Emits
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    transaction: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:visible', 'payment-complete']);

const posStore = usePosStore();
const toast = useToast();

// Reactive data
const selectedPaymentMethod = ref('cash');
const cashAmount = ref(0);
const cardNumber = ref('');
const cardHolderName = ref('');
const expiryDate = ref('');
const cvv = ref('');
const isProcessing = ref(false);
const showReceipt = ref(false);
const lastTransaction = ref(null);

// Computed properties
const paymentMethods = computed(() => [
    { label: 'Cash', value: 'cash', icon: 'pi pi-money-bill' },
    { label: 'Credit/Debit Card', value: 'card', icon: 'pi pi-credit-card' },
    { label: 'Mobile Payment', value: 'mobile_payment', icon: 'pi pi-mobile' }
]);

const totalAmount = computed(() => props.transaction?.total || 0);

const change = computed(() => {
    if (selectedPaymentMethod.value === 'cash') {
        return Math.max(0, cashAmount.value - totalAmount.value);
    }
    return 0;
});

const canProcessPayment = computed(() => {
    if (!props.transaction) return false;

    switch (selectedPaymentMethod.value) {
        case 'cash':
            return cashAmount.value >= totalAmount.value;
        case 'card':
            return cardNumber.value && cardHolderName.value && expiryDate.value && cvv.value;
        case 'mobile_payment':
            return true; // Assuming mobile payment doesn't need additional validation here
        default:
            return false;
    }
});

// Methods
const processPayment = async () => {
    if (!canProcessPayment.value) {
        toast.add({
            severity: 'warn',
            summary: 'Invalid Payment',
            detail: 'Please complete all required payment information',
            life: 3000
        });
        return;
    }

    isProcessing.value = true;

    try {
        let paymentData = {
            method: selectedPaymentMethod.value,
            amount: totalAmount.value
        };

        switch (selectedPaymentMethod.value) {
            case 'cash':
                paymentData = {
                    ...paymentData,
                    amount: cashAmount.value,
                    change: change.value
                };
                break;
            case 'card':
                paymentData = {
                    ...paymentData,
                    cardLastFour: cardNumber.value.slice(-4),
                    cardHolderName: cardHolderName.value,
                    approvalCode: generateApprovalCode()
                };
                break;
            case 'mobile_payment':
                paymentData = {
                    ...paymentData,
                    approvalCode: generateApprovalCode()
                };
                break;
        }

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const result = await posStore.processPayment(paymentData);

        if (result.success) {
            lastTransaction.value = result.transaction;
            showReceipt.value = true;
            resetForm();

            setTimeout(() => {
                emit('payment-complete', result);
                closeDialog();
            }, 3000);
        } else {
            emit('payment-complete', result);
        }
    } catch (error) {
        emit('payment-complete', {
            success: false,
            message: error.message
        });
    } finally {
        isProcessing.value = false;
    }
};

const generateApprovalCode = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
};

const resetForm = () => {
    selectedPaymentMethod.value = 'cash';
    cashAmount.value = 0;
    cardNumber.value = '';
    cardHolderName.value = '';
    expiryDate.value = '';
    cvv.value = '';
};

const closeDialog = () => {
    emit('update:visible', false);
    showReceipt.value = false;
    resetForm();
};

const quickCashAmounts = computed(() => {
    const total = totalAmount.value;
    const amounts = [total];

    // Add common bill denominations
    const bills = [5, 10, 20, 50, 100];
    bills.forEach((bill) => {
        let amount = Math.ceil(total / bill) * bill;
        if (!amounts.includes(amount)) {
            amounts.push(amount);
        }
    });

    return amounts.sort((a, b) => a - b).slice(0, 6);
});

const selectQuickAmount = (amount) => {
    cashAmount.value = amount;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const printReceipt = () => {
    if (lastTransaction.value) {
        const receipt = posStore.generateReceipt(lastTransaction.value);
        posStore.printReceipt(receipt);
    }
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Process Payment" :modal="true" :closable="!isProcessing" :style="{ width: '600px' }" class="payment-dialog">
        <!-- Processing Overlay -->
        <div v-if="isProcessing" class="text-center py-8">
            <ProgressSpinner />
            <p class="text-lg font-medium mt-4">Processing Payment...</p>
            <p class="text-sm text-gray-600">Please wait while we process your payment</p>
        </div>

        <!-- Receipt View -->
        <div v-else-if="showReceipt" class="text-center py-8">
            <i class="pi pi-check-circle text-green-500 text-6xl mb-4"></i>
            <h3 class="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h3>
            <p class="text-gray-600 mb-4">Transaction {{ lastTransaction?.transactionNumber }} completed successfully</p>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <div class="text-lg font-semibold">{{ formatCurrency(lastTransaction?.total) }}</div>
                <div class="text-sm text-gray-600">Paid via {{ lastTransaction?.paymentMethod?.toUpperCase() }}</div>
            </div>
            <Button label="Print Receipt" icon="pi pi-print" @click="printReceipt" severity="secondary" />
        </div>

        <!-- Payment Form -->
        <div v-else>
            <div class="space-y-6">
                <!-- Transaction Summary -->
                <Card class="mb-4">
                    <template #content>
                        <div class="flex justify-between items-center text-lg">
                            <span class="font-medium">Total Amount:</span>
                            <span class="font-bold text-2xl text-green-600">
                                {{ formatCurrency(totalAmount) }}
                            </span>
                        </div>
                    </template>
                </Card>

                <!-- Payment Method Selection -->
                <div>
                    <h4 class="text-lg font-semibold mb-3">Payment Method</h4>
                    <div class="grid grid-cols-3 gap-3">
                        <div
                            v-for="method in paymentMethods"
                            :key="method.value"
                            class="payment-method-card border rounded-lg p-4 cursor-pointer transition-all"
                            :class="{
                                'border-blue-500 bg-blue-50': selectedPaymentMethod === method.value,
                                'border-gray-200 hover:border-gray-300': selectedPaymentMethod !== method.value
                            }"
                            @click="selectedPaymentMethod = method.value"
                        >
                            <RadioButton v-model="selectedPaymentMethod" :input-id="method.value" :value="method.value" class="mb-2" />
                            <div class="text-center">
                                <i :class="method.icon" class="text-2xl mb-2"></i>
                                <div class="text-sm font-medium">{{ method.label }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Cash Payment -->
                <div v-if="selectedPaymentMethod === 'cash'" class="space-y-4">
                    <h4 class="text-lg font-semibold">Cash Payment</h4>

                    <div class="grid grid-cols-3 gap-2 mb-4">
                        <Button v-for="amount in quickCashAmounts" :key="amount" :label="formatCurrency(amount)" @click="selectQuickAmount(amount)" severity="secondary" size="small" class="p-button-outlined" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Amount Received</label>
                        <InputNumber v-model="cashAmount" mode="currency" currency="USD" locale="en-US" :min="totalAmount" class="w-full" size="large" />
                    </div>

                    <div v-if="cashAmount > 0" class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="text-lg">Change:</span>
                            <span class="text-xl font-bold text-green-600">
                                {{ formatCurrency(change) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Card Payment -->
                <div v-else-if="selectedPaymentMethod === 'card'" class="space-y-4">
                    <h4 class="text-lg font-semibold">Card Payment</h4>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                            <InputText v-model="cardNumber" placeholder="1234 5678 9012 3456" class="w-full" />
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                            <InputText v-model="cardHolderName" placeholder="John Doe" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <InputText v-model="expiryDate" placeholder="MM/YY" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                            <InputText v-model="cvv" placeholder="123" class="w-full" type="password" />
                        </div>
                    </div>
                </div>

                <!-- Mobile Payment -->
                <div v-else-if="selectedPaymentMethod === 'mobile_payment'" class="text-center py-8">
                    <i class="pi pi-mobile text-4xl text-blue-500 mb-4"></i>
                    <h4 class="text-lg font-semibold mb-2">Mobile Payment</h4>
                    <p class="text-gray-600 mb-4">Customer will pay using their mobile payment app</p>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-blue-700 font-medium">Amount: {{ formatCurrency(totalAmount) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between w-full">
                <Button label="Cancel" severity="secondary" @click="closeDialog" :disabled="isProcessing" />
                <Button v-if="!showReceipt && !isProcessing" label="Process Payment" icon="pi pi-credit-card" @click="processPayment" :disabled="!canProcessPayment" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.payment-method-card {
    background-color: var(--surface-card);
    transition: all 0.2s ease-in-out;
}

.payment-method-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.payment-dialog :deep(.p-dialog-header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.payment-dialog :deep(.p-dialog-header .p-dialog-title) {
    color: white;
}

.payment-dialog :deep(.p-dialog-header .p-dialog-header-icon) {
    color: white;
}
</style>
