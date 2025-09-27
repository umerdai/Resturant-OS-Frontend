import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useOrderStore } from './order.js';

export const usePosStore = defineStore('pos', () => {
    // State
    const cart = ref([]);
    const currentTransaction = ref(null);
    const transactions = ref([]);
    const customerInfo = ref(null);
    const discounts = ref([]);
    const appliedDiscount = ref(null);
    const isLoading = ref(false);

    // Employee & Shift Management
    const cashierInfo = ref(null);
    const currentShift = ref(null);
    const employeePermissions = ref({});

    // Tax & Charges
    const taxRate = ref(0.08);
    const serviceChargeRate = ref(0.1);
    const deliveryFee = ref(3.5);
    const packagingFee = ref(1.0);

    // Cash Management
    const cashDrawerAmount = ref(500.0);
    const cashDrawerHistory = ref([]);
    const lastDrawerCount = ref(null);

    // Order Management
    const orderMode = ref('dine_in'); // dine_in, takeout, delivery, pickup
    const tableNumber = ref(null);
    const orderPriority = ref('normal'); // rush, normal, low
    const estimatedPrepTime = ref(0);
    const deliveryAddress = ref(null);
    const pickupTime = ref(null);

    // Tips & Gratuity
    const tipAmount = ref(0);
    const tipPercentage = ref(0);
    const suggestedTips = ref([15, 18, 20, 25]);
    const autoGratuityThreshold = ref(6); // Party size for auto-gratuity
    const autoGratuityRate = ref(0.18);

    // Payment Processing
    const splitPayments = ref([]);
    const giftCardBalance = ref(0);
    const loyaltyPoints = ref(0);
    const loyaltyRedemption = ref(null);
    const roundUpCharity = ref(false);
    const roundUpAmount = ref(0);

    // Customer Loyalty & Marketing
    const loyaltyProgram = ref({
        memberId: null,
        points: 0,
        tier: 'bronze',
        earnRate: 1, // points per dollar
        redeemRate: 100 // points per dollar value
    });

    // Promotions & Coupons
    const appliedCoupons = ref([]);
    const availablePromotions = ref([]);
    const comboDeals = ref([]);

    // Inventory Integration
    const inventoryAlerts = ref([]);
    const outOfStockItems = ref([]);

    // Analytics & Reporting
    const sessionMetrics = ref({
        ordersCount: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        peakHours: [],
        popularItems: []
    });

    // Receipt & Printing
    const receiptSettings = ref({
        printCustomerCopy: true,
        printKitchenTicket: true,
        emailReceipt: false,
        smsReceipt: false,
        logoUrl: '',
        footerMessage: 'Thank you for your visit!'
    });

    // Multi-location Support
    const locationInfo = ref({
        id: 1,
        name: 'Main Branch',
        address: '123 Main St',
        phone: '(555) 123-4567',
        timezone: 'America/New_York'
    });

    // Kitchen Display System
    const kitchenOrders = ref([]);
    const preparationQueues = ref({
        cold: [],
        hot: [],
        grill: [],
        fryer: [],
        dessert: []
    });

    // Constants
    const PAYMENT_METHODS = {
        CASH: 'cash',
        CREDIT_CARD: 'credit_card',
        DEBIT_CARD: 'debit_card',
        MOBILE_PAYMENT: 'mobile_payment',
        GIFT_CARD: 'gift_card',
        LOYALTY_POINTS: 'loyalty_points',
        CHECK: 'check',
        BANK_TRANSFER: 'bank_transfer',
        SPLIT_PAYMENT: 'split_payment',
        COMP: 'comp', // Complimentary
        HOUSE_ACCOUNT: 'house_account'
    };

    const TRANSACTION_STATUS = {
        PENDING: 'pending',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        REFUNDED: 'refunded',
        PARTIALLY_REFUNDED: 'partially_refunded',
        VOIDED: 'voided',
        SUSPENDED: 'suspended'
    };

    const ORDER_TYPES = {
        DINE_IN: 'dine_in',
        TAKEOUT: 'takeout',
        DELIVERY: 'delivery',
        PICKUP: 'pickup',
        DRIVE_THRU: 'drive_thru',
        CURBSIDE: 'curbside'
    };

    const ORDER_PRIORITIES = {
        RUSH: 'rush',
        NORMAL: 'normal',
        LOW: 'low',
        CATERING: 'catering'
    };

    const DISCOUNT_TYPES = {
        PERCENTAGE: 'percentage',
        FIXED_AMOUNT: 'fixed_amount',
        BUY_ONE_GET_ONE: 'bogo',
        ITEM_DISCOUNT: 'item_discount',
        CATEGORY_DISCOUNT: 'category_discount',
        LOYALTY_DISCOUNT: 'loyalty_discount',
        EMPLOYEE_DISCOUNT: 'employee_discount',
        SENIOR_DISCOUNT: 'senior_discount',
        MILITARY_DISCOUNT: 'military_discount'
    };

    const CUSTOMER_TYPES = {
        WALK_IN: 'walk_in',
        REGULAR: 'regular',
        VIP: 'vip',
        CORPORATE: 'corporate',
        EMPLOYEE: 'employee'
    };

    const TAX_TYPES = {
        SALES_TAX: 'sales_tax',
        VAT: 'vat',
        GST: 'gst',
        SERVICE_TAX: 'service_tax',
        LUXURY_TAX: 'luxury_tax'
    };

    const PREPARATION_STATIONS = {
        COLD_PREP: 'cold_prep',
        HOT_PREP: 'hot_prep',
        GRILL: 'grill',
        FRYER: 'fryer',
        SALAD: 'salad',
        DESSERT: 'dessert',
        BAR: 'bar',
        BAKERY: 'bakery'
    };

    const EMPLOYEE_ROLES = {
        CASHIER: 'cashier',
        SERVER: 'server',
        MANAGER: 'manager',
        ADMIN: 'admin',
        KITCHEN: 'kitchen',
        BARTENDER: 'bartender',
        HOST: 'host'
    };

    // Computed properties
    const cartItemsCount = computed(() => {
        return cart.value.reduce((total, item) => total + item.quantity, 0);
    });

    const cartSubtotal = computed(() => {
        return cart.value.reduce((total, item) => {
            const itemPrice = item.price * item.quantity;
            const modifiersPrice = (item.modifiers || []).reduce((modTotal, mod) => modTotal + mod.price * item.quantity, 0);
            return total + itemPrice + modifiersPrice;
        }, 0);
    });

    const discountAmount = computed(() => {
        if (!appliedDiscount.value) return 0;

        if (appliedDiscount.value.type === 'percentage') {
            return cartSubtotal.value * (appliedDiscount.value.value / 100);
        } else {
            return appliedDiscount.value.value;
        }
    });

    const cartTax = computed(() => {
        const subtotal = appliedDiscount.value ? cartSubtotal.value - discountAmount.value : cartSubtotal.value;
        return subtotal * taxRate.value;
    });

    const cartServiceCharge = computed(() => {
        const subtotal = appliedDiscount.value ? cartSubtotal.value - discountAmount.value : cartSubtotal.value;
        return subtotal * serviceChargeRate.value;
    });

    const cartTotal = computed(() => {
        const subtotal = cartSubtotal.value;
        const discount = discountAmount.value;
        const tax = cartTax.value;
        const serviceCharge = cartServiceCharge.value;

        return subtotal - discount + tax + serviceCharge;
    });

    const todayTransactions = computed(() => {
        const today = new Date().toDateString();
        return transactions.value.filter((transaction) => new Date(transaction.createdAt).toDateString() === today);
    });

    const todayRevenue = computed(() => {
        return todayTransactions.value.filter((t) => t.status === TRANSACTION_STATUS.COMPLETED).reduce((total, t) => total + t.total, 0);
    });

    const salesSummary = computed(() => {
        const completedTransactions = todayTransactions.value.filter((t) => t.status === TRANSACTION_STATUS.COMPLETED);

        return {
            totalSales: completedTransactions.length,
            totalRevenue: todayRevenue.value,
            averageTransaction: completedTransactions.length > 0 ? todayRevenue.value / completedTransactions.length : 0,
            cashSales: completedTransactions.filter((t) => t.paymentMethod === PAYMENT_METHODS.CASH).length,
            cardSales: completedTransactions.filter((t) => t.paymentMethod === PAYMENT_METHODS.CARD).length,
            mobileSales: completedTransactions.filter((t) => t.paymentMethod === PAYMENT_METHODS.MOBILE).length
        };
    });

    // Actions
    const addToCart = (item, quantity = 1, modifiers = [], notes = '') => {
        const existingItemIndex = cart.value.findIndex((cartItem) => cartItem.id === item.id && JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers));

        if (existingItemIndex !== -1) {
            cart.value[existingItemIndex].quantity += quantity;
        } else {
            cart.value.push({
                id: item.id,
                cartItemId: Date.now() + Math.random(),
                name: item.name,
                price: item.price,
                quantity,
                modifiers: modifiers || [],
                notes: notes || '',
                image: item.image,
                categoryId: item.categoryId
            });
        }
    };

    const removeFromCart = (cartItemId) => {
        cart.value = cart.value.filter((item) => item.cartItemId !== cartItemId);
    };

    const updateCartItemQuantity = (cartItemId, quantity) => {
        const item = cart.value.find((item) => item.cartItemId === cartItemId);
        if (item) {
            if (quantity <= 0) {
                removeFromCart(cartItemId);
            } else {
                item.quantity = quantity;
            }
        }
    };

    const clearCart = () => {
        cart.value = [];
        appliedDiscount.value = null;
        customerInfo.value = null;
    };

    const applyDiscount = (discount) => {
        appliedDiscount.value = discount;
    };

    const removeDiscount = () => {
        appliedDiscount.value = null;
    };

    const setCustomerInfo = (customer) => {
        customerInfo.value = customer;
    };

    const setCashierInfo = (cashier) => {
        cashierInfo.value = cashier;
    };

    const startTransaction = () => {
        if (cart.value.length === 0) {
            throw new Error('Cart is empty');
        }

        currentTransaction.value = {
            id: Date.now(),
            transactionNumber: `TXN-${Date.now()}`,
            items: [...cart.value],
            customer: customerInfo.value,
            cashier: cashierInfo.value,
            subtotal: cartSubtotal.value,
            tax: cartTax.value,
            serviceCharge: cartServiceCharge.value,
            discount: discountAmount.value,
            total: cartTotal.value,
            appliedDiscount: appliedDiscount.value,
            status: TRANSACTION_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return currentTransaction.value;
    };

    const processPayment = async (paymentData) => {
        if (!currentTransaction.value) {
            throw new Error('No active transaction');
        }

        isLoading.value = true;
        try {
            const orderStore = useOrderStore();

            const payment = {
                method: paymentData.method,
                amount: paymentData.amount,
                change: paymentData.change || 0,
                cardLastFour: paymentData.cardLastFour || null,
                approvalCode: paymentData.approvalCode || null,
                processedAt: new Date().toISOString()
            };

            currentTransaction.value.payment = payment;
            currentTransaction.value.paymentMethod = paymentData.method;
            currentTransaction.value.status = TRANSACTION_STATUS.COMPLETED;
            currentTransaction.value.completedAt = new Date().toISOString();

            // Add to transactions history
            transactions.value.push({ ...currentTransaction.value });

            // Update cash drawer if cash payment
            if (paymentData.method === PAYMENT_METHODS.CASH) {
                cashDrawerAmount.value += paymentData.amount - (paymentData.change || 0);
            }

            // Create order in order store
            const orderData = {
                tableId: customerInfo.value?.tableId || null,
                customerId: customerInfo.value?.id || null,
                items: cart.value.map((item) => ({
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    modifiers: item.modifiers || [],
                    notes: item.notes || ''
                })),
                subtotal: currentTransaction.value.subtotal,
                tax: currentTransaction.value.tax,
                serviceCharge: currentTransaction.value.serviceCharge,
                discount: currentTransaction.value.discount,
                total: currentTransaction.value.total,
                paymentMethod: paymentData.method,
                transactionId: currentTransaction.value.id
            };

            await orderStore.createOrder(orderData);

            // Generate receipt
            const receipt = generateReceipt(currentTransaction.value);

            // Clear current transaction and cart
            const completedTransaction = { ...currentTransaction.value };
            currentTransaction.value = null;
            clearCart();

            return { success: true, transaction: completedTransaction, receipt };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const generateReceipt = (transaction) => {
        return {
            transactionId: transaction.id,
            transactionNumber: transaction.transactionNumber,
            date: new Date(transaction.createdAt).toLocaleString(),
            cashier: transaction.cashier?.name || 'Unknown',
            customer: transaction.customer,
            items: transaction.items,
            subtotal: transaction.subtotal,
            discount: transaction.discount,
            tax: transaction.tax,
            serviceCharge: transaction.serviceCharge,
            total: transaction.total,
            payment: transaction.payment,
            restaurantInfo: {
                name: 'Restaurant OS',
                address: '123 Main Street, City, State 12345',
                phone: '(555) 123-4567',
                email: 'info@restaurant-os.com'
            }
        };
    };

    const fetchDiscounts = async () => {
        isLoading.value = true;
        try {
            const response = await simulateFetchDiscounts();
            discounts.value = response;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const simulateFetchDiscounts = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        name: 'Senior Discount',
                        type: 'percentage',
                        value: 10,
                        description: '10% discount for seniors'
                    },
                    {
                        id: 2,
                        name: 'Student Discount',
                        type: 'percentage',
                        value: 15,
                        description: '15% discount for students'
                    },
                    {
                        id: 3,
                        name: 'Happy Hour',
                        type: 'percentage',
                        value: 20,
                        description: '20% off during happy hour'
                    },
                    {
                        id: 4,
                        name: '$5 Off',
                        type: 'fixed',
                        value: 5,
                        description: '$5 off any order'
                    }
                ]);
            }, 300);
        });
    };

    return {
        // State
        cart,
        currentTransaction,
        transactions,
        customerInfo,
        discounts,
        appliedDiscount,
        isLoading,
        cashierInfo,
        taxRate,
        serviceChargeRate,
        cashDrawerAmount,
        PAYMENT_METHODS,
        TRANSACTION_STATUS,

        // Getters
        cartItemsCount,
        cartSubtotal,
        cartTax,
        cartServiceCharge,
        discountAmount,
        cartTotal,
        todayTransactions,
        todayRevenue,
        salesSummary,

        // Actions
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        applyDiscount,
        removeDiscount,
        setCustomerInfo,
        setCashierInfo,
        startTransaction,
        processPayment,
        generateReceipt,
        fetchDiscounts
    };
});
